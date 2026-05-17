import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { providerRegistry } from "@/lib/ai/registry";
import { encodeSSE } from "@/lib/ai/stream";
import { z } from "zod";
import type { AIMessage, StreamChunk } from "@/types/ai";

const requestSchema = z.object({
  chatId: z.string(),
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system", "tool"]),
      content: z.union([z.string(), z.array(z.any())]),
    })
  ),
  temperature: z.number().min(0).max(2).optional().nullable(),
  maxTokens: z.number().min(1).max(200000).optional().nullable(),
  systemPrompt: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { chatId, model, messages, temperature, maxTokens, systemPrompt } = parsed.data;
  const userId = session.user.id;
  const planTier = session.user.planTier ?? "FREE";

  // Check model availability
  if (!providerRegistry.isModelAvailable(model, planTier)) {
    return NextResponse.json(
      { error: "Model not available on your plan" },
      { status: 403 }
    );
  }

  // Check daily usage limits
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyUsage = await db.dailyUsageSummary.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  const limits: Record<string, number> = { FREE: 20, PRO: 1000, UNLIMITED: -1 };
  const limit = limits[planTier] ?? 20;

  if (limit !== -1 && (dailyUsage?.messagesCount ?? 0) >= limit) {
    return NextResponse.json(
      { error: "Daily message limit reached. Upgrade your plan." },
      { status: 429 }
    );
  }

  // Verify chat ownership
  const chat = await db.chat.findFirst({
    where: { id: chatId, userId, deletedAt: null },
  });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  // Save user message
  const lastUserMessage = messages[messages.length - 1];
  const savedUserMsg = await db.message.create({
    data: {
      chatId,
      userId,
      role: "user",
      content:
        typeof lastUserMessage.content === "string"
          ? lastUserMessage.content
          : JSON.stringify(lastUserMessage.content),
      model,
    },
  });

  const encoder = new TextEncoder();
  let assistantContent = "";
  let assistantReasoning: string | undefined;
  let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let durationMs = 0;
  const startTime = Date.now();

  const provider = providerRegistry.getProviderForModel(model);

  const stream = new ReadableStream({
    async start(controller) {
      const abortController = new AbortController();

      req.signal.addEventListener("abort", () => abortController.abort());

      try {
        const response = await provider.streamChat(
          {
            model,
            messages: messages as AIMessage[],
            temperature: temperature ?? undefined,
            maxTokens: maxTokens ?? undefined,
            systemPrompt: systemPrompt ?? undefined,
            userId,
          },
          (chunk: StreamChunk) => {
            if (chunk.type === "delta" && chunk.delta) {
              assistantContent += chunk.delta;
            }
            if (chunk.type === "reasoning" && chunk.reasoning) {
              assistantReasoning = (assistantReasoning ?? "") + chunk.reasoning;
            }
            if (chunk.type === "usage" && chunk.usage) {
              totalUsage = chunk.usage;
            }
            controller.enqueue(encoder.encode(encodeSSE(chunk)));
          },
          abortController.signal
        );

        durationMs = Date.now() - startTime;
        totalUsage = response.usage;
        assistantContent = response.content || assistantContent;

        // Если контент пустой — посылаем ошибку клиенту
        if (!assistantContent.trim()) {
          controller.enqueue(encoder.encode(encodeSSE({
            type: "error",
            error: "Модель не вернула ответ. Возможно недостаточно кредитов OpenRouter для этой модели. Попробуйте GPT-4o-mini.",
          })));
          controller.close();
          return;
        }

        // Save assistant message
        const savedAssistantMsg = await db.message.create({
          data: {
            chatId,
            userId,
            role: "assistant",
            content: assistantContent,
            reasoning: assistantReasoning,
            model,
            provider: provider.id,
            promptTokens: totalUsage.promptTokens,
            completionTokens: totalUsage.completionTokens,
            totalTokens: totalUsage.totalTokens,
            finishReason: response.finishReason,
            durationMs,
          },
        });

        // Update chat counters
        await db.chat.update({
          where: { id: chatId },
          data: {
            messageCount: { increment: 2 },
            totalTokensUsed: { increment: totalUsage.totalTokens },
            updatedAt: new Date(),
          },
        });

        // Update daily usage
        await db.dailyUsageSummary.upsert({
          where: { userId_date: { userId, date: today } },
          create: {
            userId,
            date: today,
            messagesCount: 1,
            totalTokens: totalUsage.totalTokens,
          },
          update: {
            messagesCount: { increment: 1 },
            totalTokens: { increment: totalUsage.totalTokens },
          },
        });

        // Record usage
        await db.usageRecord.create({
          data: {
            userId,
            usageType: "CHAT_MESSAGE",
            model,
            provider: provider.id,
            promptTokens: totalUsage.promptTokens,
            completionTokens: totalUsage.completionTokens,
            totalTokens: totalUsage.totalTokens,
            chatId,
            messageId: savedAssistantMsg.id,
          },
        });

        // Send final messageId to client
        controller.enqueue(
          encoder.encode(
            encodeSSE({
              type: "done",
              finishReason: response.finishReason as StreamChunk["finishReason"],
            })
          )
        );
      } catch (error) {
        if (!abortController.signal.aborted) {
          controller.enqueue(
            encoder.encode(
              encodeSSE({
                type: "error",
                error: error instanceof Error ? error.message : "Stream failed",
              })
            )
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
