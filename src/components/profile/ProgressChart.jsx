import React from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

// Lee sesiones de Practice guardadas en localStorage
function getPracticeData() {
  try {
    const raw = localStorage.getItem("mioassist_practice_sessions");
    if (!raw) return null;
    const sessions = JSON.parse(raw); // [{ day, precision, clicks }]
    return sessions.slice(-7); // últimas 7
  } catch {
    return null;
  }
}

const EMPTY_DATA = [
  { day: "Lun", precision: null, clicks: null },
  { day: "Mar", precision: null, clicks: null },
  { day: "Mié", precision: null, clicks: null },
  { day: "Jue", precision: null, clicks: null },
  { day: "Vie", precision: null, clicks: null },
  { day: "Sáb", precision: null, clicks: null },
  { day: "Dom", precision: null, clicks: null },
];

export default function ProgressChart() {
  const data = getPracticeData() || EMPTY_DATA;
  const hasData = data.some((d) => d.precision !== null);

  return (
    <div className="rounded-2xl border border-border/70 bg-card soft-shadow overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1 shrink-0">
        <div>
          <h3 className="text-xs font-semibold tracking-tight">Progreso en práctica</h3>
          <p className="text-[10px] text-muted-foreground">Precisión y activaciones por sesión</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">Precisión %</span></div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" /><span className="text-[10px] text-muted-foreground">Clicks</span></div>
        </div>
      </div>
      {!hasData ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Completa ejercicios en Práctica para ver tu progreso</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPrec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "10px" }} />
              <Area type="monotone" dataKey="precision" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#gradPrec)" />
              <Area type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#gradClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}