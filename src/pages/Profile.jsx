import React, { useState, useRef, useEffect } from "react";
import NavBar, { navItems } from "@/components/layout/NavBar";
import StatCard from "@/components/profile/StatCard";
import FatigueMeter from "@/components/profile/FatigueMeter";
import SignalGauge from "@/components/profile/SignalGauge";
import ProgressChart from "@/components/profile/ProgressChart";
import CloudExport from "@/components/profile/CloudExport";
import UserDataForm from "@/components/profile/UserDataForm";
import { Activity, Target, Clock, MousePointerClick, Gauge, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEMG } from "@/lib/EMGContext";
import { useNavigate } from "react-router-dom";

const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 3px #38bdf8", backgroundColor: "#e0f2fe", color: "#0f172a" };
const TABS = [
  { id: "metrics", label: "Métricas EMG", icon: Activity },
  { id: "user",    label: "Datos del paciente", icon: User },
];

const TOTAL_BLOCKS = 5;
const WS_URL = "ws://192.168.4.1:8081";

function useEMGSimple(wsUrl, onDer, onIzq) {
  const ws = useRef(null);
  const cbRef = useRef({ onDer, onIzq });
  cbRef.current = { onDer, onIzq };
  useEffect(() => {
    let last = 0;
    const DEBOUNCE = 800;
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (e) => {
      const now = Date.now();
      if (now - last < DEBOUNCE) return;
      try {
        const data = JSON.parse(e.data);
        const izq = data.izq?.click === 1;
        const der = data.der?.click === 1;
        if (!izq && !der) return;
        if (izq && der) return;
        last = now;
        if (der) cbRef.current.onDer();
        if (izq) cbRef.current.onIzq();
      } catch {}
    };
    ws.current.onerror = () => {};
    ws.current.onclose = () => {};
    return () => ws.current?.close();
  }, [wsUrl]);
}

function ConfirmDialog({ title, subtitle, onConfirm, onCancel, confirmOption }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl border border-border p-5 max-w-xs w-full soft-shadow text-center space-y-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        <div className="flex gap-2">
          <button onClick={onConfirm} style={confirmOption === 0 ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">✅ Confirmar</button>
          <button onClick={onCancel} style={confirmOption === 1 ? { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">❌ Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("metrics");
  const { rmsActual, pico, connected } = useEMG();

  const [activeBlock, setActiveBlock] = useState(1);
  const [navBloqueada, setNavBloqueada] = useState(false);
  const [navIdx, setNavIdx] = useState(0);
  const [navConfirmOpen, setNavConfirmOpen] = useState(false);
  const [navConfirmOption, setNavConfirmOption] = useState(0);

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

  const stateRef = useRef({});
  stateRef.current = { activeBlock, navBloqueada, navIdx, navConfirmOpen, navConfirmOption };

  useEMGSimple(WS_URL,
    () => {
      const s = stateRef.current;
      if (s.navConfirmOpen) { setNavConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.activeBlock === 0 && s.navBloqueada) { setNavIdx((i) => (i + 1 >= navItems.length ? 0 : i + 1)); return; }
      setActiveBlock((b) => (b + 1) % TOTAL_BLOCKS);
    },
    () => {
      const s = stateRef.current;
      if (s.navConfirmOpen) {
        if (s.navConfirmOption === 0) navigate(navItems[s.navIdx].to);
        else { setNavConfirmOpen(false); setNavConfirmOption(0); }
        return;
      }
      if (s.activeBlock === 0) {
        if (!s.navBloqueada) { setNavBloqueada(true); setNavIdx(0); }
        else { setNavConfirmOpen(true); setNavConfirmOption(0); }
        return;
      }
      if (s.activeBlock === 1) setTab("metrics");
      if (s.activeBlock === 2) setTab("user");
      if (s.activeBlock === 3) document.getElementById("profile-btn-download")?.click();
      if (s.activeBlock === 4) document.getElementById("profile-btn-report")?.click();
    }
  );

  React.useEffect(() => { if (activeBlock !== 0) { setNavBloqueada(false); setNavIdx(0); } }, [activeBlock]);
  React.useEffect(() => {
    const id = activeBlock === 0 ? "emg-navbar" : `emg-block-${activeBlock}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeBlock]);

  const navActive = activeBlock === 0;

  return (
    <div className="min-h-screen bg-background">
      {navConfirmOpen && (
        <ConfirmDialog title={navItems[navIdx].label} subtitle="¿Ir a esta sección?" confirmOption={navConfirmOption}
          onConfirm={() => navigate(navItems[navIdx].to)}
          onCancel={() => { setNavConfirmOpen(false); setNavConfirmOption(0); }} />
      )}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 space-y-3">

        <div id="emg-navbar" style={navActive ? { outline: "3px solid #38bdf8", outlineOffset: "4px", borderRadius: "1rem", backgroundColor: "#e0f2fe" } : {}}>
          <NavBar bloqueada={navBloqueada} selectedIdx={navIdx} />
        </div>

        {/* Header + tabs en una sola línea */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Perfil clínico</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{minutos} min activos</span>
            </div>
            <h2 className="text-xl font-light tracking-tight">Perfil <span className="font-semibold">del paciente</span></h2>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-secondary/70 border border-border/60">
            {TABS.map(({ id, label, icon: Icon }, i) => (
              <button key={id} id={`emg-block-${i + 1}`} onClick={() => setTab(id)}
                style={activeBlock === i + 1 ? STYLE_ACTIVE : {}}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 border-transparent",
                  tab === id ? "bg-card text-primary soft-shadow" : "text-muted-foreground hover:text-foreground")}>
                <Icon className="w-3 h-3" />{label}
              </button>
            ))}
          </div>
        </div>

        {tab === "metrics" && (
          <div className="space-y-2">
            {/* Fila 1 — 4 stat cards iguales */}
            <div className="grid grid-cols-4 gap-2">
              <StatCard label="Señal EMG promedio" value={avgRms} unit="µV" icon={Activity} tone="primary" hint={connected ? "En vivo" : "Rango óptimo"} />
              <StatCard label="Intensidad máxima" value={picoRms} unit="µV" icon={Zap} hint="Pico de sesión" />
              <StatCard label="Precisión" value="89" unit="%" icon={Target} tone="accent" hint="+4% vs ayer" />
              <StatCard label="Velocidad" value="24" unit="PPM" icon={Gauge} hint="Palabras/min" />
            </div>

            {/* Fila 2 — 4 cards altura fija */}
            <div className="grid grid-cols-4 gap-2">
              <StatCard label="Tiempo de uso" value={horasStr} unit="h" icon={Clock} hint="Meta: 2:00 h" />
              <StatCard label="Interacciones" value="1.284" icon={MousePointerClick} hint="Activaciones" />
              <SignalGauge avg={avgRms} max={picoRms} />
              <FatigueMeter />
            </div>

            {/* Fila 3 — chart + cloud */}
            <div className="grid grid-cols-3 gap-2 items-stretch">
              <div className="col-span-2"><ProgressChart /></div>
              <div id="emg-block-2" style={activeBlock === 2 ? STYLE_ACTIVE : {}} className="rounded-2xl transition-all">
                <CloudExport activeBlock={activeBlock} downloadBtnId="profile-btn-download" reportBtnId="profile-btn-report" />
              </div>
            </div>
          </div>
        )}
        {tab === "user" && <UserDataForm />}

      </main>
    </div>
  );
}