// src/hooks/useEMGKeyboard.js
//
// Flujo de gestos:
//
// ZONA: "top" (Top 5 + botón diccionario)
//   DERECHA (sin bloqueo) → baja a teclado fila 0
//   IZQUIERDA (sin bloqueo) → bloquea Top5, topIndex = 0
//   DERECHA (bloqueado) → mueve topIndex +1; si llega al final reinicia a 0
//   IZQUIERDA (bloqueado) → selecciona letra/abre diccionario, desbloquea, vuelve a top pos 0
//
// ZONA: "keyboard"
//   DERECHA (sin bloqueo) → baja fila; si llega al final vuelve a top
//   IZQUIERDA (sin bloqueo) → bloquea fila, col = 0
//   DERECHA (bloqueado) → mueve col +1; si llega al final reinicia a 0
//   IZQUIERDA (bloqueado) → selecciona letra, desbloquea, vuelve a top pos 0
//
// ZONA: "dictionary"
//   DERECHA → baja índice; si llega al final reinicia a 0
//   IZQUIERDA → selecciona palabra, vuelve a top pos 0
//
// ZONA: "actions" (Copiar, WhatsApp, etc.)
//   DERECHA → mueve entre acciones; si llega al final vuelve a top
//   IZQUIERDA → ejecuta la acción seleccionada, vuelve a top

import { useEffect, useRef } from "react";

const DICTIONARY_BUTTON_INDEX = 5;
const ACTIONS_COUNT = 5; // Copiar, WhatsApp, Publicar X, Descargar, Leer en voz

export function useEMGKeyboard({
  activeRows,
  kbRow, setKbRow,
  kbCol, setKbCol,
  filaBlockeada, setFilaBloqueada,
  emgZona, setEmgZona,
  topIndex, setTopIndex,
  dictIndex, setDictIndex,
  actionIndex, setActionIndex,
  topLettersData,
  suggestionsData,
  onSelectKey,
  onSelectWord,
  onOpenDictionary,
  onExecuteAction,
  wsUrl = "ws://192.168.4.1:8081",
}) {
  const ws = useRef(null);

  const stateRef = useRef({});
  stateRef.current = {
    activeRows, kbRow, kbCol, filaBlockeada,
    emgZona, topIndex, dictIndex, actionIndex,
    topLettersData, suggestionsData,
    onSelectKey, onSelectWord, onOpenDictionary, onExecuteAction,
  };

  useEffect(() => {
    let ultimaAccion = 0;
    const DEBOUNCE_MS = 800;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("✅ EMG WebSocket conectado:", wsUrl);
    };

    ws.current.onmessage = (event) => {
      const ahora = Date.now();
      if (ahora - ultimaAccion < DEBOUNCE_MS) return;

      try {
        const data = JSON.parse(event.data);
        const clickIzq = data.izq?.click === 1;
        const clickDer = data.der?.click === 1;

        if (!clickIzq && !clickDer) return;
        if (clickIzq && clickDer) return;

        ultimaAccion = ahora;

        const {
          activeRows, kbRow, kbCol, filaBlockeada,
          emgZona, topIndex, dictIndex, actionIndex,
          topLettersData, suggestionsData,
          onSelectKey, onSelectWord, onOpenDictionary, onExecuteAction,
        } = stateRef.current;

        // ── ZONA: TOP 5 ─────────────────────────────────────────────
        if (emgZona === "top") {
          if (!filaBlockeada) {
            if (clickDer) {
              setEmgZona("keyboard");
              setKbRow(0);
              setKbCol(0);
            }
            if (clickIzq) {
              setFilaBloqueada(true);
              setTopIndex(0);
            }
          } else {
            if (clickDer) {
              setTopIndex((i) => (i + 1 >= DICTIONARY_BUTTON_INDEX + 1 ? 0 : i + 1));
            }
            if (clickIzq) {
              if (topIndex === DICTIONARY_BUTTON_INDEX) {
                if (!suggestionsData || suggestionsData.length === 0) {
                  setFilaBloqueada(false);
                  setTopIndex(0);
                  return;
                }
                onOpenDictionary();
                setEmgZona("dictionary");
                setDictIndex(0);
              } else {
                const letra = topLettersData[topIndex]?.letter;
                if (letra) onSelectKey(letra);
              }
              setFilaBloqueada(false);
              setTopIndex(0);
            }
          }
        }

        // ── ZONA: TECLADO ────────────────────────────────────────────
        else if (emgZona === "keyboard") {
          if (!filaBlockeada) {
            if (clickDer) {
              const maxRow = activeRows.length - 1;
              if (kbRow >= maxRow) {
                setEmgZona("top");
                setKbRow(0);
                setKbCol(0);
              } else {
                setKbRow((r) => r + 1);
                setKbCol(0);
              }
            }
            if (clickIzq) {
              setFilaBloqueada(true);
              setKbCol(0);
            }
          } else {
            if (clickDer) {
              const rowLen = activeRows[kbRow]?.length ?? 1;
              setKbCol((c) => (c + 1 >= rowLen ? 0 : c + 1));
            }
            if (clickIzq) {
              const row = activeRows[kbRow];
              if (row) {
                const key = row[Math.min(kbCol, row.length - 1)];
                if (key) {
                  onSelectKey(key);
                  // Si es tecla de navegación, no reseteamos — ella misma maneja la zona
                  if (["COMPARTIR","PRACTICA","PERFIL","DICCIONARIO"].includes(key)) return;
                }
              }
              setFilaBloqueada(false);
              setEmgZona("top");
              setKbRow(0);
              setKbCol(0);
              setTopIndex(0);
            }
          }
        }

        // ── ZONA: DICCIONARIO ────────────────────────────────────────
        else if (emgZona === "dictionary") {
          if (clickDer) {
            const maxDict = (suggestionsData?.length ?? 1) - 1;
            setDictIndex((i) => (i + 1 > maxDict ? 0 : i + 1));
          }
          if (clickIzq) {
            const palabra = suggestionsData[dictIndex]?.word;
            if (palabra) onSelectWord(palabra);
            setEmgZona("top");
            setTopIndex(0);
            setDictIndex(0);
          }
        }

        // ── ZONA: ACCIONES (Compartir) ───────────────────────────────
        else if (emgZona === "actions") {
          if (clickDer) {
            // Mueve entre acciones; si llega al final vuelve a top
            if (actionIndex + 1 >= ACTIONS_COUNT) {
              setEmgZona("top");
              setActionIndex(0);
            } else {
              setActionIndex((i) => i + 1);
            }
          }
          if (clickIzq) {
            // Ejecuta la acción actual y vuelve a top
            onExecuteAction(actionIndex);
            setEmgZona("top");
            setActionIndex(0);
          }
        }

      } catch (e) {
        // JSON malformado, ignorar
      }
    };

    ws.current.onerror = (e) => console.warn("⚠️ EMG WebSocket error:", e);
    ws.current.onclose = () => console.log("🔌 EMG WebSocket cerrado");

    return () => ws.current?.close();
  }, [wsUrl]);
}