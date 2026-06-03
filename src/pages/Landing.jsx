import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import EMGStatusBar from "@/components/layout/EMGStatusBar";
import {
  Keyboard, Activity, Zap, Target, ArrowRight,
  Dumbbell, Shield, Wifi, Star, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const WS_URL = "ws://192.168.4.1:8081";
const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 3px #38bdf8", backgroundColor: "#e0f2fe" };
const STYLE_BTN_ACTIVE = { outline: "3px solid #38bdf8", outlineOffset: "2px" };

// 0=entrar, 1=empezar ahora, 2=ver cómo funciona, 3-8=features, 9-11=how it works, 12-14=testimonios, 15=CTA
const TOTAL_BLOCKS = 16;

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

function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(start);
    }, 30);
    return () => clearInterval(id);
  }, [to]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const [activeBlock, setActiveBlock] = useState(0);
  const stateRef = useRef({});
  stateRef.current = { activeBlock };

  useEMGSimple(WS_URL,
    // Derecha — siguiente bloque
    () => setActiveBlock((b) => (b + 1) % TOTAL_BLOCKS),
    // Izquierda — ejecuta acción del bloque activo
    () => {
      const { activeBlock } = stateRef.current;
      if (activeBlock === 0) navigate("/writer");      // Entrar a la app
      if (activeBlock === 1) navigate("/writer");      // Empezar ahora
      if (activeBlock === 2) {                         // Ver cómo funciona
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
      }
      if (activeBlock === 15) navigate("/writer");     // CTA final
    }
  );

  useEffect(() => {
    const el = document.getElementById(`emg-block-${activeBlock}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeBlock]);

  const isActive = (idx) => activeBlock === idx;

  const FEATURES = [
    { icon: Keyboard, title: "Teclado adaptativo QWERTY", desc: "Teclado completo con mayúsculas, acentos y modo numérico. Optimizado para activación muscular con latencia mínima.", accent: true },
    { icon: Zap, title: "Top 5 predicciones en vivo", desc: "Las letras más probables se muestran en grande para selección rápida. El modelo se adapta a tu patrón de escritura." },
    { icon: Target, title: "Diccionario predictivo", desc: "Palabras sugeridas contextuales para escribir frases completas en segundos. Personalizable por necesidades." },
    { icon: Activity, title: "Métricas EMG clínicas", desc: "Monitoreo en tiempo real de señal, fatiga muscular, precisión y velocidad de escritura para seguimiento médico." },
    { icon: Dumbbell, title: "Práctica guiada", desc: "Ejercicios interactivos por nivel para mejorar progresivamente con el sistema. Desde básico hasta avanzado." },
    { icon: Shield, title: "Perfil clínico seguro", desc: "Datos del paciente, terapeuta y objetivos guardados de forma segura. Exportación para informes médicos." },
  ];

  const HOW = [
    { n: "01", title: "Conecta tu sensor EMG", desc: "Coloca los electrodos en el músculo que elijas. El sistema detecta y calibra la señal automáticamente." },
    { n: "02", title: "Activa y escribe", desc: "Contrae el músculo para seleccionar letras del teclado adaptativo. El Top 5 predice las más probables." },
    { n: "03", title: "Comunícate", desc: "Usa el diccionario predictivo para escribir frases completas y compártelas por WhatsApp, voz o descarga." },
  ];

  const TESTIMONIALS = [
    { quote: "Después de mi lesión medular pensé que nunca podría escribir mensajes yo solo. MioAssist me devolvió esa independencia.", name: "Carlos M.", role: "Paciente, lesión C5 · Madrid" },
    { quote: "Como terapeuta ocupacional, es la herramienta más completa que hemos probado. Los informes EMG son muy valiosos clínicamente.", name: "Dra. Martínez", role: "Terapeuta ocupacional · Barcelona" },
    { quote: "Mi hijo tiene ELA y ahora puede mandarnos mensajes por WhatsApp solo. Es increíble lo que ha cambiado nuestra vida.", name: "Ana L.", role: "Familiar cuidadora · Valencia" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-base font-semibold">Mio<span className="text-primary">Assist</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button id="emg-block-0" onClick={() => navigate("/writer")}
              style={isActive(0) ? STYLE_BTN_ACTIVE : {}}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all soft-shadow">
              Entrar a la app <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gradient-to-b from-primary/8 to-transparent blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-12 pb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">Tecnología EMG adaptativa · 2026</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4 max-w-3xl mx-auto">
            Escribe con tus{" "}
            <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">músculos</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-7 leading-relaxed">
            MioAssist convierte señales musculares EMG en escritura fluida e inteligente. Diseñado para personas con movilidad reducida, con predicción de palabras en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button id="emg-block-1" onClick={() => navigate("/writer")}
              style={isActive(1) ? STYLE_BTN_ACTIVE : {}}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all soft-shadow">
              <Keyboard className="w-4 h-4" /> Empezar ahora — es gratis
            </button>
            <button id="emg-block-2" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              style={isActive(2) ? STYLE_BTN_ACTIVE : {}}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm hover:border-primary/40 transition-all">
              Ver cómo funciona <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Live EMG preview */}
          <div className="max-w-lg mx-auto rounded-2xl border border-border/70 bg-card soft-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-[hsl(196_85%_22%)] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-accent" />
                <span className="text-primary-foreground/90 text-xs font-semibold uppercase tracking-wider">Señal EMG en tiempo real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-primary-foreground/70 text-xs">74 µV</span>
              </div>
            </div>
            <div className="px-4 py-3">
              <EMGStatusBar />
              <div className="mt-3 rounded-xl bg-secondary/60 border border-border px-3 py-2 text-left font-mono text-sm text-foreground">
                hola familia, hoy me siento mejor
                <span className="w-0.5 h-4 bg-primary inline-block ml-0.5 animate-pulse rounded-full align-middle" />
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {["E", "A", "O", "S", "R"].map((l, i) => (
                  <div key={l} className="h-10 rounded-lg border-2 border-border bg-background flex flex-col items-center justify-center">
                    <span className="text-sm font-medium text-foreground">{l}</span>
                    <span className="text-[9px] text-muted-foreground tabular-nums">{95 - i * 12}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { label: "Usuarios activos", value: 1200, suffix: "+" },
            { label: "Palabras escritas", value: 4800000, suffix: "" },
            { label: "Precisión promedio", value: 89, suffix: "%" },
            { label: "Centros clínicos", value: 38, suffix: "" },
          ].map(({ label, value, suffix }) => (
            <div key={label}>
              <div className="text-3xl font-light tabular-nums text-primary mb-1"><Counter to={value} suffix={suffix} /></div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
            <Zap className="w-3 h-3" /> Funcionalidades
          </div>
          <h2 className="text-3xl sm:text-4xl font-light mb-3">Todo lo que <span className="font-semibold">necesitas</span></h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">Una plataforma completa diseñada desde cero para escritura asistida por señal EMG.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const blockIdx = 3 + i;
            return (
              <div key={f.title} id={`emg-block-${blockIdx}`}
                style={isActive(blockIdx) ? STYLE_ACTIVE : {}}
                className="rounded-2xl border border-border/70 bg-card p-4 soft-shadow hover:border-accent/40 transition-all">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", f.accent ? "bg-gradient-to-br from-primary to-accent" : "bg-primary/10")}>
                  <Icon className={cn("w-4 h-4", f.accent ? "text-primary-foreground" : "text-primary")} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-br from-primary to-[hsl(196_85%_20%)] text-primary-foreground py-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-light mb-2">¿Cómo <span className="font-semibold">funciona</span>?</h2>
            <p className="opacity-80 text-sm">Tres pasos simples para empezar a escribir</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW.map((h, i) => {
              const blockIdx = 9 + i;
              return (
                <div key={h.n} id={`emg-block-${blockIdx}`}
                  style={isActive(blockIdx) ? { ...STYLE_ACTIVE, backgroundColor: "rgba(255,255,255,0.15)" } : {}}
                  className="flex flex-col gap-2 rounded-2xl p-4 transition-all">
                  <div className="text-4xl font-light text-accent/50 tabular-nums leading-none">{h.n}</div>
                  <h3 className="text-base font-semibold">{h.title}</h3>
                  <p className="opacity-80 text-xs leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-light mb-2">Lo que dicen los <span className="font-semibold">usuarios</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TESTIMONIALS.map((t, i) => {
            const blockIdx = 12 + i;
            return (
              <div key={t.name} id={`emg-block-${blockIdx}`}
                style={isActive(blockIdx) ? STYLE_ACTIVE : {}}
                className="rounded-2xl border border-border/70 bg-card p-4 soft-shadow space-y-3 transition-all">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-foreground/80 text-xs leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-xs">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-14">
        <div id="emg-block-15"
          style={isActive(15) ? { ...STYLE_ACTIVE, borderRadius: "1rem" } : {}}
          className="rounded-2xl bg-gradient-to-br from-primary to-[hsl(196_85%_22%)] text-primary-foreground p-8 sm:p-10 text-center relative overflow-hidden soft-shadow transition-all">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-light mb-3">Listo para <span className="font-semibold">empezar</span></h2>
            <p className="opacity-80 text-sm mb-6 max-w-md mx-auto">Accede a MioAssist ahora mismo. Sin instalaciones, directo desde el navegador.</p>
            <button onClick={() => navigate("/writer")}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 transition-all">
              <Keyboard className="w-4 h-4" /> Abrir MioAssist <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-card/30">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>MioAssist © 2026</span>
          </div>
          <div className="flex gap-5 flex-wrap justify-center">
            <button onClick={() => navigate("/writer")} className="hover:text-foreground transition-colors">Escritura</button>
            <button onClick={() => navigate("/profile")} className="hover:text-foreground transition-colors">Perfil EMG</button>
            <button onClick={() => navigate("/practice")} className="hover:text-foreground transition-colors">Práctica</button>
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">Privacidad</button>
            <button onClick={() => navigate("/info")} className="hover:text-foreground transition-colors">Información</button>
            <button onClick={() => navigate("/legal")} className="hover:text-foreground transition-colors">Marco legal</button>
          </div>
        </div>
      </footer>
    </div>
  );
}