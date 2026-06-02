import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { Activity, User, Dumbbell, Keyboard, LogOut, Info, Scale, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useEMG } from "@/lib/EMGContext";

const navItems = [
  { to: "/",         label: "Escritura",   icon: Keyboard },
  { to: "/profile",  label: "Perfil EMG",  icon: User },
  { to: "/practice", label: "Práctica",    icon: Dumbbell },
  { to: "/info",     label: "Información", icon: Info },
  { to: "/legal",    label: "Marco legal", icon: Scale },
  { to: "/privacy",  label: "Privacidad",  icon: Shield },
];

const STYLE_CONFIRM_OK = { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" };
const STYLE_CONFIRM_NO = { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" };

export default function Header({ zona, headerIndex = 0 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isWriter = pathname === "/";

  const [emgIndex, setEmgIndex] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOption, setConfirmOption] = useState(0);

  const { claimEMG, releaseEMG } = useEMG();
  const stateRef = useRef({});
  stateRef.current = { emgIndex, confirmOpen, confirmOption };

  useEffect(() => {
    if (isWriter) { releaseEMG("header"); return; }

    console.log("[EMG] Header haciendo claimEMG"); claimEMG("header",
      () => {
        const { confirmOpen } = stateRef.current;
        if (confirmOpen) { setConfirmOption((o) => o === 0 ? 1 : 0); return; }
        setEmgIndex((i) => i === null ? 0 : (i + 1) % navItems.length);
      },
      () => {
        const { emgIndex, confirmOpen, confirmOption } = stateRef.current;
        if (confirmOpen) {
          if (confirmOption === 0) {
            navigate(navItems[emgIndex].to);
            setConfirmOpen(false);
            setEmgIndex(null);
          } else {
            setConfirmOpen(false);
            setConfirmOption(0);
          }
          return;
        }
        if (emgIndex !== null) { setConfirmOpen(true); setConfirmOption(0); }
      }
    );
  }, [isWriter, pathname]);

  const handleLogout = () => logout();

  const activeEmgIndex = isWriter ? headerIndex : emgIndex;
  const activeZona = isWriter ? zona : (emgIndex !== null ? "header" : null);

  return (
    <>
      {confirmOpen && emgIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-card rounded-3xl border border-border p-8 max-w-sm w-full soft-shadow text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              {React.createElement(navItems[emgIndex].icon, { className: "w-6 h-6 text-primary" })}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{navItems[emgIndex].label}</h3>
              <p className="text-sm text-muted-foreground mt-1">¿Ir a esta sección?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { navigate(navItems[emgIndex].to); setConfirmOpen(false); setEmgIndex(null); }}
                style={confirmOption === 0 ? STYLE_CONFIRM_OK : {}}
                className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all"
              >✅ Confirmar</button>
              <button
                onClick={() => { setConfirmOpen(false); setConfirmOption(0); }}
                style={confirmOption === 1 ? STYLE_CONFIRM_NO : {}}
                className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all"
              >❌ Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-24 flex items-center justify-between gap-5">

          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-4 group text-left shrink-0">
            <Logo size={56} />
            <div className="leading-tight">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Mio<span className="text-primary">Assist</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground bg-accent/20 border border-accent/30 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  EMG live
                </span>
              </div>
              <p className="text-sm text-muted-foreground hidden sm:block mt-1">
                Asistencia inteligente para escritura mediante EMG
              </p>
            </div>
          </button>

          <nav className="flex items-center gap-1.5 p-1.5 rounded-full bg-secondary/70 border border-border/60">
            {navItems.map(({ to, label, icon: Icon }, i) => {
              const active   = pathname === to;
              const selected = activeZona === "header" && activeEmgIndex === i;
              return (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  style={selected ? { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", backgroundColor: "#7dd3fc", color: "#0f172a" } : {}}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-medium transition-all border border-transparent",
                    active && !selected ? "bg-card text-primary soft-shadow" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border/60 soft-shadow">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium tabular-nums text-muted-foreground">Señal 74%</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border/60 soft-shadow">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.nombre?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user.nombre?.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border/60 bg-card text-sm font-medium text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all soft-shadow"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Salir</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  );
}