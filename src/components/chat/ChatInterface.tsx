"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MessageBubble } from "./MessageBubble";
import { StreamingText } from "./StreamingText";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: string;
  model?: string;
  durationMs?: number;
  totalTokens?: number;
  createdAt: string;
}

interface Chat {
  id: string;
  title: string;
  model: string;
  provider: string;
  systemPrompt?: string;
  temperature: number;
  maxTokens: number;
  messages: Message[];
}

interface Props {
  chatId: string;
  initialPrompt?: string;
}

const SUGGESTIONS = [
  "Напиши функцию на Python для сортировки списка",
  "Объясни квантовые вычисления простыми словами",
  "Помоги составить план бизнеса",
  "Переведи текст на английский",
];

export function ChatInterface({ chatId, initialPrompt }: Props) {
  const { data: session } = useSession();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const initialPromptSent = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat();
  }, [chatId]);

  useEffect(() => {
    if (initialPrompt && !loading && !initialPromptSent.current && messages.length === 0) {
      initialPromptSent.current = true;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, loading, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function loadChat() {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/${chatId}`);
      if (!res.ok) throw new Error("Чат не найден");
      const data = await res.json();
      setChat(data.chat);
      setMessages(data.chat.messages);
      setModel(data.chat.model);
    } catch {
      toast.error("Не удалось загрузить чат");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(content: string) {
    if (isStreaming) return;

    const userMsg: Message = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent("");

    const messagesForAPI = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content },
    ];

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          chatId,
          model,
          messages: messagesForAPI,
          temperature: chat?.temperature ?? 0.7,
          maxTokens: chat?.maxTokens ?? 2048,
          systemPrompt: chat?.systemPrompt ?? undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ошибка стриминга");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantReasoning = "";
      let finalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      let buffer = ""; // буфер для неполных SSE-чанков

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Обрабатываем только полные строки (заканчивающиеся на \n)
        const lines = buffer.split("\n");
        // Последний элемент может быть неполным — оставляем в буфере
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const chunk = JSON.parse(jsonStr);
            if (chunk.type === "delta" && chunk.delta) {
              assistantContent += chunk.delta;
              setStreamingContent(assistantContent);
            } else if (chunk.type === "reasoning" && chunk.reasoning) {
              assistantReasoning += chunk.reasoning;
            } else if (chunk.type === "usage" && chunk.usage) {
              finalUsage = chunk.usage;
            } else if (chunk.type === "error") {
              throw new Error(chunk.error);
            }
          } catch { /* ignore parse errors */ }
        }
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantContent,
        reasoning: assistantReasoning || undefined,
        model,
        totalTokens: finalUsage.totalTokens,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");

      // Обновляем сайдбар
      window.dispatchEvent(new Event("chat-updated"));

      if (messages.length === 0) {
        fetch("/api/ai/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        })
          .then((r) => r.json())
          .then(({ title }) => {
            if (title) {
              fetch(`/api/chat/${chatId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
              }).then(() => {
                window.dispatchEvent(new Event("chat-updated"));
              });
            }
          })
          .catch(() => {});
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error((error as Error).message ?? "Ошибка отправки сообщения");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  function regenerate() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setMessages((prev) => prev.filter((m) => m.id !== messages[messages.length - 1].id));
      sendMessage(lastUserMsg.content);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full max-w-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex flex-col h-full">
      {/* Панель инструментов */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background shrink-0">
        <ModelSelector
          value={model}
          onChange={(m) => {
            setModel(m);
            fetch(`/api/chat/${chatId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ model: m }),
            });
          }}
          planTier={session?.user?.planTier ?? "FREE"}
        />
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          {chat?.title ?? "Новый чат"}
        </span>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Чем могу помочь?</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              Задайте любой вопрос — код, анализ, творчество или просто беседа.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                userImage={session?.user?.image ?? ""}
                userName={session?.user?.name ?? "Вы"}
                isLast={idx === messages.length - 1}
                onRegenerate={idx === messages.length - 1 ? regenerate : undefined}
              />
            ))}

            {isStreaming && streamingContent && (
              <div className="flex gap-3 px-4 py-3">
                <div className="shrink-0 mt-0.5">
                  <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">ИИ Хаб</div>
                  <StreamingText content={streamingContent} isStreaming />
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex gap-3 px-4 py-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Ввод */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        placeholder="Напишите сообщение..."
      />
    </div>
  );
}
