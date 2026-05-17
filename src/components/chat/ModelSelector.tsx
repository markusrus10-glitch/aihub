"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Zap } from "lucide-react";
import { MODELS, MODEL_ICON_COLORS } from "@/lib/constants/models";
import { createPortal } from "react-dom";

interface Props {
  value: string;
  onChange: (modelId: string) => void;
  planTier?: string;
}

export function ModelSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find((m) => m.id === value) ?? MODELS[0];
  const iconColor = MODEL_ICON_COLORS[currentModel.icon ?? "G"] ?? "#10a37f";

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen((v) => !v);
  }

  // Закрываем только по клику СНАРУЖИ дропдауна и кнопки
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;    // клик по кнопке — не закрываем
      if (dropRef.current?.contains(target)) return;   // клик внутри списка — не закрываем
      setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  function selectModel(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-2 h-8 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-800 transition-all shadow-sm"
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: iconColor }}
        >
          {currentModel.icon ?? "G"}
        </span>
        <span className="max-w-[140px] truncate">{currentModel.displayName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 280,
            maxHeight: 400,
            zIndex: 99999,
            overflowY: "auto",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            border: "1px solid #f0f0f0",
          }}
        >
          {MODELS.map((m) => {
            const sel = m.id === value;
            const ic = MODEL_ICON_COLORS[m.icon ?? "G"] ?? "#10a37f";
            return (
              <button
                key={m.id}
                onClick={() => selectModel(m.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  background: sel ? "#fff5f7" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = sel ? "#fff5f7" : "transparent"; }}
              >
                {/* Радио */}
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${sel ? "#FF4B7D" : "#d1d5db"}`,
                  background: sel ? "#FF4B7D" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {sel && <Check style={{ width: 10, height: 10, color: "white" }} strokeWidth={3} />}
                </div>

                {/* Иконка */}
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: ic,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 11, fontWeight: "bold", flexShrink: 0,
                }}>
                  {m.icon ?? "G"}
                </div>

                {/* Название + теги */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: "#111827" }}>
                      {m.displayName}
                    </span>
                    {m.isFast && <Zap style={{ width: 11, height: 11, color: "#eab308", flexShrink: 0 }} />}
                  </div>
                  {(m.isNew || (m.badge && m.badge !== "Новое")) && (
                    <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                      {m.isNew && (
                        <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 5, background: "#f0fdf4", color: "#16a34a", fontWeight: 500 }}>
                          Новое
                        </span>
                      )}
                      {m.badge && m.badge !== "Новое" && (
                        <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 5, background: "#fff7ed", color: "#ea580c", fontWeight: 500 }}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
