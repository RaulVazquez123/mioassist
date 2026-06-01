// src/components/layout/ElectrodosBanner.jsx
// Banner rojo que aparece cuando algún electrodo se desconecta.
// Se muestra fijo arriba de todo, visible en cualquier página.

import React from "react";
import { AlertTriangle } from "lucide-react";
import { useEMG } from "@/lib/EMGContext";

export default function ElectrodosBanner() {
  const { izqConectado, derConectado, connected } = useEMG();

  // Si el WebSocket no está conectado, no mostramos nada
  if (!connected) return null;

  const hayProblema = !izqConectado || !derConectado;
  if (!hayProblema) return null;

  const mensaje = !izqConectado && !derConectado
    ? "Ambos electrodos desconectados — revisa los sensores antes de continuar"
    : !izqConectado
    ? "Electrodo izquierdo desconectado — revisa el sensor de la mano izquierda"
    : "Electrodo derecho desconectado — revisa el sensor de la mano derecha";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
      <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
      <span className="text-sm font-semibold text-center">{mensaje}</span>
    </div>
  );
}