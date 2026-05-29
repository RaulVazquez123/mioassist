// src/hooks/useEMGKeyboard.js
//
// Hook de navegación EMG para el teclado de MioAssist.
//
// Flujo de gestos:
//   DERECHA (fila NO bloqueada) → baja una fila, col vuelve a 0
//   IZQUIERDA (fila NO bloqueada) → bloquea la fila, col = 0
//   DERECHA (fila bloqueada) → mueve col +1; si llega al final reinicia a col 0
//   IZQUIERDA (fila bloqueada) → selecciona letra actual, desbloquea, row 0 col 0

import { useEffect, useRef } from "react";

export function useEMGKeyboard({
  activeRows,
  kbRow, setKbRow,
  kbCol, setKbCol,
  filaBlockeada, setFilaBloqueada,
  setZona,
  onSelectKey,
  wsUrl = "ws://localhost:8081",
}) {
  const ws = useRef(null);

  // Guardamos el estado en un ref para evitar stale closures dentro del handler
  const stateRef = useRef({});
  stateRef.current = { activeRows, kbRow, kbCol, filaBlockeada, onSelectKey };

  useEffect(() => {
    let ultimaAccion = 0;
    const DEBOUNCE_MS = 300;

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

        // Siempre forzamos zona keyboard cuando llega una señal EMG
        setZona("keyboard");

        const { activeRows, kbRow, kbCol, filaBlockeada, onSelectKey } =
          stateRef.current;

        if (!filaBlockeada) {
          // ── MODO VERTICAL (navegación entre filas) ──────────────────
          if (clickDer) {
            const maxRow = activeRows.length - 1;
            setKbRow((r) => Math.min(r + 1, maxRow));
            setKbCol(0);
          }
          if (clickIzq) {
            setFilaBloqueada(true);
            setKbCol(0);
          }
        } else {
          // ── MODO HORIZONTAL (navegación dentro de la fila) ──────────
          if (clickDer) {
            const rowLen = activeRows[kbRow]?.length ?? 1;
            setKbCol((c) => (c + 1 >= rowLen ? 0 : c + 1));
          }
          if (clickIzq) {
            const row = activeRows[kbRow];
            if (row) {
              const key = row[Math.min(kbCol, row.length - 1)];
              if (key) onSelectKey(key);
            }
            setFilaBloqueada(false);
            setKbRow(0);
            setKbCol(0);
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