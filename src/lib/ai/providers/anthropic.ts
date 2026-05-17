import Anthropic from "@anthropic-ai/sdk";
import { BaseAIProvider } from "./base";
import type {
  AIMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
} from "@/types/ai";
import { MODELS } from "@/lib/constants/models";

export class AnthropicProvider extends BaseAIProvider {
  readonly id = "anthropic";
  readonly displayName = "Anthropic";
  readonly models = MODELS.filter((m) => m.provider === "anthropic");

  private getClient(apiKey?: string) {
    return new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
  }

  async streamChat(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<ChatCompletionResponse> {
    const client = this.getClient(request.userApiKey);
    const startTime = Date.now();

    const messages = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      }));

    let content = "";
    let reasoning = "";
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let finishReason = "stop";

    const stream = client.messages.stream({
      model: request.model,
      messages,
      system: request.systemPrompt,
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
    });

    // Handle abort
    if (signal) {
      signal.addEventListener("abort", () => stream.abort());
    }

    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          content += event.delta.text;
          onChunk({ type: "delta", delta: event.delta.text });
        } else if (event.delta.type === "thinking_delta") {
          reasoning += event.delta.thinking;
          onChunk({ type: "reasoning", reasoning: event.delta.thinking });
        }
      }

      if (event.type === "message_delta") {
        if (event.usage) {
          usage = {
            promptTokens: 0,
            completionTokens: event.usage.output_tokens,
            totalTokens: event.usage.output_tokens,
          };
        }
        if (event.delta.stop_reason) {
          finishReason =
            event.delta.stop_reason === "end_turn" ? "stop" : event.delta.stop_reason;
        }
      }

      if (event.type === "message_start") {
        usage.promptTokens = event.message.usage.input_tokens;
        usage.totalTokens = event.message.usage.input_tokens;
      }
    }

    usage.totalTokens = usage.promptTokens + usage.completionTokens;
    onChunk({ type: "usage", usage });
    onChunk({ type: "done", finishReason: finishReason as StreamChunk["finishReason"] });

    return {
      id: `anthropic-${Date.now()}`,
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
      const client = new Anthropic({ apiKey });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
