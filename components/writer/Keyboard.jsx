import React, { useState } from "react";
import KeyButton from "./KeyButton";
import { ArrowBigUp, Delete, Eraser, Space, BookOpen, Hash } from "lucide-react";

const ROW1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const ROW2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"];
const ROW3 = ["z", "x", "c", "v", "b", "n", "m"];
const ACCENTS = ["á", "é", "í", "ó", "ú"];

const NUM_ROW1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const NUM_ROW2 = ["@", "#", "$", "%", "&", "*", "(", ")", "-", "_"];
const NUM_ROW3 = [".", ",", "?", "!", ";", ":", "/"];

export default function Keyboard({ onType, onBackspace, onClear, onSpace, onOpenDictionary }) {
  const [shift, setShift] = useState(false);
  const [numMode, setNumMode] = useState(false);

  const handleKey = (k) => {
    const ch = shift ? k.toUpperCase() : k;
    onType(ch);
    if (shift) setShift(false);
  };

  const row1 = numMode ? NUM_ROW1 : ROW1;
  const row2 = numMode ? NUM_ROW2 : ROW2;
  const row3 = numMode ? NUM_ROW3 : ROW3;

  return (
    <div className="rounded-3xl bg-card border border-border/70 soft-shadow p-4 sm:p-5 space-y-2 sm:space-y-3">
      {/* Accents row (only when not in number mode) */}
      {!numMode && (
        <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
          {ACCENTS.map((a) => (
            <KeyButton key={a} onClick={() => handleKey(a)} variant="soft" wide={2}>
              {shift ? a.toUpperCase() : a}
            </KeyButton>
          ))}
        </div>
      )}

      {/* Row 1 */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row1.map((k) => (
          <KeyButton key={k} onClick={() => handleKey(k)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row2.map((k) => (
          <KeyButton key={k} onClick={() => handleKey(k)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      {/* Row 3 with shift + backspace */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        <KeyButton
          onClick={() => setShift((s) => !s)}
          variant={shift ? "accent" : "soft"}
          wide={1}
          ariaLabel="Shift"
        >
          <ArrowBigUp className="w-6 h-6" />
        </KeyButton>
        {row3.map((k) => (
          <KeyButton key={k} onClick={() => handleKey(k)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
        {/* Fill to align 10 cols */}
        {Array.from({ length: Math.max(0, 8 - row3.length) }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        <KeyButton onClick={onBackspace} variant="danger" wide={1} ariaLabel="Borrar">
          <Delete className="w-6 h-6" />
        </KeyButton>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        <KeyButton
          onClick={() => setNumMode((n) => !n)}
          variant={numMode ? "accent" : "soft"}
          wide={2}
          ariaLabel="Modo números"
        >
          <Hash className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">123</span>
        </KeyButton>
        <KeyButton onClick={onSpace} variant="soft" wide={5} ariaLabel="Espacio">
          <Space className="w-6 h-6 mr-2" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
            Espacio
          </span>
        </KeyButton>
        <KeyButton onClick={onClear} variant="danger" wide={2} ariaLabel="Limpiar">
          <Eraser className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">Limpiar</span>
        </KeyButton>
        <KeyButton onClick={onOpenDictionary} variant="accent" wide={1} ariaLabel="Diccionario">
          <BookOpen className="w-6 h-6" />
        </KeyButton>
      </div>

      {/* Dictionary full bar */}
      <button
        onClick={onOpenDictionary}
        className="w-full mt-2 h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg flex items-center justify-center gap-3 hover:opacity-95 transition-opacity soft-shadow emg-glow"
      >
        <BookOpen className="w-5 h-5" />
        Abrir diccionario de palabras sugeridas
      </button>
    </div>
  );
}