import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { randomBytes } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chat = await db.chat.findFirst({
    where: { id: chatId, userId: session.user.id, deletedAt: null },
  });
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const shareToken = randomBytes(16).toString("hex");

  const updated = await db.chat.update({
    where: { id: chatId },
    data: { shareToken, shareEnabled: true },
  });

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${shareToken}`;
  return NextResponse.json({ shareToken, shareUrl, chat: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.chat.updateMany({
    where: { id: chatId, userId: session.user.id },
    data: { shareEnabled: false, shareToken: null },
  });

  return NextResponse.json({ success: true });
}
