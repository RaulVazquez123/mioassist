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

const TABS = [
  { id: "metrics", label: "Métricas EMG", icon: Activity },
  { id: "user",    label: "Datos del paciente", icon: User },
];

export default function Profile() {
  const [tab, setTab] = useState("metrics");
  const { rmsActual, pico, connected } = useEMG();

  // Tiempo de sesión
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 lg:py-12">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Perfil clínico</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Sesión de hoy · {minutos} min activos
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight">
            Perfil <span className="font-semibold">del paciente</span>
          </h2>
        </div>

        <div className="flex gap-2 p-1 rounded-2xl bg-secondary/70 border border-border/60 w-fit mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
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
              <StatCard
                label="Señal EMG promedio"
                value={avgRms}
                unit="µV"
                icon={Activity}
                tone="primary"
                hint={connected ? "En vivo" : "Rango óptimo"}
              />
              <StatCard
                label="Intensidad máxima"
                value={picoRms}
                unit="µV"
                icon={Zap}
                hint="Pico de sesión"
              />
              <StatCard label="Precisión"     value="89"   unit="%" icon={Target} tone="accent" hint="+4% vs ayer" />
              <StatCard label="Velocidad"     value="24"   unit="PPM" icon={Gauge} hint="Palabras/min" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Tiempo de uso"
                value={horasStr}
                unit="h"
                icon={Clock}
                hint="Meta: 2:00 h"
              />
              <StatCard label="Interacciones" value="1.284" icon={MousePointerClick} hint="Activaciones" />
              <SignalGauge avg={avgRms} max={picoRms} />
              <FatigueMeter />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ProgressChart />
              </div>
              <CloudExport />
            </div>
          </div>
        )}

        {tab === "user" && <UserDataForm />}
      </main>
    </div>
  );
}