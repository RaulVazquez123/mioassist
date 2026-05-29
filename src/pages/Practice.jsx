import React, { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Keyboard from "@/components/writer/Keyboard";
import TopLetters from "@/components/writer/TopLetters";
import SuggestionsSidebar from "@/components/writer/SuggestionsSidebar";
import MobileDictionary from "@/components/writer/MobileDictionary";
import { Dumbbell, Sparkles, Trophy, Star, CheckCircle2, RotateCcw, Zap, ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────
   EXERCISE DATA
───────────────────────────────────────────────────── */
const EXERCISES = [
  {
    id: 1, emoji: "🗣️", title: "Frases esenciales", level: "Básico", duration: "3 min",
    tags: ["comunicación", "cotidiano"],
    description: "Escribe frases de comunicación básica usando el teclado real.",
    phrases: ["hola", "gracias", "agua", "ayuda"],
    suggestions: ["hola", "gracias", "agua", "ayuda", "familia", "bien", "sí", "no"],
  },
  {
    id: 2, emoji: "✍️", title: "Vocabulario diario", level: "Básico", duration: "4 min",
    tags: ["precisión", "vocabulario"],
    description: "Escribe palabras esenciales usando predicción y teclado.",
    phrases: ["familia", "médico", "casa", "dolor"],
    suggestions: ["familia", "médico", "casa", "dolor", "cama", "baño", "llamar"],
  },
  {
    id: 3, emoji: "💬", title: "Mini mensaje", level: "Intermedio", duration: "6 min",
    tags: ["frase", "comunicación real"],
    description: "Construye mensajes completos usando el teclado y palabras sugeridas.",
    phrases: ["necesito ayuda", "me siento bien", "llama al doctor"],
    suggestions: ["necesito", "ayuda", "siento", "bien", "llama", "doctor", "gracias", "hoy"],
  },
  {
    id: 4, emoji: "⚡", title: "Velocidad controlada", level: "Intermedio", duration: "5 min",
    tags: ["velocidad", "precisión"],
    description: "Escribe palabras cortas con rapidez y precisión.",
    phrases: ["sí", "no", "ok", "bien", "mal"],
    suggestions: ["sí", "no", "ok", "bien", "mal", "agua", "hola"],
  },
  {
    id: 5, emoji: "📋", title: "Dictado médico", level: "Avanzado", duration: "8 min",
    tags: ["clínico", "síntomas"],
    description: "Escribe frases para comunicar síntomas al equipo médico.",
    phrases: ["tengo dolor", "no puedo dormir", "necesito medicina"],
    suggestions: ["tengo", "dolor", "puedo", "dormir", "necesito", "medicina", "médico", "hoy"],
  },
  {
    id: 6, emoji: "🏆", title: "Reto del día", level: "Avanzado", duration: "10 min",
    tags: ["reto", "resistencia"],
    description: "Escribe un mensaje largo completo. Pon a prueba tu resistencia.",
    phrases: ["hola familia hoy me siento mejor"],
    suggestions: ["hola", "familia", "hoy", "siento", "mejor", "mucho", "gracias", "bien"],
  },
];

/* ─────────────────────────────────────────────────────
   EXERCISE CARD (list view)
───────────────────────────────────────────────────── */
function ExerciseCard({ exercise, onStart }) {
  const levelStyle = {
    Básico: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    Intermedio: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    Avanzado: "bg-primary/10 text-primary border-primary/20",
  }[exercise.level];

  return (
    <div className="group rounded-3xl border border-border/70 bg-card p-6 soft-shadow hover:border-accent/50 transition-all flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border", levelStyle)}>
          {exercise.level}
        </span>
        {exercise.completed && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">{exercise.emoji}</div>
        <h3 className="text-lg font-semibold">{exercise.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5 flex-1">{exercise.description}</p>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {exercise.tags.map((t) => (
          <span key={t} className="text-[11px] bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">{t}</span>
        ))}
      </div>
      <Button
        onClick={() => onStart(exercise)}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
      >
        <Zap className="w-4 h-4 mr-2" />
        Iniciar · {exercise.duration}
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ACTIVE EXERCISE — full integrated writer
───────────────────────────────────────────────────── */
function ActiveExercise({ exercise, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [stepDone, setStepDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [mobileDictOpen, setMobileDictOpen] = useState(false);

  const target = exercise.phrases[step] || "";
  const isMatch = typed.trim().toLowerCase() === target.toLowerCase();
  const progress = typed.length / Math.max(target.length, 1);
  const totalSteps = exercise.phrases.length;

  /* Top-letter prediction based on last typed char */
  const topLetters = useMemo(() => {
    const last = typed.slice(-1).toLowerCase();
    const follow = {
      a: ["r", "n", "l", "s", "d"], e: ["n", "r", "s", "l", "d"],
      o: ["s", "n", "r", "l", "m"], n: ["a", "e", "o", "t", "i"],
      s: ["e", "a", "o", "i", "u"], r: ["a", "e", "o", "i", "u"],
    };
    if (/[a-záéíóúñ]/.test(last) && follow[last]) return follow[last];
    return ["e", "a", "o", "s", "r"];
  }, [typed]);

  const handleType = (ch) => setTyped((t) => t + ch);
  const handleBackspace = () => setTyped((t) => t.slice(0, -1));
  const handleClear = () => setTyped("");
  const handleSpace = () => setTyped((t) => t + " ");
  const handlePickWord = (w) => {
    setTyped((t) => (t.endsWith(" ") || t === "" ? t + w + " " : t + " " + w + " "));
    setMobileDictOpen(false);
  };
  const openDictionary = () => setMobileDictOpen(true);

  const handleNextStep = () => {
    if (step >= totalSteps - 1) {
      setAllDone(true);
      onComplete(exercise.id);
    } else {
      setStep((s) => s + 1);
      setTyped("");
      setStepDone(false);
    }
  };

  if (allDone) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-3xl font-light mb-2">¡Ejercicio completado!</h2>
          <p className="text-muted-foreground">
            {exercise.emoji} <span className="font-semibold text-foreground">{exercise.title}</span>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button variant="outline" onClick={() => { setStep(0); setTyped(""); setAllDone(false); }} className="h-12 px-6 rounded-2xl gap-2">
            <RotateCcw className="w-4 h-4" /> Repetir
          </Button>
          <Button onClick={onClose} className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
            Volver a práctica
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="font-semibold text-sm">{exercise.emoji} {exercise.title}</div>
            <div className="text-xs text-muted-foreground">{exercise.level} · Frase {step + 1} de {totalSteps}</div>
          </div>
        </div>
        {/* Step progress dots */}
        <div className="flex gap-1.5">
          {exercise.phrases.map((_, i) => (
            <div key={i} className={cn(
              "w-2 h-2 rounded-full transition-all",
              i < step ? "bg-primary" : i === step ? "bg-accent w-5" : "bg-secondary border border-border"
            )} />
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 space-y-4">

          {/* ── Target phrase + typed output ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Target */}
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-2">
                <Target className="w-3 h-3" /> Objetivo
              </div>
              <div className="text-2xl sm:text-3xl font-mono tracking-wide text-foreground font-medium">
                {target}
              </div>
              {/* Char-level diff */}
              <div className="mt-2 flex flex-wrap gap-0.5">
                {target.split("").map((ch, i) => {
                  const typedCh = typed[i];
                  const correct = typedCh === ch;
                  const pending = typedCh === undefined;
                  return (
                    <span key={i} className={cn(
                      "text-base font-mono px-0.5 rounded",
                      pending ? "text-muted-foreground/40" :
                      correct ? "text-emerald-600 font-semibold" : "text-destructive bg-destructive/10"
                    )}>{ch}</span>
                  );
                })}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isMatch ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-accent"
                  )}
                  style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Typed output */}
            <div className={cn(
              "rounded-2xl border p-4 transition-all",
              isMatch ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/60 bg-card"
            )}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                {isMatch ? "✓ ¡Correcto!" : "Escribiendo…"}
              </div>
              <div className={cn(
                "text-2xl sm:text-3xl font-mono tracking-wide min-h-[2.5rem] flex items-center",
                isMatch ? "text-emerald-600 font-semibold" : "text-foreground"
              )}>
                {typed || <span className="text-muted-foreground/30 font-light">usa el teclado</span>}
              </div>
              {isMatch && (
                <Button
                  onClick={handleNextStep}
                  className="mt-4 w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2"
                >
                  {step >= totalSteps - 1 ? "Finalizar ejercicio 🏆" : "Siguiente frase →"}
                </Button>
              )}
            </div>
          </div>

          {/* ── Top 5 Letters ── */}
          <TopLetters letters={topLetters} onPick={handleType} />

          {/* ── Keyboard + Sidebar layout ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
            <Keyboard
              onType={handleType}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onSpace={handleSpace}
              onOpenDictionary={openDictionary}
            />
            {/* Desktop sidebar */}
            <div className="hidden xl:block">
              <SuggestionsSidebar
                suggestions={exercise.suggestions}
                onPick={handlePickWord}
                highlighted={false}
              />
            </div>
          </div>

          {/* ── Mobile: suggestions always visible below keyboard ── */}
          <div className="xl:hidden">
            <SuggestionsSidebar
              suggestions={exercise.suggestions}
              onPick={handlePickWord}
              highlighted={false}
            />
          </div>

        </div>
      </div>

      {/* Mobile dictionary drawer */}
      <MobileDictionary
        open={mobileDictOpen}
        onClose={() => setMobileDictOpen(false)}
        suggestions={exercise.suggestions}
        onPick={handlePickWord}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
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
      <Header />

      {active && (
        <ActiveExercise
          exercise={active}
          onClose={handleClose}
          onComplete={handleComplete}
        />
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 lg:py-12">
        {/* Hero banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-primary to-[hsl(196_85%_22%)] text-primary-foreground p-7 sm:p-10 mb-8 overflow-hidden soft-shadow">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
          <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
            <Dumbbell className="w-28 h-28" />
          </div>
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Rehabilitación interactiva</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight mb-3">
              Práctica <span className="font-semibold">diaria</span>
            </h2>
            <p className="opacity-90 max-w-lg">
              Cada ejercicio usa el teclado real con predicción y diccionario, igual que en la vida cotidiana.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-80">Progreso de hoy</span>
                <span className="font-semibold tabular-nums">{completed} / {total}</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(completed / total) * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-5 mt-5 text-sm">
              <div>
                <div className="opacity-60 text-xs uppercase tracking-wider">Racha</div>
                <div className="text-xl font-light">🔥 5 días</div>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <div className="opacity-60 text-xs uppercase tracking-wider">Puntos</div>
                <div className="text-xl font-light flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-300" /> 240
                </div>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <div className="opacity-60 text-xs uppercase tracking-wider">Nivel</div>
                <div className="text-xl font-light">Intermedio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXERCISES.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={{ ...ex, completed: completedIds.has(ex.id) }}
              onStart={handleStart}
            />
          ))}
        </div>
      </main>
    </div>
  );
}