import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,  // 30 дней
    updateAge: 7 * 24 * 60 * 60, // обновлять раз в неделю (было: раз в сутки)
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // OTP вход — проверяем код из VerificationToken
    CredentialsProvider({
      id: "otp",
      name: "otp",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;

        const email = credentials.email as string;
        const code = credentials.code as string;

        // Ищем токен
        const token = await db.verificationToken.findUnique({
          where: { identifier_token: { identifier: `otp:${email}`, token: code } },
        });

        if (!token || token.expires < new Date()) {
          if (token) {
            await db.verificationToken.delete({
              where: { identifier_token: { identifier: `otp:${email}`, token: code } },
            });
          }
          return null;
        }

        // Удаляем использованный токен
        await db.verificationToken.delete({
          where: { identifier_token: { identifier: `otp:${email}`, token: code } },
        });

        // Находим или создаём пользователя
        let user = await db.user.findUnique({
          where: { email },
          include: { subscription: { select: { plan: { select: { tier: true } } } } },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email,
              name: email.split("@")[0],
              emailVerified: new Date(),
            },
            include: { subscription: { select: { plan: { select: { tier: true } } } } },
          });
          await db.userPreferences.create({ data: { userId: user.id } });
        } else if (!user.emailVerified) {
          await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        }

        if (user.isBanned) return null;

        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          planTier: user.subscription?.plan?.tier ?? "FREE",
        };
      },
    }),
    // Обычный вход по паролю (для аккаунтов созданных через регистрацию)
    CredentialsProvider({
      id: "password",
      name: "password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { subscription: { select: { plan: { select: { tier: true } } } } },
        });

        if (!user || !user.passwordHash) return null;
        if (!user.isActive || user.isBanned) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          planTier: user.subscription?.plan?.tier ?? "FREE",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // При первом входе — записываем данные из authorize()
      if (user) {
        token.id = user.id ?? "";
        token.role = (user as { role?: string }).role ?? "USER";
        token.planTier = (user as { planTier?: string }).planTier ?? "FREE";
        token.lastRefresh = Date.now();
        return token;
      }

      // Обновляем роль/план из БД не чаще раза в 5 минут
      const lastRefresh = (token.lastRefresh as number) ?? 0;
      const shouldRefresh = trigger === "update" || Date.now() - lastRefresh > 5 * 60 * 1000;

      if (shouldRefresh && token.id) {
        // Всегда обновляем lastRefresh — даже если БД недоступна,
        // чтобы не долбиться в неё при каждом запросе
        token.lastRefresh = Date.now();
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              isBanned: true,
              isActive: true,
              subscription: { select: { plan: { select: { tier: true } } } },
            },
          });
          if (dbUser) {
            if (dbUser.isBanned || !dbUser.isActive) {
              // Забаненный/деактивированный — возвращаем null чтобы выкинуть
              return null as unknown as typeof token;
            }
            token.role = dbUser.role;
            token.planTier = dbUser.subscription?.plan?.tier ?? "FREE";
          }
        } catch {
          // БД недоступна — оставляем текущие данные токена, сессию НЕ рушим
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.planTier = token.planTier as string;
      }
      return session;
    },
    async signIn({ account }) {
      if (account?.provider !== "credentials") return true;
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Create default preferences for new users
      if (user.id) {
        await db.userPreferences.create({
          data: { userId: user.id },
        });
      }
    },
  },
};
