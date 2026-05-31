import React from "react";
import KeyButton from "./KeyButton";
import { ArrowBigUp, Delete, Eraser, Space, BookOpen, Hash, Dumbbell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROW1   = ["q","w","e","r","t","y","u","i","o","p"];
const ROW2   = ["a","s","d","f","g","h","j","k","l","ñ"];
const ROW3   = ["z","x","c","v","b","n","m"];
const ACCENTS = ["á","é","í","ó","ú"];

const NUM_ROW1 = ["1","2","3","4","5","6","7","8","9","0"];
const NUM_ROW2 = ["@","#","$","%","&","*","(",")","−","_"];
const NUM_ROW3 = [".",",","?","!",";",":","/" ];

const STYLE_FILA   = { backgroundColor: "#e2e8f0", color: "#334155", borderColor: "#94a3b8" };
const STYLE_ACTIVA = { backgroundColor: "#7dd3fc", color: "#0f172a", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8" };
const STYLE_NAV_DEFAULT = { backgroundColor: "#d1fae5", borderColor: "#34d399", color: "#065f46" };
const STYLE_NAV_FILA    = { backgroundColor: "#6ee7b7", borderColor: "#10b981", color: "#064e3b" };
const STYLE_NAV_ACTIVA  = { backgroundColor: "#059669", borderColor: "#047857", color: "#ffffff", boxShadow: "0 0 0 2px #047857" };

// Fila de navegación — índice de fila 5 en LETTER_ROWS, 4 en NUM_ROWS
export const NAV_ROW = ["PRACTICA", "PERFIL"];

export default function Keyboard({
  onType,
  onBackspace,
  onClear,
  onSpace,
  onOpenDictionary = () => {},
  zona,
  kbRow,
  kbCol,
  filaBlockeada = false,
  emgZona = "top",
  showDictionaryButton = true,
  externalShift,
  externalNumMode,
  onShiftChange,
  onNumModeChange,
}) {
  const navigate = useNavigate();

  const [localShift, setLocalShift] = React.useState(false);
  const [localNumMode, setLocalNumMode] = React.useState(false);

  const shift    = externalShift   !== undefined ? externalShift   : localShift;
  const numMode  = externalNumMode !== undefined ? externalNumMode : localNumMode;
  const setShift   = onShiftChange   || setLocalShift;
  const setNumMode = onNumModeChange || setLocalNumMode;

  const row1 = numMode ? NUM_ROW1 : ROW1;
  const row2 = numMode ? NUM_ROW2 : ROW2;
  const row3 = numMode ? NUM_ROW3 : ROW3;

  // Fila de acción = fila 4, fila de nav = fila 5
  const ACTION_ROW = numMode ? 3 : 4;
  const NAV_ROW_IDX = numMode ? 4 : 5;

  const keyStyle = (rowIndex, colIndex) => {
    if (emgZona !== "keyboard") return {};
    if (rowIndex === NAV_ROW_IDX) {
      if (filaBlockeada && kbRow === rowIndex && kbCol === colIndex) return STYLE_NAV_ACTIVA;
      if (!filaBlockeada && kbRow === rowIndex) return STYLE_NAV_FILA;
      return STYLE_NAV_DEFAULT;
    }
    if (filaBlockeada && kbRow === rowIndex && kbCol === colIndex) return STYLE_ACTIVA;
    if (!filaBlockeada && kbRow === rowIndex) return STYLE_FILA;
    return {};
  };

  const handleNavKey = (key) => {
    if (key === "PRACTICA") navigate("/practice");
    if (key === "PERFIL")   navigate("/profile");
  };

  return (
    <div className="rounded-3xl bg-card border border-border/70 soft-shadow p-4 sm:p-5 space-y-2 sm:space-y-3">

      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row1.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(0, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row2.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(1, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        {row3.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(2, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      {!numMode && (
        <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
          {ACCENTS.map((a, idx) => (
            <KeyButton key={a} onClick={() => onType(a)} wide={2} style={keyStyle(3, idx)}>
              {shift ? a.toUpperCase() : a}
            </KeyButton>
          ))}
        </div>
      )}

      {/* Fila de acción */}
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5">
        <KeyButton onClick={() => setShift((s) => !s)} wide={2} ariaLabel="Shift" style={keyStyle(ACTION_ROW, 0)}>
          <ArrowBigUp className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">Shift</span>
        </KeyButton>

        <KeyButton onClick={() => setNumMode((n) => !n)} wide={2} ariaLabel="Modo números" style={keyStyle(ACTION_ROW, 1)}>
          <Hash className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">123</span>
        </KeyButton>

        <KeyButton onClick={onSpace} wide={3} ariaLabel="Espacio" style={keyStyle(ACTION_ROW, 2)}>
          <Space className="w-6 h-6 mr-2" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Espacio</span>
        </KeyButton>

        <KeyButton onClick={onBackspace} variant="danger" wide={1} ariaLabel="Borrar" style={keyStyle(ACTION_ROW, 3)}>
          <Delete className="w-6 h-6" />
        </KeyButton>

        <KeyButton onClick={onClear} variant="danger" wide={1} ariaLabel="Limpiar" style={keyStyle(ACTION_ROW, 4)}>
          <Eraser className="w-5 h-5 mr-1" />
          <span className="text-base font-semibold">Limpiar</span>
        </KeyButton>

        {showDictionaryButton && (
          <KeyButton onClick={onOpenDictionary} variant="accent" wide={1} ariaLabel="Diccionario" style={keyStyle(ACTION_ROW, 5)}>
            <BookOpen className="w-6 h-6" />
          </KeyButton>
        )}
      </div>

      {/* Fila de navegación — verde para distinguirse */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        <button
          onClick={() => handleNavKey("PRACTICA")}
          style={{ ...STYLE_NAV_DEFAULT, ...keyStyle(NAV_ROW_IDX, 0) }}
          className="h-14 rounded-2xl border-2 font-semibold text-base flex items-center justify-center gap-2 transition-all"
        >
          <Dumbbell className="w-5 h-5" />
          Práctica
        </button>
        <button
          onClick={() => handleNavKey("PERFIL")}
          style={{ ...STYLE_NAV_DEFAULT, ...keyStyle(NAV_ROW_IDX, 1) }}
          className="h-14 rounded-2xl border-2 font-semibold text-base flex items-center justify-center gap-2 transition-all"
        >
          <User className="w-5 h-5" />
          Perfil EMG
        </button>
      </div>

    </div>
  );
}