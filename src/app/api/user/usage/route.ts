import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayUsage, monthUsage] = await Promise.all([
    db.dailyUsageSummary.findUnique({
      where: { userId_date: { userId: session.user.id, date: today } },
    }),
    db.usageRecord.aggregate({
      where: {
        userId: session.user.id,
        recordedAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
      },
      _sum: { totalTokens: true, estimatedCostUsd: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    today: {
      messages: todayUsage?.messagesCount ?? 0,
      images: todayUsage?.imagesCount ?? 0,
      fileAnalysis: todayUsage?.fileAnalysisCount ?? 0,
      tokens: todayUsage?.totalTokens ?? 0,
    },
    month: {
      totalTokens: monthUsage._sum.totalTokens ?? 0,
      totalCost: monthUsage._sum.estimatedCostUsd ?? 0,
      totalRequests: monthUsage._count.id ?? 0,
    },
  });
}
