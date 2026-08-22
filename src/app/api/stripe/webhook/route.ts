import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import { sendWelcomeEmail } from "@/lib/welcome-email";
import {
  createSubscriber,
  addToList,
  triggerEvent,
  addTag,
  removeTag,
  getTierTags,
  getTierListId,
} from "@/lib/sequenzy";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// ── JSON subscriber store ──────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

interface Subscriber {
  email: string;
  name?: string;
  language: string;
  tier: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: "active" | "cancelled" | "past_due";
  startDate: string;          // ISO date subscription started
  dripDay: number;             // current day in drip cycle (1-based)
  unlockedCourses: string[];  // course IDs unlocked so far
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

function calculateDripDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// ── Drip content schedule ──────────────────────
const DRIP_SCHEDULE = {
  mindful: [
    { day: 1, type: "welcome", label: "Welcome to your Mindful Path" },
    { day: 1, type: "feature", label: "Unlimited AI Buddha chat — start now", action: "https://lofibuddha.com/chat" },
    { day: 2, type: "playlist", label: "Morning Calm — Lofi playlist #1", action: "/mindfulness" },
    { day: 3, type: "course", label: "Beginner's Mindfulness (Day 1-2)", courseId: "beginners-mindfulness", modules: [1, 2] },
    { day: 5, type: "guide", label: "4-4-4 Box Breathing technique", action: "/mindfulness" },
    { day: 7, type: "playlist", label: "Deep Focus — Lofi playlist #2", action: "/mindfulness" },
    { day: 9, type: "course", label: "Beginner's Mindfulness (Day 3-5)", courseId: "beginners-mindfulness", modules: [3, 4, 5] },
    { day: 12, type: "course", label: "Yoga Foundations (Day 1-3)", courseId: "yoga-foundations", modules: [1, 2, 3] },
    { day: 16, type: "course", label: "Beginner's Mindfulness (Day 6-7)", courseId: "beginners-mindfulness", modules: [6, 7] },
    { day: 19, type: "course", label: "Breathwork Essentials (Day 1-2)", courseId: "breathwork-essentials", modules: [1, 2] },
    { day: 23, type: "course", label: "Yoga Foundations (Day 4-7)", courseId: "yoga-foundations", modules: [4, 5, 6, 7] },
    { day: 26, type: "course", label: "Lofi & Deep Focus (Day 1-3)", courseId: "lofi-deep-focus", modules: [1, 2, 3] },
  ],
  enlightened: [
    { day: 1, type: "welcome", label: "The Enlightened Path awaits" },
    { day: 1, type: "intake", label: "Personal intake — tell us about your journey" },
    { day: 1, type: "feature", label: "Personalized daily meditation is ready", action: "https://lofibuddha.com/chat" },
    { day: 3, type: "roadmap", label: "Your spiritual roadmap — download PDF" },
    { day: 7, type: "video", label: "Guided breathwork video (10 min)" },
    { day: 14, type: "session", label: "1-on-1 AI Buddha deep dive session" },
    { day: 21, type: "playlist", label: "Custom lofi mix — generated for your mood" },
    { day: 28, type: "reflection", label: "Monthly reflection template" },
  ],
};

export function getDripContent(tier: string, dripDay: number) {
  const schedule = DRIP_SCHEDULE[tier as keyof typeof DRIP_SCHEDULE] || [];
  return schedule.filter((item) => item.day <= dripDay);
}

function upsertSubscriber(data: Partial<Subscriber>) {
  const subscribers = readSubscribers();
  const idx = subscribers.findIndex((s) => s.email === data.email);
  const now = new Date().toISOString();

  if (idx >= 0) {
    subscribers[idx] = { ...subscribers[idx], ...data, updatedAt: now };
    // Recalculate drip day
    if (subscribers[idx].startDate) {
      subscribers[idx].dripDay = calculateDripDay(subscribers[idx].startDate);
    }
  } else {
    const startDate = data.startDate || now;
    subscribers.push({
      email: data.email || "",
      name: data.name || "",
      language: data.language || "en",
      tier: data.tier || "unknown",
      stripeCustomerId: data.stripeCustomerId || "",
      stripeSubscriptionId: data.stripeSubscriptionId || "",
      status: data.status || "active",
      startDate,
      dripDay: calculateDripDay(startDate),
      unlockedCourses: data.unlockedCourses || [],
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
      const name = session.customer_details?.name || "";

      if (email) {
        // 1. Local subscriber store
        upsertSubscriber({
          email,
          name,
          tier,
          language: session.metadata?.language || "en",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "active",
          startDate: new Date().toISOString(),
        });

        // 2. Sequenzy — create subscriber + tag + list + event (fire-and-forget)
        const tags = getTierTags(tier);
        const listId = getTierListId(tier);
        const lang = session.metadata?.language || "en";

        createSubscriber({
          email,
          firstName: name,
          language: lang,
          tags,
          attributes: {
            tier,
            stripe_customer_id: session.customer as string,
            signup_source: "stripe_checkout",
          },
        })
          .then((result) => {
            if (result.success) {
              // Add to list + trigger event
              addToList(listId, [email]).catch(() => {});
              triggerEvent(email, "subscription.started", { tier, plan: tier }).catch(() => {});
            }
          })
          .catch(() => {/* silent fail */});

        // 3. Legacy Resend welcome email (keep as fallback)
        sendWelcomeEmail(email, tier, lang)
          .catch(() => {/* silent fail */});
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

        // Sync tags to Sequenzy
        if (newStatus === "past_due") {
          addTag(match.email, "past-due").catch(() => {});
        } else if (newStatus === "active") {
          removeTag(match.email, "past-due").catch(() => {});
        }
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

        // Sync churn tag to Sequenzy
        removeTag(match.email, "subscriber").catch(() => {});
        removeTag(match.email, "paid").catch(() => {});
        addTag(match.email, "churned").catch(() => {});
        triggerEvent(match.email, "subscription.cancelled", {
          tier: match.tier,
        }).catch(() => {});
      }
      break;
    }

    default:
      // Unhandled event type — silently acknowledge
      break;
  }

  return NextResponse.json({ received: true });
}
