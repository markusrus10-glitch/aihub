"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Code2, Send, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";

const LANGUAGES = [
  "TypeScript", "JavaScript", "Python", "Rust", "Go", "Java", "C++",
  "C#", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "Bash", "HTML/CSS",
];

const ACTIONS = [
  { value: "generate", label: "Generate code" },
  { value: "explain", label: "Explain code" },
  { value: "fix", label: "Fix bugs" },
  { value: "refactor", label: "Refactor" },
  { value: "test", label: "Write tests" },
  { value: "review", label: "Code review" },
];

export default function CodePage() {
  const [language, setLanguage] = useState("TypeScript");
  const [action, setAction] = useState("generate");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResponse("");

    const prompt = buildPrompt(action, language, input);
    abortRef.current = new AbortController();

    try {
      // Create a temporary chat for the code action
      const chatRes = await fetch("/api/chat", { method: "POST" });
      const chatData = await chatRes.json();
      const chatId = chatData.chat?.id;

      if (!chatId) throw new Error("Failed to create chat");

      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          chatId,
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          systemPrompt: `You are an expert ${language} developer. Provide clean, production-ready code with explanations.`,
        }),
      });

      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const chunk = JSON.parse(line.slice(6));
            if (chunk.type === "delta" && chunk.delta) {
              content += chunk.delta;
              setResponse(content);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Failed to generate response");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function buildPrompt(action: string, lang: string, input: string) {
    const actionMap: Record<string, string> = {
      generate: `Generate ${lang} code for: ${input}`,
      explain: `Explain this ${lang} code:\n\n${input}`,
      fix: `Find and fix bugs in this ${lang} code:\n\n${input}`,
      refactor: `Refactor this ${lang} code to be cleaner and more maintainable:\n\n${input}`,
      test: `Write unit tests for this ${lang} code:\n\n${input}`,
      review: `Perform a code review on this ${lang} code and suggest improvements:\n\n${input}`,
    };
    return actionMap[action] ?? input;
  }

  async function copyCode() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-full">
      {/* Input panel */}
      <div className="flex flex-col w-1/2 border-r border-border">
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <div className="w-7 h-7 bg-green-500/10 rounded-md flex items-center justify-center">
            <Code2 className="w-4 h-4 text-green-400" />
          </div>
          <span className="font-medium text-sm">Code Assistant</span>
        </div>

        <div className="flex items-center gap-2 p-3 border-b border-border">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value} className="text-xs">
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="text-xs ml-auto">GPT-4o</Badge>
        </div>

        <div className="flex-1 p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={action === "generate"
              ? "Describe what you want to build..."
              : "Paste your code here..."}
            className="h-full resize-none font-mono text-sm bg-background"
          />
        </div>

        <div className="p-3 border-t border-border">
          <Button
            onClick={run}
            disabled={!input.trim() || loading}
            className="w-full gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Send className="h-4 w-4" /> Run</>
            )}
          </Button>
        </div>
      </div>

      {/* Output panel */}
      <div className="flex flex-col w-1/2">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-medium">Output</span>
          {response && (
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={copyCode}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {response ? (
            <MarkdownRenderer content={response} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                </div>
              ) : (
                "Your generated code will appear here"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
