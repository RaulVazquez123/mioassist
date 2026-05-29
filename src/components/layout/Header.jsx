import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { Activity, User, Dumbbell, Keyboard, LogOut, Info, Scale, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { to: "/",         label: "Escritura",   icon: Keyboard },
  { to: "/profile",  label: "Perfil EMG",  icon: User },
  { to: "/practice", label: "Práctica",    icon: Dumbbell },
  { to: "/info",     label: "Información", icon: Info },
  { to: "/legal",    label: "Marco legal", icon: Scale },
  { to: "/privacy",  label: "Privacidad",  icon: Shield },
];

export default function Header({ zona, headerIndex = 0 }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // App.jsx detecta user=null y muestra AuthPage automáticamente
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-24 flex items-center justify-between gap-5">

        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-4 group text-left shrink-0"
        >
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

        {/* Nav */}
        <nav className="flex items-center gap-1.5 p-1.5 rounded-full bg-secondary/70 border border-border/60">
          {navItems.map(({ to, label, icon: Icon }, i) => {
            const active   = pathname === to;
            const selected = zona === "header" && headerIndex === i;
            return (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-medium transition-all border",
                  active
                    ? "bg-card text-primary soft-shadow border-transparent"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                  selected && "border-accent ring-2 ring-accent/40"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Derecha: señal + usuario + logout */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* Señal EMG */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-border/60 soft-shadow">
            <Activity className="w-4.5 h-4.5 text-accent" />
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              Señal 74%
            </span>
          </div>

          {/* Nombre del usuario + cerrar sesión */}
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
                title="Cerrar sesión"
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
  );
}