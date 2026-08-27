import { NextRequest, NextResponse } from "next/server";
import { chatWithBuddha } from "@/lib/deepseek";
import { getUserById, updateUser, createChatMessage, getChatMessages, createUser } from "@/lib/db";
import { hasUnlimitedTokens } from "@/lib/tokens";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

function getUserIdFromSession(req: NextRequest): string | null {
  // Firebase-users: uid via header (gezet door de client na Firebase login)
  const fbUid = req.headers.get("x-fb-uid");
  if (fbUid) return fbUid;
  // Oude cookie-sessie (anonieme gebruikers)
  const sessionCookie = req.cookies.get("lofibuddha_session");
  if (!sessionCookie) return null;
  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    return data.userId || null;
  } catch {
    return null;
  }
}

// Journey hints for the app. The client owns the actual routing (only it knows
// its own routes), so these are intent signals — keep the ids in sync with the
// four journeys in packages/shared/src/experiences.ts.
const DEEP_LINKS: Array<{ keywords: string[]; url: string; label: string }> = [
  {
    keywords: ["breathe", "breathing", "anxious", "anxiety", "panic", "nervous", "overwhelmed", "inhale", "exhale", "tight chest", "hyperventilat"],
    url: "/category/breathe",
    label: "breathe with me",
  },
  {
    keywords: ["sleep", "insomnia", "awake", "bedtime", "night", "restless", "exhausted", "wind down", "nightmare"],
    url: "/category/sleep",
    label: "let the day dissolve",
  },
  {
    keywords: ["focus", "concentrate", "concentration", "distract", "procrastinat", "deep work", "study", "attention", "scattered"],
    url: "/category/focus",
    label: "settle into deep work",
  },
  {
    keywords: ["relax", "unwind", "rest", "let go", "release", "tension", "soften", "stillness", "quiet", "peace", "settle"],
    url: "/category/relax",
    label: "unwind with me",
  },
  {
    keywords: ["sound", "music", "mix", "soundscape", "listen", "audio", "playlist", "rain sounds", "ocean", "forest sounds", "meditat", "ambient", "soundtrack"],
    url: "/explore",
    label: "open the sound library",
  },
];

/** Strongest match wins, so a message about stress *and* sleep resolves sensibly. */
function getDeepLink(userMessage: string, aiResponse: string): { url: string; label: string } | null {
  const combined = (userMessage + " " + aiResponse).toLowerCase();
  let best: { url: string; label: string } | null = null;
  let bestScore = 0;

  for (const entry of DEEP_LINKS) {
    const score = entry.keywords.reduce((n, k) => (combined.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = { url: entry.url, label: entry.label };
    }
  }

  return best;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const fbUid = req.headers.get("x-fb-uid") || body.fbUid || null;
  const fbName = body.fbName || null;
  const fbEmail = body.fbEmail || null;

  let userId = getUserIdFromSession(req);
  let isNewUser = false;
  let isReturning = false;

  if (!userId && fbUid) userId = fbUid;

  if (!userId) {
    const newUser = createUser({
      id: crypto.randomUUID(),
      tokens: 5000,
      plan: "free",
      chatCount: 0,
    });
    userId = newUser.id;
    isNewUser = true;
  }

  // Firebase-user: zorg dat het profiel bestaat en progress bijgewerkt wordt
  if (fbUid) {
    const existing = getUserById(fbUid);
    const now = new Date().toISOString();
    if (!existing) {
      createUser({
        id: fbUid,
        name: fbName || undefined,
        email: fbEmail || undefined,
        tokens: 5000,
        plan: "free",
        chatCount: 0,
      });
    } else {
      // Terugkerende Firebase-user: progress + laatste bezoek bijwerken
      isReturning = (existing.chatCount || 0) > 0;
      updateUser(fbUid, {
        name: fbName || existing.name,
        email: fbEmail || existing.email,
        lastVisitAt: now,
      });
    }
  }

  const user = getUserById(userId);
  if (!user) {
    return withCors(req, NextResponse.json({ error: "Session expired. Please refresh." }, { status: 404 }));
  }

  if (!user.email && (user.chatCount || 0) >= 10) {
    return withCors(req, NextResponse.json({
      error: "Your 10 free chats are used. Enter your email for 10 more.",
      code: "EMAIL_REQUIRED",
    }, { status: 403 }));
  }

  if (!hasUnlimitedTokens(user.plan) && user.tokens <= 0) {
    return withCors(req, NextResponse.json({
      error: "No tokens left. Upgrade to continue.",
      code: "OUT_OF_TOKENS",
    }, { status: 402 }));
  }

  const userMessage = body.message?.trim();
  if (!userMessage) {
    return withCors(req, NextResponse.json({ error: "Message is required" }, { status: 400 }));
  }
  const language: string = body.language || "english";

  const recentMessages = getChatMessages(userId, 10);
  const conversationHistory = recentMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  createChatMessage({ userId, role: "user", content: userMessage, tokensUsed: 0 });

  try {
    // Eerste chat ooit: warme persoonlijke welkom
    const isFirstChat = !user.chatCount || user.chatCount === 0;
    // Terugkerende Firebase-user (na vorige sessie): warme check-in i.p.v. opnieuw beginnen
    const isReturningVisit = isReturning && !isFirstChat;

    let prefix = "";
    if (isFirstChat) {
      prefix = `${user.name || userMessage} just joined. This is their very first moment with you. Their name is exactly "${user.name || userMessage}" — greet them using EXACTLY this name with a capital first letter, never lowercase it. Keep it short and personal. Then ask how they are feeling right now, offering the 4 action choices on their own lines starting with --- so they become separate clickable bubbles:\n\n--- i want to focus\n--- my mind feels busy\n--- i can't sleep\n--- i just need to talk\n\nKeep the welcome warm and human. Do not add any text after the 4 choices.`;
    } else if (isReturningVisit) {
      // Check-in: herken de terugkeer, vraag hoe het gaat + slaap
      prefix = `${user.name} is returning to you after a break (this is a NEW session, not a continuation of the previous chat). Their name is exactly "${user.name}". Greet them warmly by name — like "welcome back, ${user.name}" — and do a gentle check-in. Ask how they are feeling today, and specifically how their sleep was, and what they need right now. Offer 4 choices on their own lines starting with --- :\n\n--- i slept well\n--- i slept badly\n--- i feel anxious\n--- i just want to talk\n\nKeep it warm and human, max 3 sentences before the choices. Do not add any text after the 4 choices.`;
    }

    const messagesToSend = prefix
      ? [{ role: "user" as const, content: prefix }, ...conversationHistory, { role: "user" as const, content: userMessage }]
      : [...conversationHistory, { role: "user" as const, content: userMessage }];

    const response = await chatWithBuddha({
      messages: messagesToSend,
      maxTokens: 300,
      language,
    });

    // Only attach deep link on non-first chats (welcome stays clean)
    const deepLink = isFirstChat ? null : getDeepLink(userMessage, response.content);
    createChatMessage({ userId, role: "assistant", content: response.content, tokensUsed: 0 });

    const actualTokensUsed = response.tokensUsed || 0;
    const newChatCount = (user.chatCount || 0) + 1;

    if (!hasUnlimitedTokens(user.plan)) {
      const newBalance = Math.max(0, user.tokens - actualTokensUsed);
      updateUser(userId, { tokens: newBalance, chatCount: newChatCount });
    } else {
      updateUser(userId, { chatCount: newChatCount });
    }

    const updatedUser = getUserById(userId);

    const jsonResponse = NextResponse.json({
      message: response.content,
      deepLink, // structured: { url, label } or null
      tokensRemaining: hasUnlimitedTokens(updatedUser!.plan) ? null : updatedUser!.tokens,
      tokensUsed: actualTokensUsed,
      chatCount: updatedUser!.chatCount,
      needsEmail: !updatedUser!.email && newChatCount >= 8,
      isNewUser,
      isReturning,
    });

    if (isNewUser) {
      const session = Buffer.from(JSON.stringify({ userId })).toString("base64");
      jsonResponse.cookies.set("lofibuddha_session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return withCors(req, jsonResponse);
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return withCors(req, NextResponse.json({ error: "Buddha is meditating. Please try again." }, { status: 500 }));
  }
}
