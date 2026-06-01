import React, { useState } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/profile/StatCard";
import FatigueMeter from "@/components/profile/FatigueMeter";
import SignalGauge from "@/components/profile/SignalGauge";
import ProgressChart from "@/components/profile/ProgressChart";
import CloudExport from "@/components/profile/CloudExport";
import UserDataForm from "@/components/profile/UserDataForm";
import { Activity, Target, Clock, MousePointerClick, Gauge, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEMG } from "@/lib/EMGContext";

const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8" };

const TABS = [
  { id: "metrics", label: "Métricas EMG", icon: Activity },
  { id: "user",    label: "Datos del paciente", icon: User },
];

// Bloques: 0=tab métricas, 1=tab datos, 2=botón descargar, 3=botón generar reporte
const BLOCK_COUNT = 4;

export default function Profile() {
  const [tab, setTab] = useState("metrics");
  const { rmsActual, pico, connected, claimEMG, releaseEMG } = useEMG();
  const [activeBlock, setActiveBlock] = useState(-1);

  const [sessionStart] = useState(Date.now());
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const minutos = Math.floor((now - sessionStart) / 60000);
  const horasStr = `${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, "0")}`;

  const avgRms  = connected && rmsActual > 0 ? Math.round(rmsActual) : 68;
  const picoRms = connected && pico > 0      ? Math.round(pico)      : 118;

  const stateRef = React.useRef({});
  stateRef.current = { activeBlock };

  React.useEffect(() => {
    if (activeBlock === -1) {
      releaseEMG("profile");
      return;
    }
    claimEMG("profile",
      () => {
        setActiveBlock((b) => {
          if (b >= BLOCK_COUNT - 1) return -1;
          return b + 1;
        });
      },
      () => {
        const { activeBlock } = stateRef.current;
        if (activeBlock === 0) setTab("metrics");
        if (activeBlock === 1) setTab("user");
        if (activeBlock === 2) document.getElementById("profile-btn-download")?.click();
        if (activeBlock === 3) document.getElementById("profile-btn-report")?.click();
      }
    );
  }, [activeBlock]);

  React.useEffect(() => {
    return () => releaseEMG("profile");
  }, []);

  // Scroll to active block
  React.useEffect(() => {
    if (activeBlock >= 0) {
      const el = document.getElementById(`emg-block-${activeBlock}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeBlock]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 lg:py-12">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Perfil clínico</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sesión de hoy · {minutos} min activos</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight">
            Perfil <span className="font-semibold">del paciente</span>
          </h2>
        </div>

        {/* Tabs — bloques 0 y 1 */}
        <div className="flex gap-2 p-1 rounded-2xl bg-secondary/70 border border-border/60 w-fit mb-8">
          {TABS.map(({ id, label, icon: Icon }, i) => (
            <button
              key={id}
              id={`emg-block-${i}`}
              onClick={() => setTab(id)}
              style={activeBlock === i ? STYLE_ACTIVE : {}}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border-2 border-transparent",
                tab === id ? "bg-card text-primary soft-shadow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "metrics" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Señal EMG promedio" value={avgRms} unit="µV" icon={Activity} tone="primary" hint={connected ? "En vivo" : "Rango óptimo"} />
              <StatCard label="Intensidad máxima" value={picoRms} unit="µV" icon={Zap} hint="Pico de sesión" />
              <StatCard label="Precisión" value="89" unit="%" icon={Target} tone="accent" hint="+4% vs ayer" />
              <StatCard label="Velocidad" value="24" unit="PPM" icon={Gauge} hint="Palabras/min" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Tiempo de uso" value={horasStr} unit="h" icon={Clock} hint="Meta: 2:00 h" />
              <StatCard label="Interacciones" value="1.284" icon={MousePointerClick} hint="Activaciones" />
              <SignalGauge avg={avgRms} max={picoRms} />
              <FatigueMeter />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><ProgressChart /></div>
              {/* CloudExport con botones marcados — bloques 2 y 3 */}
              <CloudExport
                activeBlock={activeBlock}
                downloadBtnId="profile-btn-download"
                reportBtnId="profile-btn-report"
              />
            </div>
          </div>
        )}

        {tab === "user" && <UserDataForm />}
      </main>
    </div>
  );
}