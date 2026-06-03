import React from "react";
import { cn } from "@/lib/utils";

export default function KeyButton({
  children,
  onClick,
  variant = "default",
  className = "",
  wide = 1,
  ariaLabel,
  style = {},
}) {
  const variants = {
    default: "bg-card hover:bg-secondary text-foreground border-border",
    accent:  "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
    soft:    "bg-secondary hover:bg-muted text-foreground border-border",
    danger:  "bg-card hover:bg-destructive/10 text-destructive border-border hover:border-destructive/40",
  };

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "h-11 sm:h-12 rounded-xl border-2 font-medium text-base sm:text-lg transition-all duration-150 active:scale-[0.96] key-shadow select-none flex items-center justify-center gap-0.5",
        variants[variant],
        className
      )}
      style={{ gridColumn: `span ${wide} / span ${wide}`, ...style }}
    >
      {children}
    </button>
  );
}