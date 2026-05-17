import OpenAI from "openai";
import { BaseAIProvider } from "./base";
import type {
  AIMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
  StreamChunk,
} from "@/types/ai";
import { MODELS } from "@/lib/constants/models";

export class OpenAIProvider extends BaseAIProvider {
  readonly id = "openai";
  readonly displayName = "OpenAI";
  readonly models = MODELS.filter((m) => m.provider === "openai");

  private getClient(apiKey?: string) {
    return new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
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
        stream_options: { include_usage: true },
        response_format: request.jsonMode ? { type: "json_object" } : undefined,
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
        onChunk({ type: "usage", usage });
      }
    }

    onChunk({ type: "done", finishReason: finishReason as StreamChunk["finishReason"] });

    return {
      id: `openai-${Date.now()}`,
      content,
      model: request.model,
      usage,
      finishReason,
      durationMs: Date.now() - startTime,
    };
  }

  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const client = this.getClient();

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: request.prompt,
      size: request.size ?? "1024x1024",
      quality: request.quality ?? "standard",
      style: request.style ?? "vivid",
      n: 1,
      response_format: "url",
    });

    const imageData = response.data ?? [];
    return {
      url: imageData[0]?.url ?? "",
      revisedPrompt: imageData[0]?.revised_prompt ?? undefined,
    };
  }

  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    const client = this.getClient();

    const arrayBuffer = audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const file = new File([blob], "audio.webm", { type: mimeType });

    const response = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    return response.text;
  }

  async countTokens(messages: AIMessage[], _model: string): Promise<number> {
    // Rough estimate: 4 chars per token
    const totalChars = messages.reduce((acc, m) => {
      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      return acc + content.length;
    }, 0);
    return Math.ceil(totalChars / 4);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = new OpenAI({ apiKey });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
