import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { Activity, User, Dumbbell, Keyboard, LogOut, Info, Scale, Shield, Lock } from "lucide-react";
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

export default function Header() {
  const { pathname } = useLocation();

  return (
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
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  active
                    ? "bg-card text-primary soft-shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Secure connection badge */}
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
  );
}