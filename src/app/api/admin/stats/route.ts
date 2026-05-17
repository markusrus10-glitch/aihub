import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const [
    totalUsers,
    newUsersToday,
    totalChats,
    totalMessages,
    activeSubscriptions,
    monthlyRevenue,
    todayMessages,
    tokensThisMonth,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { createdAt: { gte: startOfDay } } }),
    db.chat.count({ where: { deletedAt: null } }),
    db.message.count({ where: { deletedAt: null } }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: true },
    }),
    db.message.count({ where: { createdAt: { gte: startOfDay } } }),
    db.usageRecord.aggregate({
      where: { recordedAt: { gte: startOfMonth } },
      _sum: { totalTokens: true },
    }),
  ]);

  const mrr = monthlyRevenue.reduce((acc, sub) => {
    return acc + Number(sub.plan.monthlyPriceUsd);
  }, 0);

  return NextResponse.json({
    users: { total: totalUsers, newToday: newUsersToday },
    chats: { total: totalChats },
    messages: { total: totalMessages, today: todayMessages },
    revenue: { mrr, activeSubscriptions },
    tokens: { thisMonth: tokensThisMonth._sum.totalTokens ?? 0 },
  });
}
