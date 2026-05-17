import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { stripe } from "@/lib/stripe/client";
import { z } from "zod";

const schema = z.object({
  priceId: z.string(),
  interval: z.enum(["monthly", "yearly"]).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { priceId } = parsed.data;
  const userId = session.user.id;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  // Get or create Stripe customer
  let sub = await db.subscription.findUnique({ where: { userId } });

  let customerId = sub?.stripeCustomerId;
  if (!customerId) {
    const user = await db.user.findUnique({ where: { id: userId } });
    const customer = await stripe.customers.create({
      email: user?.email,
      name: user?.name ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;

    // Get free plan
    const freePlan = await db.plan.findUnique({ where: { tier: "FREE" } });

    sub = await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: freePlan!.id,
        stripeCustomerId: customerId,
        status: "INACTIVE",
      },
      update: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=true`,
    cancel_url: `${appUrl}/settings/billing?canceled=true`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
