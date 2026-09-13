export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40 disabled:pointer-events-none select-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-[#F3D8A4] to-[#E4B872] text-[#08070C] hover:opacity-90 active:scale-[0.98] shadow-[0_4px_16px_var(--accent-glow)]",
  secondary:
    "bg-bg-elevated border border-border text-text-primary hover:bg-bg-hover backdrop-blur-xl",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-hover",
  soft: "bg-accent/15 text-accent-light hover:bg-accent/25 border border-accent/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}
