import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser, getUserById, updateUser } from "@/lib/db";

function capitalize(s?: string): string | undefined {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name } = body;

  // Get existing session if any
  const sessionCookie = req.cookies.get("lofibuddha_session");
  let existingUserId: string | null = null;
  if (sessionCookie) {
    try {
      const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
      existingUserId = data.userId;
    } catch { /* ignore */ }
  }

  // If email provided: upgrade anonymous user or create/find existing
  if (email) {
    let user = getUserByEmail(email);

    if (user) {
      // Existing user with this email — merge anonymous data if needed
      if (existingUserId && existingUserId !== user.id) {
        const anonUser = getUserById(existingUserId);
        if (anonUser && !anonUser.email) {
          // Transfer anonymous tokens + chats, then upgrade
          updateUser(user.id, {
            tokens: user.tokens + (anonUser.tokens || 0),
            chatCount: (user.chatCount || 0) + (anonUser.chatCount || 0),
          });
        }
      }
    } else if (existingUserId) {
      // Upgrade anonymous user with email
      const anonUser = getUserById(existingUserId);
      if (anonUser && !anonUser.email) {
        user = updateUser(existingUserId, {
          email,
          name: capitalize(name) || capitalize(email.split("@")[0]),
          tokens: (anonUser.tokens || 0) + 50, // +50 bonus for registering
        });
      }
    }

    if (!user) {
      // Brand new user
      user = createUser({
        id: crypto.randomUUID(),
        email,
        name: capitalize(name) || capitalize(email.split("@")[0]),
        tokens: 100, // 50 base + 50 registration bonus
        plan: "free",
        chatCount: 0,
      });
    }

    const session = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString("base64");
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, tokens: user.tokens, plan: user.plan, chatCount: user.chatCount },
    });
    response.cookies.set("lofibuddha_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  }

  // No email — create anonymous user with name if provided
  const user = createUser({
    id: crypto.randomUUID(),
    name: capitalize(name),
    tokens: 5000,
    plan: "free",
    chatCount: 0,
  });

  const session = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, tokens: user.tokens, plan: user.plan, chatCount: user.chatCount, isAnonymous: true },
  });
  response.cookies.set("lofibuddha_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("lofibuddha_session");
  if (!sessionCookie) return NextResponse.json({ user: null });

  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    const user = getUserById(data.userId);
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: {
        id: user.id, name: user.name, email: user.email,
        tokens: user.tokens, plan: user.plan, chatCount: user.chatCount,
        isAnonymous: !user.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("lofibuddha_session");
  return response;
}
