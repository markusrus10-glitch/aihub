import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const usage = await db.dailyUsageSummary.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
  });

  return NextResponse.json({ subscription: sub, todayUsage: usage });
}
