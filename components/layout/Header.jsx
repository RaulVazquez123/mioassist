import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { Activity, User, Dumbbell, Keyboard, LogOut, Info, Scale, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

const navItems = [
  { to: "/landing", label: "Inicio", icon: Activity },
  { to: "/", label: "Escritura", icon: Keyboard },
  { to: "/profile", label: "Perfil EMG", icon: User },
  { to: "/practice", label: "Práctica", icon: Dumbbell },
  { to: "/info", label: "Información", icon: Info },
  { to: "/legal", label: "Marco legal", icon: Scale },
];

const STYLE_SELECTED = {
  borderColor: "#38bdf8",
  boxShadow: "0 0 0 2px #38bdf8",
  backgroundColor: "#7dd3fc",
  color: "#0f172a",
};

const STYLE_CONFIRM_OK  = { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" };
const STYLE_CONFIRM_NO  = { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" };

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isWriter = pathname === "/";

  const [navIndex, setNavIndex] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOption, setConfirmOption] = useState(0); // 0=Confirmar, 1=Cancelar

  const ws = useRef(null);
  const stateRef = useRef({});
  stateRef.current = { navIndex, confirmOpen, confirmOption, isWriter };

  useEffect(() => {
    if (isWriter) return; // Writer maneja su propia navegación EMG

    let ultimaAccion = 0;
    const DEBOUNCE_MS = 800;

    ws.current = new WebSocket("ws://192.168.4.1:8081");

    ws.current.onmessage = (event) => {
      const ahora = Date.now();
      if (ahora - ultimaAccion < DEBOUNCE_MS) return;
      try {
        const data = JSON.parse(event.data);
        const clickIzq = data.izq?.click === 1;
        const clickDer = data.der?.click === 1;
        if (!clickIzq && !clickDer) return;
        if (clickIzq && clickDer) return;
        ultimaAccion = ahora;

        const { navIndex, confirmOpen, confirmOption } = stateRef.current;

        if (!confirmOpen) {
          if (clickDer) {
            setNavIndex((i) => {
              if (i === null) return 0;
              return (i + 1) % navItems.length;
            });
          }
          if (clickIzq && navIndex !== null) {
            setConfirmOpen(true);
            setConfirmOption(0);
          }
        } else {
          if (clickDer) {
            setConfirmOption((o) => o === 0 ? 1 : 0);
          }
          if (clickIzq) {
            if (confirmOption === 0) {
              navigate(navItems[navIndex].to);
              setConfirmOpen(false);
              setNavIndex(null);
            } else {
              setConfirmOpen(false);
              setConfirmOption(0);
            }
          }
        }
      } catch (e) {}
    };

    ws.current.onerror = () => {};
    ws.current.onclose = () => {};
    return () => ws.current?.close();
  }, [isWriter, pathname]);

  return (
    <>
      {/* Confirm dialog */}
      {confirmOpen && navIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-card rounded-3xl border border-border p-8 max-w-sm w-full soft-shadow text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              {React.createElement(navItems[navIndex].icon, { className: "w-6 h-6 text-primary" })}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{navItems[navIndex].label}</h3>
              <p className="text-sm text-muted-foreground mt-1">¿Ir a esta sección?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { navigate(navItems[navIndex].to); setConfirmOpen(false); setNavIndex(null); }}
                style={confirmOption === 0 ? STYLE_CONFIRM_OK : {}}
                className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all"
              >
                ✅ Confirmar
              </button>
              <button
                onClick={() => { setConfirmOpen(false); setConfirmOption(0); }}
                style={confirmOption === 1 ? STYLE_CONFIRM_NO : {}}
                className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size={44} />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  Mio<span className="text-primary">Assist</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-accent-foreground bg-accent/20 border border-accent/30 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  EMG live
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Asistencia inteligente para escritura mediante EMG
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 p-1 rounded-full bg-secondary/70 border border-border/60">
            {navItems.map(({ to, label, icon: Icon }, idx) => {
              const active = pathname === to;
              const emgSelected = !isWriter && navIndex === idx;
              return (
                <Link
                  key={to}
                  to={to}
                  style={emgSelected ? STYLE_SELECTED : {}}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border-2 border-transparent",
                    active ? "bg-card text-primary soft-shadow" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 soft-shadow">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Datos protegidos</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 soft-shadow">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                Señal 74%
              </span>
            </div>
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/60 soft-shadow text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}