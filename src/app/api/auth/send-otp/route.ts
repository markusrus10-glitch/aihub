import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

// Генерируем 6-значный код
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const code = generateOTP();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

  // Удаляем старые коды для этого email
  await db.verificationToken.deleteMany({
    where: { identifier: `otp:${email}` },
  });

  // Сохраняем новый код
  await db.verificationToken.create({
    data: {
      identifier: `otp:${email}`,
      token: code,
      expires,
    },
  });

  // Отправляем email
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey && resendKey !== "re_...") {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@aihub.io",
        to: email,
        subject: "Ваш код для входа в ИИ Хаб",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #111; margin-bottom: 8px;">Код для входа</h2>
            <p style="color: #666; margin-bottom: 24px;">Введите этот код на странице входа:</p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #111;">${code}</span>
            </div>
            <p style="color: #999; font-size: 13px;">Код действителен 15 минут. Если вы не запрашивали код — проигнорируйте это письмо.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Email send error:", err);
      // Не блокируем — в dev режиме просто логируем
    }
  } else {
    // В dev режиме показываем код в консоли
    console.log(`\n🔑 OTP для ${email}: ${code}\n`);
  }

  return NextResponse.json({ success: true, dev: !resendKey ? code : undefined });
}
