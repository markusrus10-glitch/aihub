"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, LogIn } from "lucide-react";
import Link from "next/link";
import { PricingModal } from "@/components/billing/PricingModal";

const TITLES: Record<string, string> = {
  "/chat": "Дашборд",
  "/image-generation": "Генерация изображений",
  "/video": "Генерация видео",
  "/code": "Код",
  "/files": "Файлы",
  "/history": "История генераций",
  "/prompts": "Шаблоны",
  "/settings/profile": "Профиль",
  "/settings/billing": "Подписка",
  "/settings/preferences": "Настройки",
  "/admin": "Администратор",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showPricing, setShowPricing] = useState(false);

  const title = Object.entries(TITLES).find(([key]) => pathname === key || pathname.startsWith(key + "/"))?.[1] ?? "ИИ Хаб";
  const isPro = (session?.user?.planTier ?? "FREE") !== "FREE";

  return (
    <>
      <header className="flex items-center h-12 px-5 border-b bg-white shrink-0" style={{ borderColor: "#e5e7eb" }}>
        <span className="text-sm text-gray-400 font-medium">
          / <span className="text-gray-800">{title}</span>
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {!isPro && (
            <button
              onClick={() => setShowPricing(true)}
              className="flex items-center gap-2 h-8 px-4 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: "#FFD6E0", color: "#D63B6E" }}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Выбрать тариф
            </button>
          )}

          {!session?.user && (
            <Link
              href="/login"
              className="flex items-center gap-2 h-8 px-4 rounded-xl text-sm font-bold text-white transition-all"
              style={{ backgroundColor: "#FF4B7D" }}
            >
              <LogIn className="h-3.5 w-3.5" />
              Войти в аккаунт
            </Link>
          )}
        </div>
      </header>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </>
  );
}
