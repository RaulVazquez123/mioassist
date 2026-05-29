import React from "react";

export default function SignalGauge({ avg = 68, max = 118 }) {
  const pct = Math.min(100, (avg / max) * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 soft-shadow flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Perfil de señal
        </span>
        <span className="text-[10px] font-medium text-accent-foreground bg-accent/20 border border-accent/30 rounded-full px-2 py-0.5">
          µV
        </span>
      </div>

      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="url(#gauge-grad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          <defs>
            <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-light tabular-nums">{avg}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">promedio</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-xs">
        <div className="text-center">
          <div className="text-muted-foreground">Pico</div>
          <div className="font-semibold tabular-nums">{max} µV</div>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="text-center">
          <div className="text-muted-foreground">Estable</div>
          <div className="font-semibold text-emerald-600">Sí</div>
        </div>
      </div>
    </div>
  );
}