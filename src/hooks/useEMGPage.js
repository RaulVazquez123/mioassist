// src/hooks/useEMGPage.js
// Hook reutilizable para navegación EMG en páginas de contenido.
// Usa EMGContext para evitar conflictos con otros componentes.

import { useEffect, useRef, useState } from "react";
import { useEMG } from "@/lib/EMGContext";

export function useEMGPage({ blockCount, onBlockAction, ownerId }) {
  const { claimEMG, releaseEMG } = useEMG();
  const [activeBlock, setActiveBlock] = useState(-1);
  const stateRef = useRef({});
  stateRef.current = { activeBlock, blockCount, onBlockAction };

  // Cuando activeBlock es -1, liberar control para que Header lo tome
  useEffect(() => {
    if (activeBlock === -1) {
      releaseEMG(ownerId);
    } else {
      claimEMG(ownerId,
        () => {
          const { activeBlock, blockCount } = stateRef.current;
          setActiveBlock((b) => {
            if (b >= blockCount - 1) return -1;
            return b + 1;
          });
        },
        () => {
          const { activeBlock, onBlockAction } = stateRef.current;
          if (activeBlock >= 0) onBlockAction?.(activeBlock);
        }
      );
    }
  }, [activeBlock, ownerId]);

  // Al montar, no reclamar — esperar a que el usuario baje desde el header
  useEffect(() => {
    return () => releaseEMG(ownerId);
  }, [ownerId]);

  // Scroll automático
  useEffect(() => {
    if (activeBlock >= 0) {
      const el = document.getElementById(`emg-block-${activeBlock}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeBlock]);

  return { activeBlock, setActiveBlock };
}