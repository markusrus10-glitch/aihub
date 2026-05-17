import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { z } from "zod";

const createSchema = z.object({
  model: z.string().optional(),
  title: z.string().optional(),
  systemPrompt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const search = searchParams.get("search") ?? "";
  const archived = searchParams.get("archived") === "true";

  const where = {
    userId: session.user.id,
    deletedAt: null,
    isArchived: archived,
    ...(search && { title: { contains: search, mode: "insensitive" as const } }),
  };

  const [chats, total] = await Promise.all([
    db.chat.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        model: true,
        provider: true,
        isPinned: true,
        isArchived: true,
        messageCount: true,
        totalTokensUsed: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
    }),
    db.chat.count({ where }),
  ]);

  return NextResponse.json({ chats, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  const data = parsed.success ? parsed.data : {};

  const chat = await db.chat.create({
    data: {
      userId: session.user.id,
      model: data.model ?? "gpt-4o-mini",
      title: data.title ?? "New Chat",
      systemPrompt: data.systemPrompt,
    },
  });

  return NextResponse.json({ chat }, { status: 201 });
}
