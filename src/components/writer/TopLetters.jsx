import React from "react";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export default function TopLetters({ letters, onPick, zona, topIndex, onOpenDictionary }) {
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
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {letters.map((item, i) => {
          const l       = typeof item === "string" ? item : item.letter;
          const percent = typeof item === "object" && item.percent ? item.percent : null;
          const isSelected = zona === "top" && topIndex === i;
          return (
            <button
              key={`${l}-${i}`}
              onClick={() => onPick(l)}
              className={cn(
                "group relative h-20 sm:h-24 rounded-2xl bg-gradient-to-b from-card to-secondary/60 border-2 border-border hover:border-accent hover:from-accent/10 hover:to-primary/5 transition-all duration-200 soft-shadow active:scale-[0.97]",
                isSelected && "border-accent from-accent/10 to-primary/5 scale-[1.04]"
              )}
            >
              <span className="absolute top-2 left-3 text-[10px] font-bold tabular-nums text-muted-foreground group-hover:text-accent-foreground">
                {i + 1}
              </span>
              <span className="text-4xl sm:text-5xl font-light text-foreground group-hover:text-primary transition-colors">
                {l ? l.toUpperCase() : ""}
              </span>
              {percent !== null && (
                <span className="absolute bottom-2 right-3 text-[10px] font-medium text-muted-foreground tabular-nums">
                  {percent}%
                </span>
              )}
            </button>
          );
        })}

        {/* Botón diccionario */}
        <button
          onClick={onOpenDictionary}
          className={cn(
            "group relative h-20 sm:h-24 rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 to-primary/5 hover:from-primary/20 hover:border-primary transition-all duration-200 soft-shadow active:scale-[0.97] flex flex-col items-center justify-center gap-1",
            zona === "top" && topIndex === 5 && "border-accent from-accent/10 scale-[1.04]"
          )}
        >
          <BookOpen className="w-7 h-7 text-primary" />
          <span className="text-[10px] font-medium text-primary/80 text-center leading-tight px-1">
            Palabras
          </span>
        </button>
      </div>
    </div>
  );
}