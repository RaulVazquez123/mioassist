import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import TextCanvas from "@/components/writer/TextCanvas";
import ActionBar from "@/components/writer/ActionBar";
import TopLetters from "@/components/writer/TopLetters";
import Keyboard from "@/components/writer/Keyboard";
import SuggestionsSidebar from "@/components/writer/SuggestionsSidebar";
import SignalPanel from "@/components/writer/SignalPanel";
import MobileDictionary from "@/components/writer/MobileDictionary";
import { useEMGKeyboard } from "@/hooks/useEMGKeyboard";
import {
  loadLanguageModel,
  getTopLetters,
  getSuggestedWords,
  registerWordUsage,
} from "@/lib/languageModel";

const HEADER_ROUTES = ["/", "/profile", "/practice", "/info", "/legal", "/privacy"];

const LETTER_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l","ñ"],
  ["z","x","c","v","b","n","m"],
  ["á","é","í","ó","ú"],
  ["SHIFT","123","ESPACIO","BORRAR","LIMPIAR","DICCIONARIO"],
  ["COMPARTIR","PRACTICA","PERFIL"],
];

const NUM_ROWS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["@","#","$","%","&","*","(",")","−","_"],
  [".",",","?","!",";",":","/" ],
  ["SHIFT","123","ESPACIO","BORRAR","LIMPIAR","DICCIONARIO"],
  ["COMPARTIR","PRACTICA","PERFIL"],
];

export default function Writer() {
  const [text, setText] = useState("");
  const [highlightSidebar, setHighlightSidebar] = useState(false);
  const [mobileDictOpen, setMobileDictOpen] = useState(false);
  const [triggerActionSignal, setTriggerActionSignal] = useState(0);
  const [modelReady, setModelReady] = useState(false);

  const [shift, setShift] = useState(true);
  const [numMode, setNumMode] = useState(false);

  // Zona para navegación por teclado físico (flechas)
  const [zona, setZona] = useState("top");
  const [headerIndex, setHeaderIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);

  // Estado exclusivo para navegación EMG
  const [filaBlockeada, setFilaBloqueada] = useState(false);
  const [emgZona, setEmgZona] = useState("top"); // "top" | "keyboard" | "dictionary" | "actions"
  const [emgTopIndex, setEmgTopIndex] = useState(0);
  const [emgDictIndex, setEmgDictIndex] = useState(0);
  const [emgActionIndex, setEmgActionIndex] = useState(0);

  useEffect(() => {
    loadLanguageModel().then(() => setModelReady(true));
  }, []);

  useEffect(() => {
    if (text === "") { setShift(true); return; }
    const t = text.trimEnd();
    if (t.endsWith(".") || t.endsWith("!") || t.endsWith("?")) setShift(true);
  }, [text]);

  const topLettersData = useMemo(() => {
    if (!modelReady) return [];
    return getTopLetters(text, 5);
  }, [text, modelReady]);

  const suggestionsData = useMemo(() => {
    if (!modelReady) return [];
    return getSuggestedWords(text, 8);
  }, [text, modelReady]);

  const handleType = (ch) => setText((t) => t + ch);
  const handleBackspace = () => setText((t) => t.slice(0, -1));
  const handleClear = () => { setText(""); setShift(true); setNumMode(false); };
  const handleSpace = () => setText((t) => t + " ");

  const replaceCurrentWord = (fullWord) => {
    setText((prev) => {
      const trailingSpace = /\s$/.test(prev);
      if (!prev.trim()) return `${fullWord} `;
      if (trailingSpace) return `${prev}${fullWord} `;
      const parts = prev.split(" ");
      parts[parts.length - 1] = fullWord;
      return `${parts.join(" ")} `;
    });
    registerWordUsage(fullWord);
    setMobileDictOpen(false);
  };

  const openDictionary = () => {
    setHighlightSidebar(true);
    const el = document.getElementById("suggestions-sidebar");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => setHighlightSidebar(false), 1800);
    setMobileDictOpen(true);
    setZona("suggestions");
    setSuggestionIndex(0);
  };

  const openSharing = () => {
    setEmgZona("actions");
    setEmgActionIndex(0);
  };

  const ACTION_HANDLERS = [
    // Copiar
    async () => {
      if (!text.trim()) return;
      await navigator.clipboard.writeText(text);
    },
    // WhatsApp
    () => { if (!text.trim()) return; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"); },
    // Publicar en X
    () => { if (!text.trim()) return; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank"); },
    // Descargar
    () => {
      if (!text.trim()) return;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `mioassist-${Date.now()}.txt`; a.click();
      URL.revokeObjectURL(url);
    },
    // Leer en voz
    () => {
      if (!text.trim() || !("speechSynthesis" in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-ES";
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    },
  ];

  const onExecuteAction = (index) => {
    ACTION_HANDLERS[index]?.();
  };

  const ejecutarTecla = (value) => {
    if (value === "ESPACIO")     return handleSpace();
    if (value === "BORRAR")      return handleBackspace();
    if (value === "LIMPIAR")     return handleClear();
    if (value === "DICCIONARIO") return openDictionary();
    if (value === "SHIFT")       { setShift((s) => !s); return; }
    if (value === "123")         { setNumMode((n) => !n); setKbRow(0); setKbCol(0); return; }
    if (value === "PRACTICA")    { window.location.href = "/practice"; return; }
    if (value === "PERFIL")      { window.location.href = "/profile"; return; }
    if (value === "COMPARTIR")   { console.log("COMPARTIR ejecutado"); openSharing(); return; }
    const ch = (shift && !numMode) ? value.toUpperCase() : value;
    handleType(ch);
    if (shift && !numMode) setShift(false);
  };

  const activeRows = numMode ? NUM_ROWS : LETTER_ROWS;

  const moverIzquierda = () => {
    if (zona === "header")      { setHeaderIndex((i) => Math.max(0, i - 1)); return; }
    if (zona === "actions")     { setActionIndex((i) => Math.max(0, i - 1)); return; }
    if (zona === "top")         { setTopIndex((i) => Math.max(0, i - 1)); return; }
    if (zona === "suggestions") { setZona("keyboard"); setKbRow(activeRows.length - 1); setKbCol(5); return; }
    if (zona === "keyboard")    setKbCol((i) => Math.max(0, i - 1));
  };

  const moverDerecha = () => {
    if (zona === "header")   { setHeaderIndex((i) => Math.min(HEADER_ROUTES.length - 1, i + 1)); return; }
    if (zona === "actions")  { setActionIndex((i) => Math.min(4, i + 1)); return; }
    if (zona === "top")      { setTopIndex((i) => Math.min(5, i + 1)); return; }
    if (zona === "keyboard") { const row = activeRows[kbRow]; if (row) setKbCol((i) => Math.min(row.length - 1, i + 1)); }
  };

  const moverArriba = () => {
    if (zona === "suggestions") { setSuggestionIndex((i) => Math.max(0, i - 1)); return; }
    if (zona === "keyboard") {
      if (kbRow === 0) { setZona("top"); }
      else {
        const prev = (numMode && kbRow === 3) ? 2 : kbRow - 1;
        setKbRow(prev);
        setKbCol((c) => Math.min(c, activeRows[prev].length - 1));
      }
      return;
    }
    if (zona === "top")     { setZona("actions"); return; }
    if (zona === "actions") setZona("header");
  };

  const moverAbajo = () => {
    if (zona === "header")  { setZona("actions"); return; }
    if (zona === "actions") { setZona("top"); return; }
    if (zona === "top") {
      if (topIndex === 5) { openDictionary(); return; }
      setZona("keyboard"); setKbRow(0); setKbCol(0);
      return;
    }
    if (zona === "keyboard") {
      const maxRow = activeRows.length - 1;
      if (kbRow < maxRow) {
        const next = (numMode && kbRow === 2) ? 3 : kbRow + 1;
        setKbRow(next);
        setKbCol((c) => Math.min(c, activeRows[next].length - 1));
      } else if (suggestionsData.length > 0) {
        setZona("suggestions"); setSuggestionIndex(0);
      }
      return;
    }
    if (zona === "suggestions") setSuggestionIndex((i) => Math.min(suggestionsData.length - 1, i + 1));
  };

  const seleccionarActual = () => {
    if (zona === "header")  { window.location.href = HEADER_ROUTES[headerIndex]; return; }
    if (zona === "actions") { setTriggerActionSignal((n) => n + 1); return; }
    if (zona === "top") {
      if (topIndex === 5) { openDictionary(); return; }
      const l = topLettersData[topIndex]?.letter;
      if (l) ejecutarTecla(l);
      return;
    }
    if (zona === "keyboard") {
      const rows = numMode ? NUM_ROWS : LETTER_ROWS;
      const effectiveRow = (numMode && kbRow === 3) ? 3 : kbRow;
      const row = rows[effectiveRow];
      if (row) { const key = row[Math.min(kbCol, row.length - 1)]; if (key) ejecutarTecla(key); }
      return;
    }
    if (zona === "suggestions") { const p = suggestionsData[suggestionIndex]?.word; if (p) replaceCurrentWord(p); }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowLeft")  moverIzquierda();
      if (event.key === "ArrowRight") moverDerecha();
      if (event.key === "ArrowUp")    moverArriba();
      if (event.key === "ArrowDown")  moverAbajo();
      if (event.key === "Enter")      seleccionarActual();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zona, headerIndex, actionIndex, topIndex, suggestionIndex, kbRow, kbCol, topLettersData, suggestionsData, shift, numMode]);

  // Hook de navegación EMG
  useEMGKeyboard({
    activeRows,
    kbRow,    setKbRow,
    kbCol,    setKbCol,
    filaBlockeada, setFilaBloqueada,
    emgZona,  setEmgZona,
    topIndex: emgTopIndex, setTopIndex: setEmgTopIndex,
    dictIndex: emgDictIndex, setDictIndex: setEmgDictIndex,
    actionIndex: emgActionIndex, setActionIndex: setEmgActionIndex,
    topLettersData,
    suggestionsData,
    onSelectKey: ejecutarTecla,
    onSelectWord: replaceCurrentWord,
    onOpenDictionary: openDictionary,
    onExecuteAction,
    wsUrl: "ws://localhost:8081",
  });

  // Sincronizar emgTopIndex con topIndex para que el resaltado se vea
  useEffect(() => {
    setTopIndex(emgTopIndex);
  }, [emgTopIndex]);

  // Sincronizar emgZona con zona para resaltado visual
  useEffect(() => {
    if (emgZona === "top")      setZona("top");
    if (emgZona === "keyboard") setZona("keyboard");
    if (emgZona === "dictionary") setZona("suggestions");
  }, [emgZona]);

  // Sincronizar dictIndex con suggestionIndex para resaltado
  useEffect(() => {
    setSuggestionIndex(emgDictIndex);
  }, [emgDictIndex]);

  return (
    <div className="min-h-screen bg-background">
      <Header zona={zona === "header" ? "header" : undefined} headerIndex={headerIndex} />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 lg:gap-8">
          <div className="space-y-5">
            <TextCanvas value={text} onChange={setText} />
            <ActionBar text={text} zona={zona} actionIndex={actionIndex} triggerActionSignal={triggerActionSignal} emgZona={emgZona} emgActionIndex={emgActionIndex} />
            <TopLetters
              letters={topLettersData}
              onPick={(l) => ejecutarTecla(l)}
              zona={zona}
              topIndex={topIndex}
              onOpenDictionary={openDictionary}
            />
            <Keyboard
              onType={(k) => ejecutarTecla(k)}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onSpace={handleSpace}
              onOpenDictionary={openDictionary}
              onOpenSharing={openSharing}
              zona={zona}
              kbRow={kbRow}
              kbCol={kbCol}
              filaBlockeada={filaBlockeada}
              emgZona={emgZona}
              externalShift={shift}
              externalNumMode={numMode}
              onShiftChange={setShift}
              onNumModeChange={setNumMode}
            />
            <div className="xl:hidden">
              <SuggestionsSidebar
                suggestions={suggestionsData}
                onPick={replaceCurrentWord}
                highlighted={highlightSidebar}
                zona={zona}
                suggestionIndex={suggestionIndex}
              />
            </div>
          </div>
          <div className="hidden xl:flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <SignalPanel />
            <SuggestionsSidebar
              id="suggestions-sidebar"
              suggestions={suggestionsData}
              onPick={replaceCurrentWord}
              highlighted={highlightSidebar}
              zona={zona}
              suggestionIndex={suggestionIndex}
            />
          </div>
        </div>
      </main>
      <MobileDictionary
        open={mobileDictOpen}
        onClose={() => setMobileDictOpen(false)}
        suggestions={suggestionsData.map((item) => item.word)}
        onPick={replaceCurrentWord}
      />
    </div>
  );
}