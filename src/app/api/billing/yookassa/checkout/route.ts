import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";

const SHOP_ID = process.env.YOOKASSA_SHOP_ID!;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

const PLANS = {
  week: {
    amount: "299.00",
    days: 7,
    description: "Подписка ИИ Хаб — Неделя",
    tier: "UNLIMITED",
  },
  "two-weeks": {
    amount: "550.00",
    days: 14,
    description: "Подписка ИИ Хаб — 14 дней",
    tier: "UNLIMITED",
  },
  month: {
    amount: "1369.00",
    days: 30,
    description: "Подписка ИИ Хаб — Месяц",
    tier: "UNLIMITED",
  },
} as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  const planData = PLANS[plan as keyof typeof PLANS];
  if (!planData) {
    return NextResponse.json({ error: "Неверный план" }, { status: 400 });
  }

  const idempotenceKey = randomUUID();
  const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64");

  const payment = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify({
      amount: {
        value: planData.amount,
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${APP_URL}/chat?payment=success`,
      },
      capture: true,
      description: planData.description,
      metadata: {
        userId: session.user.id,
        plan,
        days: planData.days,
        tier: planData.tier,
      },
    }),
  });

  if (!payment.ok) {
    const err = await payment.json();
    console.error("YooKassa error:", err);
    return NextResponse.json({ error: "Ошибка создания платежа" }, { status: 500 });
  }

  const data = await payment.json();
  const confirmUrl = data.confirmation?.confirmation_url;

  if (!confirmUrl) {
    return NextResponse.json({ error: "Не удалось получить ссылку оплаты" }, { status: 500 });
  }

  return NextResponse.json({ url: confirmUrl });
}
