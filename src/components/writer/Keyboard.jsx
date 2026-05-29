import React from "react";
import KeyButton from "./KeyButton";
import { ArrowBigUp, Delete, Eraser, Space, BookOpen, Hash } from "lucide-react";

const ROW1   = ["q","w","e","r","t","y","u","i","o","p"];
const ROW2   = ["a","s","d","f","g","h","j","k","l","ñ"];
const ROW3   = ["z","x","c","v","b","n","m"];
const ACCENTS = ["á","é","í","ó","ú"];

const NUM_ROW1 = ["1","2","3","4","5","6","7","8","9","0"];
const NUM_ROW2 = ["@","#","$","%","&","*","(",")","−","_"];
const NUM_ROW3 = [".",",","?","!",";",":","/" ];

export default function Keyboard({
  onType,
  onBackspace,
  onClear,
  onSpace,
  onOpenDictionary = () => {},
  zona,
  kbRow,
  kbCol,
  showDictionaryButton = true,
  externalShift,
  externalNumMode,
  onShiftChange,
  onNumModeChange,
}) {
  const [localShift, setLocalShift] = React.useState(false);
  const [localNumMode, setLocalNumMode] = React.useState(false);

  const shift    = externalShift   !== undefined ? externalShift   : localShift;
  const numMode  = externalNumMode !== undefined ? externalNumMode : localNumMode;
  const setShift   = onShiftChange   || setLocalShift;
  const setNumMode = onNumModeChange || setLocalNumMode;

  const row1 = numMode ? NUM_ROW1 : ROW1;
  const row2 = numMode ? NUM_ROW2 : ROW2;
  const row3 = numMode ? NUM_ROW3 : ROW3;

  // Resaltar tecla activa con sombra de fila/columna
  const keyStyle = (rowIndex, colIndex) => {
    const activa  = zona === "keyboard" && kbRow === rowIndex && kbCol === colIndex;
    const fila    = zona === "keyboard" && kbRow === rowIndex;
    const columna = zona === "keyboard" && kbCol === colIndex;
    if (activa)          return { backgroundColor: "#94a3b8", color: "#0f172a", borderColor: "#7dd3fc", boxShadow: "0 0 0 2px #7dd3fc" };
    if (fila || columna) return { backgroundColor: "#e2e8f0", color: "#334155" };
    return {};
  };

  return (
    <div className="rounded-3xl bg-card border border-border/70 soft-shadow p-4 sm:p-5 space-y-2 sm:space-y-3">

      {/* Row 1 */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row1.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(0, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row2.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(1, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row3.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(2, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      {/* Accents row (solo en modo letras) */}
      {!numMode && (
        <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
          {ACCENTS.map((a, idx) => (
            <KeyButton key={a} onClick={() => onType(a)} variant="soft" wide={2} style={keyStyle(3, idx)}>
              {shift ? a.toUpperCase() : a}
            </KeyButton>
          ))}
        </div>
      )}

      {/* Action row — fila 4 en LETTER_ROWS, fila 3 en NUM_ROWS */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {/* SHIFT — col 0 */}
        <KeyButton
          onClick={() => setShift((s) => !s)}
          variant={shift ? "accent" : "soft"}
          wide={2}
          ariaLabel="Shift"
          style={keyStyle(4, 0)}
        >
          <ArrowBigUp className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">Shift</span>
        </KeyButton>

        {/* 123 — col 1 */}
        <KeyButton
          onClick={() => setNumMode((n) => !n)}
          variant={numMode ? "accent" : "soft"}
          wide={2}
          ariaLabel="Modo números"
          style={keyStyle(4, 1)}
        >
          <Hash className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">123</span>
        </KeyButton>

        {/* ESPACIO — col 2 */}
        <KeyButton onClick={onSpace} variant="soft" wide={3} ariaLabel="Espacio" style={keyStyle(4, 2)}>
          <Space className="w-6 h-6 mr-2" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Espacio</span>
        </KeyButton>

        {/* BORRAR — col 3 */}
        <KeyButton onClick={onBackspace} variant="danger" wide={1} ariaLabel="Borrar" style={keyStyle(4, 3)}>
          <Delete className="w-6 h-6" />
        </KeyButton>

        {/* LIMPIAR — col 4 */}
        <KeyButton onClick={onClear} variant="danger" wide={1} ariaLabel="Limpiar" style={keyStyle(4, 4)}>
          <Eraser className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">Limpiar</span>
        </KeyButton>

        {/* DICCIONARIO — col 5 */}
        {showDictionaryButton && (
          <KeyButton onClick={onOpenDictionary} variant="accent" wide={1} ariaLabel="Diccionario" style={keyStyle(4, 5)}>
            <BookOpen className="w-6 h-6" />
          </KeyButton>
        )}
      </div>

      {showDictionaryButton && (
        <button
          onClick={onOpenDictionary}
          className="w-full mt-2 h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg flex items-center justify-center gap-3 hover:opacity-95 transition-opacity soft-shadow emg-glow"
        >
          <BookOpen className="w-5 h-5" />
          Abrir diccionario de palabras sugeridas
        </button>
      )}
    </div>
  );
}