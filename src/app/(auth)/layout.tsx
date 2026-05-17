import type { Metadata } from "next";

export const metadata: Metadata = { title: "Авторизация | ИИ Хаб" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
