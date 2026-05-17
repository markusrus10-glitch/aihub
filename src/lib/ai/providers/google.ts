import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { BaseAIProvider } from "./base";
import type {
  AIMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
} from "@/types/ai";
import { MODELS } from "@/lib/constants/models";

export class GoogleProvider extends BaseAIProvider {
  readonly id = "google";
  readonly displayName = "Google";
  readonly models = MODELS.filter((m) => m.provider === "google");

  private getClient(apiKey?: string) {
    return new GoogleGenerativeAI(apiKey ?? process.env.GOOGLE_AI_API_KEY!);
  }

  async streamChat(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<ChatCompletionResponse> {
    const client = this.getClient(request.userApiKey);
    const startTime = Date.now();

    const model = client.getGenerativeModel({
      model: request.model,
      systemInstruction: request.systemPrompt,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
        responseMimeType: request.jsonMode ? "application/json" : "text/plain",
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    // Convert messages to Gemini format
    const userMessages = request.messages.filter((m) => m.role !== "system");
    const history = userMessages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
    }));
    const lastMessage = userMessages[userMessages.length - 1];
    const lastContent = typeof lastMessage?.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage?.content);

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastContent);

    let content = "";
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    for await (const chunk of result.stream) {
      if (signal?.aborted) break;
      const text = chunk.text();
      content += text;
      onChunk({ type: "delta", delta: text });
    }

    const response = await result.response;
    const usageData = response.usageMetadata;
    if (usageData) {
      usage = {
        promptTokens: usageData.promptTokenCount ?? 0,
        completionTokens: usageData.candidatesTokenCount ?? 0,
        totalTokens: usageData.totalTokenCount ?? 0,
      };
    }

    onChunk({ type: "usage", usage });
    onChunk({ type: "done", finishReason: "stop" });

    return {
      id: `google-${Date.now()}`,
      content,
      model: request.model,
      usage,
      finishReason: "stop",
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
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
      await model.countTokens("test");
      return true;
    } catch {
      return false;
    }
  }
}
