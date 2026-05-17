"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, ChevronDown, ChevronUp, Loader2, Download, X, Sparkles, RefreshCw, Check } from "lucide-react";

// ── Модели ────────────────────────────────────────────────────────────────────
const IMAGE_MODELS = [
  {
    id: "grok-image",
    label: "Grok Image",
    icon: "⚡",
    iconBg: "#111111",
    tags: ["Фото"],
    desc: "xAI",
  },
  {
    id: "gpt-image-1.5",
    label: "GPT Image 1.5",
    icon: "✦",
    iconBg: "#10a37f",
    tags: ["Быстрая", "Высокое"],
    desc: "OpenAI",
  },
  {
    id: "nano-banana",
    label: "Nano Banana",
    icon: "🍌",
    iconBg: "#fbbf24",
    tags: ["Быстрая", "Топ"],
    desc: "ИИ Хаб",
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    icon: "✦",
    iconBg: "#10a37f",
    tags: [],
    desc: "OpenAI",
  },
  {
    id: "nano-banana-pro",
    label: "Nano Banana Pro",
    icon: "🍌",
    iconBg: "#f59e0b",
    tags: ["Топ", "Премиум"],
    desc: "ИИ Хаб",
  },
  {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    icon: "🍌",
    iconBg: "#d97706",
    tags: ["Новое", "Премиум"],
    desc: "ИИ Хаб",
  },
  {
    id: "dall-e-3",
    label: "DALL-E 3",
    icon: "✦",
    iconBg: "#6b7280",
    tags: ["Высокое"],
    desc: "OpenAI",
  },
  {
    id: "flux-1.1-pro",
    label: "FLUX 1.1 Pro",
    icon: "🌊",
    iconBg: "#6366f1",
    tags: ["Топ", "Премиум"],
    desc: "Black Forest Labs",
  },
];

// ── Размеры ───────────────────────────────────────────────────────────────────
const RATIOS = [
  { label: "1:1",  value: "1024x1024" },
  { label: "16:9", value: "1792x1024" },
  { label: "9:16", value: "1024x1792" },
  { label: "4:3",  value: "1024x768"  },
];

// ── Качество ──────────────────────────────────────────────────────────────────
const QUALITIES = [
  { label: "Стандарт", value: "standard" },
  { label: "HD",       value: "hd"       },
  { label: "4K",       value: "hd"       },
];

// ── Теги ──────────────────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  "Быстрая":  { bg: "#f0fdf4", text: "#16a34a" },
  "Высокое":  { bg: "#eff6ff", text: "#2563eb" },
  "Топ":      { bg: "#fdf4ff", text: "#9333ea" },
  "Премиум":  { bg: "#fff7ed", text: "#ea580c" },
  "Новое":    { bg: "#f0fdf4", text: "#059669" },
  "Фото":     { bg: "#fdf2f8", text: "#db2777" },
};

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  revisedPrompt?: string;
}

export default function ImageGenerationPage() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(IMAGE_MODELS.find(m => m.id === "nano-banana-pro") ?? IMAGE_MODELS[0]);
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [openDrop, setOpenDrop] = useState<"model" | "ratio" | "quality" | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  async function generate() {
    if (!prompt.trim()) { inputRef.current?.focus(); toast.error("Введите промпт"); return; }
    setLoading(true);
    try {
      // Для DALL-E 3 используем наш API, для остальных — заглушка через DALL-E 3
      const apiModel = model.id.startsWith("dall-e") ? model.id : "dall-e-3";
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: ratio.value, quality: quality.value, model: apiModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      if (data.generation?.imageUrl) {
        setImages((prev) => [{ id: data.generation.id, url: data.generation.imageUrl, prompt, revisedPrompt: data.generation.revisedPrompt }, ...prev]);
        toast.success("Изображение создано!");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aihub-${Date.now()}.png`;
    a.click();
  }

  const planTier = session?.user?.planTier ?? "FREE";
  const canGenerate = planTier !== "FREE";

  return (
    <div className="flex flex-col h-full bg-white" onClick={() => openDrop && setOpenDrop(null)}>

      {/* Область изображений */}
      <div className="flex-1 overflow-y-auto p-6">
        {images.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="h-full flex items-center justify-center"
          >
            <div
              className="w-full max-w-2xl mx-auto rounded-3xl flex flex-col items-center justify-center gap-4 p-16 cursor-pointer transition-all"
              style={{ border: `2px dashed ${dragOver ? "#FF4B7D" : "#d1d5db"}`, backgroundColor: dragOver ? "#fff0f3" : "#fafafa", minHeight: 300 }}
              onClick={() => inputRef.current?.focus()}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6)" }}>
                <span className="text-3xl">🖼️</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg mb-1">Загрузите изображение или напишите промпт</p>
                <p className="text-gray-400 text-sm">Перетащите файл или нажмите сюда</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {loading && (
              <div className="mb-4 w-64 h-64 rounded-3xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 animate-pulse" style={{ color: "#FF4B7D" }} />
                  <p className="text-xs text-gray-400">Генерирую...</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => downloadImage(img.url)} className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center hover:bg-white">
                        <Download className="h-4 w-4 text-gray-700" />
                      </button>
                      <button onClick={() => { setPrompt(img.prompt); inputRef.current?.focus(); }} className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center hover:bg-white">
                        <RefreshCw className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                    <p className="text-white text-xs line-clamp-2">{img.revisedPrompt ?? img.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Нижняя панель */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-4xl mx-auto">

          {/* Превью загруженного фото */}
          {previewImage && (
            <div className="relative inline-block mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage} alt="" className="h-12 w-12 rounded-xl object-cover border border-gray-200" />
              <button onClick={() => setPreviewImage(null)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-700 rounded-full text-white flex items-center justify-center">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-gray-300 transition-all px-4 py-3">
            {/* + кнопка */}
            <label className="shrink-0 w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 self-end mb-0.5">
              <Plus className="h-4 w-4 text-gray-500" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { const r = new FileReader(); r.onload = () => setPreviewImage(r.result as string); r.readAsDataURL(file); }
              }} />
            </label>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); } }}
              placeholder="Напиши, что хочешь сгенерировать"
              rows={1}
              className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 max-h-[120px] overflow-y-auto self-center"
            />

            {/* Селекторы */}
            <div className="flex items-center gap-1.5 shrink-0 self-end mb-0.5">

              {/* ── Модель ── */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenDrop(openDrop === "model" ? null : "model"); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-all"
                >
                  <span>{model.icon}</span>
                  {model.label}
                  {openDrop === "model" ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
                </button>

                {openDrop === "model" && (
                  <div
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                    style={{ width: 280 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {IMAGE_MODELS.map((m) => {
                      const isSelected = model.id === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setModel(m); setOpenDrop(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-all"
                        >
                          {/* Радио */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-pink-500" : "border-gray-300"}`}
                            style={{ backgroundColor: isSelected ? "#FF4B7D" : "transparent" }}>
                            {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                          </div>

                          {/* Иконка модели */}
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ backgroundColor: m.iconBg + "20" }}>
                            <span>{m.icon}</span>
                          </div>

                          {/* Название + теги */}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900">{m.label}</p>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {m.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                  style={{
                                    backgroundColor: TAG_COLORS[tag]?.bg ?? "#f3f4f6",
                                    color: TAG_COLORS[tag]?.text ?? "#6b7280",
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Размер ── */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenDrop(openDrop === "ratio" ? null : "ratio"); }}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-all"
                >
                  {ratio.label}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                {openDrop === "ratio" && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50" onClick={(e) => e.stopPropagation()}>
                    {RATIOS.map((r) => (
                      <button
                        key={r.value + r.label}
                        onClick={() => { setRatio(r); setOpenDrop(null); }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-all"
                      >
                        <span className={ratio.label === r.label ? "font-semibold" : "text-gray-700"}>{r.label}</span>
                        {ratio.label === r.label && <Check className="h-3.5 w-3.5" style={{ color: "#FF4B7D" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Качество ── */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenDrop(openDrop === "quality" ? null : "quality"); }}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-all"
                >
                  {quality.label}
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                {openDrop === "quality" && (
                  <div className="absolute bottom-full left-0 mb-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50" onClick={(e) => e.stopPropagation()}>
                    {QUALITIES.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => { setQuality(q); setOpenDrop(null); }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-all"
                      >
                        <span className={quality.label === q.label ? "font-semibold" : "text-gray-700"}>{q.label}</span>
                        {quality.label === q.label && <Check className="h-3.5 w-3.5" style={{ color: "#FF4B7D" }} />}
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
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {loading ? "..." : "Создать"}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-1.5">
            {canGenerate ? "Enter — создать" : "⚠️ Генерация доступна на тарифе Про и Безлимит"}
          </p>
        </div>
      </div>
    </div>
  );
}
