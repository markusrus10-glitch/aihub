"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { PricingModal } from "@/components/billing/PricingModal";

export default function BillingPage() {
  const { data: session } = useSession();
  const [showPricing, setShowPricing] = useState(false);

  const planTier = session?.user?.planTier ?? "FREE";
  const isPro = planTier !== "FREE";

  return (
    <>
      <div
        className="flex flex-col h-full overflow-auto"
        style={{
          backgroundColor: "#f0f0f0",
          backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="max-w-2xl mx-auto w-full px-4 py-8">

          {/* Текущий тариф */}
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: isPro ? "#fff0f4" : "#f3f4f6" }}>
                <Sparkles className="h-5 w-5" style={{ color: isPro ? "#FF4B7D" : "#9ca3af" }} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Текущий тариф</p>
                <p className="font-bold text-gray-900">
                  {planTier === "FREE" ? "Бесплатный" : planTier === "PRO" ? "Про" : "Безлимит"}
                </p>
              </div>
            </div>

            {isPro ? (
              <div
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ backgroundColor: "#fff0f4", color: "#FF4B7D" }}
              >
                <Sparkles className="h-4 w-4" />
                Подписка активна
              </div>
            ) : (
              <button
                onClick={() => setShowPricing(true)}
                className="w-full h-11 rounded-xl font-bold text-gray-900 text-sm transition-all hover:brightness-105"
                style={{ backgroundColor: "#CCFF00" }}
              >
                + Активировать Нейросети
              </button>
            )}
          </div>

          {/* Плашка тестового периода */}
          <div
            className="rounded-2xl px-5 py-3 mb-4 text-center text-sm font-bold"
            style={{ backgroundColor: "#CCFF00", color: "#444" }}
          >
            🎉 Цены актуальны на период теста
          </div>

          {/* Карточки тарифов (превью) */}
          <div className="space-y-3 mb-6">

            {/* Неделя */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Неделя</p>
                  <p className="text-xs text-gray-400 mt-0.5">доступа ко всем нейросетям</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-lg">299 <span className="text-sm font-medium text-gray-500">₽/нед</span></p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-xs text-gray-400 line-through">427₽</span>
                    <span className="text-xs font-bold px-1 rounded" style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}>-30%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 14 дней — популярный */}
            <div className="relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black text-white whitespace-nowrap z-10" style={{ backgroundColor: "#FF4B7D" }}>
                САМЫЙ ПОПУЛЯРНЫЙ
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 mt-1.5" style={{ borderColor: "#FF4B7D" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">14 дней</p>
                    <p className="text-xs text-gray-400 mt-0.5">доступа ко всем нейросетям</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-lg">550 <span className="text-sm font-medium text-gray-500">₽/14 дней</span></p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-gray-400 line-through">786₽</span>
                      <span className="text-xs font-bold px-1 rounded" style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}>-30%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Месяц — выгодный */}
            <div className="relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black whitespace-nowrap z-10" style={{ backgroundColor: "#CCFF00", color: "#444" }}>
                САМЫЙ ВЫГОДНЫЙ
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mt-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Месяц</p>
                    <p className="text-xs text-gray-400 mt-0.5">доступа ко всем нейросетям</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-lg">1 369 <span className="text-sm font-medium text-gray-500">₽/мес</span></p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-gray-400 line-through">1 956₽</span>
                      <span className="text-xs font-bold px-1 rounded" style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}>-30%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Большая кнопка */}
          {!isPro && (
            <button
              onClick={() => setShowPricing(true)}
              className="w-full h-14 rounded-2xl font-black text-white text-base transition-all hover:brightness-105 active:scale-95"
              style={{ backgroundColor: "#FF4B7D" }}
            >
              Приобрести
            </button>
          )}

        </div>
      </div>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </>
  );
}
