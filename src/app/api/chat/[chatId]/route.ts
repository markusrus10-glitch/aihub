import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(200000).optional(),
});

async function getChat(chatId: string, userId: string) {
  return db.chat.findFirst({
    where: { id: chatId, userId, deletedAt: null },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chat = await db.chat.findFirst({
    where: { id: chatId, userId: session.user.id, deletedAt: null },
    include: {
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: { attachments: { include: { file: true } } },
      },
      tags: true,
    },
  });

  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  return NextResponse.json({ chat });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chat = await getChat(chatId, session.user.id);
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const updated = await db.chat.update({
    where: { id: chatId },
    data: parsed.data,
  });

  return NextResponse.json({ chat: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chat = await getChat(chatId, session.user.id);
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  await db.chat.update({
    where: { id: chatId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
