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
      "relative rounded-2xl border border-border/70 bg-gradient-to-br p-3 soft-shadow overflow-hidden",
      tones[tone]
    )}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground leading-tight">{label}</span>
        {Icon && (
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-light tracking-tight tabular-nums">{value}</span>
        {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
      </div>
      {hint && <p className="mt-0.5 text-[9px] text-muted-foreground">{hint}</p>}
    </div>
  );
}