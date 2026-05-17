import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { z } from "zod";

const schema = z.object({
  prompt: z.string().min(1).max(4000),
  size: z.string().optional(),
  quality: z.enum(["standard", "hd"]).optional(),
  style: z.enum(["vivid", "natural"]).optional(),
  model: z.string().optional(),
});

// Размер → ширина/высота
function sizeToWH(size?: string): { width: number; height: number } {
  if (size === "1792x1024") return { width: 1792, height: 1024 };
  if (size === "1024x1792") return { width: 1024, height: 1792 };
  if (size === "1024x768")  return { width: 1024, height: 768  };
  return { width: 1024, height: 1024 };
}

// Переводим промпт на английский через OpenRouter
async function translatePrompt(prompt: string): Promise<string> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "AI Hub",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Translate this image generation prompt to English and enhance it with vivid artistic details (add lighting, style, quality keywords). Return ONLY the enhanced English prompt, nothing else:\n\n"${prompt}"`,
        }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return prompt;
    const data = await res.json();
    const translated = data.choices?.[0]?.message?.content?.trim();
    return translated || prompt;
  } catch {
    return prompt;
  }
}

// Pollinations.ai — бесплатная генерация без ключей
async function generateViaPollinations(
  prompt: string,
  width: number,
  height: number,
  model?: string
): Promise<{ url: string; revisedPrompt?: string }> {
  // Переводим на английский для лучшего качества
  const englishPrompt = await translatePrompt(prompt);

  const encoded = encodeURIComponent(englishPrompt);
  const seed = Math.floor(Math.random() * 999999);

  // Выбираем модель
  let pollinationsModel = "flux";
  if (model?.includes("grok"))        pollinationsModel = "flux-realism";
  else if (model?.includes("gpt"))    pollinationsModel = "turbo";
  else if (model?.includes("stable")) pollinationsModel = "stable-diffusion-xl-lightning";

  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=${pollinationsModel}&nologo=true&enhance=true`;

  // Проверяем что URL отвечает
  const res = await fetch(url, { method: "HEAD" });
  if (!res.ok) throw new Error("Pollinations API не ответил");

  return { url, revisedPrompt: englishPrompt };
}

// OpenAI DALL-E (если есть ключ)
async function generateViaOpenAI(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792",
  quality: "standard" | "hd"
): Promise<{ url: string; revisedPrompt?: string }> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.images.generate({
    model: "dall-e-3",
    prompt,
    size,
    quality,
    n: 1,
    response_format: "url",
  });
  return {
    url: res.data?.[0]?.url ?? "",
    revisedPrompt: res.data?.[0]?.revised_prompt,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Проверяем план прямо из БД
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const role = dbUser?.role ?? "USER";
  if (role === "USER") {
    return NextResponse.json(
      { error: "Генерация изображений доступна на тарифе Про и Безлимит" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }

  const { prompt, size, quality = "standard", model } = parsed.data;
  const { width, height } = sizeToWH(size);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const generation = await db.imageGeneration.create({
    data: { userId, prompt, size: `${width}x${height}`, status: "GENERATING" },
  });

  try {
    let result: { url: string; revisedPrompt?: string };

    // OpenAI DALL-E 3 — если ключ есть
    if (process.env.OPENAI_API_KEY?.startsWith("sk-") && !process.env.OPENAI_API_KEY.includes("...")) {
      const dalleSize =
        size === "1792x1024" ? "1792x1024" :
        size === "1024x1792" ? "1024x1792" : "1024x1024";
      result = await generateViaOpenAI(prompt, dalleSize, quality);
    } else {
      // Pollinations.ai — бесплатно, без ключей
      result = await generateViaPollinations(prompt, width, height, model);
    }

    if (!result.url) throw new Error("Пустой URL");

    const updated = await db.imageGeneration.update({
      where: { id: generation.id },
      data: {
        status: "COMPLETED",
        imageUrl: result.url,
        revisedPrompt: result.revisedPrompt,
        quality: quality === "hd" ? "HD" : "STANDARD",
      },
    });

    await db.dailyUsageSummary.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, imagesCount: 1 },
      update: { imagesCount: { increment: 1 } },
    });

    return NextResponse.json({ generation: updated });

  } catch (error) {
    console.error("Image generation error:", error);
    await db.imageGeneration.update({
      where: { id: generation.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Ошибка",
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка генерации" },
      { status: 500 }
    );
  }
}
