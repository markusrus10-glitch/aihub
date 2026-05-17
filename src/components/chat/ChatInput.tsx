"use client";

import { useRef, useState, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface Props {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const msg = value.trim();
    if (!msg || isStreaming || disabled) return;
    setValue("");
    onSend(msg);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2 bg-muted/50 rounded-2xl border border-border focus-within:border-primary focus-within:shadow-sm transition-all p-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? "Напишите сообщение... (Shift+Enter для новой строки)"}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground max-h-[200px] overflow-y-auto"
          />

          <div className="flex items-center shrink-0">
            {isStreaming ? (
              <Button size="icon" className="h-8 w-8 bg-destructive hover:bg-destructive/90 rounded-xl" onClick={onStop}>
                <Square className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={handleSend}
                disabled={!value.trim() || disabled}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          ИИ Хаб может ошибаться. Проверяйте важную информацию.
        </p>
      </div>
    </div>
  );
}
