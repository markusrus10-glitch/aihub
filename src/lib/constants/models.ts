export interface ModelDefinition {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsJson: boolean;
  inputCostPer1k: number;
  outputCostPer1k: number;
  minPlanTier: "FREE" | "PRO" | "UNLIMITED";
  badge?: string;
  isNew?: boolean;
  isFast?: boolean;
  icon?: string;
  priceLabel?: string;
}

export const MODELS: ModelDefinition[] = [
  // ── OpenAI ──────────────────────────────────────────────────────────────────
  {
    id: "openai/gpt-5.4",
    provider: "openrouter", displayName: "GPT-5.4", description: "Новейший GPT",
    contextWindow: 128000, maxOutputTokens: 16384,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.264, outputCostPer1k: 0.264,
    minPlanTier: "FREE", isNew: true, icon: "G", priceLabel: "~264/1К",
  },
  {
    id: "openai/gpt-5.2",
    provider: "openrouter", displayName: "GPT-5.2", description: "GPT-5.2",
    contextWindow: 128000, maxOutputTokens: 16384,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.3002, outputCostPer1k: 0.3002,
    minPlanTier: "FREE", icon: "G", priceLabel: "~300,2/1К",
  },
  {
    id: "openai/gpt-4o",
    provider: "openrouter", displayName: "GPT-4o", description: "GPT-4o мультимодальный",
    contextWindow: 128000, maxOutputTokens: 16384,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.1386, outputCostPer1k: 0.1386,
    minPlanTier: "FREE", icon: "G", priceLabel: "~138,6/1К",
  },
  {
    id: "openai/gpt-4o-mini",
    provider: "openrouter", displayName: "GPT-4o-mini", description: "Быстрый и дешёвый",
    contextWindow: 128000, maxOutputTokens: 16384,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.011, outputCostPer1k: 0.011,
    minPlanTier: "FREE", isFast: true, icon: "G", priceLabel: "~11/1К",
  },
  {
    id: "openai/gpt-5.4-mini",
    provider: "openrouter", displayName: "GPT-5-mini", description: "Компактный GPT-5",
    contextWindow: 128000, maxOutputTokens: 16384,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.0418, outputCostPer1k: 0.0418,
    minPlanTier: "FREE", icon: "G", priceLabel: "~41,8/1К",
  },
  {
    id: "openai/gpt-5.4-nano",
    provider: "openrouter", displayName: "GPT-5-nano", description: "Самый быстрый GPT",
    contextWindow: 128000, maxOutputTokens: 8192,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.0076, outputCostPer1k: 0.0076,
    minPlanTier: "FREE", isFast: true, icon: "G", priceLabel: "~7,6/1К",
  },
  // ── Gemini ───────────────────────────────────────────────────────────────────
  {
    id: "google/gemini-2.5-flash-lite-preview-09-2025",
    provider: "openrouter", displayName: "Gemini 2.5 Flash", description: "Быстрый Gemini",
    contextWindow: 1000000, maxOutputTokens: 8192,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.0552, outputCostPer1k: 0.0552,
    minPlanTier: "FREE", isFast: true, icon: "◆", priceLabel: "~55,2/1К",
  },
  {
    id: "google/gemini-flash-1.5",
    provider: "openrouter", displayName: "Gemini 3.0 Flash", description: "Google Gemini Flash",
    contextWindow: 1000000, maxOutputTokens: 8192,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.051, outputCostPer1k: 0.051,
    minPlanTier: "FREE", isFast: true, icon: "◆", priceLabel: "~51/1К",
  },
  {
    id: "google/gemini-2.5-pro-preview",
    provider: "openrouter", displayName: "Gemini 2.5 Pro", description: "Мощный Gemini",
    contextWindow: 1000000, maxOutputTokens: 65536,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.2128, outputCostPer1k: 0.2128,
    minPlanTier: "FREE", icon: "◆", priceLabel: "~212,8/1К",
  },
  {
    id: "google/gemini-3.1-pro-preview",
    provider: "openrouter", displayName: "Gemini 3.1 Pro", description: "Новый Gemini Pro",
    contextWindow: 1000000, maxOutputTokens: 8192,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.21, outputCostPer1k: 0.21,
    minPlanTier: "FREE", isNew: true, icon: "◆", priceLabel: "~210/1К",
  },
  // ── DeepSeek ─────────────────────────────────────────────────────────────────
  {
    id: "deepseek/deepseek-v4-flash",
    provider: "openrouter", displayName: "DeepSeek V4 Flash", description: "Быстрый DeepSeek",
    contextWindow: 65536, maxOutputTokens: 8000,
    supportsVision: false, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.035, outputCostPer1k: 0.035,
    minPlanTier: "FREE", isFast: true, icon: "D", priceLabel: "~35/1К",
  },
  {
    id: "deepseek/deepseek-v4-pro",
    provider: "openrouter", displayName: "DeepSeek V4 Pro", description: "DeepSeek с reasoning",
    contextWindow: 65536, maxOutputTokens: 8000,
    supportsVision: false, supportsTools: false, supportsJson: true,
    inputCostPer1k: 0.07, outputCostPer1k: 0.07,
    minPlanTier: "FREE", badge: "Reasoning", icon: "D", priceLabel: "~70/1К",
  },
  // ── Grok ─────────────────────────────────────────────────────────────────────
  {
    id: "x-ai/grok-4-fast",
    provider: "openrouter", displayName: "Grok 4", description: "xAI Grok 4",
    contextWindow: 131072, maxOutputTokens: 131072,
    supportsVision: false, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.234, outputCostPer1k: 0.234,
    minPlanTier: "FREE", icon: "X", priceLabel: "~234/1К",
  },
  {
    id: "x-ai/grok-4.1-fast",
    provider: "openrouter", displayName: "Grok 4 Fast", description: "Быстрый Grok",
    contextWindow: 131072, maxOutputTokens: 131072,
    supportsVision: false, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.0114, outputCostPer1k: 0.0114,
    minPlanTier: "FREE", isFast: true, isNew: true, icon: "X", priceLabel: "~11,4/1К",
  },
  // ── Claude ───────────────────────────────────────────────────────────────────
  {
    id: "anthropic/claude-sonnet-4.6",
    provider: "openrouter", displayName: "Claude Sonnet 4.6", description: "Лучший Claude",
    contextWindow: 200000, maxOutputTokens: 8192,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.03, outputCostPer1k: 0.03,
    minPlanTier: "FREE", badge: "Лучший", icon: "A", priceLabel: "~30/1К",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    provider: "openrouter", displayName: "Claude Haiku", description: "Быстрый Claude",
    contextWindow: 200000, maxOutputTokens: 4096,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.0025, outputCostPer1k: 0.0025,
    minPlanTier: "FREE", isFast: true, icon: "A", priceLabel: "~2,5/1К",
  },
  // ── Llama ────────────────────────────────────────────────────────────────────
  {
    id: "meta-llama/llama-4-maverick",
    provider: "openrouter", displayName: "Llama 4 Maverick", description: "Meta Llama 4",
    contextWindow: 1000000, maxOutputTokens: 16384,
    supportsVision: true, supportsTools: true, supportsJson: true,
    inputCostPer1k: 0.0002, outputCostPer1k: 0.0006,
    minPlanTier: "FREE", isNew: true, icon: "L", priceLabel: "~0,2/1К",
  },
];

export const MODEL_MAP = new Map(MODELS.map((m) => [m.id, m]));

export const PROVIDER_NAMES: Record<string, string> = {
  openrouter: "OpenRouter",
};

export const MODEL_ICON_COLORS: Record<string, string> = {
  "G": "#10a37f",
  "◆": "#4285f4",
  "D": "#1e40af",
  "X": "#111111",
  "A": "#d97706",
  "L": "#7c3aed",
};
