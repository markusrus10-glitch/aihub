"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { TemplateView } from "@/components/templates/TemplateView";
import { IMAGE_TEMPLATES, type ImageTemplate } from "@/lib/constants/templates";
import { Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";

/* ───── App icons ───── */
const APP_ICONS = [
  {
    label: "Chat GPT\n5.5",
    bg: "#10a37f",
    model: "openai/gpt-4o-mini",
    icon: (
      <svg viewBox="0 0 41 41" fill="none" className="w-7 h-7">
        <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835A9.964 9.964 0 0 0 18.306.5a10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.516 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 23.86a7.504 7.504 0 0 1-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.5v4.999l-4.331 2.5-4.331-2.5V18z" fill="white"/>
      </svg>
    ),
  },
  {
    label: "Nano Banana\nPro",
    bg: "linear-gradient(135deg, #FFD700, #FF8C00)",
    model: "openai/gpt-4o-mini",
    icon: <span className="text-3xl">🍌</span>,
  },
  {
    label: "Kling\nMotion",
    bg: "linear-gradient(135deg, #00b09b, #96c93d)",
    model: null,
    href: "/video",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M8 5v14l11-7z"/></svg>
    ),
  },
  {
    label: "Генерация\nВидео",
    bg: "linear-gradient(135deg, #667eea, #764ba2)",
    model: null,
    href: "/video",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
    ),
  },
  {
    label: "Генерация\nИзображений",
    bg: "linear-gradient(135deg, #4facfe, #00f2fe)",
    model: null,
    href: "/image-generation",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
    ),
  },
  {
    label: "Топовые\nШаблоны",
    bg: "linear-gradient(135deg, #f093fb, #f5576c)",
    model: null,
    href: "/prompts",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    ),
  },
  {
    label: "Все\nНейронки",
    bg: "linear-gradient(135deg, #a8e063, #56ab2f)",
    model: null,
    href: "/prompts",
    badge: "50+",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
    ),
  },
];

const PREVIEW_COUNT = 8; // сколько показывать по умолчанию

type Mode = "text" | "image" | "video";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const [mode, setMode] = useState<Mode>("text");

  // Показываем тост при успешной оплате
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("🎉 Оплата прошла успешно! Подписка активирована.");
      // Обновляем сессию чтобы получить новый planTier
      update();
      // Убираем query-параметр из URL
      router.replace("/chat");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ImageTemplate | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const visibleTemplates = showAll ? IMAGE_TEMPLATES : IMAGE_TEMPLATES.slice(0, PREVIEW_COUNT);

  async function handleSend(text?: string) {
    const finalPrompt = text ?? prompt;
    if (!finalPrompt.trim() || loading) return;
    if (mode === "image") { router.push("/image-generation"); return; }
    if (mode === "video") { router.push("/video"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel }),
      });
      const data = await res.json();
      if (data.chat?.id) {
        window.dispatchEvent(new Event("chat-updated"));
        router.push(`/chat/${data.chat.id}?prompt=${encodeURIComponent(finalPrompt)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleAppClick(app: typeof APP_ICONS[0]) {
    if ("href" in app && app.href) { router.push(app.href); return; }
    if (app.model) setSelectedModel(app.model);
    textareaRef.current?.focus();
  }

  return (
    <>
      <div
        className="flex-1 overflow-y-auto h-full"
        style={{
          backgroundColor: "#f0f0f0",
          backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* Переключатель Текст / Фото / Видео */}
          <div className="flex items-center justify-center gap-6 mb-6 text-sm font-medium">
            {(["text", "image", "video"] as Mode[]).map((m) => {
              const colors = { text: "#6b7280", image: "#CCFF00", video: "#FF4B7D" };
              const labels = { text: "Текст", image: "Фото", video: "Видео" };
              const active = mode === m;
              return (
                <button key={m} onClick={() => setMode(m)} className="flex items-center gap-1.5 transition-all">
                  <div
                    className="w-2.5 h-2.5 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: active ? colors[m] : "transparent",
                      borderColor: active ? colors[m] : "#d1d5db",
                    }}
                  />
                  <span style={{ color: active ? "#111" : "#9ca3af" }}>{labels[m]}</span>
                </button>
              );
            })}
          </div>

          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-3">
              Поможем улучшить ваш<br />
              контент при помощи{" "}
              <span style={{ color: "#FF4B7D" }}>нейросетей</span>
            </h1>
            <p className="text-gray-500 text-base">Без VPN, сложностей и с оплатой по СБП!</p>
          </div>

          {/* Textarea */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={mode === "image" ? "Опиши изображение..." : mode === "video" ? "Опиши видео..." : "С чего начнём?"}
              rows={4}
              className="w-full px-5 pt-4 pb-2 text-gray-800 resize-none focus:outline-none text-base bg-transparent"
              style={{ minHeight: 100 }}
            />
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <ModelSelector value={selectedModel} onChange={setSelectedModel} planTier={session?.user?.planTier ?? "FREE"} />
              <button
                onClick={() => handleSend()}
                disabled={!prompt.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ backgroundColor: prompt.trim() ? "#FF4B7D" : "#f3f4f6" }}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                  : <Send className="h-4 w-4" style={{ color: prompt.trim() ? "white" : "#9ca3af" }} />
                }
              </button>
            </div>
          </div>

          {/* App icons */}
          <div className="flex items-start gap-3 mb-10 overflow-x-auto pb-2">
            {APP_ICONS.map((app, idx) => (
              <button
                key={idx}
                onClick={() => handleAppClick(app)}
                className="flex flex-col items-center gap-2 shrink-0 group"
                style={{ minWidth: 76 }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105 relative overflow-hidden"
                  style={{ background: app.bg }}
                >
                  {app.icon}
                  {"badge" in app && app.badge && (
                    <div
                      className="absolute -top-1 -right-1 text-white rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor: "#FF4B7D", fontSize: 9, minWidth: 22, height: 22, padding: "0 4px" }}
                    >
                      {app.badge}
                    </div>
                  )}
                </div>
                <span className="text-xs text-center text-gray-600 leading-tight whitespace-pre-line" style={{ maxWidth: 76 }}>
                  {app.label}
                </span>
              </button>
            ))}
          </div>

          {/* Топовые шаблоны */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-1">ТОПОВЫЕ ШАБЛОНЫ</h2>
            <p className="text-gray-400 text-sm mb-5">Созданы командой ИИ / Хаб и набирают миллионы просмотров!</p>

            {/* Сетка 4 колонки */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {visibleTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[3/4] bg-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.photo}
                    alt={t.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-sm font-semibold text-left">{t.title}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Кнопка показать все / скрыть */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-gray-900 text-sm transition-all hover:brightness-105 hover:shadow-md"
                style={{ backgroundColor: "#CCFF00" }}
              >
                {showAll ? (
                  <>Скрыть <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Показать все шаблоны ({IMAGE_TEMPLATES.length}) <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen просмотр шаблона */}
      {activeTemplate && (
        <TemplateView
          template={activeTemplate}
          onClose={() => setActiveTemplate(null)}
        />
      )}
    </>
  );
}
