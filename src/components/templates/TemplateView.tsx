"use client";

import { useState, useRef } from "react";
import { X, Plus, ChevronDown, Loader2, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { ImageTemplate } from "@/lib/constants/templates";

const RATIOS = ["9:16", "16:9", "1:1", "4:3"] as const;
const QUALITIES = ["HD", "4K"] as const;

interface Props {
  template: ImageTemplate;
  onClose: () => void;
  /** fullscreen=true — занимает весь экран (для страницы шаблонов) */
  fullscreen?: boolean;
}

export function TemplateView({ template, onClose, fullscreen = false }: Props) {
  const [extra, setExtra] = useState("");
  const [ratio, setRatio] = useState<typeof RATIOS[number]>("9:16");
  const [quality, setQuality] = useState<typeof QUALITIES[number]>("4K");
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const imgWidth =
    ratio === "16:9" ? 580 : ratio === "1:1" ? 400 : ratio === "4:3" ? 480 : 340;
  const imgHeight =
    ratio === "9:16" ? 560 : ratio === "16:9" ? 326 : ratio === "1:1" ? 400 : ratio === "4:3" ? 360 : 560;

  async function generate() {
    setGenerating(true);
    setGeneratedUrl(null);
    try {
      const fullPrompt = extra.trim()
        ? `${template.prompt}. Additional details: ${extra}`
        : template.prompt;

      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: "flux",
          size:
            ratio === "9:16"
              ? "1024x1792"
              : ratio === "16:9"
              ? "1792x1024"
              : "1024x1024",
          quality: quality === "4K" ? "hd" : "standard",
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedUrl(data.imageUrl);
      } else {
        toast.error(data.error ?? "Ошибка генерации");
      }
    } catch {
      toast.error("Ошибка генерации");
    } finally {
      setGenerating(false);
    }
  }

  async function downloadImage() {
    if (!generatedUrl) return;
    const res = await fetch(generatedUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${template.id}-${Date.now()}.png`;
    a.click();
  }

  const wrapClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col"
    : "fixed inset-0 z-50 flex flex-col";

  return (
    <div
      className={wrapClass}
      style={{
        backgroundColor: "#f0f0f0",
        backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Хедер */}
      <div
        className="flex items-center h-12 px-5 border-b shrink-0"
        style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mr-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-400 font-medium">
          /{" "}
          <span className="text-gray-800">
            Шаблоны
          </span>
        </span>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Центр — изображение */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center py-8 px-4">
        <div
          className="relative rounded-2xl overflow-hidden shadow-md bg-white"
          style={{ width: imgWidth, height: imgHeight }}
        >
          {generating ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-3"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#FF4B7D" }} />
              <p className="text-sm text-gray-500">Генерируем изображение...</p>
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedUrl ?? template.photo}
                alt={template.title}
                className="w-full h-full object-cover"
              />
              {generatedUrl && (
                <button
                  onClick={downloadImage}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center hover:bg-white shadow-sm transition-all"
                >
                  <Download className="h-4 w-4 text-gray-700" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Название */}
        <div
          className="mt-4 bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 text-center"
          style={{ minWidth: 240 }}
        >
          <p className="font-semibold text-gray-900">{template.title}</p>
          {generatedUrl && (
            <p className="text-xs mt-0.5" style={{ color: "#22c55e" }}>
              ✓ Изображение создано
            </p>
          )}
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="shrink-0 px-4 pb-4">
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          style={{ maxWidth: 900, margin: "0 auto" }}
        >
          <div className="flex items-start gap-3 px-4 pt-4 pb-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50 transition-all mt-0.5"
            >
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" />
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Дополните описание к шаблону..."
              rows={2}
              className="flex-1 text-sm text-gray-700 resize-none focus:outline-none bg-transparent placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
            {/* Тег шаблона */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 shrink-0">
              Шаблон: <span className="text-gray-900 ml-1">{template.title}</span>
            </div>

            {/* Соотношение */}
            <div className="relative">
              <button
                onClick={() => { setShowRatioMenu(!showRatioMenu); setShowQualityMenu(false); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                {ratio} <ChevronDown className="h-3 w-3" />
              </button>
              {showRatioMenu && (
                <div className="absolute bottom-full mb-1 left-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[80px]">
                  {RATIOS.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRatio(r); setShowRatioMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-all"
                      style={{ fontWeight: r === ratio ? 700 : 400, color: r === ratio ? "#FF4B7D" : "#374151" }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Качество */}
            <div className="relative">
              <button
                onClick={() => { setShowQualityMenu(!showQualityMenu); setShowRatioMenu(false); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                {quality} <ChevronDown className="h-3 w-3" />
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full mb-1 left-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[70px]">
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-all"
                      style={{ fontWeight: q === quality ? 700 : 400, color: q === quality ? "#FF4B7D" : "#374151" }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1" />

            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:brightness-105 shrink-0"
              style={{ backgroundColor: "#FF4B7D" }}
            >
              {generating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
