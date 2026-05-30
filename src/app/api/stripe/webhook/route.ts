import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// ── Simple JSON subscriber store ──────────────
const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

interface Subscriber {
  email: string;
  tier: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: "active" | "cancelled" | "past_due";
  createdAt: string;
  updatedAt: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSubscribers(): Subscriber[] {
  ensureDataDir();
  if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeSubscribers(subscribers: Subscriber[]) {
  ensureDataDir();
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

function upsertSubscriber(data: Partial<Subscriber>) {
  const subscribers = readSubscribers();
  const idx = subscribers.findIndex((s) => s.email === data.email);
  const now = new Date().toISOString();

  if (idx >= 0) {
    subscribers[idx] = { ...subscribers[idx], ...data, updatedAt: now };
  } else {
    subscribers.push({
      email: data.email || "",
      tier: data.tier || "unknown",
      stripeCustomerId: data.stripeCustomerId || "",
      stripeSubscriptionId: data.stripeSubscriptionId || "",
      status: data.status || "active",
      createdAt: now,
      updatedAt: now,
    });
  }
  writeSubscribers(subscribers);
  return subscribers;
}

// ── Webhook handler ────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email || session.customer_details?.email;
      const tier = session.metadata?.tier || "unknown";

      if (email) {
        upsertSubscriber({
          email,
          tier,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
        });
        console.log(`[Webhook] ✅ Subscriber saved: ${email} (${tier})`);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const subscribers = readSubscribers();
      const match = subscribers.find(
        (s) => s.stripeCustomerId === customerId
      );
      if (match) {
        const newStatus =
          sub.status === "active"
            ? "active"
            : sub.status === "past_due"
              ? "past_due"
              : "cancelled";
        upsertSubscriber({
          email: match.email,
          status: newStatus,
          stripeSubscriptionId: sub.id,
        });
        console.log(
          `[Webhook] 🔄 Subscription updated: ${match.email} → ${newStatus}`
        );
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const subscribers = readSubscribers();
      const match = subscribers.find(
        (s) => s.stripeCustomerId === customerId
      );
      if (match) {
        upsertSubscriber({
          email: match.email,
          status: "cancelled",
        });
        console.log(`[Webhook] ❌ Subscription cancelled: ${match.email}`);
      }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
