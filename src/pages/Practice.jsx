import React, { useEffect, useMemo, useState, useRef } from "react";
// import Header from "@/components/layout/Header"; // comentado temporalmente
import Keyboard from "@/components/writer/Keyboard";
import TopLetters from "@/components/writer/TopLetters";
import SuggestionsSidebar from "@/components/writer/SuggestionsSidebar";
import MobileDictionary from "@/components/writer/MobileDictionary";
import { useEMGKeyboard } from "@/hooks/useEMGKeyboard";
import {
  loadLanguageModel,
  getTopLetters,
  getSuggestedWords,
  isLanguageModelReady,
} from "@/lib/languageModel";
import {
  Dumbbell, Sparkles, Trophy, Star, CheckCircle2,
  RotateCcw, Zap, ArrowLeft, Target, Clock, MousePointerClick, Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

// Hook EMG simple — propio WebSocket, sin depender del contexto
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

/* ─── CONFIRM DIALOG ─── */
function ConfirmDialog({ title, subtitle, onConfirm, onCancel, confirmOption }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-card rounded-3xl border border-border p-8 max-w-sm w-full soft-shadow text-center space-y-5">
        <h3 className="text-xl font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            style={confirmOption === 0 ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" } : {}}
            className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all"
          >✅ Confirmar</button>
          <button
            onClick={onCancel}
            style={confirmOption === 1 ? { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" } : {}}
            className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all"
          >❌ Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── STATS SCREEN ─── */
function StatsScreen({ stats, exercise, onRepeat, onAnother, onClose }) {
  const mins = Math.floor(stats.seconds / 60);
  const secs = stats.seconds % 60;
  const [selectedBtn, setSelectedBtn] = useState(0);
  const cbRef = useRef({ onRepeat, onAnother, onClose, selectedBtn });
  cbRef.current = { onRepeat, onAnother, onClose, selectedBtn };

  useEMGSimple("ws://192.168.4.1:8081",
    () => setSelectedBtn((i) => (i + 1) % 3),
    () => {
      const { selectedBtn, onRepeat, onAnother, onClose } = cbRef.current;
      if (selectedBtn === 0) onRepeat();
      else if (selectedBtn === 1) onAnother();
      else onClose();
    }
  );

  const btnStyle = (idx) => selectedBtn === idx
    ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" }
    : {};

  const precisionColor = stats.precision >= 80 ? "text-emerald-600" : stats.precision >= 60 ? "text-amber-600" : "text-red-500";

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-light">¡Completado!</h2>
            <p className="text-muted-foreground mt-1">{exercise.emoji} <span className="font-semibold text-foreground">{exercise.title}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/70 bg-card p-5 flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            <span className="text-3xl font-light tabular-nums">{mins}:{String(secs).padStart(2,"0")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tiempo</span>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5 flex flex-col items-center gap-2">
            <MousePointerClick className="w-6 h-6 text-accent" />
            <span className="text-3xl font-light tabular-nums">{stats.clicks}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Clicks</span>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5 flex flex-col items-center gap-2">
            <Percent className="w-6 h-6 text-emerald-500" />
            <span className={`text-3xl font-light tabular-nums ${precisionColor}`}>{stats.precision}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Precisión</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onRepeat} style={btnStyle(0)} className="flex-1 h-14 rounded-2xl border-2 border-border font-semibold text-sm flex items-center justify-center gap-2 transition-all">
            <RotateCcw className="w-4 h-4" /> Repetir
          </button>
          <button onClick={onAnother} style={btnStyle(1)} className="flex-1 h-14 rounded-2xl border-2 border-border font-semibold text-sm flex items-center justify-center gap-2 transition-all">
            <Dumbbell className="w-4 h-4" /> Otro
          </button>
          <button onClick={onClose} style={btnStyle(2)} className="flex-1 h-14 rounded-2xl border-2 border-primary bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all">
            Volver
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">Derecha → navega · Izquierda → selecciona</p>
      </div>
    </div>
  );
}

/* ─── ACTIVE EXERCISE ─── */
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

  useEffect(() => {
    if (!isLanguageModelReady()) loadLanguageModel().then(() => setModelReady(true));
  }, []);

  const target = exercise.phrases[step] ? exercise.phrases[step].charAt(0).toUpperCase() + exercise.phrases[step].slice(1) : "";
  const isMatch = typed.trim().toLowerCase() === target.toLowerCase();
  const totalSteps = exercise.phrases.length;
  const activeRows = numMode ? NUM_ROWS : LETTER_ROWS;

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
    const modelWords = getSuggestedWords(typed, 8);
    return modelWords;
  }, [typed, exercise.suggestions, modelReady]);

  const handleType = (ch) => {
    clicks.current++;
    totalChars.current++;
    const next = typed + ch;
    if (target[next.length - 1] === ch) correctChars.current++;
    setTyped(next);
  };
  const handleBackspace = () => setTyped((t) => t.slice(0, -1));
  const handleClear = () => setTyped("");
  const handleSpace = () => { clicks.current++; setTyped((t) => t + " "); };
  const handlePickWord = (w) => { setTyped((t) => (t.endsWith(" ") || t === "" ? t + w + " " : t + " " + w + " ")); setMobileDictOpen(false); };
  const openDictionary = () => { setMobileDictOpen(true); setEmgZona("dictionary"); setEmgDictIndex(0); };

  const ejecutarTecla = (value) => {
    if (value === "ESPACIO")     return handleSpace();
    if (value === "BORRAR")      return handleBackspace();
    if (value === "LIMPIAR")     return handleClear();
    if (value === "DICCIONARIO") return openDictionary();
    if (value === "SHIFT")       { setShift((s) => !s); return; }
    if (value === "123")         { setNumMode((n) => !n); setKbRow(0); setKbCol(0); return; }
    if (value === "SALIR")       { setShowExitConfirm(true); setExitConfirmOption(0); return; }
    const ch = (shift && !numMode) ? value.toUpperCase() : value;
    handleType(ch);
    if (shift && !numMode) setShift(false);
  };

  const handleNextStep = () => {
    if (step >= totalSteps - 1) {
      const seconds = Math.floor((Date.now() - startTime.current) / 1000);
      const precision = totalChars.current > 0 ? Math.round((correctChars.current / totalChars.current) * 100) : 100;
      setStats({ seconds, clicks: clicks.current, precision });
      setAllDone(true);
      onComplete(exercise.id);
    } else {
      setStep((s) => s + 1);
      setTyped("");
    }
  };

  useEffect(() => { setTopIndex(emgTopIndex); }, [emgTopIndex]);
  useEffect(() => {
    if (emgZona === "top")        setZona("top");
    if (emgZona === "keyboard")   setZona("keyboard");
    if (emgZona === "dictionary") setZona("suggestions");
  }, [emgZona]);
  useEffect(() => { setSuggestionIndex(emgDictIndex); }, [emgDictIndex]);

  // Hook principal del teclado — desactivado cuando el confirm de salir está abierto
  useEMGKeyboard({
    activeRows,
    kbRow, setKbRow,
    kbCol, setKbCol,
    filaBlockeada, setFilaBloqueada,
    emgZona, setEmgZona,
    topIndex: emgTopIndex, setTopIndex: setEmgTopIndex,
    dictIndex: emgDictIndex, setDictIndex: setEmgDictIndex,
    actionIndex: emgActionIndex, setActionIndex: setEmgActionIndex,
    topLettersData,
    suggestionsData,
    onSelectKey: ejecutarTecla,
    onSelectWord: handlePickWord,
    onOpenDictionary: openDictionary,
    onExecuteAction: () => {},
    wsUrl: showExitConfirm ? null : "ws://192.168.4.1:8081",
  });

  // Hook para el confirm de salir
  useEMGSimple(
    "ws://192.168.4.1:8081",
    () => setExitConfirmOption((o) => o === 0 ? 1 : 0),
    () => {
      if (exitConfirmOptionRef.current === 0) { onClose(); }
      else { setShowExitConfirm(false); setExitConfirmOption(0); }
    },
    showExitConfirm
  );

  if (allDone && stats) {
    return (
      <StatsScreen
        stats={stats} exercise={exercise}
        onRepeat={() => { setStep(0); setTyped(""); setAllDone(false); startTime.current = Date.now(); clicks.current = 0; totalChars.current = 0; correctChars.current = 0; }}
        onAnother={onClose}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {showExitConfirm && (
        <ConfirmDialog
          title="¿Salir del ejercicio?"
          subtitle="Se perderá el progreso actual"
          confirmOption={exitConfirmOption}
          onConfirm={onClose}
          onCancel={() => { setShowExitConfirm(false); setExitConfirmOption(0); }}
        />
      )}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowExitConfirm(true); setExitConfirmOption(0); }} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="font-semibold text-sm">{exercise.emoji} {exercise.title}</div>
            <div className="text-xs text-muted-foreground">{exercise.level} · Frase {step + 1} de {totalSteps}</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {exercise.phrases.map((_, i) => (
            <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i < step ? "bg-primary" : i === step ? "bg-accent w-5" : "bg-secondary border border-border")} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-2"><Target className="w-3 h-3" /> Objetivo</div>
              <div className="text-2xl sm:text-3xl font-mono tracking-wide text-foreground font-medium">{target}</div>
              <div className="mt-2 flex flex-wrap gap-0.5">
                {target.split("").map((ch, i) => {
                  const typedCh = typed[i];
                  const correct = typedCh === ch;
                  const pending = typedCh === undefined;
                  return <span key={i} className={cn("text-base font-mono px-0.5 rounded", pending ? "text-muted-foreground/40" : correct ? "text-emerald-600 font-semibold" : "text-destructive bg-destructive/10")}>{ch}</span>;
                })}
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-300", isMatch ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-accent")} style={{ width: `${Math.min((typed.length / Math.max(target.length,1)) * 100, 100)}%` }} />
              </div>
            </div>
            <div className={cn("rounded-2xl border p-4 transition-all", isMatch ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/60 bg-card")}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{isMatch ? "✓ ¡Correcto!" : "Escribiendo…"}</div>
              <div className={cn("text-2xl sm:text-3xl font-mono tracking-wide min-h-[2.5rem] flex items-center", isMatch ? "text-emerald-600 font-semibold" : "text-foreground")}>
                {typed || <span className="text-muted-foreground/30 font-light">usa el teclado</span>}
              </div>
              {isMatch && (
                <Button onClick={handleNextStep} className="mt-4 w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2">
                  {step >= totalSteps - 1 ? "Finalizar ejercicio 🏆" : "Siguiente frase →"}
                </Button>
              )}
            </div>
          </div>
          <TopLetters letters={topLettersData} onPick={ejecutarTecla} zona={zona} topIndex={topIndex} onOpenDictionary={openDictionary} />
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
            <div className="space-y-2">
              <Keyboard
                onType={ejecutarTecla} onBackspace={handleBackspace} onClear={handleClear}
                onSpace={handleSpace} onOpenDictionary={openDictionary} onOpenSharing={() => {}}
                hideNavRow={true} zona={zona} kbRow={kbRow} kbCol={kbCol}
                filaBlockeada={filaBlockeada} emgZona={emgZona}
                externalShift={shift} externalNumMode={numMode}
                onShiftChange={setShift} onNumModeChange={setNumMode}
              />
              <button
                onClick={() => { setShowExitConfirm(true); setExitConfirmOption(0); }}
                style={
                  zona === "keyboard" && kbRow === activeRows.length - 1
                    ? filaBlockeada
                      ? { backgroundColor: "#ef4444", borderColor: "#b91c1c", color: "#ffffff", boxShadow: "0 0 0 2px #b91c1c" }
                      : { backgroundColor: "#fecaca", borderColor: "#f87171", color: "#991b1b" }
                    : { backgroundColor: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }
                }
                className="w-full h-14 rounded-2xl border-2 font-semibold text-base flex items-center justify-center gap-2 transition-all"
              >✕ Salir del ejercicio</button>
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

/* ─── EXERCISE LIST ─── */
function ExerciseList({ exercises, completedIds, onStart, enabled = true }) {
  const [selectedIdx, setSelectedIdx] = useState(0); // empieza en 0 no null
  const [confirmMode, setConfirmMode] = useState(false);
  const [confirmOption, setConfirmOption] = useState(0);

  const selectedIdxRef = useRef(0);
  const confirmOptionRef = useRef(0);
  selectedIdxRef.current = selectedIdx;
  confirmOptionRef.current = confirmOption;

  // Derecha → siguiente ejercicio (cicla), Izquierda → abre confirm
  useEMGSimple(
    "ws://192.168.4.1:8081",
    // Derecha — navega o alterna confirm
    () => {
      if (confirmMode) {
        setConfirmOption((o) => o === 0 ? 1 : 0);
      } else {
        setSelectedIdx((i) => (i + 1 >= exercises.length ? 0 : i + 1));
      }
    },
    // Izquierda — abre confirm o ejecuta
    () => {
      if (confirmMode) {
        if (confirmOptionRef.current === 0) {
          setConfirmMode(false);
          onStart(exercises[selectedIdxRef.current]);
        } else {
          setConfirmMode(false);
          setConfirmOption(0);
        }
      } else {
        setConfirmMode(true);
        setConfirmOption(0);
      }
    },
    enabled
  );

  const levelStyle = (level) => ({
    Básico: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    Intermedio: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    Avanzado: "bg-primary/10 text-primary border-primary/20"
  }[level]);

  return (
    <div className="relative">
      {confirmMode && (
        <ConfirmDialog
          title={`${exercises[selectedIdx].emoji} ${exercises[selectedIdx].title}`}
          subtitle={`${exercises[selectedIdx].level} · ${exercises[selectedIdx].duration} — ¿Iniciar este ejercicio?`}
          confirmOption={confirmOption}
          onConfirm={() => { setConfirmMode(false); onStart(exercises[selectedIdx]); }}
          onCancel={() => { setConfirmMode(false); setConfirmOption(0); }}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {exercises.map((ex, idx) => (
          <div
            key={ex.id}
            style={!confirmMode && selectedIdx === idx ? { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8" } : {}}
            className="group rounded-3xl border border-border/70 bg-card p-6 soft-shadow hover:border-accent/50 transition-all flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border", levelStyle(ex.level))}>{ex.level}</span>
              {completedIds.has(ex.id) && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">{ex.emoji}</div>
              <h3 className="text-lg font-semibold">{ex.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 flex-1">{ex.description}</p>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {ex.tags.map((t) => <span key={t} className="text-[11px] bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">{t}</span>)}
            </div>
            <Button onClick={() => onStart(ex)} className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold">
              <Zap className="w-4 h-4 mr-2" />Iniciar · {ex.duration}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function Practice() {
  const [active, setActive] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());

  const handleStart = (ex) => setActive(ex);
  const handleComplete = (id) => setCompletedIds((s) => new Set([...s, id]));
  const handleClose = () => setActive(null);

  const completed = completedIds.size;
  const total = EXERCISES.length;

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> comentado temporalmente */}
      {active && <ActiveExercise exercise={active} onClose={handleClose} onComplete={handleComplete} />}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 lg:py-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary to-[hsl(196_85%_22%)] text-primary-foreground p-7 sm:p-10 mb-8 overflow-hidden soft-shadow">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
          <div className="absolute top-6 right-6 opacity-10 pointer-events-none"><Dumbbell className="w-28 h-28" /></div>
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Rehabilitación interactiva</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-3">Práctica <span className="font-semibold">diaria</span></h2>
            <p className="opacity-90 max-w-lg">Cada ejercicio usa el teclado real con predicción y diccionario, igual que en la vida cotidiana.</p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="opacity-80">Progreso de hoy</span><span className="font-semibold tabular-nums">{completed} / {total}</span></div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(completed / total) * 100}%` }} /></div>
            </div>
            <div className="flex flex-wrap gap-5 mt-5 text-sm">
              <div><div className="opacity-60 text-xs uppercase tracking-wider">Racha</div><div className="text-xl font-light">🔥 5 días</div></div>
              <div className="w-px bg-white/20" />
              <div><div className="opacity-60 text-xs uppercase tracking-wider">Puntos</div><div className="text-xl font-light flex items-center gap-1"><Star className="w-4 h-4 text-amber-300" /> 240</div></div>
              <div className="w-px bg-white/20" />
              <div><div className="opacity-60 text-xs uppercase tracking-wider">Nivel</div><div className="text-xl font-light">Intermedio</div></div>
            </div>
          </div>
        </div>
        <ExerciseList exercises={EXERCISES} completedIds={completedIds} onStart={handleStart} enabled={!active} />
      </main>
    </div>
  );
}