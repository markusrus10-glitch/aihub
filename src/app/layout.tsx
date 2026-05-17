import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "@/components/layout/SessionProvider";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "ИИ Хаб — Все ИИ модели в одном месте",
    template: "%s | ИИ Хаб",
  },
  description:
    "Доступ к GPT-4o, Claude, Gemini, DeepSeek и другим моделям с одной платформы. Лучший ИИ агрегатор.",
  keywords: ["ИИ", "ChatGPT", "Claude", "Gemini", "искусственный интеллект", "нейросеть"],
  authors: [{ name: "ИИ Хаб" }],
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.variable}>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster
              theme="light"
              position="bottom-right"
              richColors
              closeButton
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
