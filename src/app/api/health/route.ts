import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET() {
  const start = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "connected",
      uptime: process.uptime(),
      latencyMs: Date.now() - start,
    });
  } catch {
    return NextResponse.json(
      { status: "error", db: "disconnected" },
      { status: 503 }
    );
  }
}
