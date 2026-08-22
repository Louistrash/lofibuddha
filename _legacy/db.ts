import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  tokens: number;
  plan: "free" | "starter" | "focus" | "deep";
  planExpiresAt?: string;
  chatCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  tokensUsed: number;
  createdAt: string;
}

export interface TokenPurchase {
  id: string;
  userId: string;
  amount: number;
  stripeSessionId?: string;
  plan?: string;
  createdAt: string;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readCollection<T>(name: string): T[] {
  ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeCollection<T>(name: string, data: T[]) {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

// Users
export function getUsers(): User[] {
  return readCollection<User>("users");
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function createUser(user: Omit<User, "createdAt" | "updatedAt">): User {
  const users = getUsers();
  const now = new Date().toISOString();
  const newUser: User = { ...user, createdAt: now, updatedAt: now };
  users.push(newUser);
  writeCollection("users", users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  writeCollection("users", users);
  return users[idx];
}

// Chat Messages
export function getChatMessages(userId: string, limit = 50): ChatMessage[] {
  return readCollection<ChatMessage>("chat_messages")
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-limit);
}

export function createChatMessage(msg: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  const messages = readCollection<ChatMessage>("chat_messages");
  const newMsg: ChatMessage = {
    ...msg,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  messages.push(newMsg);
  writeCollection("chat_messages", messages);
  return newMsg;
}

// Token Purchases
export function getTokenPurchases(userId: string): TokenPurchase[] {
  return readCollection<TokenPurchase>("token_purchases").filter((p) => p.userId === userId);
}

export function createTokenPurchase(purchase: Omit<TokenPurchase, "id" | "createdAt">): TokenPurchase {
  const purchases = readCollection<TokenPurchase>("token_purchases");
  const newPurchase: TokenPurchase = {
    ...purchase,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  purchases.push(newPurchase);
  writeCollection("token_purchases", purchases);
  return newPurchase;
}
