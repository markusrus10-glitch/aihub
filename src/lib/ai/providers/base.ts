import type {
  AIMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
  StreamChunk,
} from "@/types/ai";
import type { ModelDefinition } from "@/lib/constants/models";

export abstract class BaseAIProvider {
  abstract readonly id: string;
  abstract readonly displayName: string;
  abstract readonly models: ModelDefinition[];

  abstract streamChat(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<ChatCompletionResponse>;

  generateImage?(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse>;

  transcribeAudio?(audioBuffer: Buffer, mimeType: string): Promise<string>;

  abstract countTokens(messages: AIMessage[], model: string): Promise<number>;

  abstract validateApiKey(apiKey: string): Promise<boolean>;

  protected formatMessages(
    messages: AIMessage[],
    systemPrompt?: string
  ): AIMessage[] {
    const formatted: AIMessage[] = [];
    if (systemPrompt) {
      formatted.push({ role: "system", content: systemPrompt });
    }
    formatted.push(...messages.filter((m) => m.role !== "system"));
    return formatted;
  }
}
