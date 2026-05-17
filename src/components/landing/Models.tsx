"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MODELS } from "@/lib/constants/models";

const PROVIDER_LOGOS: Record<string, string> = {
  openai: "🟢", anthropic: "🟠", google: "🔵",
  deepseek: "💠", grok: "⚫", openrouter: "🟣",
};

const PROVIDER_NAMES_RU: Record<string, string> = {
  openai: "OpenAI", anthropic: "Anthropic", google: "Google",
  deepseek: "DeepSeek", grok: "xAI / Grok", openrouter: "OpenRouter",
};

const BADGE_NAMES: Record<string, string> = {
  Popular: "Популярный", Best: "Лучший", Powerful: "Мощный",
  Reasoning: "Рассуждения", New: "Новое",
};

export function LandingModels() {
  return (
    <section id="models" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            На базе{" "}
            <span className="gradient-text">лучших ИИ в мире</span>
          </h2>
          <p className="text-muted-foreground">
            Переключайтесь между моделями мгновенно — без дополнительных подписок
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODELS.filter(m => m.provider !== "openrouter").slice(0, 8).map((model, idx) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{PROVIDER_LOGOS[model.provider] ?? "🤖"}</span>
                <div>
                  <div className="text-sm font-medium leading-tight">{model.displayName}</div>
                  <div className="text-xs text-muted-foreground">{PROVIDER_NAMES_RU[model.provider]}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {model.badge && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {BADGE_NAMES[model.badge] ?? model.badge}
                  </Badge>
                )}
                {model.supportsVision && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground">Зрение</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {model.contextWindow >= 1000000 ? "1M" : `${(model.contextWindow / 1000).toFixed(0)}K`} контекст
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
