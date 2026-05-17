import OpenAI from "openai";
import { BaseAIProvider } from "./base";
import type {
  AIMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
} from "@/types/ai";
import { MODELS } from "@/lib/constants/models";

export class OpenRouterProvider extends BaseAIProvider {
  readonly id = "openrouter";
  readonly displayName = "OpenRouter";
  readonly models = MODELS.filter((m) => m.provider === "openrouter");

  private getClient(apiKey?: string) {
    return new OpenAI({
      apiKey: apiKey ?? process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
        "X-Title": "AI Hub",
      },
    });
  }

  async streamChat(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<ChatCompletionResponse> {
    const client = this.getClient(request.userApiKey);
    const startTime = Date.now();

    const messages = this.formatMessages(
      request.messages,
      request.systemPrompt
    ) as OpenAI.ChatCompletionMessageParam[];

    let content = "";
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let finishReason = "stop";

    const stream = await client.chat.completions.create(
      {
        model: request.model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: true,
      },
      { signal }
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        content += delta;
        onChunk({ type: "delta", delta });
      }
      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }
      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens,
          completionTokens: chunk.usage.completion_tokens,
          totalTokens: chunk.usage.total_tokens,
        };
      }
    }

    onChunk({ type: "usage", usage });
    onChunk({ type: "done", finishReason: finishReason as StreamChunk["finishReason"] });

    return {
      id: `openrouter-${Date.now()}`,
      content,
      model: request.model,
      usage,
      finishReason,
      durationMs: Date.now() - startTime,
    };
  }

  async countTokens(messages: AIMessage[]): Promise<number> {
    const totalChars = messages.reduce((acc, m) => {
      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      return acc + content.length;
    }, 0);
    return Math.ceil(totalChars / 4);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
