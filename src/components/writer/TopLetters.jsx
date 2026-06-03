import React from "react";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

const STYLE_SELECTED = { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8" };

export default function TopLetters({ letters, onPick, zona, topIndex, onOpenDictionary }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Top 5 predicciones
          </span>
          <span className="text-[10px] text-muted-foreground">— selección rápida EMG</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
          en vivo
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {letters.map((item, i) => {
          const l       = typeof item === "string" ? item : item.letter;
          const percent = typeof item === "object" && item.percent ? item.percent : null;
          const isSelected = zona === "top" && topIndex === i;
          return (
            <button
              key={`${l}-${i}`}
              onClick={() => onPick(l)}
              style={isSelected ? STYLE_SELECTED : {}}
              className="group relative h-14 rounded-xl bg-gradient-to-b from-card to-secondary/60 border-2 border-border hover:border-accent hover:from-accent/10 hover:to-primary/5 transition-all duration-200 soft-shadow active:scale-[0.97] flex items-center justify-center"
            >
              <span className="absolute top-1 left-1.5 text-[9px] font-bold tabular-nums text-muted-foreground group-hover:text-accent-foreground">
                {i + 1}
              </span>
              <span className="text-3xl font-light text-foreground group-hover:text-primary transition-colors">
                {l ? l.toUpperCase() : ""}
              </span>
              {percent !== null && (
                <span className="absolute bottom-1 right-1.5 text-[9px] font-medium text-muted-foreground tabular-nums">
                  {percent}%
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={onOpenDictionary}
          style={zona === "top" && topIndex === 5 ? STYLE_SELECTED : {}}
          className="group relative h-14 rounded-xl border-2 bg-primary text-primary-foreground border-primary hover:bg-primary/90 transition-all duration-200 soft-shadow active:scale-[0.97] flex flex-col items-center justify-center gap-1"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium text-center leading-tight px-1">
            Palabras
          </span>
        </button>
      </div>
    </div>
  );
}