import React, { useState } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/profile/StatCard";
import FatigueMeter from "@/components/profile/FatigueMeter";
import SignalGauge from "@/components/profile/SignalGauge";
import ProgressChart from "@/components/profile/ProgressChart";
import CloudExport from "@/components/profile/CloudExport";
import UserDataForm from "@/components/profile/UserDataForm";
import { Activity, Target, Clock, MousePointerClick, Gauge, Zap, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "metrics", label: "Métricas EMG", icon: Activity },
  { id: "user", label: "Datos del paciente", icon: User },
];

export default function Profile() {
  const [tab, setTab] = useState("metrics");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 lg:py-12">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Perfil clínico</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sesión de hoy · 32 min activos</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight">
            Perfil <span className="font-semibold">del paciente</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-secondary/70 border border-border/60 w-fit mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                tab === id
                  ? "bg-card text-primary soft-shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── METRICS TAB ── */}
        {tab === "metrics" && (
          <div className="space-y-5">
            {/* Row 1: key stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Señal EMG promedio" value="68" unit="µV" icon={Activity} tone="primary" hint="Rango óptimo" />
              <StatCard label="Intensidad máxima" value="118" unit="µV" icon={Zap} hint="Pico 14:02" />
              <StatCard label="Precisión" value="89" unit="%" icon={Target} tone="accent" hint="+4% vs ayer" />
              <StatCard label="Velocidad" value="24" unit="PPM" icon={Gauge} hint="Palabras/min" />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Tiempo de uso" value="1:42" unit="h" icon={Clock} hint="Meta: 2:00 h" />
              <StatCard label="Interacciones" value="1.284" icon={MousePointerClick} hint="Activaciones" />
              <SignalGauge avg={68} max={118} />
              <FatigueMeter level={42} />
            </div>

            {/* Row 3: chart + cloud */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ProgressChart />
              </div>
              <CloudExport />
            </div>
          </div>
        )}

        {/* ── USER DATA TAB ── */}
        {tab === "user" && <UserDataForm />}
      </main>
    </div>
  );
}