import React from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuggestionsSidebar({ suggestions, onPick, highlighted, id, zona, suggestionIndex }) {
  return (
    <aside
      id={id || "suggestions-sidebar"}
      className={cn(
        "rounded-2xl bg-card border border-border/70 soft-shadow overflow-hidden transition-all duration-500",
        highlighted && "ring-2 ring-accent/40 border-accent"
      )}
    >
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-secondary/50 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
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

      <div className="p-2.5 space-y-1.5 max-h-[420px] overflow-y-auto">
        {suggestions.map((item, i) => {
          const word = typeof item === "string" ? item : item.word;
          const isSelected = zona === "suggestions" && suggestionIndex === i;
          return (
            <button
              key={`${word}-${i}`}
              onClick={() => onPick(word)}
              className={cn(
                "group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border/60 bg-background hover:border-accent hover:bg-accent/5 transition-all text-left active:scale-[0.98]",
                isSelected && "border-accent bg-accent/10 scale-[1.02]"
              )}
              style={isSelected ? { boxShadow: "0 0 0 2px #7dd3fc" } : {}}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 shrink-0 rounded-md bg-secondary group-hover:bg-accent/20 flex items-center justify-center text-[11px] font-bold tabular-nums text-muted-foreground group-hover:text-primary">
                  {i + 1}
                </span>
                <span className="text-sm font-medium truncate">{word}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}