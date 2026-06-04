import React from "react";
import EMGStatusBar from "@/components/layout/EMGStatusBar";
import { Activity } from "lucide-react";
import { useEMG } from "@/lib/EMGContext";

export default function SignalPanel() {
  const { rmsActual, pico, umbral, latencia } = useEMG();

  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary to-[hsl(196_85%_22%)] text-primary-foreground p-5 soft-shadow overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent blur-3xl" />
      </div>
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
            Señal EMG en vivo
          </span>
        </div>
        <span className="text-xs font-medium tabular-nums opacity-80">
          {rmsActual > 0 ? `${rmsActual.toFixed(1)} mV` : "— mV"}
        </span>
      </div>
      <EMGStatusBar />
      <div className="relative mt-4 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="opacity-70">Umbral</div>
          <div className="font-semibold tabular-nums text-sm">{umbral}mV</div>
        </div>
        <div>
          <div className="opacity-70">Pico</div>
          <div className="font-semibold tabular-nums text-sm">
            {pico > 0 ? `${pico.toFixed(1)} mV` : "— mV"}
          </div>
        </div>
        <div>
          <div className="opacity-70">Latencia</div>
          <div className="font-semibold tabular-nums text-sm">
            {latencia > 0 ? `${latencia} ms` : "— ms"}
          </div>
        </div>
      </div>
    </div>
  );
}