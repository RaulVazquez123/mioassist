// src/hooks/useEMGPage.js
//
// Hook reutilizable para navegación EMG en páginas de contenido.
//
// Flujo:
//   - Arranca en "header" — derecha mueve entre pestañas del nav
//   - Izquierda en header → navega a esa página
//   - Al entrar a una página → baja automáticamente al primer bloque
//   - Derecha en bloques → siguiente bloque (reinicia al llegar al final → vuelve a header)
//   - Izquierda en bloque → ejecuta la acción del bloque (expandir, descargar, etc.)

import { useEffect, useRef, useState } from "react";

export function useEMGPage({
  blockCount,
  onBlockAction,
  wsUrl = "ws://192.168.4.1:8081",
  startInContent = false, // true si viene de navegar desde header
}) {
  const [activeBlock, setActiveBlock] = useState(startInContent ? 0 : -1);
  // -1 = no hay bloque activo (estamos en header o recién llegados)

  const stateRef = useRef({});
  stateRef.current = { activeBlock, blockCount, onBlockAction };

  const ws = useRef(null);

  useEffect(() => {
    let ultimaAccion = 0;
    const DEBOUNCE_MS = 800;

    ws.current = new WebSocket(wsUrl);

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

        const { activeBlock, blockCount, onBlockAction } = stateRef.current;

        if (clickDer) {
          setActiveBlock((b) => {
            if (b < 0) return 0; // primer bloque
            if (b >= blockCount - 1) return -1; // al final → vuelve a "sin selección" (header toma control)
            return b + 1;
          });
        }

        if (clickIzq) {
          if (activeBlock >= 0) {
            onBlockAction?.(activeBlock);
          }
        }
      } catch (e) {}
    };

    ws.current.onerror = () => {};
    ws.current.onclose = () => {};
    return () => ws.current?.close();
  }, [wsUrl]);

  // Scroll automático al bloque activo
  useEffect(() => {
    if (activeBlock >= 0) {
      const el = document.getElementById(`emg-block-${activeBlock}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeBlock]);

  return { activeBlock, setActiveBlock };
}