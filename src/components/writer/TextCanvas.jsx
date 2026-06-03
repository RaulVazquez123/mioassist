import React, { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function TextCanvas({ value, onChange }) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const textareaRef = useRef(null);

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

  useEffect(() => {
    if (textareaRef.current) {
      const len = value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [value]);

  return (
    <div className="relative rounded-2xl border border-border/70 bg-card soft-shadow overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
      <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Lienzo de escritura
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
          <span>{wordCount} palabras</span>
          <span>{charCount} caracteres</span>
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Empieza a escribir con señales EMG…"
        style={{ fontSize: "1.5rem", lineHeight: "1.4", caretColor: "transparent" }}
        className="min-h-[80px] sm:min-h-[100px] font-light border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none px-4 sm:px-5 pb-4 bg-transparent placeholder:text-muted-foreground/50"
        autoFocus
      />
    </div>
  );
}