import React from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileDictionary({ open, onClose, suggestions, onPick }) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm xl:hidden"
        onClick={onClose}
      />
      {/* Drawer from bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden rounded-t-3xl bg-card border-t border-border shadow-2xl max-h-[70vh] flex flex-col">
        {/* Handle + header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Palabras sugeridas</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Word list */}
        <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {suggestions.map((word, i) => (
            <button
              key={`${word}-${i}`}
              onClick={() => onPick(word)}
              className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-2xl border border-border/60 bg-background hover:border-accent hover:bg-accent/5 transition-all text-left active:scale-[0.97]"
            >
              <span className="text-base font-medium truncate">{word}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}