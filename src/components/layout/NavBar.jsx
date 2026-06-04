import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { User, Dumbbell, Keyboard, LogOut, Info, Scale, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useEMG } from "@/lib/EMGContext";

export const navItems = [
  { to: "/writer",   label: "Escritura",   icon: Keyboard },
  { to: "/profile",  label: "Perfil EMG",  icon: User },
  { to: "/practice", label: "Práctica",    icon: Dumbbell },
  { to: "/info",     label: "Información", icon: Info },
  { to: "/legal",    label: "Marco legal", icon: Scale },
  { to: "/privacy",  label: "Privacidad",  icon: Shield },
];

export default function NavBar({ bloqueada = false, selectedIdx = 0 }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { connected } = useEMG();

  return (
    <header className="border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

        <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2 group text-left shrink-0">
          <Logo size={36} />
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold tracking-tight">Mio<span className="text-primary">Assist</span></h1>
              <span className={cn("hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border", connected ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-700" : "bg-red-500/20 border-red-500/40 text-red-700")}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )} />
                {connected ? "EMG live" : "EMG off"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">Asistencia inteligente para escritura mediante EMG</p>
          </div>
        </button>

        <nav className="flex items-center gap-1 p-1 rounded-full bg-secondary/70 border border-border/60">
          {navItems.map(({ to, label, icon: Icon }, i) => {
            const active = pathname === to;
            const selected = bloqueada && selectedIdx === i;
            return (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                style={selected ? { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", backgroundColor: "#7dd3fc", color: "#0f172a" } : {}}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border border-transparent",
                  active && !selected ? "bg-card text-primary soft-shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {user && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card border border-border/60 soft-shadow">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.nombre?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-xs font-medium text-foreground max-w-[100px] truncate">{user.nombre?.split(" ")[0]}</span>
              </div>
              <button onClick={logout} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border/60 bg-card text-xs font-medium text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all soft-shadow">
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