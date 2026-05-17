"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FAQ_ITEMS = [
  { q: "Какие ИИ модели доступны?", a: "ИИ Хаб поддерживает GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet, Claude Opus, Gemini 2.0 Flash, Gemini 2.5 Pro, DeepSeek R1, Grok 2 и многие другие через OpenRouter. Новые модели добавляются регулярно." },
  { q: "Нужны ли отдельные ключи для каждой модели?", a: "Нет! Ваша подписка покрывает все модели. На тарифе Безлимит вы также можете использовать свои API ключи для ещё большего контроля." },
  { q: "Как работает оплата?", a: "Мы используем Stripe для безопасной оплаты. Списание происходит ежемесячно, отмена возможна в любое время. Никаких скрытых платежей." },
  { q: "Можно ли экспортировать историю чатов?", a: "Да! Любой чат можно экспортировать в JSON, Markdown, PDF или HTML. Также можно поделиться чатом по публичной ссылке." },
  { q: "Мои данные в безопасности?", a: "Конфиденциальность — наш приоритет. Ваши чаты приватны по умолчанию. Мы не используем ваши переписки для обучения ИИ моделей." },
  { q: "Какие форматы файлов поддерживаются?", a: "PDF, DOCX, TXT, CSV и популярные форматы изображений (PNG, JPG, WebP). ИИ может читать и анализировать содержимое загруженных файлов." },
];

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Частые вопросы</h2>
          <p className="text-muted-foreground">Всё что нужно знать об ИИ Хаб</p>
        </motion.div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-sm">{item.q}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", open === idx && "rotate-180")} />
              </button>
              {open === idx && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
