"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function LandingNavbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center h-16 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">ИИ Хаб</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-8">
          {[
            { label: "Возможности", href: "#features" },
            { label: "Модели", href: "#models" },
            { label: "Тарифы", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Войти</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Начать бесплатно
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
