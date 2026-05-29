import React from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuggestionsSidebar({ suggestions, onPick, highlighted, id }) {
  return (
    <aside
      id={id || "suggestions-sidebar"}
      className={cn(
        "rounded-3xl bg-card border border-border/70 soft-shadow overflow-hidden transition-all duration-500",
        highlighted && "ring-4 ring-accent/40 border-accent"
      )}
    >
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-secondary/50 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Palabras sugeridas</h3>
            <p className="text-[11px] text-muted-foreground">Diccionario predictivo</p>
          </div>
        </div>
        <span className="text-[10px] font-medium text-accent-foreground bg-accent/20 border border-accent/30 rounded-full px-2 py-0.5">
          {suggestions.length}
        </span>
      </div>

      <div className="p-3 space-y-2 max-h-[540px] overflow-y-auto">
        {suggestions.map((word, i) => (
          <button
            key={`${word}-${i}`}
            onClick={() => onPick(word)}
            className="group w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-border/60 bg-background hover:border-accent hover:bg-accent/5 transition-all text-left active:scale-[0.98]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-7 h-7 shrink-0 rounded-lg bg-secondary group-hover:bg-accent/20 flex items-center justify-center text-[11px] font-bold tabular-nums text-muted-foreground group-hover:text-primary">
                {i + 1}
              </span>
              <span className="text-base font-medium truncate">{word}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </aside>
  );
}