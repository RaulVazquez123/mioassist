import React from "react";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PracticeCard({ title, description, level, duration, items, completed }) {
  const levelTone = {
    Básico: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    Intermedio: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    Avanzado: "bg-primary/10 text-primary border-primary/20",
  }[level] || "bg-secondary text-foreground";

  return (
    <div className="group rounded-3xl border border-border/70 bg-card p-6 soft-shadow hover:border-accent/60 transition-all">
      <div className="flex items-start justify-between mb-4">
        <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border", levelTone)}>
          {level}
        </span>
        {completed && (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        )}
      </div>

      <h3 className="text-xl font-semibold tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>

      <div className="space-y-2 mb-6">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 text-sm px-3 py-2 rounded-xl bg-secondary/60">
            <span className="w-5 h-5 rounded-md bg-card border border-border text-[10px] font-bold tabular-nums flex items-center justify-center">
              {i + 1}
            </span>
            <span>{it}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">{duration}</span>
        <Button className="rounded-full h-10 px-5 bg-primary hover:bg-primary/90">
          <Play className="w-4 h-4 mr-2" />
          Iniciar
        </Button>
      </div>
    </div>
  );
}