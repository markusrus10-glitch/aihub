"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-pink-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Сброс пароля</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sent ? "Письмо отправлено на вашу почту" : "Введите email для сброса пароля"}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Если аккаунт существует, вы получите письмо в течение нескольких минут.
            </p>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium mt-4"
              style={{ color: "#FF4B7D" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Введите ваш email"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 mb-4 text-gray-900"
            />

            <button
              onClick={send}
              disabled={loading || !email.trim()}
              className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mb-4 disabled:opacity-60 transition-all"
              style={{ backgroundColor: "#FF4B7D" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить ссылку для сброса"}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Вернуться ко входу
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
