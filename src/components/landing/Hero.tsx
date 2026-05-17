"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-24 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-400/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            GPT-4o · Claude · Gemini · DeepSeek · Grok
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
            Все ИИ модели.{" "}
            <span className="gradient-text">Одна платформа.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Переключайтесь между лучшими ИИ моделями мгновенно.
            GPT-4o, Claude, Gemini, DeepSeek и другие — в одном красивом интерфейсе.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8 text-base h-12">
                <Sparkles className="h-5 w-5" />
                Начать бесплатно
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 text-base h-12">
                Войти в аккаунт
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Карта не нужна · 20 сообщений в день бесплатно
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-2xl border border-border overflow-hidden shadow-xl"
        >
          <div className="bg-card p-4 border-b border-border flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 text-center text-xs text-muted-foreground">ИИ Хаб — Чат</div>
          </div>
          <div className="bg-background p-6 text-left space-y-4">
            <div className="flex gap-3">
              <div className="h-7 w-7 bg-primary rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">В</span>
              </div>
              <div className="bg-primary text-white rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-md">
                Сравни Claude 3.5 Sonnet и GPT-4o для написания кода
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="text-xs text-muted-foreground">Claude 3.5 Sonnet</div>
                <div className="bg-muted/50 rounded-2xl px-4 py-3 text-sm leading-relaxed border border-border">
                  Обе модели отличны для написания кода. <strong className="text-foreground">Claude 3.5 Sonnet</strong> превосходит при работе со сложными архитектурами и большими кодовыми базами...
                  <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-cursor align-text-bottom" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
