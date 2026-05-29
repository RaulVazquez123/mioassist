import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import EMGStatusBar from "@/components/layout/EMGStatusBar";
import {
  Keyboard, Activity, Zap, Target, ArrowRight,
  Dumbbell, Shield, Wifi, Star, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Animated counter ── */
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

/* ── Feature card ── */
function Feature({ icon: Icon, title, desc, accent }) {
  return (
    <div className={cn(
      "rounded-3xl border border-border/70 bg-card p-6 soft-shadow hover:border-accent/40 transition-all group",
    )}>
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center mb-5",
        accent ? "bg-gradient-to-br from-primary to-accent" : "bg-primary/10"
      )}>
        <Icon className={cn("w-6 h-6", accent ? "text-primary-foreground" : "text-primary")} />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Testimonial ── */
function Testimonial({ quote, name, role }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 soft-shadow space-y-4">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-foreground/80 text-sm leading-relaxed italic">"{quote}"</p>
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══ NAVBAR ══ */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Logo size={38} />
            <span className="text-xl font-semibold">
              Mio<span className="text-primary">Assist</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all soft-shadow"
            >
              Entrar a la app <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-b from-primary/8 to-transparent blur-3xl" />
          <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-accent/8 blur-3xl" />
          <div className="absolute top-40 left-0 w-60 h-60 rounded-full bg-primary/6 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              Tecnología EMG adaptativa · 2026
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight mb-6 max-w-4xl mx-auto">
            Escribe con tus{" "}
            <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              músculos
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            MioAssist convierte señales musculares EMG en escritura fluida e inteligente.
            Diseñado para personas con movilidad reducida, con predicción de palabras en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all soft-shadow emg-glow"
            >
              <Keyboard className="w-5 h-5" />
              Empezar ahora — es gratis
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-border bg-card text-foreground font-semibold text-lg hover:border-primary/40 transition-all"
            >
              Ver cómo funciona <ChevronDown className="w-5 h-5" />
            </a>
          </div>

          {/* Live EMG preview card */}
          <div className="max-w-2xl mx-auto rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-[hsl(196_85%_22%)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-primary-foreground/90 text-sm font-semibold uppercase tracking-wider">
                  Señal EMG en tiempo real
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-primary-foreground/70 text-xs">74 µV</span>
              </div>
            </div>
            <div className="px-6 py-5">
              <EMGStatusBar />
              <div className="mt-4 rounded-2xl bg-secondary/60 border border-border px-4 py-3 text-left font-mono text-lg text-foreground">
                hola familia, hoy me siento mejor
                <span className="w-0.5 h-5 bg-primary inline-block ml-0.5 animate-pulse rounded-full align-middle" />
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {["E", "A", "O", "S", "R"].map((l, i) => (
                  <div key={l} className="h-12 rounded-xl border-2 border-border bg-background flex flex-col items-center justify-center">
                    <span className="text-lg font-medium text-foreground">{l}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{95 - i * 12}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { label: "Usuarios activos", value: 1200, suffix: "+" },
            { label: "Palabras escritas", value: 4800000, suffix: "" },
            { label: "Precisión promedio", value: 89, suffix: "%" },
            { label: "Centros clínicos", value: 38, suffix: "" },
          ].map(({ label, value, suffix }) => (
            <div key={label}>
              <div className="text-4xl font-light tabular-nums text-primary mb-1">
                <Counter to={value} suffix={suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
            <Zap className="w-3.5 h-3.5" /> Funcionalidades
          </div>
          <h2 className="text-4xl sm:text-5xl font-light mb-4">
            Todo lo que <span className="font-semibold">necesitas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Una plataforma completa diseñada desde cero para escritura asistida por señal EMG.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Feature accent icon={Keyboard}
            title="Teclado adaptativo QWERTY"
            desc="Teclado completo con mayúsculas, acentos y modo numérico. Optimizado para activación muscular con latencia mínima." />
          <Feature icon={Zap}
            title="Top 5 predicciones en vivo"
            desc="Las letras más probables se muestran en grande para selección rápida. El modelo se adapta a tu patrón de escritura." />
          <Feature icon={Target}
            title="Diccionario predictivo"
            desc="Palabras sugeridas contextuales para escribir frases completas en segundos. Personalizable por necesidades." />
          <Feature icon={Activity}
            title="Métricas EMG clínicas"
            desc="Monitoreo en tiempo real de señal, fatiga muscular, precisión y velocidad de escritura para seguimiento médico." />
          <Feature icon={Dumbbell}
            title="Práctica guiada"
            desc="Ejercicios interactivos por nivel para mejorar progresivamente con el sistema. Desde básico hasta avanzado." />
          <Feature icon={Shield}
            title="Perfil clínico seguro"
            desc="Datos del paciente, terapeuta y objetivos guardados de forma segura. Exportación para informes médicos." />
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="bg-gradient-to-br from-primary to-[hsl(196_85%_20%)] text-primary-foreground py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-light mb-4">
              ¿Cómo <span className="font-semibold">funciona</span>?
            </h2>
            <p className="opacity-80 text-lg">Tres pasos simples para empezar a escribir</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Conecta tu sensor EMG", desc: "Coloca los electrodos en el músculo que elijas. El sistema detecta y calibra la señal automáticamente." },
              { n: "02", title: "Activa y escribe", desc: "Contrae el músculo para seleccionar letras del teclado adaptativo. El Top 5 predice las más probables." },
              { n: "03", title: "Comunícate", desc: "Usa el diccionario predictivo para escribir frases completas y compártelas por WhatsApp, voz o descarga." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col gap-4">
                <div className="text-6xl font-light text-accent/50 tabular-nums leading-none">{n}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="opacity-80 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-light mb-4">
            Lo que dicen los <span className="font-semibold">usuarios</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Testimonial
            quote="Después de mi lesión medular pensé que nunca podría escribir mensajes yo solo. MioAssist me devolvió esa independencia."
            name="Carlos M."
            role="Paciente, lesión C5 · Madrid" />
          <Testimonial
            quote="Como terapeuta ocupacional, es la herramienta más completa que hemos probado. Los informes EMG son muy valiosos clínicamente."
            name="Dra. Martínez"
            role="Terapeuta ocupacional · Barcelona" />
          <Testimonial
            quote="Mi hijo tiene ELA y ahora puede mandarnos mensajes por WhatsApp solo. Es increíble lo que ha cambiado nuestra vida."
            name="Ana L."
            role="Familiar cuidadora · Valencia" />
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[hsl(196_85%_22%)] text-primary-foreground p-10 sm:p-16 text-center relative overflow-hidden soft-shadow">
          <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Wifi className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-light mb-4">
              Listo para <span className="font-semibold">empezar</span>
            </h2>
            <p className="opacity-80 text-lg mb-8 max-w-lg mx-auto">
              Accede a MioAssist ahora mismo. Sin instalaciones, directo desde el navegador.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-primary font-bold text-lg hover:bg-white/90 transition-all"
            >
              <Keyboard className="w-5 h-5" />
              Abrir MioAssist
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-border/60 bg-card/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span>MioAssist © 2026</span>
          </div>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link to="/" className="hover:text-foreground transition-colors">Escritura</Link>
            <Link to="/profile" className="hover:text-foreground transition-colors">Perfil EMG</Link>
            <Link to="/practice" className="hover:text-foreground transition-colors">Práctica</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Aviso de Privacidad</Link>
            <Link to="/info" className="hover:text-foreground transition-colors">Información</Link>
            <Link to="/legal" className="hover:text-foreground transition-colors">Marco legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}