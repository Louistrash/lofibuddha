import { NextRequest, NextResponse } from "next/server";
import { chatWithBuddha } from "@/lib/deepseek";
import { getUserById, updateUser, createChatMessage, getChatMessages, createUser } from "@/lib/db";
import { hasUnlimitedTokens } from "@/lib/tokens";

function getUserIdFromSession(req: NextRequest): string | null {
  const sessionCookie = req.cookies.get("lofibuddha_session");
  if (!sessionCookie) return null;
  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    return data.userId || null;
  } catch {
    return null;
  }
}

// Deep links to REAL pages in the Bodhi Dashboard
const DEEP_LINKS: Array<{ keywords: string[]; url: string; label: string }> = [
  {
    keywords: ["breathe", "breathing", "anxious", "anxiety", "stressed", "stress", "calm", "relax", "panic", "overwhelmed", "nervous"],
    url: "/breathe",
    label: "breathe with me",
  },
  {
    keywords: ["sleep", "slept", "insomnia", "can't sleep", "cant sleep", "tired", "restless", "exhausted"],
    url: "/browse",
    label: "find sleep sounds",
  },
  {
    keywords: ["meditate", "meditation", "mindful", "mindfulness", "zen", "spiritual"],
    url: "/browse",
    label: "find a meditation",
  },
  {
    keywords: ["focus", "study", "studying", "work", "working", "code", "coding", "program", "concentrate", "deep work", "productive"],
    url: "/browse",
    label: "find focus music",
  },
  {
    keywords: ["learn", "learning", "course", "teach", "practice", "yoga", "beginner"],
    url: "/learn",
    label: "explore courses",
  },
  {
    keywords: ["music", "lofi", "lo-fi", "playlist", "listen", "song", "sound"],
    url: "/browse",
    label: "browse music",
  },
  {
    keywords: ["sad", "lonely", "down", "depressed", "cry", "heartbroken", "grief"],
    url: "/browse",
    label: "find comfort",
  },
  {
    keywords: ["creative", "create", "write", "writer", "artist", "inspired", "block"],
    url: "/browse",
    label: "find creative flow",
  },
];

function getDeepLink(userMessage: string, aiResponse: string): { url: string; label: string } | null {
  const combined = (userMessage + " " + aiResponse).toLowerCase();
  for (const entry of DEEP_LINKS) {
    if (entry.keywords.some((k) => combined.includes(k))) {
      return { url: entry.url, label: entry.label };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  let userId = getUserIdFromSession(req);
  let isNewUser = false;

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

  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Session expired. Please refresh." }, { status: 404 });
  }

  if (!user.email && (user.chatCount || 0) >= 10) {
    return NextResponse.json({
      error: "Your 10 free chats are used. Enter your email for 10 more.",
      code: "EMAIL_REQUIRED",
    }, { status: 403 });
  }

  if (!hasUnlimitedTokens(user.plan) && user.tokens <= 0) {
    return NextResponse.json({
      error: "No tokens left. Upgrade to continue.",
      code: "OUT_OF_TOKENS",
    }, { status: 402 });
  }

  const body = await req.json();
  const userMessage = body.message?.trim();
  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const recentMessages = getChatMessages(userId, 10);
  const conversationHistory = recentMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  createChatMessage({ userId, role: "user", content: userMessage, tokensUsed: 0 });

  try {
    // Detect first message — give warm personalized welcome with gentle choices
    const isFirstChat = !user.chatCount || user.chatCount === 0;
    const welcomePrefix = isFirstChat
      ? `${user.name || userMessage} just joined. This is their very first moment with you. Welcome them warmly — use their name with proper capitalization. Keep it short and personal. Then offer exactly 4 gentle choices, each on its own line starting with --- so they appear as separate bubbles:\n\n"--- My mind feels busy\n--- I'm feeling stressed\n--- I need some motivation\n--- I want to feel calm"\n\nEnd with: "Or simply write whatever comes to mind. I'm listening. 🙏"\n\nThis creates a natural flow where each option is its own bubble the user can tap. Keep the language warm, human, and lowercase except proper nouns.`
      : "";

    const messagesToSend = welcomePrefix
      ? [{ role: "user" as const, content: welcomePrefix }, ...conversationHistory, { role: "user" as const, content: userMessage }]
      : [...conversationHistory, { role: "user" as const, content: userMessage }];

    const response = await chatWithBuddha({
      messages: messagesToSend,
      maxTokens: 300,
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

    return jsonResponse;
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return NextResponse.json({ error: "Buddha is meditating. Please try again." }, { status: 500 });
  }
}
