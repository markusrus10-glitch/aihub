"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, ChevronDown, ChevronRight, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/format";
import { MODELS } from "@/lib/constants/models";

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

interface Props {
  message: Message;
  userImage?: string;
  userName?: string;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export function MessageBubble({ message, userImage, userName, onRegenerate, isLast }: Props) {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const isUser = message.role === "user";
  const modelDef = MODELS.find((m) => m.id === message.model);

  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn(
      "group flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
      isUser && "flex-row-reverse"
    )}>
      {/* Аватар */}
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <Avatar className="h-7 w-7">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="text-xs bg-primary text-white">
              {userName?.charAt(0).toUpperCase() ?? "П"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
        )}
      </div>

      {/* Содержимое */}
      <div className={cn("flex-1 min-w-0 space-y-1", isUser && "flex flex-col items-end")}>
        {/* Имя + модель */}
        <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isUser && "flex-row-reverse")}>
          <span className="font-medium">{isUser ? (userName ?? "Вы") : "ИИ Хаб"}</span>
          {!isUser && modelDef && <span className="opacity-60">{modelDef.displayName}</span>}
          <span className="opacity-40">{formatRelative(message.createdAt)}</span>
        </div>

        {/* Размышления (DeepSeek R1, Claude Extended Thinking) */}
        {message.reasoning && (
          <div className="w-full max-w-3xl">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Размышление</span>
              {showReasoning ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {showReasoning && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-mono whitespace-pre-wrap mb-2">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Текст сообщения */}
        <div className={cn(
          "max-w-3xl",
          isUser
            ? "bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5"
            : ""
        )}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Действия */}
        <div className={cn(
          "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser && "flex-row-reverse"
        )}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copy} title="Копировать">
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          {!isUser && isLast && onRegenerate && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRegenerate} title="Повторить">
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          {(message.totalTokens ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground px-1">
              {(message.totalTokens ?? 0).toLocaleString()} токенов
              {(message.durationMs ?? 0) > 0 && ` · ${((message.durationMs ?? 0) / 1000).toFixed(1)}с`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
