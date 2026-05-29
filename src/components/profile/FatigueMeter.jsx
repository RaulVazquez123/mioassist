import React from "react";
import { Flame } from "lucide-react";

export default function FatigueMeter({ level = 38 }) {
  // level 0-100
  const tone =
    level < 33 ? { label: "Baja", color: "hsl(var(--success))", bg: "bg-emerald-500" } :
    level < 66 ? { label: "Moderada", color: "hsl(var(--warning))", bg: "bg-amber-500" } :
                 { label: "Alta", color: "hsl(var(--destructive))", bg: "bg-red-500" };

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 soft-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Fatiga estimada
          </span>
        </div>
        <span className="text-sm font-semibold" style={{ color: tone.color }}>{tone.label}</span>
      </div>

      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-4xl font-light tabular-nums">{level}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>

      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${tone.bg} transition-all duration-700`}
          style={{ width: `${level}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
        <span>Descansado</span>
        <span>Moderado</span>
        <span>Agotado</span>
      </div>
    </div>
  );
}