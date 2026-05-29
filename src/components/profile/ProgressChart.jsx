import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

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
    <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 soft-shadow">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Progreso semanal</h3>
          <p className="text-sm text-muted-foreground">Precisión y velocidad de escritura</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Precisión (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">Velocidad (PPM)</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey="precision" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#gradPrec)" />
            <Area type="monotone" dataKey="speed" stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#gradSpeed)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}