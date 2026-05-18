import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.event !== "payment.succeeded") {
      return NextResponse.json({ ok: true });
    }

    const { metadata } = body.object;
    const userId: string = metadata?.userId;
    const days: number = Number(metadata?.days ?? 30);

    if (!userId) {
      return NextResponse.json({ error: "no userId" }, { status: 400 });
    }

    // Находим план UNLIMITED
    const plan = await db.plan.findFirst({
      where: { tier: "UNLIMITED" },
    });
    if (!plan) {
      return NextResponse.json({ error: "plan not found" }, { status: 500 });
    }

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + days);

    // Создаём или обновляем подписку
    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: plan.id,
        status: "ACTIVE",
        stripeCustomerId: `yk_${userId}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    // Обновляем роль пользователя
    await db.user.update({
      where: { id: userId },
      data: { role: "UNLIMITED" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("YooKassa webhook error:", err);
    return NextResponse.json({ error: "webhook error" }, { status: 500 });
  }
}
