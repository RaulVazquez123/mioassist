import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, unit, hint, icon: Icon, tone = "default" }) {
  const tones = {
    default: "from-card to-card",
    primary: "from-primary/5 to-accent/10",
    accent: "from-accent/10 to-primary/5",
  };
  return (
    <div className={cn(
      "relative rounded-3xl border border-border/70 bg-gradient-to-br p-5 soft-shadow overflow-hidden",
      tones[tone]
    )}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-light tracking-tight tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground font-medium">{unit}</span>}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}