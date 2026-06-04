import React, { useEffect, useMemo, useState, useRef } from "react";
import NavBar, { navItems } from "@/components/layout/NavBar";
import Keyboard from "@/components/writer/Keyboard";
import TopLetters from "@/components/writer/TopLetters";
import SuggestionsSidebar from "@/components/writer/SuggestionsSidebar";
import MobileDictionary from "@/components/writer/MobileDictionary";
import { useEMGKeyboard } from "@/hooks/useEMGKeyboard";
import { loadLanguageModel, getTopLetters, getSuggestedWords, isLanguageModelReady } from "@/lib/languageModel";
import { Dumbbell, Sparkles, Trophy, Star, CheckCircle2, RotateCcw, Zap, ArrowLeft, Target, Clock, MousePointerClick, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const EXERCISES = [
  { id: 1, emoji: "🗣️", title: "Frases esenciales", level: "Básico", duration: "3 min", tags: ["comunicación", "cotidiano"], description: "Escribe frases de comunicación básica usando el teclado real.", phrases: ["hola", "gracias", "agua", "ayuda"], suggestions: ["hola", "gracias", "agua", "ayuda", "familia", "bien", "sí", "no"] },
  { id: 2, emoji: "✍️", title: "Vocabulario diario", level: "Básico", duration: "4 min", tags: ["precisión", "vocabulario"], description: "Escribe palabras esenciales usando predicción y teclado.", phrases: ["familia", "médico", "casa", "dolor"], suggestions: ["familia", "médico", "casa", "dolor", "cama", "baño", "llamar"] },
  { id: 3, emoji: "💬", title: "Mini mensaje", level: "Intermedio", duration: "6 min", tags: ["frase", "comunicación real"], description: "Construye mensajes completos usando el teclado y palabras sugeridas.", phrases: ["necesito ayuda", "me siento bien", "llama al doctor"], suggestions: ["necesito", "ayuda", "siento", "bien", "llama", "doctor", "gracias", "hoy"] },
  { id: 4, emoji: "⚡", title: "Velocidad controlada", level: "Intermedio", duration: "5 min", tags: ["velocidad", "precisión"], description: "Escribe palabras cortas con rapidez y precisión.", phrases: ["sí", "no", "ok", "bien", "mal"], suggestions: ["sí", "no", "ok", "bien", "mal", "agua", "hola"] },
  { id: 5, emoji: "📋", title: "Dictado médico", level: "Avanzado", duration: "8 min", tags: ["clínico", "síntomas"], description: "Escribe frases para comunicar síntomas al equipo médico.", phrases: ["tengo dolor", "no puedo dormir", "necesito medicina"], suggestions: ["tengo", "dolor", "puedo", "dormir", "necesito", "medicina", "médico", "hoy"] },
  { id: 6, emoji: "🏆", title: "Reto del día", level: "Avanzado", duration: "10 min", tags: ["reto", "resistencia"], description: "Escribe un mensaje largo completo. Pon a prueba tu resistencia.", phrases: ["hola familia hoy me siento mejor"], suggestions: ["hola", "familia", "hoy", "siento", "mejor", "mucho", "gracias", "bien"] },
];

const LETTER_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l","ñ"],
  ["z","x","c","v","b","n","m"],
  ["á","é","í","ó","ú"],
  ["SHIFT","123","ESPACIO","BORRAR","LIMPIAR","DICCIONARIO"],
  ["SALIR"],
];
const NUM_ROWS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["@","#","$","%","&","*","(",")","−","_"],
  [".",",","?","!",";",":","/" ],
  ["SHIFT","123","ESPACIO","BORRAR","LIMPIAR","DICCIONARIO"],
  ["SALIR"],
];

const TOTAL_BLOCKS = 7;
const WS_URL = "ws://192.168.4.1:8081";

function useEMGSimple(wsUrl, onDer, onIzq, enabled = true) {
  const ws = useRef(null);
  const cbRef = useRef({ onDer, onIzq });
  cbRef.current = { onDer, onIzq };
  useEffect(() => {
    if (!enabled) { ws.current?.close(); return; }
    let last = 0;
    const DEBOUNCE = 800;
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (e) => {
      const now = Date.now();
      if (now - last < DEBOUNCE) return;
      try {
        const data = JSON.parse(e.data);
        const izq = data.izq?.click === 1;
        const der = data.der?.click === 1;
        if (!izq && !der) return;
        if (izq && der) return;
        last = now;
        if (der) cbRef.current.onDer();
        if (izq) cbRef.current.onIzq();
      } catch {}
    };
    ws.current.onerror = () => {};
    ws.current.onclose = () => {};
    return () => ws.current?.close();
  }, [wsUrl, enabled]);
}

function ConfirmDialog({ title, subtitle, onConfirm, onCancel, confirmOption, confirmLabel = "✅ Confirmar", cancelLabel = "❌ Cancelar" }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl border border-border p-5 max-w-xs w-full soft-shadow text-center space-y-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        <div className="flex gap-2">
          <button onClick={onConfirm} style={confirmOption === 0 ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">{confirmLabel}</button>
          <button onClick={onCancel} style={confirmOption === 1 ? { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}

function StatsScreen({ stats, exercise, onRepeat, onAnother, onClose }) {
  const mins = Math.floor(stats.seconds / 60);
  const secs = stats.seconds % 60;
  const [selectedBtn, setSelectedBtn] = useState(0);
  const cbRef = useRef({ onRepeat, onAnother, onClose, selectedBtn });
  cbRef.current = { onRepeat, onAnother, onClose, selectedBtn };
  useEMGSimple(WS_URL, () => setSelectedBtn((i) => (i + 1) % 3), () => {
    const { selectedBtn, onRepeat, onAnother, onClose } = cbRef.current;
    if (selectedBtn === 0) onRepeat();
    else if (selectedBtn === 1) onAnother();
    else onClose();
  });
  const btnStyle = (idx) => selectedBtn === idx ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" } : {};
  const precisionColor = stats.precision >= 80 ? "text-emerald-600" : stats.precision >= 60 ? "text-amber-600" : "text-red-500";
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center"><Trophy className="w-7 h-7 text-emerald-500" /></div>
          <div><h2 className="text-2xl font-light">¡Completado!</h2><p className="text-muted-foreground text-sm mt-0.5">{exercise.emoji} <span className="font-semibold text-foreground">{exercise.title}</span></p></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border/70 bg-card p-3 flex flex-col items-center gap-1"><Clock className="w-4 h-4 text-primary" /><span className="text-xl font-light tabular-nums">{mins}:{String(secs).padStart(2,"0")}</span><span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tiempo</span></div>
          <div className="rounded-xl border border-border/70 bg-card p-3 flex flex-col items-center gap-1"><MousePointerClick className="w-4 h-4 text-accent" /><span className="text-xl font-light tabular-nums">{stats.clicks}</span><span className="text-[10px] text-muted-foreground uppercase tracking-wider">Clicks</span></div>
          <div className="rounded-xl border border-border/70 bg-card p-3 flex flex-col items-center gap-1"><Percent className="w-4 h-4 text-emerald-500" /><span className={`text-xl font-light tabular-nums ${precisionColor}`}>{stats.precision}%</span><span className="text-[10px] text-muted-foreground uppercase tracking-wider">Precisión</span></div>
        </div>
        <div className="flex gap-2">
          <button onClick={onRepeat} style={btnStyle(0)} className="flex-1 h-10 rounded-xl border-2 border-border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"><RotateCcw className="w-3.5 h-3.5" /> Repetir</button>
          <button onClick={onAnother} style={btnStyle(1)} className="flex-1 h-10 rounded-xl border-2 border-border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"><Dumbbell className="w-3.5 h-3.5" /> Otro</button>
          <button onClick={onClose} style={btnStyle(2)} className="flex-1 h-10 rounded-xl border-2 border-primary bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-all">Volver</button>
        </div>
        <p className="text-[10px] text-muted-foreground">Derecha → navega · Izquierda → selecciona</p>
      </div>
    </div>
  );
}

function ActiveExercise({ exercise, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [allDone, setAllDone] = useState(false);
  const [mobileDictOpen, setMobileDictOpen] = useState(false);
  const [shift, setShift] = useState(true);
  const [numMode, setNumMode] = useState(false);
  const [modelReady, setModelReady] = useState(isLanguageModelReady());
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitConfirmOption, setExitConfirmOption] = useState(0);
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [nextConfirmOption, setNextConfirmOption] = useState(0);
  const [filaBlockeada, setFilaBloqueada] = useState(false);
  const [emgZona, setEmgZona] = useState("top");
  const [emgTopIndex, setEmgTopIndex] = useState(0);
  const [emgDictIndex, setEmgDictIndex] = useState(0);
  const [emgActionIndex, setEmgActionIndex] = useState(0);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);
  const [zona, setZona] = useState("top");
  const [topIndex, setTopIndex] = useState(0);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const startTime = useRef(Date.now());
  const clicks = useRef(0);
  const totalChars = useRef(0);
  const correctChars = useRef(0);
  const [stats, setStats] = useState(null);
  const exitConfirmOptionRef = useRef(0);
  exitConfirmOptionRef.current = exitConfirmOption;
  const nextConfirmOptionRef = useRef(0);
  nextConfirmOptionRef.current = nextConfirmOption;

  useEffect(() => { if (!isLanguageModelReady()) loadLanguageModel().then(() => setModelReady(true)); }, []);

  const target = exercise.phrases[step] ? exercise.phrases[step].charAt(0).toUpperCase() + exercise.phrases[step].slice(1) : "";
  const isMatch = typed.trim().toLowerCase() === target.toLowerCase();
  const totalSteps = exercise.phrases.length;
  const activeRows = numMode ? NUM_ROWS : LETTER_ROWS;

  useEffect(() => {
    if (isMatch && !showNextConfirm && !showExitConfirm) { setShowNextConfirm(true); setNextConfirmOption(0); }
  }, [isMatch]);

  const topLettersData = useMemo(() => {
    if (!modelReady) {
      const last = typed.slice(-1).toLowerCase();
      const follow = { a:["r","n","l","s","d"], e:["n","r","s","l","d"], o:["s","n","r","l","m"], n:["a","e","o","t","i"], s:["e","a","o","i","u"], r:["a","e","o","i","u"] };
      return (follow[last] || ["e","a","o","s","r"]).map((l) => ({ letter: l, percent: 20 }));
    }
    return getTopLetters(typed, 5);
  }, [typed, modelReady]);

  const suggestionsData = useMemo(() => {
    if (!typed.trim()) return [];
    if (!modelReady) return exercise.suggestions.map((w) => ({ word: w }));
    return getSuggestedWords(typed, 8);
  }, [typed, exercise.suggestions, modelReady]);

  const handleType = (ch) => { clicks.current++; totalChars.current++; const next = typed + ch; if (target[next.length - 1] === ch) correctChars.current++; setTyped(next); };
  const handleBackspace = () => setTyped((t) => t.slice(0, -1));
  const handleClear = () => setTyped("");
  const handleSpace = () => { clicks.current++; setTyped((t) => t + " "); };
  const handlePickWord = (w) => { setTyped((t) => { const parts = t.split(" "); const partial = parts[parts.length - 1]; const word = partial.length > 0 && partial[0] === partial[0].toUpperCase() && partial[0] !== partial[0].toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w; parts[parts.length - 1] = word; return parts.join(" ") + " "; }); setMobileDictOpen(false); };
  const openDictionary = () => { setMobileDictOpen(true); setEmgZona("dictionary"); setEmgDictIndex(0); };

  const ejecutarTecla = (value) => {
    if (value === "ESPACIO") return handleSpace();
    if (value === "BORRAR") return handleBackspace();
    if (value === "LIMPIAR") return handleClear();
    if (value === "DICCIONARIO") return openDictionary();
    if (value === "SHIFT") { setShift((s) => !s); return; }
    if (value === "123") { setNumMode((n) => !n); setKbRow(0); setKbCol(0); return; }
    if (value === "SALIR") { setShowExitConfirm(true); setExitConfirmOption(0); return; }
    const ch = (shift && !numMode) ? value.toUpperCase() : value;
    handleType(ch);
    if (shift && !numMode) setShift(false);
  };

  const handleNextStep = () => {
    setShowNextConfirm(false);
    if (step >= totalSteps - 1) {
      const seconds = Math.floor((Date.now() - startTime.current) / 1000);
      const precision = totalChars.current > 0 ? Math.round((correctChars.current / totalChars.current) * 100) : 100;
      setStats({ seconds, clicks: clicks.current, precision });
      try { const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]; const day = DAYS[new Date().getDay()]; const prev = JSON.parse(localStorage.getItem("mioassist_practice_sessions") || "[]"); prev.push({ day, precision, clicks: clicks.current }); localStorage.setItem("mioassist_practice_sessions", JSON.stringify(prev.slice(-7))); } catch {}
      setAllDone(true);
      onComplete(exercise.id);
    } else { setStep((s) => s + 1); setTyped(""); setShift(true); }
  };

  const handleRetry = () => { setShowNextConfirm(false); setTyped(""); setShift(true); };

  useEffect(() => { setTopIndex(emgTopIndex); }, [emgTopIndex]);
  useEffect(() => {
    if (emgZona === "top") setZona("top");
    if (emgZona === "keyboard") setZona("keyboard");
    if (emgZona === "dictionary") setZona("suggestions");
  }, [emgZona]);
  useEffect(() => { setSuggestionIndex(emgDictIndex); }, [emgDictIndex]);

  const anyConfirmOpen = showExitConfirm || showNextConfirm;

  useEMGKeyboard({
    activeRows, kbRow, setKbRow, kbCol, setKbCol, filaBlockeada, setFilaBloqueada,
    emgZona, setEmgZona, topIndex: emgTopIndex, setTopIndex: setEmgTopIndex,
    dictIndex: emgDictIndex, setDictIndex: setEmgDictIndex,
    actionIndex: emgActionIndex, setActionIndex: setEmgActionIndex,
    topLettersData, suggestionsData, onSelectKey: ejecutarTecla,
    onSelectWord: handlePickWord, onOpenDictionary: openDictionary, onExecuteAction: () => {},
    wsUrl: anyConfirmOpen ? null : WS_URL,
  });

  useEMGSimple(WS_URL, () => setExitConfirmOption((o) => o === 0 ? 1 : 0), () => {
    if (exitConfirmOptionRef.current === 0) onClose();
    else { setShowExitConfirm(false); setExitConfirmOption(0); }
  }, showExitConfirm);

  useEMGSimple(WS_URL, () => setNextConfirmOption((o) => o === 0 ? 1 : 0), () => {
    if (nextConfirmOptionRef.current === 0) handleNextStep();
    else handleRetry();
  }, showNextConfirm);

  if (allDone && stats) {
    return <StatsScreen stats={stats} exercise={exercise}
      onRepeat={() => { setStep(0); setTyped(""); setAllDone(false); setShift(true); startTime.current = Date.now(); clicks.current = 0; totalChars.current = 0; correctChars.current = 0; }}
      onAnother={onClose} onClose={onClose} />;
  }

  const isLastStep = step >= totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {showExitConfirm && <ConfirmDialog title="¿Salir del ejercicio?" subtitle="Se perderá el progreso actual" confirmOption={exitConfirmOption} onConfirm={onClose} onCancel={() => { setShowExitConfirm(false); setExitConfirmOption(0); }} />}
      {showNextConfirm && <ConfirmDialog title="✓ ¡Correcto!" subtitle={isLastStep ? "¿Finalizar el ejercicio?" : `Frase ${step + 1} de ${totalSteps} completada`} confirmOption={nextConfirmOption} confirmLabel={isLastStep ? "🏆 Finalizar" : "➡️ Siguiente"} cancelLabel="🔄 Reintentar" onConfirm={handleNextStep} onCancel={handleRetry} />}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowExitConfirm(true); setExitConfirmOption(0); }} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div>
            <div className="font-semibold text-xs">{exercise.emoji} {exercise.title}</div>
            <div className="text-[10px] text-muted-foreground">{exercise.level} · Frase {step + 1} de {totalSteps}</div>
          </div>
        </div>
        <div className="flex gap-1">
          {exercise.phrases.map((_, i) => (<div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i < step ? "bg-primary" : i === step ? "bg-accent w-4" : "bg-secondary border border-border")} />))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-3 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/60 bg-card p-3">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5"><Target className="w-3 h-3" /> Objetivo</div>
              <div className="text-xl font-mono tracking-wide text-foreground font-medium">{target}</div>
              <div className="mt-1.5 flex flex-wrap gap-0.5">
                {target.split("").map((ch, i) => { const typedCh = typed[i]; const correct = typedCh === ch; const pending = typedCh === undefined; return <span key={i} className={cn("text-sm font-mono px-0.5 rounded", pending ? "text-muted-foreground/40" : correct ? "text-emerald-600 font-semibold" : "text-destructive bg-destructive/10")}>{ch}</span>; })}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-300", isMatch ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-accent")} style={{ width: `${Math.min((typed.length / Math.max(target.length,1)) * 100, 100)}%` }} />
              </div>
            </div>
            <div className={cn("rounded-xl border p-3 transition-all", isMatch ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/60 bg-card")}>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{isMatch ? "✓ ¡Correcto!" : "Escribiendo…"}</div>
              <div className={cn("text-xl font-mono tracking-wide min-h-[2rem] flex items-center", isMatch ? "text-emerald-600 font-semibold" : "text-foreground")}>
                {typed || <span className="text-muted-foreground/30 font-light">usa el teclado</span>}
              </div>
            </div>
          </div>
          <TopLetters letters={topLettersData} onPick={ejecutarTecla} zona={zona} topIndex={topIndex} onOpenDictionary={openDictionary} />
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3">
            <div className="space-y-1.5">
              <Keyboard onType={ejecutarTecla} onBackspace={handleBackspace} onClear={handleClear} onSpace={handleSpace} onOpenDictionary={openDictionary} onOpenSharing={() => {}} hideNavRow={true} zona={zona} kbRow={kbRow} kbCol={kbCol} filaBlockeada={filaBlockeada} emgZona={emgZona} externalShift={shift} externalNumMode={numMode} onShiftChange={setShift} onNumModeChange={setNumMode} />
              <button onClick={() => { setShowExitConfirm(true); setExitConfirmOption(0); }}
                style={zona === "keyboard" && kbRow === activeRows.length - 1 ? filaBlockeada ? { backgroundColor: "#ef4444", borderColor: "#b91c1c", color: "#ffffff", boxShadow: "0 0 0 2px #b91c1c" } : { backgroundColor: "#fecaca", borderColor: "#f87171", color: "#991b1b" } : { backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}
                className="w-full h-9 rounded-xl border-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all">✕ Salir del ejercicio</button>
            </div>
            <div className="hidden xl:block">
              <SuggestionsSidebar suggestions={suggestionsData} onPick={handlePickWord} highlighted={emgZona === "dictionary"} zona={zona} suggestionIndex={suggestionIndex} />
            </div>
          </div>
          <div className="xl:hidden">
            <SuggestionsSidebar suggestions={suggestionsData} onPick={handlePickWord} highlighted={emgZona === "dictionary"} zona={zona} suggestionIndex={suggestionIndex} />
          </div>
        </div>
      </div>
      <MobileDictionary open={mobileDictOpen} onClose={() => setMobileDictOpen(false)} suggestions={suggestionsData.map(s => s.word)} onPick={handlePickWord} />
    </div>
  );
}

export default function Practice() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());

  const [activeBlock, setActiveBlock] = useState(1);
  const [navBloqueada, setNavBloqueada] = useState(false);
  const [navIdx, setNavIdx] = useState(0);
  const [navConfirmOpen, setNavConfirmOpen] = useState(false);
  const [navConfirmOption, setNavConfirmOption] = useState(0);
  const [confirmMode, setConfirmMode] = useState(false);
  const [confirmOption, setConfirmOption] = useState(0);

  const stateRef = useRef({});
  stateRef.current = { activeBlock, navBloqueada, navIdx, navConfirmOpen, navConfirmOption, confirmMode, confirmOption, active };

  const handleStart = (ex) => setActive(ex);
  const handleComplete = (id) => setCompletedIds((s) => new Set([...s, id]));
  const handleClose = () => { setActive(null); setActiveBlock(1); };

  useEMGSimple(WS_URL,
    () => {
      const s = stateRef.current;
      if (s.active) return;
      if (s.navConfirmOpen) { setNavConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.activeBlock === 0 && s.navBloqueada) { setNavIdx((i) => (i + 1 >= navItems.length ? 0 : i + 1)); return; }
      if (s.confirmMode) { setConfirmOption((o) => o === 0 ? 1 : 0); return; }
      setActiveBlock((b) => (b + 1) % TOTAL_BLOCKS);
    },
    () => {
      const s = stateRef.current;
      if (s.active) return;
      if (s.navConfirmOpen) {
        if (s.navConfirmOption === 0) navigate(navItems[s.navIdx].to);
        else { setNavConfirmOpen(false); setNavConfirmOption(0); }
        return;
      }
      if (s.activeBlock === 0) {
        if (!s.navBloqueada) { setNavBloqueada(true); setNavIdx(0); }
        else { setNavConfirmOpen(true); setNavConfirmOption(0); }
        return;
      }
      if (s.confirmMode) {
        if (s.confirmOption === 0) { setConfirmMode(false); handleStart(EXERCISES[s.activeBlock - 1]); }
        else { setConfirmMode(false); setConfirmOption(0); }
        return;
      }
      setConfirmMode(true); setConfirmOption(0);
    },
    !active
  );

  useEffect(() => { if (activeBlock !== 0) { setNavBloqueada(false); setNavIdx(0); } }, [activeBlock]);
  useEffect(() => {
    if (active) return;
    const id = activeBlock === 0 ? "emg-navbar" : `emg-block-${activeBlock}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeBlock, active]);

  const navActive = activeBlock === 0;
  const completed = completedIds.size;
  const total = EXERCISES.length;
  const levelStyle = (level) => ({ Básico: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", Intermedio: "bg-amber-500/10 text-amber-700 border-amber-500/20", Avanzado: "bg-primary/10 text-primary border-primary/20" }[level]);

  return (
    <div className="min-h-screen bg-background">
      {active && <ActiveExercise exercise={active} onClose={handleClose} onComplete={handleComplete} />}
      {navConfirmOpen && (
        <ConfirmDialog title={navItems[navIdx].label} subtitle="¿Ir a esta sección?" confirmOption={navConfirmOption}
          onConfirm={() => navigate(navItems[navIdx].to)}
          onCancel={() => { setNavConfirmOpen(false); setNavConfirmOption(0); }} />
      )}
      {confirmMode && (
        <ConfirmDialog
          title={`${EXERCISES[activeBlock - 1]?.emoji} ${EXERCISES[activeBlock - 1]?.title}`}
          subtitle={`${EXERCISES[activeBlock - 1]?.level} · ${EXERCISES[activeBlock - 1]?.duration} — ¿Iniciar este ejercicio?`}
          confirmOption={confirmOption}
          onConfirm={() => { setConfirmMode(false); handleStart(EXERCISES[activeBlock - 1]); }}
          onCancel={() => { setConfirmMode(false); setConfirmOption(0); }} />
      )}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-col" style={{height: "calc(100vh - 64px)", gap: "12px"}}>

        <div id="emg-navbar" style={navActive ? { outline: "3px solid #38bdf8", outlineOffset: "4px", borderRadius: "1rem", backgroundColor: "#e0f2fe" } : {}}>
          <NavBar bloqueada={navBloqueada} selectedIdx={navIdx} />
        </div>

        {/* Banner compacto */}
        <div className="relative rounded-2xl bg-gradient-to-br from-primary to-[hsl(196_85%_22%)] text-primary-foreground px-5 py-4 overflow-hidden soft-shadow">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
          <div className="absolute top-3 right-4 opacity-10 pointer-events-none"><Dumbbell className="w-16 h-16" /></div>
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-2.5 py-0.5 mb-2">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Rehabilitación interactiva</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-light tracking-tight">Práctica <span className="font-semibold">diaria</span></h2>
              <p className="opacity-80 text-xs mt-0.5 max-w-sm">Cada ejercicio usa el teclado real con predicción y diccionario.</p>
            </div>
            <div className="flex items-center gap-4 text-sm shrink-0">
              <div className="text-center"><div className="opacity-60 text-[10px] uppercase tracking-wider">Racha</div><div className="text-base font-light">🔥 5 días</div></div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center"><div className="opacity-60 text-[10px] uppercase tracking-wider">Puntos</div><div className="text-base font-light flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-300" /> 240</div></div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center"><div className="opacity-60 text-[10px] uppercase tracking-wider">Nivel</div><div className="text-base font-light">Intermedio</div></div>
              <div className="text-center min-w-[80px]">
                <div className="flex items-center justify-between text-[10px] mb-1"><span className="opacity-60">Progreso</span><span className="font-semibold">{completed}/{total}</span></div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden w-20"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(completed / total) * 100}%` }} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Ejercicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0">
          {EXERCISES.map((ex, idx) => {
            const blockIdx = idx + 1;
            const isActive = !navActive && !confirmMode && activeBlock === blockIdx;
            return (
              <div key={ex.id} id={`emg-block-${blockIdx}`}
                style={isActive ? { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", backgroundColor: "#e0f2fe" } : {}}
                className="group rounded-2xl border border-border/70 bg-card p-4 soft-shadow hover:border-accent/50 transition-all flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <span className={cn("text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border", levelStyle(ex.level))}>{ex.level}</span>
                  {completedIds.has(ex.id) && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-base">{ex.emoji}</div>
                  <h3 className="text-sm font-semibold">{ex.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3 flex-1">{ex.description}</p>
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  {ex.tags.map((t) => <span key={t} className="text-[10px] bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">{t}</span>)}
                </div>
                <button onClick={() => handleStart(ex)} className="w-full h-9 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />Iniciar · {ex.duration}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}