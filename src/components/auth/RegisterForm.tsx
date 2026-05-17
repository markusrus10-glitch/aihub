"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Ошибка регистрации");
      return;
    }
    await signIn("credentials", { email: data.email, password: data.password, callbackUrl: "/chat" });
  }

  async function oauthLogin(provider: string) {
    await signIn(provider, { callbackUrl: "/chat" });
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Логотип */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-md">
          <span className="text-3xl">✦</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Регистрация в{" "}
          <span style={{ color: "#FF4B7D" }}>ИИ / Хаб</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Бесплатно · Без карты · Сразу в работу</p>
      </div>

      {/* OAuth кнопки */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => oauthLogin("google")}
          className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          onClick={() => oauthLogin("github")}
          className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
          </svg>
          GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">или через email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Ваше имя"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-gray-900"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1 pl-1">{errors.name.message}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-gray-900"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1 pl-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль (мин. 8 символов)"
              className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-gray-900"
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1 pl-1">{errors.password.message}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Подтвердите пароль"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-gray-900"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 pl-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-gray-900 mt-2"
          style={{ backgroundColor: "#CCFF00" }}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Создать аккаунт</>}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-4">
        Продолжая, вы принимаете{" "}
        <Link href="/terms" className="underline hover:text-gray-600">Условия</Link>
        {" "}и{" "}
        <Link href="/privacy" className="underline hover:text-gray-600">Политику конфиденциальности</Link>
      </p>

      <p className="text-center text-sm text-gray-500 mt-4">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium hover:underline" style={{ color: "#FF4B7D" }}>
          Войти
        </Link>
      </p>
    </div>
  );
}
