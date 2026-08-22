// ── Sequenzy Email Marketing API Client ──────────
// Docs: https://docs.sequenzy.com/api-reference
// Company: Lofi Buddha (cinawvedyum1yk4x2p4b8kql)

const BASE_URL = "https://api.sequenzy.com/v1";

function getHeaders(): Record<string, string> {
  const key = process.env.SEQUENZY_API_KEY || "";
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

// ── Types ──────────────────────────────────────
export interface SequenzySubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  tags?: string[];
  attributes?: Record<string, string | number>;
  createdAt?: string;
}

// ── Subscribers ────────────────────────────────
export async function createSubscriber(params: {
  email: string;
  firstName?: string;
  language?: string;
  tags?: string[];
  attributes?: Record<string, string | number>;
}): Promise<{ success: boolean; subscriber?: SequenzySubscriber; error?: string }> {
  try {
    const body: Record<string, unknown> = {
      email: params.email,
    };
    if (params.firstName) body.firstName = params.firstName;
    if (params.language) body.language = params.language;
    if (params.tags?.length) body.tags = params.tags;
    if (params.attributes) body.attributes = params.attributes;

    const resp = await fetch(`${BASE_URL}/subscribers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      return { success: true, subscriber: data.subscriber };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getSubscriber(email: string): Promise<{ success: boolean; subscriber?: SequenzySubscriber; error?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/subscribers?email=${encodeURIComponent(email)}`, {
      headers: getHeaders(),
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      return { success: true, subscriber: data.subscriber };
    }
    return { success: false, error: "Not found" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateSubscriber(
  email: string,
  params: {
    firstName?: string;
    tags?: string[];
    attributes?: Record<string, string | number>;
  }
): Promise<{ success: boolean; subscriber?: SequenzySubscriber; error?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/subscribers`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ email, ...params }),
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      return { success: true, subscriber: data.subscriber };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSubscriber(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/subscribers`, {
      method: "DELETE",
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (resp.ok) return { success: true };
    const data = await resp.json();
    return { success: false, error: JSON.stringify(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── Lists ───────────────────────────────────────
export async function addToList(
  listId: string,
  emails: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/lists/${listId}/subscribers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ emails }),
    });
    if (resp.ok) return { success: true };
    const data = await resp.json();
    return { success: false, error: JSON.stringify(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── Events ──────────────────────────────────────
export async function triggerEvent(
  email: string,
  eventName: string,
  properties?: Record<string, string | number | boolean>
): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, event: eventName, properties }),
    });
    if (resp.ok) return { success: true };
    const data = await resp.json();
    return { success: false, error: JSON.stringify(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── Tags ────────────────────────────────────────
export async function addTag(
  email: string,
  tag: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/tags`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, tag }),
    });
    if (resp.ok) return { success: true };
    const data = await resp.json();
    return { success: false, error: JSON.stringify(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeTag(
  email: string,
  tag: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/tags/remove`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, tag }),
    });
    if (resp.ok) return { success: true };
    const data = await resp.json();
    return { success: false, error: JSON.stringify(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ── Tier → List mapping ─────────────────────────
// These IDs come from Sequenzy dashboard
export const SEQUENZY_LISTS = {
  newsletter: "ocny5b84y4piled8gt7dc68t",     // Newsletter Subscribers
  product: "sqquzwpni75e0krksmgmklt5",        // Product Subscribers
};

// Tier → tags
export function getTierTags(tier: string): string[] {
  switch (tier) {
    case "mindful":
      return ["subscriber", "mindful-path", "paid"];
    case "enlightened":
      return ["subscriber", "enlightened-path", "paid", "vip"];
    default:
      return ["subscriber"];
  }
}

// Tier → list
export function getTierListId(tier: string): string {
  // All paid subscribers → Product Subscribers
  // Newsletter signups (free) → Newsletter Subscribers
  return tier === "zen" ? SEQUENZY_LISTS.newsletter : SEQUENZY_LISTS.product;
}
