"use client";

import { motion } from "framer-motion";
import { MessageSquare, Image, Code, FolderOpen, Zap, Shield, Share2, Mic, BookOpen } from "lucide-react";

const FEATURES = [
  { icon: MessageSquare, title: "Мультимодельный чат", description: "Переключайтесь между ИИ моделями прямо в разговоре. Сравнивайте ответы.", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Image, title: "Генерация изображений", description: "Создавайте изображения с помощью DALL-E 3. Разные размеры и стили.", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Code, title: "Помощник по коду", description: "Генерация, объяснение и отладка кода с интеграцией Monaco Editor.", color: "text-green-500", bg: "bg-green-50" },
  { icon: FolderOpen, title: "Анализ файлов", description: "Загружайте PDF, изображения, Word — ИИ читает и анализирует их.", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Zap, title: "Стриминг в реальном времени", description: "Ответы появляются мгновенно. Остановите генерацию одним нажатием.", color: "text-yellow-500", bg: "bg-yellow-50" },
  { icon: BookOpen, title: "Библиотека промптов", description: "Сохраняйте и переиспользуйте лучшие промпты. Просматривайте публичные.", color: "text-cyan-500", bg: "bg-cyan-50" },
  { icon: Share2, title: "Поделиться чатом", description: "Отправьте разговор по публичной ссылке. Идеально для совместной работы.", color: "text-pink-500", bg: "bg-pink-50" },
  { icon: Mic, title: "Голосовой ввод", description: "Говорите сообщения — Whisper мгновенно переводит в текст.", color: "text-indigo-500", bg: "bg-indigo-50" },
  { icon: Shield, title: "Свои API ключи", description: "Используйте собственные ключи. Полный контроль над расходами.", color: "text-emerald-500", bg: "bg-emerald-50" },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Всё необходимое.{" "}
            <span className="gradient-text">Ничего лишнего.</span>
          </h2>
          <p className="text-muted-foreground">
            Полноценная ИИ платформа для профессионалов и команд.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-5 border border-border hover:border-primary/20 hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
