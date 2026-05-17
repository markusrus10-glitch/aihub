import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const { promptId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompt = await db.prompt.findFirst({
    where: { id: promptId, userId: session.user.id, deletedAt: null },
  });
  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  await db.prompt.update({
    where: { id: promptId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const { promptId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompt = await db.prompt.findFirst({
    where: { id: promptId, userId: session.user.id, deletedAt: null },
  });
  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const updated = await db.prompt.update({
    where: { id: promptId },
    data: parsed.data,
  });

  return NextResponse.json({ prompt: updated });
}
