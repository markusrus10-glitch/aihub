import { notFound } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MODELS } from "@/lib/constants/models";

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string;
  createdAt: string;
}

interface SharedChat {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  user: { name: string | null; image: string | null };
  messages: Message[];
}

async function getSharedChat(shareToken: string): Promise<SharedChat | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/chat/shared/${shareToken}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.chat;
  } catch {
    return null;
  }
}

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const chat = await getSharedChat(shareToken);

  if (!chat) notFound();

  const modelDef = MODELS.find((m) => m.id === chat.model);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{chat.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarImage src={chat.user.image ?? ""} />
                <AvatarFallback className="text-[8px]">
                  {chat.user.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span>{chat.user.name ?? "Anonymous"}</span>
              {modelDef && (
                <>
                  <span>·</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {modelDef.displayName}
                  </Badge>
                </>
              )}
            </div>
          </div>
          <Link href="/register">
            <Button size="sm" className="gap-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Try AI Hub
            </Button>
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className="shrink-0 mt-1">
              {msg.role === "user" ? (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={chat.user.image ?? ""} />
                  <AvatarFallback className="text-xs">
                    {chat.user.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
              )}
            </div>

            <div className={`flex-1 min-w-0 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
              {msg.role === "user" ? (
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-xl">
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <MarkdownRenderer content={msg.content} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            Start your own conversation with AI Hub — free, no credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Get started for free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
