import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardVariant = "card" | "frame";

/** No outlines: the shade alone separates a card from what is behind it. */
const VARIANTS: Record<CardVariant, string> = {
  card: "bg-card",
  frame: "bg-panel shadow-2xl",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** "frame" is the darker outer container that holds a list of cards. */
  variant?: CardVariant;
}

export function Card({ variant = "card", className, ...props }: CardProps) {
  return <div className={cn("rounded-2xl", VARIANTS[variant], className)} {...props} />;
}

interface CardHeaderProps {
  title: ReactNode;
  /** Right-aligned controls or a caption. */
  action?: ReactNode;
  className?: string;
}

/** The small upper-case mono title used on every module. */
export function CardHeader({ title, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex min-h-7 items-center justify-between gap-3", className)}>
      <h2 className="font-mono text-xs uppercase tracking-wider text-fg-muted">{title}</h2>
      {action}
    </div>
  );
}
