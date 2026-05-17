import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  content: z.string().min(1),
  category: z.enum(["WRITING", "CODING", "ANALYSIS", "CREATIVE", "BUSINESS", "EDUCATION", "RESEARCH", "CUSTOM"]).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const prompts = await db.prompt.findMany({
    where: {
      deletedAt: null,
      OR: [
        { userId: session.user.id },
        { isSystem: true },
        { isPublic: true },
      ],
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ isSystem: "desc" }, { useCount: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ prompts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const prompt = await db.prompt.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      tags: parsed.data.tags ?? [],
    },
  });

  return NextResponse.json({ prompt }, { status: 201 });
}
