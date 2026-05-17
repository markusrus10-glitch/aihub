"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PLANS = [
  {
    name: "Бесплатный",
    price: 0,
    icon: Zap,
    color: "text-zinc-500",
    features: ["20 сообщений в день", "GPT-4o Mini + Gemini Flash", "2 загрузки файлов в день", "Контекст 8K токенов", "История чатов"],
  },
  {
    name: "Про",
    price: 19,
    icon: Crown,
    color: "text-yellow-500",
    popular: true,
    features: ["1 000 сообщений в день", "Все ИИ модели", "30 генераций изображений в день", "50 загрузок файлов в день", "Контекст 128K токенов", "Приоритетная поддержка"],
  },
  {
    name: "Безлимит",
    price: 49,
    icon: Sparkles,
    color: "text-purple-500",
    features: ["Безлимитные сообщения", "Все модели + свои API ключи", "Безлимитная генерация изображений", "Безлимитные загрузки", "Контекст 200K токенов", "Доступ к API", "Приоритетная поддержка"],
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Простые и прозрачные{" "}
            <span className="gradient-text">тарифы</span>
          </h2>
          <p className="text-muted-foreground">Начните бесплатно, перейдите на платный когда понадобится больше</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`relative h-full flex flex-col ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-xs px-3">Популярный</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className={`w-10 h-10 rounded-xl ${plan.popular ? "bg-primary/10" : "bg-muted"} flex items-center justify-center mb-3`}>
                    <plan.icon className={`w-5 h-5 ${plan.color}`} />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    {plan.price > 0 && <span className="text-sm text-muted-foreground">/месяц</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.price === 0 ? "Начать бесплатно" : `Выбрать ${plan.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
