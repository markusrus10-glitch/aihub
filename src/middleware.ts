import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Страницы доступные без входа
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/pricing",
  "/privacy",
  "/terms",
  "/shared",
];

// Только для не-авторизованных
const AUTH_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

export default auth((req) => {
  const path = req.nextUrl.pathname;

  // Всегда пропускаем
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/health") ||
    path.startsWith("/api/billing/webhook") ||
    path.startsWith("/api/billing/yookassa/webhook") ||
    path.startsWith("/shared/") ||
    path.startsWith("/api/chat/shared/") ||
    path.includes("favicon") ||
    path.includes("manifest") ||
    path.includes("robots") ||
    path.includes("sw.js") ||
    path.includes(".png") ||
    path.includes(".ico") ||
    path.includes(".json")
  ) {
    return NextResponse.next();
  }

  // Читаем сессию — в NextAuth v5 она в req.auth
  const session = (req as { auth?: { user?: { id?: string; role?: string } } | null }).auth;
  const isLoggedIn = !!session?.user?.id;

  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(p + "/")
  );
  const isAuthOnly = AUTH_ONLY_PATHS.some(
    (p) => path === p || path.startsWith(p + "/")
  );

  // Залогиненных с главной страницы кидаем в дашборд
  if (isLoggedIn && path === "/") {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }

  // Вошедших пользователей не пускаем на страницы входа/регистрации
  if (isLoggedIn && isAuthOnly) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }

  // API роуты: 401 если не авторизован
  if (path.startsWith("/api/")) {
    if (!isLoggedIn && !isPublic) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Публичные страницы — всегда доступны
  if (isPublic) {
    return NextResponse.next();
  }

  // Защищённые страницы — редиректим на вход
  if (!isLoggedIn) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Админ-роуты
  if (path.startsWith("/admin")) {
    const role = session?.user?.role;
    if (!["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/chat", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
