"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, MessageSquare, Image as ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { formatRelative } from "@/lib/utils/format";
import { toast } from "sonner";

interface ImageGen {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  imageUrl?: string;
  status: string;
  size: string;
  createdAt: string;
}

interface Chat {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  updatedAt: string;
}

type Tab = "images" | "chats";

export default function HistoryPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("images");
  const [images, setImages] = useState<ImageGen[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "images") loadImages();
    else loadChats();
  }, [tab]);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/history/images");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images ?? []);
      }
    } finally { setLoading(false); }
  }

  async function loadChats() {
    setLoading(true);
    try {
      const res = await fetch("/api/chat?limit=50");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats ?? []);
      }
    } finally { setLoading(false); }
  }

  async function downloadImage(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aihub-${Date.now()}.png`;
    a.click();
  }

  async function deleteChat(id: string) {
    await fetch(`/api/chat/${id}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== id));
    toast.success("Чат удалён");
  }

  return (
    <div className="flex flex-col h-full overflow-auto" style={{
      backgroundColor: "#f0f0f0",
      backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    }}>
      <div className="max-w-5xl mx-auto w-full p-6">

        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">История генераций</h1>
          <p className="text-gray-500 text-sm mt-1">Все ваши изображения и чаты в одном месте</p>
        </div>

        {/* Табы */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 w-fit mb-6">
          <button
            onClick={() => setTab("images")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === "images" ? "#FF4B7D" : "transparent",
              color: tab === "images" ? "white" : "#6b7280",
            }}
          >
            <ImageIcon className="h-4 w-4" />
            Изображения
          </button>
          <button
            onClick={() => setTab("chats")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === "chats" ? "#FF4B7D" : "transparent",
              color: tab === "chats" ? "white" : "#6b7280",
            }}
          >
            <MessageSquare className="h-4 w-4" />
            Чаты
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl animate-pulse" style={{ height: 200 }} />
            ))}
          </div>
        ) : tab === "images" ? (
          /* ── Изображения ── */
          images.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ImageIcon className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Нет созданных изображений</p>
              <p className="text-gray-400 text-sm mt-1">Перейдите в Генерацию изображений и создайте первое</p>
              <button
                onClick={() => router.push("/image-generation")}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: "#FF4B7D" }}
              >
                Создать изображение
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  {img.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.imageUrl} alt={img.prompt} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => downloadImage(img.imageUrl!)}
                            className="w-8 h-8 bg-white/90 rounded-xl flex items-center justify-center hover:bg-white"
                          >
                            <Download className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                        <div>
                          <p className="text-white text-xs line-clamp-2">{img.prompt}</p>
                          <p className="text-white/60 text-xs mt-1">{formatRelative(img.createdAt)}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {img.status === "GENERATING" ? "⏳" : img.status === "FAILED" ? "❌" : "🖼️"}
                        </div>
                        <p className="text-xs text-gray-400">
                          {img.status === "GENERATING" ? "Генерация..." : img.status === "FAILED" ? "Ошибка" : "Ожидание"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">{img.prompt}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{img.size} · {formatRelative(img.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── Чаты ── */
          chats.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageSquare className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Нет чатов</p>
              <p className="text-gray-400 text-sm mt-1">Начните новый разговор с ИИ</p>
              <button
                onClick={() => router.push("/chat")}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: "#FF4B7D" }}
              >
                Новый чат
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{chat.title || "Новый чат"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{chat.messageCount} сообщений</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatRelative(chat.updatedAt)}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{chat.model}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/chat/${chat.id}`); }}
                      className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                      className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
