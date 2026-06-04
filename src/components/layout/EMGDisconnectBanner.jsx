import React from "react";
import { useEMG } from "@/lib/EMGContext";
import { AlertTriangle, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EMGDisconnectBanner() {
  const { connected, izqConectado, derConectado } = useEMG();

  const anyDisconnected = connected && (!izqConectado || !derConectado);
  if (!anyDisconnected) return null;

  const bothDisconnected = !izqConectado && !derConectado;
  const message = bothDisconnected
    ? "Ambos electrodos desconectados"
    : !izqConectado
    ? "Electrodo izquierdo desconectado"
    : "Electrodo derecho desconectado";

  return (
    <>
      {/* Overlay que bloquea toda la pantalla */}
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />

      {/* Banner centrado */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-3xl border-2 border-amber-500/60 bg-amber-50 shadow-2xl p-10 flex flex-col items-center gap-6 text-center">
          
          {/* Ícono grande */}
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>

          {/* Título */}
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">{message}</h2>
            <p className="text-amber-700 text-base leading-relaxed">
              Verifica la colocación de los sensores EMG antes de continuar.<br />
              El sistema se reactivará automáticamente al reconectarse.
            </p>
          </div>

          {/* Estado de electrodos */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2 w-32",
              izqConectado
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-red-500/10 border-red-500/40"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full",
                izqConectado ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )} />
              <span className={cn(
                "text-sm font-bold",
                izqConectado ? "text-emerald-700" : "text-red-700"
              )}>IZQUIERDO</span>
              <span className={cn(
                "text-xs font-semibold",
                izqConectado ? "text-emerald-600" : "text-red-600"
              )}>{izqConectado ? "✅ OK" : "❌ Error"}</span>
            </div>

            <div className={cn(
              "flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2 w-32",
              derConectado
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-red-500/10 border-red-500/40"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full",
                derConectado ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )} />
              <span className={cn(
                "text-sm font-bold",
                derConectado ? "text-emerald-700" : "text-red-700"
              )}>DERECHO</span>
              <span className={cn(
                "text-xs font-semibold",
                derConectado ? "text-emerald-600" : "text-red-600"
              )}>{derConectado ? "✅ OK" : "❌ Error"}</span>
            </div>
          </div>

          {/* Indicador de espera */}
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <Wifi className="w-4 h-4 animate-pulse" />
            <span>Esperando reconexión de electrodos...</span>
          </div>

        </div>
      </div>
    </>
  );
}