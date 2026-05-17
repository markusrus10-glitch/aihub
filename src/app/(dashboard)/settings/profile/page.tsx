"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut, Mail, ChevronRight, Sparkles, Sun, Moon, Monitor } from "lucide-react";
import { PricingModal } from "@/components/billing/PricingModal";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [editingName, setEditingName] = useState(false);
  const [usage, setUsage] = useState<{ today: { messages: number; images: number } } | null>(null);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    fetch("/api/user/usage").then(r => r.json()).then(setUsage).catch(() => {});
  }, []);

  async function saveName() {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      await update({ name });
      toast.success("Имя обновлено");
      setEditingName(false);
    }
  }

  const [showPricing, setShowPricing] = useState(false);
  const planTier = session?.user?.planTier ?? "FREE";
  const isPro = planTier !== "FREE";
  const email = session?.user?.email ?? "";
  const displayName = name || email.split("@")[0];

  const planColors: Record<string, string> = {
    FREE: "#9ca3af",
    PRO: "#f59e0b",
    UNLIMITED: "#FF4B7D",
  };
  const planLabels: Record<string, string> = {
    FREE: "Бесплатный",
    PRO: "Pro",
    UNLIMITED: "Безлимит",
  };

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
      <div className="max-w-2xl mx-auto w-full px-4 py-6">

        {/* Аватар + имя */}
        <div className="flex flex-col items-center mb-6">
          {/* Аватар */}
          <div className="relative mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ border: "3px solid #FF4B7D", padding: 3 }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-gray-500 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Имя */}
          <div className="flex items-center gap-2 mb-1">
            {editingName ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
                className="text-xl font-bold text-center border-b-2 border-pink-400 bg-transparent outline-none text-gray-900"
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
            )}
            <button
              onClick={() => setEditingName(true)}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"
            >
              <span className="text-gray-400 text-xs font-bold">⋮</span>
            </button>
          </div>
          <p className="text-sm text-gray-500">{email}</p>

          {/* Тариф */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: planColors[planTier] + "20", color: planColors[planTier] }}
            >
              {planLabels[planTier]} подписка
            </span>
          </div>
        </div>

        {/* Кнопка активации / апгрейда */}
        {!isPro ? (
          <button
            onClick={() => setShowPricing(true)}
            className="w-full h-12 rounded-2xl font-bold text-gray-900 text-base mb-4 transition-all hover:brightness-105"
            style={{ backgroundColor: "#CCFF00" }}
          >
            + Активировать Нейросети
          </button>
        ) : (
          <div
            className="w-full h-12 rounded-2xl font-bold text-center flex items-center justify-center gap-2 mb-4"
            style={{ backgroundColor: "#fff0f4", color: "#FF4B7D" }}
          >
            <Sparkles className="h-4 w-4" />
            {planLabels[planTier]} — активен
          </div>
        )}

        {/* Переключатель темы */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 mb-4 shadow-sm border border-gray-100">
          {[
            { icon: Monitor, value: "system" },
            { icon: Sun, value: "light" },
            { icon: Moon, value: "dark" },
          ].map(({ icon: Icon, value }) => (
            <button
              key={value}
              className="flex-1 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ backgroundColor: value === "light" ? "#CCFF00" : "transparent" }}
            >
              <Icon className="h-4 w-4" style={{ color: value === "light" ? "#555" : "#9ca3af" }} />
            </button>
          ))}
        </div>

        {/* Реферальный блок */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="flex -space-x-2 shrink-0">
            {["#6366f1", "#10b981", "#f59e0b", "#ef4444"].map((color, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
                {["М", "А", "К", "Е"][i]}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center text-white text-xs font-bold">+11K</div>
          </div>
          <p className="flex-1 text-sm text-gray-600">
            Приглашай друзей в <span className="font-semibold">●ИИ/Хаб</span>
            <span style={{ color: "#FF4B7D" }}> и зарабатывай вместе!</span>
          </p>
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?ref=${session?.user?.id}`); toast.success("Ссылка скопирована!"); }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0"
            style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}
          >
            Пригласить <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* История генераций */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">История генераций</h3>
          {(usage?.today?.messages ?? 0) === 0 ? (
            <>
              <p className="text-sm text-gray-400 text-center py-3">У вас пока нет генераций</p>
              <button
                onClick={() => router.push("/chat")}
                className="w-full h-11 rounded-xl font-semibold text-sm transition-all"
                style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}
              >
                ∞ Сгенерировать
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Сообщений сегодня</span>
                <span className="font-semibold text-gray-900">{usage?.today?.messages}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Изображений сегодня</span>
                <span className="font-semibold text-gray-900">{usage?.today?.images}</span>
              </div>
              <button
                onClick={() => router.push("/history")}
                className="w-full h-11 rounded-xl font-semibold text-sm mt-2 transition-all"
                style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}
              >
                ∞ Вся история
              </button>
            </div>
          )}
        </div>

        {/* История транзакций */}
        <button
          onClick={() => router.push("/settings/billing")}
          className="w-full h-12 rounded-2xl text-sm text-gray-400 bg-white border border-gray-100 shadow-sm mb-4 hover:bg-gray-50 transition-all flex items-center justify-center"
        >
          Посмотреть историю транзакций
        </button>

        {/* Способы входа */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <h3 className="font-bold text-gray-900 px-4 pt-4 pb-3">Способы входа в аккаунт</h3>

          <div className="flex divide-x divide-gray-100">
            {/* Telegram */}
            <div className="flex-1 flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f4fd" }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#26A5E4">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.53 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.19-1.82 6.99-3.02 8.39-3.6 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .38.03.55.17.14.12.18.28.2.45-.01.06.01.24 0 .42z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Telegram</p>
                <p className="text-xs text-gray-400">Не привязан</p>
              </div>
              <button className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all" style={{ backgroundColor: "#FFD6E0", color: "#FF4B7D" }}>
                Привязать
              </button>
            </div>

            {/* Email */}
            <div className="flex-1 flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#f3f4f6" }}>
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Почта</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#FF4B7D" }}>Подключена</span>
            </div>
          </div>
        </div>

        {/* Выход */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-gray-600 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Выйти из аккаунта
        </button>

      </div>
    </div>

    {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </>
  );
}
