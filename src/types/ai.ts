export interface AIMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string | ContentPart[];
  toolCallId?: string;
  name?: string;
}

export interface ContentPart {
  type: "text" | "image_url" | "file";
  text?: string;
  image_url?: { url: string; detail?: "low" | "high" | "auto" };
  file?: { url: string; mimeType: string };
}

export interface StreamChunk {
  type: "delta" | "usage" | "done" | "error" | "reasoning";
  delta?: string;
  reasoning?: string;
  usage?: TokenUsage;
  error?: string;
  finishReason?: "stop" | "length" | "tool_calls" | "content_filter";
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
  jsonMode?: boolean;
  stopSequences?: string[];
  userId?: string;
  userApiKey?: string;
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  reasoning?: string;
  model: string;
  usage: TokenUsage;
  finishReason: string;
  durationMs: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number;
}

export interface ImageGenerationResponse {
  url: string;
  revisedPrompt?: string;
  b64Json?: string;
}
