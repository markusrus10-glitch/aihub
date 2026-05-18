"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "week",
    label: "Неделя",
    desc: "доступа ко всем нейросетям",
    price: 299,
    unit: "нед",
    oldPrice: 427,
    badge: null,
    badgeColor: null,
  },
  {
    id: "two-weeks",
    label: "14 дней",
    desc: "доступа ко всем нейросетям",
    price: 550,
    unit: "14 дней",
    oldPrice: 786,
    badge: "САМЫЙ ПОПУЛЯРНЫЙ",
    badgeColor: "#FF4B7D",
  },
  {
    id: "month",
    label: "Месяц",
    desc: "доступа ко всем нейросетям",
    price: 1369,
    unit: "мес",
    oldPrice: 1956,
    badge: "САМЫЙ ВЫГОДНЫЙ",
    badgeColor: "#CCFF00",
  },
] as const;

/* Иконки ИИ-сервисов вокруг центра */
const AI_ICONS = [
  { bg: "#10a37f", pos: "bottom-0 right-4", size: 44, icon: (
    <svg viewBox="0 0 41 41" fill="none" style={{ width: 24, height: 24 }}>
      <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835A9.964 9.964 0 0 0 18.306.5a10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.516 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813z" fill="white"/>
    </svg>
  )},
  { bg: "#1d9bf0", pos: "top-2 right-0", size: 40, icon: <span style={{ fontSize: 22, color: "white" }}>𝕏</span> },
  { bg: "#7c3aed", pos: "top-0 left-1/2 -translate-x-1/2", size: 38, icon: <span style={{ fontSize: 18, color: "white" }}>✦</span> },
  { bg: "#f59e0b", pos: "top-2 left-0", size: 40, icon: <span style={{ fontSize: 20 }}>🍌</span> },
  { bg: "#111827", pos: "bottom-4 left-0", size: 38, icon: <span style={{ fontSize: 18, color: "white" }}>◎</span> },
  { bg: "linear-gradient(135deg,#4facfe,#00f2fe)", pos: "bottom-0 left-4", size: 40, icon: <span style={{ fontSize: 18, color: "white" }}>⬡</span> },
];

interface Props {
  onClose: () => void;
}

export function PricingModal({ onClose }: Props) {
  const [selected, setSelected] = useState<typeof PLANS[number]["id"]>("two-weeks");
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/yookassa/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Ошибка оплаты");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = PLANS.find((p) => p.id === selected)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden"
        style={{ maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка с иконками */}
        <div className="relative pt-8 pb-4 flex flex-col items-center" style={{ backgroundColor: "#fafafa" }}>
          {/* Кнопка закрыть */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all"
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>

          {/* Иконки в кружке */}
          <div className="relative w-40 h-36 mb-3">
            {/* Центральная иконка — наша */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex items-center justify-center shadow-lg z-10"
              style={{ width: 60, height: 60, background: "linear-gradient(135deg,#FF6B9D,#C9177E)" }}
            >
              <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
                <line x1="9" y1="9" x2="9" y2="23" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                <line x1="23" y1="9" x2="23" y2="23" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                <line x1="23" y1="10" x2="9" y2="22" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Вокруг иконки */}
            {AI_ICONS.map((icon, i) => (
              <div
                key={i}
                className={`absolute ${icon.pos} rounded-2xl flex items-center justify-center shadow-md`}
                style={{
                  width: icon.size,
                  height: icon.size,
                  background: icon.bg,
                }}
              >
                {icon.icon}
              </div>
            ))}
          </div>

          {/* Рейтинг */}
          <div className="flex items-center gap-1.5 mb-2">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm font-bold text-gray-900 ml-1">4.85</span>
            <span className="text-sm text-gray-400">• 24 854 отзыва</span>
          </div>

          {/* Заголовок */}
          <h2 className="text-xl font-black text-gray-900 text-center px-4">
            Chat GPT 5.5, Grok 4, Veo 3.1
          </h2>
          <p className="text-sm text-gray-500 text-center px-6 mt-1">
            Создавай изображения и видео, общайся с Чатом ГПТ и всё в одном месте
          </p>
        </div>

        {/* Плашка тестового периода */}
        <div
          className="mx-4 mt-4 rounded-xl px-4 py-2 text-center text-xs font-semibold"
          style={{ backgroundColor: "#CCFF00", color: "#555" }}
        >
          🎉 Цены актуальны на период теста
        </div>

        {/* Тарифы */}
        <div className="px-4 pt-3 pb-4 space-y-2">
          {PLANS.map((plan) => {
            const isSelected = selected === plan.id;
            const discount = Math.round((1 - plan.price / plan.oldPrice) * 100);

            return (
              <div key={plan.id} className="relative">
                {/* Плашка сверху */}
                {plan.badge && (
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black tracking-wide z-10 whitespace-nowrap"
                    style={{
                      backgroundColor: plan.badgeColor!,
                      color: plan.badgeColor === "#CCFF00" ? "#555" : "white",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <button
                  onClick={() => setSelected(plan.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all text-left"
                  style={{
                    borderColor: isSelected ? "#FF4B7D" : "#e5e7eb",
                    backgroundColor: isSelected ? "#fff0f4" : "white",
                    marginTop: plan.badge ? 6 : 0,
                  }}
                >
                  {/* Радио */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: isSelected ? "#FF4B7D" : "#d1d5db",
                      backgroundColor: isSelected ? "#FF4B7D" : "white",
                    }}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Текст */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{plan.label}</p>
                    <p className="text-xs text-gray-400">{plan.desc}</p>
                  </div>

                  {/* Цена */}
                  <div className="text-right shrink-0">
                    <p className="font-black text-gray-900">
                      {plan.price.toLocaleString("ru")}
                      <span className="text-xs font-medium text-gray-500 ml-0.5">₽/{plan.unit}</span>
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-gray-400 line-through">
                        {plan.oldPrice.toLocaleString("ru")}
                      </span>
                      <span
                        className="text-xs font-bold px-1 rounded"
                        style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}
                      >
                        -{discount}%
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Кнопка */}
        <div className="px-4 pb-5">
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full h-14 rounded-2xl font-black text-white text-base transition-all hover:brightness-105 active:scale-95"
            style={{ backgroundColor: "#FF4B7D" }}
          >
            Приобрести
          </button>
        </div>
      </div>
    </div>
  );
}
