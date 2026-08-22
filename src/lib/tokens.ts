const PLANS = {
  free: { tokens: 50, name: "Free" },
  starter: { tokens: 500, name: "Starter" },
  focus: { tokens: 2000, name: "Focus" },
  deep: { tokens: -1, name: "Deep" }, // -1 = unlimited
} as const;

export type PlanName = keyof typeof PLANS;

export function getPlanTokens(plan: PlanName): number {
  return PLANS[plan].tokens;
}

export function getPlanName(plan: PlanName): string {
  return PLANS[plan].name;
}

export function hasUnlimitedTokens(plan: PlanName): boolean {
  return PLANS[plan].tokens === -1;
}

/** Estimate tokens for a message. Roughly: 1 token ≈ 4 chars for English, ~3 for other */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

export function getPlanPrice(plan: PlanName): number {
  switch (plan) {
    case "starter": return 5;
    case "focus": return 12;
    case "deep": return 25;
    default: return 0;
  }
}

export function getPlanTokensPerMonth(plan: PlanName): number {
  return PLANS[plan].tokens;
}
