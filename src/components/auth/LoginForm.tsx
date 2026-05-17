"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Step = "main" | "otp" | "login-form";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("main");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [generatedCreds, setGeneratedCreds] = useState<{ login: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Отправить OTP ─────────────────────────────────────────────────────────
  async function sendOtp() {
    if (!email.trim()) return toast.error("Введите email");
    setLoading("email");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error ?? "Ошибка");
      if (data.dev) setDevCode(data.dev);
      else toast.success("Код отправлен на вашу почту");
      setStep("otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(null);
    }
  }

  // ── Ввод OTP ──────────────────────────────────────────────────────────────
  function handleOtpChange(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every((x) => x)) verifyOtp(next.join(""));
  }
  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) { setOtp(digits.split("")); verifyOtp(digits); }
  }

  async function verifyOtp(code?: string) {
    const c = code ?? otp.join("");
    if (c.length !== 6) return;
    setLoading("otp");
    try {
      const result = await signIn("otp", { email, code: c, redirect: false });
      if (result?.ok) { router.push("/chat"); router.refresh(); }
      else { toast.error("Неверный или устаревший код"); setOtp(["", "", "", "", "", ""]); setTimeout(() => inputRefs.current[0]?.focus(), 50); }
    } finally { setLoading(null); }
  }

  // ── Войти в 1 клик ────────────────────────────────────────────────────────
  function oneClick() {
    setLoading("oneclick");
    setTimeout(() => {
      const num = String(Math.floor(10000000 + Math.random() * 90000000));
      const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz23456789";
      const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      setGeneratedCreds({ login: num, password: pwd });
      setLoading(null);
    }, 500);
  }

  async function registerOneClick() {
    if (!generatedCreds) return;
    setLoading("register");
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Пользователь ${generatedCreds.login}`, email: `${generatedCreds.login}@aihub.local`, password: generatedCreds.password }),
      });
      const result = await signIn("password", { email: `${generatedCreds.login}@aihub.local`, password: generatedCreds.password, redirect: false });
      if (result?.ok) { router.push("/chat"); router.refresh(); }
      else toast.error("Ошибка входа");
    } finally { setLoading(null); }
  }

  async function copyAll() {
    if (!generatedCreds) return;
    await navigator.clipboard.writeText(`Логин: ${generatedCreds.login}\nПароль: ${generatedCreds.password}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success("Скопировано");
  }

  // ── Вход по логину ────────────────────────────────────────────────────────
  async function loginWithPassword() {
    if (!login.trim() || !password.trim()) return toast.error("Заполните все поля");
    setLoading("login");
    try {
      const emailToUse = login.includes("@") ? login : `${login}@aihub.local`;
      const result = await signIn("password", { email: emailToUse, password, redirect: false });
      if (result?.ok) { router.push("/chat"); router.refresh(); }
      else toast.error("Неверный логин или пароль");
    } finally { setLoading(null); }
  }

  async function oauthLogin(provider: string) {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/chat" });
  }

  // ── Экран: модалка 1-клик ─────────────────────────────────────────────────
  if (generatedCreds) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-[420px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Ваши данные</h2>
          <button onClick={() => setGeneratedCreds(null)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm">✕</button>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ваш логин</label>
            <div className="flex items-center gap-2 h-12 px-4 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="flex-1 font-medium text-gray-900">{generatedCreds.login}</span>
              <button onClick={() => navigator.clipboard.writeText(generatedCreds.login)} className="text-gray-400 hover:text-gray-600"><Copy className="h-4 w-4" /></button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ваш пароль</label>
            <div className="flex items-center gap-2 h-12 px-4 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="flex-1 font-mono text-gray-900">{showPass ? generatedCreds.password : "•".repeat(generatedCreds.password.length)}</span>
              <button onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              <button onClick={() => navigator.clipboard.writeText(generatedCreds.password)} className="text-gray-400 hover:text-gray-600"><Copy className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mb-3">не забудьте сохранить данные</p>

        <button
          onClick={registerOneClick}
          disabled={loading === "register"}
          className="w-full h-12 rounded-2xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-3"
          style={{ backgroundColor: "#CCFF00" }}
        >
          {loading === "register" ? <Loader2 className="h-4 w-4 animate-spin" /> : "⚡ Войти с этими данными"}
        </button>

        <button onClick={copyAll} className="w-full h-12 rounded-2xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-all">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          Скопировать данные
        </button>
      </div>
    );
  }

  // ── Экран: ввод кода OTP ─────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-[420px]">
        <button onClick={() => { setStep("main"); setOtp(["","","","","",""]); setDevCode(null); }} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Назад</button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" style={{ background: "linear-gradient(135deg, #FF4B7D, #FF8FA3)" }}>
            <span className="text-2xl">✉</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Проверьте почту</h2>
          <p className="text-gray-500 text-sm mt-1">Код отправлен на <strong className="text-gray-800">{email}</strong></p>
          {devCode && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <p className="text-xs text-amber-600 mb-1">Dev-режим (без Resend)</p>
              <p className="font-mono text-3xl font-bold tracking-[0.5em] text-amber-900">{devCode}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKey(i, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 bg-gray-50 focus:outline-none transition-all text-gray-900"
              style={{ borderColor: digit ? "#FF4B7D" : "#e5e7eb", backgroundColor: digit ? "#fff0f4" : "#f9fafb" }}
            />
          ))}
        </div>

        <button
          onClick={() => verifyOtp()}
          disabled={loading === "otp" || otp.some((d) => !d)}
          className="w-full h-12 rounded-2xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
          style={{ backgroundColor: "#CCFF00" }}
        >
          {loading === "otp" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Войти →"}
        </button>

        <div className="flex justify-between text-sm">
          <button onClick={() => { setStep("main"); setOtp(["","","","","",""]); setDevCode(null); }} className="text-gray-400 hover:text-gray-600">← Изменить email</button>
          <button onClick={sendOtp} disabled={!!loading} className="font-medium" style={{ color: "#FF4B7D" }}>Отправить снова</button>
        </div>
      </div>
    );
  }

  // ── Экран: вход по логину ─────────────────────────────────────────────────
  if (step === "login-form") {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-[420px]">
        <button onClick={() => setStep("main")} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Назад</button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Войти через логин</h2>
          <p className="text-gray-500 text-sm mt-1">Введите ваши данные</p>
        </div>

        <div className="space-y-3 mb-4">
          <input
            type="text" value={login} onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин или email"
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 text-gray-900"
          />
          <div className="relative">
            <input
              type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loginWithPassword()}
              placeholder="Пароль"
              className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 text-gray-900"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          onClick={loginWithPassword} disabled={loading === "login"}
          className="w-full h-12 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 mb-3"
          style={{ backgroundColor: "#FF4B7D" }}
        >
          {loading === "login" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Войти"}
        </button>

        <Link href="/register" className="w-full h-12 rounded-2xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all text-sm">
          Зарегистрироваться
        </Link>
      </div>
    );
  }

  // ── Главный экран — точная копия GPTPortal ────────────────────────────────
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-[420px]">

      {/* Логотип */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="w-full h-full rounded-full shadow-lg overflow-hidden" style={{
            background: "linear-gradient(135deg, #a8e063, #56ab2f)",
          }}>
            <div className="w-full h-full flex items-center justify-center">
              {/* Иконка как у GPTPortal — круговая стрелка */}
              <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                <circle cx="24" cy="24" r="16" stroke="rgba(0,0,0,0.15)" strokeWidth="3" fill="none"/>
                <path d="M24 10 A14 14 0 0 1 38 24" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                <path d="M24 10 A14 14 0 0 0 10 24" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                <circle cx="24" cy="24" r="5" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Войдите в <span style={{ color: "#FF4B7D" }}>ИИ / Хаб</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">И пользуйтесь лучшими нейросетями!</p>
      </div>

      {/* Email поле */}
      <input
        type="email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendOtp()}
        placeholder="example@mail.ru"
        className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 mb-3 text-gray-900"
        autoFocus
      />

      {/* Войти через почту */}
      <button
        onClick={sendOtp}
        disabled={loading === "email" || !email.trim()}
        className="w-full h-12 rounded-2xl font-semibold flex items-center justify-center gap-2 mb-3 transition-all disabled:opacity-60"
        style={{ backgroundColor: "#FFD6E0", color: "#D63B6E" }}
      >
        {loading === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>✉ Войти через почту</>}
      </button>

      {/* Разделитель */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">или</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ⚡ Войти в 1 клик */}
      <button
        onClick={oneClick}
        disabled={loading === "oneclick"}
        className="w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2 mb-3 text-gray-900 shadow-sm transition-all"
        style={{ backgroundColor: "#CCFF00" }}
      >
        {loading === "oneclick" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>⚡ Войти в 1 клик</>}
      </button>

      {/* Войти через логин */}
      <button
        onClick={() => setStep("login-form")}
        className="w-full h-12 rounded-2xl font-medium flex items-center justify-center gap-2 mb-4 bg-gray-100 hover:bg-gray-200 transition-all text-gray-700"
      >
        <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
        </div>
        Войти через логин
      </button>

      {/* Яндекс + Telegram */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Яндекс (Google как замена) */}
        <button
          onClick={() => oauthLogin("google")}
          disabled={!!loading}
          className="h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center disabled:opacity-60"
        >
          {loading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="h-6 w-6">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
        </button>

        {/* Telegram (GitHub как замена) */}
        <button
          onClick={() => oauthLogin("github")}
          disabled={!!loading}
          className="h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center disabled:opacity-60"
        >
          {loading === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#26A5E4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Подпись VK ID */}
      <p className="text-center text-xs text-gray-400 mb-2">или войти через VK ID с использованием данных из сервиса</p>

      {/* ВК + Одноклассники + Mail.ru */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {/* VK */}
        <button className="h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#0077FF">
            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm2.85 13.65h-1.7c-.64 0-.84-.51-1.99-1.67-1-.98-1.44-.98-1.44-.98s-.2 0-.2.28v1.53c0 .2-.06.32-.6.32-1.17 0-2.46-.7-3.37-2.02-1.37-1.93-1.74-3.37-1.74-3.66 0-.16.06-.3.3-.3h1.7c.22 0 .3.1.38.34.42 1.2 1.12 2.25 1.41 2.25.1 0 .16-.05.16-.32V9.98c-.04-.74-.43-.8-.43-.8-.22-.03-.32-.19-.32-.31 0-.16.13-.28.32-.28h2.67c.18 0 .26.1.26.3v1.94c0 .18.08.26.13.26.1 0 .2-.08.4-.28.62-.7 1.06-1.77 1.06-1.77.06-.14.18-.28.4-.28h1.7c.51 0 .62.26.51.52-.22.5-1.54 2.18-1.54 2.18-.14.2-.2.3 0 .52.14.18.62.56 1 1.06.62.82.64 1.28.64 1.48s-.12.42-.54.42z"/>
          </svg>
        </button>

        {/* Одноклассники */}
        <button className="h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#EE8208">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 4c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm4.949 7.207a.877.877 0 01-.105 1.237c-.636.554-1.387.952-2.212 1.177l2.154 2.154a.877.877 0 11-1.24 1.241L12 15.37l-3.546 3.546a.877.877 0 11-1.241-1.24l2.154-2.155a5.893 5.893 0 01-2.212-1.177.877.877 0 111.132-1.342A4.147 4.147 0 0012 14.123a4.147 4.147 0 003.713-1.021.877.877 0 011.236.105z"/>
          </svg>
        </button>

        {/* Mail.ru */}
        <button className="h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-6 w-6">
            <circle cx="12" cy="12" r="10" fill="#FF6B2B"/>
            <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">@</text>
          </svg>
        </button>
      </div>

      {/* Условия */}
      <p className="text-center text-xs text-gray-400">
        Продолжая, вы принимаете условия{" "}
        <Link href="/terms" className="underline hover:text-gray-600">Пользовательского соглашения</Link>
        {" "}и{" "}
        <Link href="/privacy" className="underline hover:text-gray-600">Политики конфиденциальности</Link>.
      </p>
    </div>
  );
}
