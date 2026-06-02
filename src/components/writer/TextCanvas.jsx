import React, { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function TextCanvas({ value, onChange }) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const textareaRef = useRef(null);

  // Mantener foco siempre — necesario para EMG
  useEffect(() => {
    const mantenerFoco = () => {
      if (textareaRef.current && document.activeElement !== textareaRef.current) {
        textareaRef.current.focus();
      }
    };
    mantenerFoco();
    const interval = setInterval(mantenerFoco, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mover cursor al final cuando cambia el valor
  useEffect(() => {
    if (textareaRef.current) {
      const len = value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [value]);

  return (
    <div className="relative rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
      <div className="px-6 sm:px-8 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Lienzo de escritura
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground tabular-nums">
          <span>{wordCount} palabras</span>
          <span>{charCount} caracteres</span>
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Empieza a escribir con señales EMG…"
        className="min-h-[180px] sm:min-h-[220px] text-4xl sm:text-5xl leading-relaxed font-light border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none px-6 sm:px-8 pb-8 bg-transparent placeholder:text-muted-foreground/50"
        autoFocus
      />
    </div>
  );
}