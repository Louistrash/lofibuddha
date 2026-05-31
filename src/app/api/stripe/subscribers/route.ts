import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

// Price IDs to tier + amount mapping
const PRICE_META: Record<string, { tier: string; amount: number }> = {
  price_1TchJtB7GXjClDhqDj2dLJDn: { tier: "mindful", amount: 4.99 },
  price_1TchJuB7GXjClDhqJRbsTgHt: { tier: "enlightened", amount: 12.99 },
};

interface SubscriberStats {
  activeSubscribers: number;
  mrr: number;
  churnRate: number;
  totalEver: number;
  cancelledCount: number;
  tierDistribution: Record<string, number>;
  recentSubscriptions: Array<{
    email: string;
    tier: string;
    status: string;
    amount: number;
    since: string;
  }>;
}

export async function GET(_request: NextRequest) {
  try {
    const stripe = getStripe();

    // ── Fetch active subscriptions (paginated) ────
    let activeSubs: Stripe.Subscription[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const subs = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      activeSubs = activeSubs.concat(subs.data);
      hasMore = subs.has_more;
      if (subs.data.length > 0) {
        startingAfter = subs.data[subs.data.length - 1].id;
      }
    }

    // ── Calculate MRR & tier distribution ──────────
    let mrr = 0;
    const tierDist: Record<string, number> = { mindful: 0, enlightened: 0, zen: 0 };

    const recentSubscriptions: SubscriberStats["recentSubscriptions"] = [];

    for (const sub of activeSubs) {
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        const meta = PRICE_META[priceId];
        if (meta) {
          mrr += meta.amount;
          tierDist[meta.tier]++;
        }
      }

      // Recent subs for display (last 10)
      if (recentSubscriptions.length < 10) {
        const customer =
          typeof sub.customer === "string"
            ? await stripe.customers.retrieve(sub.customer).catch(() => null)
            : sub.customer;

        const email =
          customer && !customer.deleted
            ? (customer as Stripe.Customer).email || "unknown"
            : "unknown";

        let tier = "unknown";
        let amount = 0;
        for (const item of sub.items.data) {
          const meta = PRICE_META[item.price.id];
          if (meta) {
            tier = meta.tier;
            amount = meta.amount;
            break;
          }
        }

        recentSubscriptions.push({
          email,
          tier,
          status: sub.status,
          amount,
          since: new Date(sub.created * 1000).toISOString(),
        });
      }
    }

    // ── Get cancelled count for churn ──────────────
    let cancelledCount = 0;
    let totalEver = 0;
    try {
      let cancelHasMore = true;
      let cancelAfter: string | undefined;

      while (cancelHasMore) {
        const cancelled = await stripe.subscriptions.list({
          status: "canceled",
          limit: 100,
          ...(cancelAfter ? { starting_after: cancelAfter } : {}),
        });
        cancelledCount += cancelled.data.length;
        cancelHasMore = cancelled.has_more;
        if (cancelled.data.length > 0) {
          cancelAfter = cancelled.data[cancelled.data.length - 1].id;
        }
      }
      totalEver = activeSubs.length + cancelledCount;
    } catch {
      // If fetching cancelled fails, use active subs only
      totalEver = activeSubs.length;
    }

    const churnRate = totalEver > 0 ? (cancelledCount / totalEver) * 100 : 0;

    const stats: SubscriberStats = {
      activeSubscribers: activeSubs.length,
      mrr: Math.round(mrr * 100) / 100,
      churnRate: Math.round(churnRate * 10) / 10,
      totalEver,
      cancelledCount,
      tierDistribution: tierDist,
      recentSubscriptions,
    };

    return NextResponse.json(stats);
  } catch (err: any) {
    console.error("[Stripe Stats]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
