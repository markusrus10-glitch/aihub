import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { ChatInterface } from "@/components/chat/ChatInterface";

interface Props {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ prompt?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) return { title: "Чат" };

  const chat = await db.chat.findFirst({
    where: { id: chatId, userId: session.user.id, deletedAt: null },
    select: { title: true },
  });

  return { title: chat?.title ?? "Чат" };
}

export default async function ChatPage({ params, searchParams }: Props) {
  const { chatId } = await params;
  const { prompt } = await searchParams;
  const session = await auth();
  if (!session?.user) notFound();

  const chat = await db.chat.findFirst({
    where: { id: chatId, userId: session.user.id, deletedAt: null },
  });

  if (!chat) notFound();

  return <ChatInterface chatId={chatId} initialPrompt={prompt} />;
}
