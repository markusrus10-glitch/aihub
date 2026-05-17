import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { z } from "zod";

const updateSchema = z.object({
  defaultModel: z.string().optional(),
  defaultSystemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(200000).optional(),
  streamingEnabled: z.boolean().optional(),
  theme: z.string().optional(),
  language: z.string().optional(),
  fontSize: z.string().optional(),
  codeTheme: z.string().optional(),
  sendOnEnter: z.boolean().optional(),
  showTokenCount: z.boolean().optional(),
  enableSoundEffects: z.boolean().optional(),
  compactMode: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await db.userPreferences.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ preferences: prefs });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const prefs = await db.userPreferences.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ preferences: prefs });
}
