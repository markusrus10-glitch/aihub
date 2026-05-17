"use client";

import { MarkdownRenderer } from "./MarkdownRenderer";

interface Props {
  content: string;
  isStreaming?: boolean;
}

export function StreamingText({ content, isStreaming }: Props) {
  return (
    <div className="relative">
      <MarkdownRenderer content={content} />
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-cursor align-text-bottom" />
      )}
    </div>
  );
}
