import React, { useState } from "react";
import { Cloud, Check, RefreshCw, Download, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8" };

const REPORTS = [
  { name: "Sesión_2026-04-17.pdf", size: "84 KB", time: "Hoy 14:32", synced: true },
  { name: "Semana_14_2026.pdf", size: "210 KB", time: "Dom 09:00", synced: true },
  { name: "Semana_13_2026.pdf", size: "198 KB", time: "Dom 09:00", synced: true },
];

export default function CloudExport({ activeBlock, downloadBtnId, reportBtnId }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("14:32 hoy");

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setLastSync("ahora mismo"); }, 2000);
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 soft-shadow flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Nube · Google Drive</h3>
            <p className="text-[11px] text-muted-foreground">Sincronización automática</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Activo
        </span>
      </div>

      <div className="rounded-2xl bg-secondary/60 border border-border/60 px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Última sync: <span className="font-semibold text-foreground">{lastSync}</span>
        </div>
        <button onClick={handleSync} className={cn("w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-all", syncing && "animate-spin")}>
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {REPORTS.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background border border-border/60 hover:border-border transition-all">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{r.name}</div>
              <div className="text-[10px] text-muted-foreground">{r.size} · {r.time}</div>
            </div>
            {r.synced && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          id={downloadBtnId}
          style={activeBlock === 2 ? STYLE_ACTIVE : {}}
          className="h-9 rounded-xl text-xs gap-1.5 border-2 border-border flex items-center justify-center font-medium transition-all hover:bg-secondary"
        >
          <Download className="w-3.5 h-3.5" /> Descargar
        </button>
        <button
          id={reportBtnId}
          style={activeBlock === 3 ? STYLE_ACTIVE : {}}
          className="h-9 rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground border-2 border-transparent flex items-center justify-center font-medium transition-all"
        >
          <Cloud className="w-3.5 h-3.5" /> Generar reporte
        </button>
      </div>
    </div>
  );
}