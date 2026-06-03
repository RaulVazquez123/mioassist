import React from "react";
import KeyButton from "./KeyButton";
import { ArrowBigUp, Delete, Eraser, Space, BookOpen, Hash, Dumbbell, User, Share2, Info, Scale, Shield } from "lucide-react";
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

export const NAV_ROW = ["COMPARTIR", "PRACTICA", "PERFIL", "INFO", "LEGAL", "PRIVACIDAD"];

export default function Keyboard({
  onType, onBackspace, onClear, onSpace,
  onOpenDictionary = () => {}, onOpenSharing = () => {},
  hideNavRow = false, zona, kbRow, kbCol, filaBlockeada = false,
  emgZona = "top", showDictionaryButton = true,
  externalShift, externalNumMode, onShiftChange, onNumModeChange,
}) {
  const navigate = useNavigate();
  const [localShift, setLocalShift] = React.useState(false);
  const [localNumMode, setLocalNumMode] = React.useState(false);

  const shift   = externalShift   !== undefined ? externalShift   : localShift;
  const numMode = externalNumMode !== undefined ? externalNumMode : localNumMode;
  const setShift   = onShiftChange   || setLocalShift;
  const setNumMode = onNumModeChange || setLocalNumMode;

  const row1 = numMode ? NUM_ROW1 : ROW1;
  const row2 = numMode ? NUM_ROW2 : ROW2;
  const row3 = numMode ? NUM_ROW3 : ROW3;

  const ACTION_ROW  = numMode ? 3 : 4;
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
    if (key === "PRACTICA")   navigate("/practice");
    if (key === "PERFIL")     navigate("/profile");
    if (key === "INFO")       navigate("/info");
    if (key === "LEGAL")      navigate("/legal");
    if (key === "PRIVACIDAD") navigate("/privacy");
    if (key === "SALIR")      onOpenSharing();
  };

  const navKeyContent = (key, idx) => {
    const style = { ...STYLE_NAV_DEFAULT, ...keyStyle(NAV_ROW_IDX, idx) };
    const cls = "h-8 rounded-xl border-2 font-semibold text-xs flex items-center justify-center gap-1 transition-all px-1.5";
    if (key === "COMPARTIR") return (
      <button key="COMPARTIR" onClick={onOpenSharing} style={style} className={cls}>
        <Share2 className="w-3 h-3 shrink-0" /><span>Compartir</span>
      </button>
    );
    if (key === "PRACTICA") return (
      <button key="PRACTICA" onClick={() => handleNavKey("PRACTICA")} style={style} className={cls}>
        <Dumbbell className="w-3 h-3 shrink-0" /><span>Práctica</span>
      </button>
    );
    if (key === "PERFIL") return (
      <button key="PERFIL" onClick={() => handleNavKey("PERFIL")} style={style} className={cls}>
        <User className="w-3 h-3 shrink-0" /><span>Perfil</span>
      </button>
    );
    if (key === "INFO") return (
      <button key="INFO" onClick={() => handleNavKey("INFO")} style={style} className={cls}>
        <Info className="w-3 h-3 shrink-0" /><span>Info</span>
      </button>
    );
    if (key === "LEGAL") return (
      <button key="LEGAL" onClick={() => handleNavKey("LEGAL")} style={style} className={cls}>
        <Scale className="w-3 h-3 shrink-0" /><span>Legal</span>
      </button>
    );
    if (key === "PRIVACIDAD") return (
      <button key="PRIVACIDAD" onClick={() => handleNavKey("PRIVACIDAD")} style={style} className={cls}>
        <Shield className="w-3 h-3 shrink-0" /><span>Privacidad</span>
      </button>
    );
    return null;
  };

  return (
    <div className="rounded-2xl bg-card border border-border/70 soft-shadow p-2.5 sm:p-3 space-y-1.5">

      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {row1.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(0, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {row2.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(1, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {row3.map((k, idx) => (
          <KeyButton key={k} onClick={() => onType(k)} style={keyStyle(2, idx)}>
            {shift && !numMode ? k.toUpperCase() : k}
          </KeyButton>
        ))}
      </div>

      {!numMode && (
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {ACCENTS.map((a, idx) => (
            <KeyButton key={a} onClick={() => onType(a)} wide={2} style={keyStyle(3, idx)}>
              {shift ? a.toUpperCase() : a}
            </KeyButton>
          ))}
        </div>
      )}

      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        <KeyButton onClick={() => setShift((s) => !s)} wide={2} ariaLabel="Shift" style={keyStyle(ACTION_ROW, 0)}>
          <ArrowBigUp className="w-3.5 h-3.5 mr-0.5" />
          <span className="text-xs font-semibold">Shift</span>
        </KeyButton>
        <KeyButton onClick={() => setNumMode((n) => !n)} wide={2} ariaLabel="Modo números" style={keyStyle(ACTION_ROW, 1)}>
          <Hash className="w-3.5 h-3.5 mr-0.5" />
          <span className="text-xs font-semibold">123</span>
        </KeyButton>
        <KeyButton onClick={onSpace} wide={3} ariaLabel="Espacio" style={keyStyle(ACTION_ROW, 2)}>
          <Space className="w-4 h-4 mr-1" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Espacio</span>
        </KeyButton>
        <KeyButton onClick={onBackspace} variant="danger" wide={1} ariaLabel="Borrar" style={keyStyle(ACTION_ROW, 3)}>
          <Delete className="w-4 h-4" />
        </KeyButton>
        <KeyButton onClick={onClear} variant="danger" wide={1} ariaLabel="Limpiar" style={keyStyle(ACTION_ROW, 4)}>
          <Eraser className="w-3.5 h-3.5 mr-0.5" />
          <span className="text-xs font-semibold">Limpiar</span>
        </KeyButton>
        {showDictionaryButton && (
          <KeyButton onClick={onOpenDictionary} variant="accent" wide={1} ariaLabel="Diccionario" style={keyStyle(ACTION_ROW, 5)}>
            <BookOpen className="w-4 h-4" />
          </KeyButton>
        )}
      </div>

      {!hideNavRow && (
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {NAV_ROW.map((key, idx) => navKeyContent(key, idx))}
        </div>
      )}

    </div>
  );
}