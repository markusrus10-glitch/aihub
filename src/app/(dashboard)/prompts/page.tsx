"use client";

import { useState } from "react";
import { IMAGE_TEMPLATES, type ImageTemplate } from "@/lib/constants/templates";
import { TemplateView } from "@/components/templates/TemplateView";

const FILTERS = ["Тренды", "Картинки", "Motion"] as const;
type Filter = typeof FILTERS[number];

const FILTER_ICONS: Record<Filter, string> = {
  "Тренды": "📈",
  "Картинки": "🖼",
  "Motion": "⚡",
};

export default function PromptsPage() {
  const [filter, setFilter] = useState<Filter>("Тренды");
  const [selected, setSelected] = useState<ImageTemplate | null>(null);

  const filtered = IMAGE_TEMPLATES.filter((t) => t.category === filter);

  if (selected) {
    return <TemplateView template={selected} onClose={() => setSelected(null)} fullscreen />;
  }

  return (
    <div
      className="flex flex-col h-full overflow-auto"
      style={{
        backgroundColor: "#f0f0f0",
        backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="max-w-5xl mx-auto w-full px-6 py-8">

        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Топовые Шаблоны</h1>
          <p className="text-gray-400 text-sm">Созданы командой ИИ / Хаб и набирают миллионы просмотров!</p>
        </div>

        {/* Фильтры */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all"
              style={{
                backgroundColor: filter === f ? "#1a1a1a" : "white",
                color: filter === f ? "white" : "#374151",
                border: filter === f ? "none" : "1px solid #e5e7eb",
              }}
            >
              <span>{FILTER_ICONS[f]}</span>
              {f}
            </button>
          ))}
        </div>

        {/* Сетка — 4 колонки */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
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

          {filtered.length === 0 && (
            <div className="col-span-4 py-20 text-center text-gray-400 text-sm">
              Шаблонов в этой категории пока нет
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
