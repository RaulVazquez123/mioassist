import React, { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";
import { useEMG } from "@/lib/EMGContext";

export default function FatigueMeter({ level: levelProp }) {
  const { izqMnf, derMnf, connected } = useEMG();
  const baselineMnf = useRef(null);
  const [fatigueLevel, setFatigueLevel] = useState(levelProp ?? 0);

  useEffect(() => {
    if (!connected) return;
    const mnf = Math.max(izqMnf, derMnf);
    if (!mnf || mnf <= 0) return;
    if (!baselineMnf.current) { baselineMnf.current = mnf; return; }
    const drop = (baselineMnf.current - mnf) / baselineMnf.current;
    setFatigueLevel(Math.min(100, Math.max(0, Math.round((drop / 0.30) * 100))));
  }, [izqMnf, derMnf, connected]);

  const level = connected ? fatigueLevel : (levelProp ?? 0);
  const tone =
    level < 33 ? { label: "Baja",     color: "hsl(var(--success))",    bg: "bg-emerald-500" } :
    level < 66 ? { label: "Moderada", color: "hsl(var(--warning))",    bg: "bg-amber-500"   } :
                 { label: "Alta",     color: "hsl(var(--destructive))", bg: "bg-red-500"     };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-3 soft-shadow">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Flame className="w-3 h-3 text-amber-600" />
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Fatiga estimada</span>
        </div>
        <span className="text-xs font-semibold" style={{ color: tone.color }}>{tone.label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-xl font-light tabular-nums">{level}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${tone.bg} transition-all duration-700`} style={{ width: `${level}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
        <span>Descansado</span><span>Moderado</span><span>Agotado</span>
      </div>
    </div>
  );
}