import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;

  const chat = await db.chat.findFirst({
    where: { shareToken, shareEnabled: true, deletedAt: null },
    include: {
      messages: {
        where: { deletedAt: null, role: { in: ["user", "assistant"] } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          model: true,
          createdAt: true,
        },
      },
      user: { select: { name: true, image: true } },
    },
  });

  if (!chat) {
    return NextResponse.json({ error: "Shared chat not found" }, { status: 404 });
  }

  return NextResponse.json({
    chat: {
      id: chat.id,
      title: chat.title,
      model: chat.model,
      createdAt: chat.createdAt,
      user: chat.user,
      messages: chat.messages,
    },
  });
}
