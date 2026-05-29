import React from "react";

export default function TopLetters({ letters, onPick }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Top 5 predicciones
          </span>
          <span className="text-xs text-muted-foreground">— selección rápida EMG</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          en vivo
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {letters.map((l, i) => (
          <button
            key={`${l}-${i}`}
            onClick={() => onPick(l)}
            className="group relative h-20 sm:h-24 rounded-2xl bg-gradient-to-b from-card to-secondary/60 border-2 border-border hover:border-accent hover:from-accent/10 hover:to-primary/5 transition-all duration-200 soft-shadow active:scale-[0.97]"
          >
            <span className="absolute top-2 left-3 text-[10px] font-bold tabular-nums text-muted-foreground group-hover:text-accent-foreground">
              {i + 1}
            </span>
            <span className="text-4xl sm:text-5xl font-light text-foreground group-hover:text-primary transition-colors">
              {l.toUpperCase()}
            </span>
            <span className="absolute bottom-2 right-3 text-[10px] font-medium text-muted-foreground tabular-nums">
              {Math.round(95 - i * 12)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}