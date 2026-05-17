"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, FileText, Video, ImageIcon, CreditCard,
  History, Users, X, Sun, Moon, Monitor, Sparkles,
  LogOut, Settings, ChevronUp, Plus, Trash2, MoreHorizontal,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface Chat {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
  messages?: { content: string }[];
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [openChatMenu, setOpenChatMenu] = useState<string | null>(null);

  const planTier = session?.user?.planTier ?? "FREE";
  const isPro = planTier !== "FREE";

  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const res = await fetch("/api/chat?limit=50");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats ?? []);
      }
    } catch { /* silent */ }
    finally { setLoadingChats(false); }
  }, []);

  // Загружаем при монтировании, смене страницы и событии обновления
  useEffect(() => {
    if (session?.user) fetchChats();
  }, [pathname, session?.user, fetchChats]);

  useEffect(() => {
    const handler = () => fetchChats();
    window.addEventListener("chat-updated", handler);
    return () => window.removeEventListener("chat-updated", handler);
  }, [fetchChats]);

  async function createChat() {
    try {
      const res = await fetch("/api/chat", { method: "POST" });
      const data = await res.json();
      if (data.chat?.id) {
        await fetchChats();
        router.push(`/chat/${data.chat.id}`);
      }
    } catch { toast.error("Ошибка создания чата"); }
  }

  async function deleteChat(chatId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (pathname === `/chat/${chatId}`) router.push("/chat");
    toast.success("Чат удалён");
    setOpenChatMenu(null);
  }

  const NAV_TOP = [
    { icon: LayoutDashboard, label: "Дашборд", href: "/chat" },
    { icon: FileText, label: "Шаблоны", href: "/prompts" },
  ];

  const NAV_GEN = [
    { icon: MessageSquare, label: "Текст", href: "/chat" },
    { icon: Video, label: "Видео", href: "/video" },
    { icon: ImageIcon, label: "Изображения", href: "/image-generation" },
  ];

  const NAV_ACC = [
    { icon: CreditCard, label: "Пополнить баланс", href: "/settings/billing" },
    { icon: History, label: "История генераций", href: "/history" },
    { icon: Users, label: "Рефералы", href: "/settings/profile" },
  ];

  function NavItem({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
    const isActive = pathname === href || (href !== "/chat" && pathname.startsWith(href));
    return (
      <Link href={href}>
        <div className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer",
          isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}>
          <Icon className="h-4 w-4 shrink-0" style={{ color: isActive ? "#FF4B7D" : undefined }} />
          {label}
        </div>
      </Link>
    );
  }

  return (
    <aside className="flex flex-col w-[260px] shrink-0 border-r h-full overflow-hidden" style={{ backgroundColor: "#fff", borderColor: "#e5e7eb" }}>

      {/* Логотип */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <Link href="/chat" className="flex items-center gap-2.5">
          {/* Иконка — буква И на розовом градиенте */}
          <div className="w-8 h-8 rounded-xl shrink-0 shadow-sm overflow-hidden">
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
              <defs>
                <linearGradient id="sb-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF6B9D"/>
                  <stop offset="100%" stopColor="#C9177E"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#sb-bg)"/>
              {/* Блик */}
              <rect width="32" height="16" rx="8" fill="white" fillOpacity="0.12"/>
              {/* Буква И */}
              <line x1="9" y1="9.5" x2="9" y2="22.5" stroke="white" strokeWidth="4.2" strokeLinecap="round"/>
              <line x1="23" y1="9.5" x2="23" y2="22.5" stroke="white" strokeWidth="4.2" strokeLinecap="round"/>
              <line x1="23" y1="10" x2="9" y2="22" stroke="white" strokeWidth="3.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">
            ИИ<span className="text-gray-300">/</span>Хаб
          </span>
        </Link>
      </div>

      {/* Прокручиваемая область */}
      <div className="flex-1 overflow-y-auto">

        {/* Навигация */}
        <div className="px-3 pt-3 pb-1">
          <p className="text-xs font-semibold text-gray-400 px-2 mb-1 tracking-wider">ГЛАВНАЯ</p>
          {NAV_TOP.map((item) => <NavItem key={item.href + item.label} {...item} />)}
        </div>

        <div className="px-3 pb-1">
          <p className="text-xs font-semibold text-gray-400 px-2 mb-1 tracking-wider">ГЕНЕРАЦИЯ</p>
          {NAV_GEN.map((item) => <NavItem key={item.href + item.label} {...item} />)}
        </div>

        <div className="px-3 pb-2">
          <p className="text-xs font-semibold text-gray-400 px-2 mb-1 tracking-wider">АККАУНТ</p>
          {NAV_ACC.map((item) => <NavItem key={item.href + item.label} {...item} />)}
        </div>

        {/* Разделитель */}
        <div className="mx-3 h-px bg-gray-100 mb-2" />

        {/* История чатов */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-semibold text-gray-400 tracking-wider">ИСТОРИЯ ЧАТОВ</p>
            <button
              onClick={createChat}
              className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-gray-100 transition-all"
              title="Новый чат"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          {loadingChats && chats.length === 0 && (
            <div className="space-y-1.5 px-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {chats.length === 0 && !loadingChats && (
            <p className="text-xs text-gray-400 text-center py-4">Нет чатов</p>
          )}

          <div className="space-y-0.5">
            {chats.map((chat) => {
              const isActive = pathname === `/chat/${chat.id}`;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all",
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="flex-1 text-xs truncate">{chat.title || "Новый чат"}</span>

                  {/* Кнопка меню — видна при наведении */}
                  <button
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition-all shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenChatMenu(openChatMenu === chat.id ? null : chat.id);
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>

                  {/* Выпадашка удаления */}
                  {openChatMenu === chat.id && (
                    <div
                      className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Нижняя часть */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100 shrink-0 space-y-2">
        {/* Переключатель темы */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {[{ icon: Monitor, value: "system" }, { icon: Sun, value: "light" }, { icon: Moon, value: "dark" }].map(({ icon: Icon, value }) => (
            <button
              key={value}
              onClick={() => setTheme(value as "light" | "dark" | "system")}
              className="flex-1 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ backgroundColor: theme === value ? "#CCFF00" : undefined }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: theme === value ? "#666" : "#9ca3af" }} />
            </button>
          ))}
        </div>

        {/* Тариф */}
        {!isPro && (
          <Link href="/settings/billing" className="block w-full h-9 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: "#FFD6E0", color: "#D63B6E" }}>
            <CreditCard className="h-3.5 w-3.5" />
            Выбрать тариф
          </Link>
        )}

        {/* Пользователь */}
        {session?.user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-all"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: "#FF4B7D" }}>
                {session.user.name?.charAt(0)?.toUpperCase() ?? session.user.email?.charAt(0)?.toUpperCase() ?? "П"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-gray-900 truncate">{session.user.email}</p>
                <p className="text-xs font-semibold" style={{ color: isPro ? "#FF4B7D" : "#9ca3af" }}>
                  {isPro ? "● Безлимит" : "Бесплатный"}
                </p>
              </div>
              <ChevronUp className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showUserMenu ? "" : "rotate-180"}`} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <Link href="/settings/profile" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all">
                  <Settings className="h-4 w-4 text-gray-400" />Настройки
                </Link>
                <Link href="/settings/billing" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all">
                  <CreditCard className="h-4 w-4 text-gray-400" />Подписка
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-all">
                  <LogOut className="h-4 w-4" />Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="block w-full h-9 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-gray-900 transition-all" style={{ backgroundColor: "#CCFF00" }}>
            <Sparkles className="h-4 w-4" />Войти
          </Link>
        )}
      </div>
    </aside>
  );
}
