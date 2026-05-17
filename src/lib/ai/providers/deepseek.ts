import OpenAI from "openai";
import { BaseAIProvider } from "./base";
import type {
  AIMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
} from "@/types/ai";
import { MODELS } from "@/lib/constants/models";

export class DeepSeekProvider extends BaseAIProvider {
  readonly id = "deepseek";
  readonly displayName = "DeepSeek";
  readonly models = MODELS.filter((m) => m.provider === "deepseek");

  private getClient(apiKey?: string) {
    return new OpenAI({
      apiKey: apiKey ?? process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
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
    let reasoning = "";
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let finishReason = "stop";

    const stream = await client.chat.completions.create(
      {
        model: request.model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: true,
      } as OpenAI.ChatCompletionCreateParamsStreaming,
      { signal }
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      // DeepSeek R1 includes reasoning_content
      const reasoningDelta = (delta as { reasoning_content?: string })?.reasoning_content;
      const textDelta = delta?.content ?? "";

      if (reasoningDelta) {
        reasoning += reasoningDelta;
        onChunk({ type: "reasoning", reasoning: reasoningDelta });
      }
      if (textDelta) {
        content += textDelta;
        onChunk({ type: "delta", delta: textDelta });
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
      id: `deepseek-${Date.now()}`,
      content,
      reasoning: reasoning || undefined,
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
      const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
