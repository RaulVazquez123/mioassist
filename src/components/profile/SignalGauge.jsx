import React from "react";
import { useEMG } from "@/lib/EMGContext";

export default function SignalGauge({ avg: avgProp = 68, max: maxProp = 118 }) {
  const { rmsActual, pico, connected, izqConectado, derConectado } = useEMG();
  const avg = connected && rmsActual > 0 ? Math.round(rmsActual) : avgProp;
  const max = connected && pico > 0     ? Math.round(pico)      : maxProp;
  const pct = max > 0 ? Math.min(100, (avg / max) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  const estable = connected ? (izqConectado && derConectado) : true;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-3 soft-shadow flex flex-col items-center justify-center">
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Perfil de señal</span>
        <span className="text-[9px] font-medium text-accent-foreground bg-accent/20 border border-accent/30 rounded-full px-1.5 py-0.5">µV</span>
      </div>
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
          <circle cx="60" cy="60" r="54" stroke="url(#gauge-grad)" strokeWidth="10" fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }} />
          <defs>
            <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-light tabular-nums">{avg}</span>
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground">prom</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="text-center">
          <div className="text-muted-foreground text-[9px]">Pico</div>
          <div className="font-semibold tabular-nums text-xs">{max} µV</div>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="text-center">
          <div className="text-muted-foreground text-[9px]">Estable</div>
          <div className={`font-semibold text-xs ${estable ? "text-emerald-600" : "text-red-500"}`}>{estable ? "Sí" : "No"}</div>
        </div>
      </div>
    </div>
  );
}