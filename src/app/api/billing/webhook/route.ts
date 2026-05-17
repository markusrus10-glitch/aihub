import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db/client";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  async function getSubscriptionPlan(stripePriceId: string) {
    return db.plan.findFirst({
      where: {
        OR: [
          { stripePriceIdMonthly: stripePriceId },
          { stripePriceIdYearly: stripePriceId },
        ],
      },
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.mode !== "subscription") break;

      const userId = checkoutSession.metadata?.userId;
      if (!userId) break;

      const stripeSubscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string
      );

      const priceId = stripeSubscription.items.data[0]?.price.id;
      const plan = await getSubscriptionPlan(priceId);

      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: plan!.id,
          stripeCustomerId: checkoutSession.customer as string,
          stripeSubscriptionId: stripeSubscription.id,
          status: "ACTIVE",
          currentPeriodStart: stripeSubscription.billing_cycle_anchor ? new Date(stripeSubscription.billing_cycle_anchor * 1000) : undefined,
          currentPeriodEnd: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : undefined,
        },
        update: {
          planId: plan!.id,
          stripeSubscriptionId: stripeSubscription.id,
          status: "ACTIVE",
          currentPeriodStart: stripeSubscription.billing_cycle_anchor ? new Date(stripeSubscription.billing_cycle_anchor * 1000) : undefined,
          currentPeriodEnd: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : undefined,
        },
      });

      // Update user role
      await db.user.update({
        where: { id: userId },
        data: { role: plan?.tier === "UNLIMITED" ? "UNLIMITED" : "PRO" },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const plan = await getSubscriptionPlan(priceId);

      const statusMap: Record<string, string> = {
        active: "ACTIVE",
        past_due: "PAST_DUE",
        canceled: "CANCELED",
        unpaid: "UNPAID",
        trialing: "TRIALING",
        paused: "PAUSED",
      };

      await db.subscription.update({
        where: { userId },
        data: {
          planId: plan?.id,
          status: statusMap[sub.status] as never ?? "INACTIVE",
          currentPeriodStart: sub.billing_cycle_anchor ? new Date(sub.billing_cycle_anchor * 1000) : undefined,
          currentPeriodEnd: sub.cancel_at ? new Date(sub.cancel_at * 1000) : undefined,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const freePlan = await db.plan.findUnique({ where: { tier: "FREE" } });

      await db.subscription.update({
        where: { userId },
        data: { planId: freePlan!.id, status: "CANCELED", stripeSubscriptionId: null },
      });

      await db.user.update({ where: { id: userId }, data: { role: "USER" } });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await db.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: { status: "PAST_DUE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
