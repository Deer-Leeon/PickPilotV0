import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

/**
 * The fill of a quiet control that sits on a card or panel: no outline, lighter on hover.
 * Shared so every such control (buttons, links that look like buttons, the slip "+") matches.
 */
export const CONTROL_FILL = "bg-white/[0.07] text-fg-soft hover:bg-white/[0.12] hover:text-fg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-fg text-canvas hover:bg-white font-semibold",
  secondary: CONTROL_FILL,
  ghost: "text-fg-muted hover:bg-white/5 hover:text-fg",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3.5 text-xs",
};

/** Shared classes, for links that should look like buttons. */
export function buttonClass(variant: Variant = "secondary", size: Size = "md", className?: string): string {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "secondary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
