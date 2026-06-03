import React from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

const DATA = [
  { day: "Lun", precision: 72, speed: 14 },
  { day: "Mar", precision: 75, speed: 16 },
  { day: "Mié", precision: 78, speed: 17 },
  { day: "Jue", precision: 81, speed: 19 },
  { day: "Vie", precision: 84, speed: 21 },
  { day: "Sáb", precision: 86, speed: 22 },
  { day: "Dom", precision: 89, speed: 24 },
];

export default function ProgressChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card soft-shadow overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1 shrink-0">
        <div>
          <h3 className="text-xs font-semibold tracking-tight">Progreso semanal</h3>
          <p className="text-[10px] text-muted-foreground">Precisión y velocidad</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">Precisión</span></div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" /><span className="text-[10px] text-muted-foreground">Velocidad</span></div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 5, right: 0, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPrec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSpeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "10px" }} />
            <Area type="monotone" dataKey="precision" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#gradPrec)" />
            <Area type="monotone" dataKey="speed" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#gradSpeed)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}