import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const { email, code } = parsed.data;

  // Ищем токен
  const token = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier: `otp:${email}`, token: code } },
  });

  if (!token) {
    return NextResponse.json({ error: "Неверный код" }, { status: 400 });
  }

  if (token.expires < new Date()) {
    await db.verificationToken.delete({
      where: { identifier_token: { identifier: `otp:${email}`, token: code } },
    });
    return NextResponse.json({ error: "Код устарел. Запросите новый." }, { status: 400 });
  }

  // Удаляем использованный токен
  await db.verificationToken.delete({
    where: { identifier_token: { identifier: `otp:${email}`, token: code } },
  });

  // Находим или создаём пользователя
  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: email.split("@")[0],
        emailVerified: new Date(),
      },
    });
    // Создаём настройки по умолчанию
    await db.userPreferences.create({ data: { userId: user.id } });
  } else {
    // Помечаем email как подтверждённый
    if (!user.emailVerified) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }
  }

  // Возвращаем данные — NextAuth сессию создаём через signIn на клиенте
  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
