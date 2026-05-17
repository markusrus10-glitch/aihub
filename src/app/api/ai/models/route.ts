import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MODELS } from "@/lib/constants/models";

export async function GET() {
  const session = await auth();
  const planTier = session?.user?.planTier ?? "FREE";

  const tiers = ["FREE", "PRO", "UNLIMITED"];
  const userTierIndex = tiers.indexOf(planTier);

  const available = MODELS.filter((m) => {
    const modelTierIndex = tiers.indexOf(m.minPlanTier);
    return userTierIndex >= modelTierIndex;
  });

  return NextResponse.json({ models: available, planTier });
}
