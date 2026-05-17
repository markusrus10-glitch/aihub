"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2, Check, Download, RefreshCw, Film, ArrowLeftRight, Sparkles } from "lucide-react";

// ── Модели видео ──────────────────────────────────────────────────────────────
const VIDEO_MODELS = [
  { id: "veo-3.1-fast",   label: "Veo 3.1 Fast",        icon: "◎", iconBg: "#111", tags: ["Премиум"],          price: "~9 000"        },
  { id: "veo-3.1",        label: "Veo 3.1",              icon: "◎", iconBg: "#111", tags: [],                   price: "~24 000"       },
  { id: "grok-imagine",   label: "Grok Imagine",         icon: "⊘", iconBg: "#222", tags: ["Видео"],            price: "~5 000"        },
  { id: "kling-motion-c", label: "Kling Motion Con...",  icon: "◌", iconBg: "#6366f1", tags: ["Новое","Премиум"], price: "~1 700/сек" },
  { id: "kling-3.0",      label: "Kling 3.0",            icon: "◌", iconBg: "#6366f1", tags: ["Новое","Премиум"], price: "~11 000"    },
  { id: "kling-motion",   label: "Kling Motion Con...",  icon: "◌", iconBg: "#818cf8", tags: [],                price: "~1 000/сек"    },
];

const DURATIONS = ["4 сек", "6 сек", "8 сек"];
const RATIOS    = [
  { label: "16:9", icon: "▬" },
  { label: "9:16", icon: "▐" },
];
const QUALITIES = ["720p", "1080p", "2160p"];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  "Премиум": { bg: "#fff7ed", text: "#ea580c" },
  "Видео":   { bg: "#fdf2f8", text: "#db2777" },
  "Новое":   { bg: "#f0fdf4", text: "#16a34a" },
};

type Drop = "model" | "duration" | "ratio" | "quality" | null;

export default function VideoPage() {
  const [prompt, setPrompt]     = useState("");
  const [model, setModel]       = useState(VIDEO_MODELS[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [ratio, setRatio]       = useState(RATIOS[0]);
  const [quality, setQuality]   = useState(QUALITIES[0]);
  const [mode, setMode]         = useState<"t2v" | "i2v">("t2v"); // text-to-video / image-to-video
  const [loading, setLoading]   = useState(false);
  const [openDrop, setOpenDrop] = useState<Drop>(null);
  const [videos, setVideos]     = useState<{ id: string; url: string; prompt: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function toggleDrop(d: Drop) {
    setOpenDrop((prev) => (prev === d ? null : d));
  }

  async function generate() {
    if (!prompt.trim()) { textareaRef.current?.focus(); toast.error("Опишите сцену"); return; }
    setLoading(true);
    try {
      // Здесь будет реальный API — пока показываем заглушку
      await new Promise((r) => setTimeout(r, 2000));
      toast.info("Генерация видео скоро будет доступна. Подключаем Kling и Veo API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col h-full bg-white"
      onClick={() => openDrop && setOpenDrop(null)}
    >
      {/* Область видео */}
      <div className="flex-1 overflow-y-auto p-6">
        {videos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div
              className="w-full max-w-2xl mx-auto rounded-3xl flex flex-col items-center justify-center gap-4 p-16 cursor-pointer transition-all"
              style={{
                border: "2px dashed #d1d5db",
                backgroundColor: "#fafafa",
                minHeight: 300,
              }}
              onClick={() => textareaRef.current?.focus()}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg, #f472b6, #ec4899)" }}>
                <Film className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg mb-1">Опишите сцену для видео</p>
                <p className="text-gray-400 text-sm">Нажмите сюда или начните вводить промпт</p>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                {["Закат над горами", "Город будущего", "Океан в шторм", "Космический полёт"].map((s) => (
                  <button
                    key={s}
                    onClick={(e) => { e.stopPropagation(); setPrompt(s); textareaRef.current?.focus(); }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:border-pink-300 hover:text-pink-500 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((v) => (
              <div key={v.id} className="group relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-900 aspect-video">
                <video src={v.url} controls className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={v.url} download className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center hover:bg-white">
                    <Download className="h-4 w-4 text-gray-700" />
                  </a>
                  <button onClick={() => { setPrompt(v.prompt); textareaRef.current?.focus(); }}
                    className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center hover:bg-white">
                    <RefreshCw className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Нижняя панель */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3"
        onClick={(e) => e.stopPropagation()}>
        <div className="max-w-4xl mx-auto">

          {/* Верхние иконки-кнопки */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <button
              onClick={() => setMode("t2v")}
              title="Текст в видео"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ backgroundColor: mode === "t2v" ? "#fff0f3" : "#f3f4f6", color: mode === "t2v" ? "#FF4B7D" : "#9ca3af" }}
            >
              <Film className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMode(mode === "t2v" ? "i2v" : "t2v")}
              title="Изображение в видео"
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <button
              title="Эффекты"
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-gray-300 transition-all px-4 py-3">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); } }}
              placeholder="Опишите сцену, которую хотите создать"
              rows={1}
              className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 max-h-[120px] overflow-y-auto self-center"
            />

            <div className="flex items-center gap-1.5 shrink-0 self-end mb-0.5">

              {/* Модель */}
              <div className="relative">
                <button
                  onClick={() => toggleDrop("model")}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-all"
                >
                  <span className="text-xs font-bold" style={{ color: "#111" }}>{model.icon}</span>
                  {model.label.length > 14 ? model.label.slice(0, 14) + "…" : model.label}
                  {openDrop === "model" ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
                </button>

                {openDrop === "model" && (
                  <div
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    style={{ width: 300 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {VIDEO_MODELS.map((m) => {
                      const sel = model.id === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setModel(m); setOpenDrop(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-all"
                        >
                          {/* Радио */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all`}
                            style={{ borderColor: sel ? "#FF4B7D" : "#d1d5db", backgroundColor: sel ? "#FF4B7D" : "transparent" }}>
                            {sel && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                          </div>
                          {/* Иконка */}
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: m.iconBg }}>
                            {m.icon}
                          </div>
                          {/* Название + теги */}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900">{m.label}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {m.tags.map((tag) => (
                                <span key={tag} className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                  style={{ backgroundColor: TAG_COLORS[tag]?.bg ?? "#f3f4f6", color: TAG_COLORS[tag]?.text ?? "#6b7280" }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* Цена */}
                          <span className="text-sm font-semibold shrink-0" style={{ color: "#FF4B7D" }}>
                            {m.price} <span className="text-xs">◎</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* I2V кнопка */}
              <button
                onClick={() => setMode(mode === "i2v" ? "t2v" : "i2v")}
                className="h-8 px-2.5 rounded-xl border text-xs font-bold transition-all"
                style={{
                  backgroundColor: mode === "i2v" ? "#FF4B7D" : "white",
                  borderColor: mode === "i2v" ? "#FF4B7D" : "#e5e7eb",
                  color: mode === "i2v" ? "white" : "#6b7280",
                }}
              >
                I2V
              </button>

              {/* Длительность */}
              <div className="relative">
                <button onClick={() => toggleDrop("duration")}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700">
                  {duration}
                  {openDrop === "duration" ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
                </button>
                {openDrop === "duration" && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}>
                    {DURATIONS.map((d) => (
                      <button key={d} onClick={() => { setDuration(d); setOpenDrop(null); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center`}
                          style={{ borderColor: duration === d ? "#FF4B7D" : "#d1d5db", backgroundColor: duration === d ? "#FF4B7D" : "transparent" }}>
                          {duration === d && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={duration === d ? "font-semibold text-gray-900" : "text-gray-700"}>{d}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Соотношение сторон */}
              <div className="relative">
                <button onClick={() => toggleDrop("ratio")}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700">
                  {ratio.label}
                  {openDrop === "ratio" ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
                </button>
                {openDrop === "ratio" && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}>
                    {RATIOS.map((r) => (
                      <button key={r.label} onClick={() => { setRatio(r); setOpenDrop(null); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center`}
                          style={{ borderColor: ratio.label === r.label ? "#FF4B7D" : "#d1d5db", backgroundColor: ratio.label === r.label ? "#FF4B7D" : "transparent" }}>
                          {ratio.label === r.label && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-lg mr-1">{r.icon}</span>
                        <span className={ratio.label === r.label ? "font-semibold text-gray-900" : "text-gray-700"}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Качество */}
              <div className="relative">
                <button onClick={() => toggleDrop("quality")}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700">
                  {quality}
                  {openDrop === "quality" ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
                </button>
                {openDrop === "quality" && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}>
                    {QUALITIES.map((q) => (
                      <button key={q} onClick={() => { setQuality(q); setOpenDrop(null); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center`}
                          style={{ borderColor: quality === q ? "#FF4B7D" : "#d1d5db", backgroundColor: quality === q ? "#FF4B7D" : "transparent" }}>
                          {quality === q && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={quality === q ? "font-semibold text-gray-900" : "text-gray-700"}>{q}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопка создать */}
              <button
                onClick={generate}
                disabled={loading || !prompt.trim()}
                className="h-8 px-4 rounded-xl text-sm font-bold flex items-center gap-1.5 text-white disabled:opacity-50 transition-all"
                style={{ backgroundColor: "#FF4B7D" }}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
                {loading ? "..." : "Создать"}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-1.5">Enter — создать видео</p>
        </div>
      </div>
    </div>
  );
}
