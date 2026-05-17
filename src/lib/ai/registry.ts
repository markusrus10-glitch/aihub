import { BaseAIProvider } from "./providers/base";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GoogleProvider } from "./providers/google";
import { DeepSeekProvider } from "./providers/deepseek";
import { GrokProvider } from "./providers/grok";
import { OpenRouterProvider } from "./providers/openrouter";
import { MODELS } from "@/lib/constants/models";

class ProviderRegistry {
  private providers: Map<string, BaseAIProvider> = new Map();
  private modelToProvider: Map<string, string> = new Map();

  constructor() {
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
    this.register(new GoogleProvider());
    this.register(new DeepSeekProvider());
    this.register(new GrokProvider());
    this.register(new OpenRouterProvider());

    // Build model → provider index
    for (const model of MODELS) {
      this.modelToProvider.set(model.id, model.provider);
    }
  }

  register(provider: BaseAIProvider) {
    this.providers.set(provider.id, provider);
  }

  getProviderForModel(modelId: string): BaseAIProvider {
    const providerId = this.modelToProvider.get(modelId);
    if (!providerId) {
      // Try OpenRouter as fallback
      const or = this.providers.get("openrouter");
      if (or) return or;
      throw new Error(`No provider found for model: ${modelId}`);
    }
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Provider not registered: ${providerId}`);
    return provider;
  }

  getProvider(id: string): BaseAIProvider {
    const provider = this.providers.get(id);
    if (!provider) throw new Error(`Provider not found: ${id}`);
    return provider;
  }

  listModels() {
    return MODELS;
  }

  isModelAvailable(modelId: string, planTier: string): boolean {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return false;

    const tiers = ["FREE", "PRO", "UNLIMITED"];
    const userTierIndex = tiers.indexOf(planTier);
    const modelTierIndex = tiers.indexOf(model.minPlanTier);

    return userTierIndex >= modelTierIndex;
  }
}

export const providerRegistry = new ProviderRegistry();
