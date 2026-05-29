import React from "react";

/**
 * MioAssist Logo — Músculo + Teclado inteligente
 *
 * Concepto visual:
 * - Tile exterior = tecla de teclado (rectángulo redondeado con borde y sombra inferior de tecla)
 * - Interior: 3 fibras musculares paralelas ligeramente curvadas (forma orgánica del músculo)
 *   que se transforman / convergen en mini-teclas cuadradas a la derecha
 * - La transición fibras→teclas representa la integración EMG→escritura
 * - Sin ondas tipo ECG, sin corazón, puramente muscular + tecnológico
 */
export default function Logo({ size = 40, className = "" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      aria-label="MioAssist"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lg-key" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
          <linearGradient id="lg-fiber" x1="0" y1="30" x2="60" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="65%" stopColor="hsl(var(--accent))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── Keyboard key tile (outer shell) ── */}
        {/* Main face */}
        <rect x="2" y="2" width="56" height="52" rx="13"
          fill="hsl(var(--card))"
          stroke="url(#lg-key)"
          strokeWidth="2"
        />
        {/* Key depth shadow (bottom strip — simulates physical key) */}
        <rect x="2" y="47" width="56" height="7" rx="8"
          fill="url(#lg-key)"
          opacity="0.18"
        />

        {/* ── Muscle fibers (left half): 3 curved parallel strands ── */}
        {/* Each fiber curves slightly, mimicking fascicle bundles */}
        {/* Fiber 1 — top */}
        <path
          d="M 8 20 C 14 18, 20 19, 26 20"
          stroke="url(#lg-fiber)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Fiber 2 — mid */}
        <path
          d="M 6 28 C 13 26, 20 27, 26 28"
          stroke="url(#lg-fiber)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Fiber 3 — bottom */}
        <path
          d="M 8 36 C 14 38, 20 37, 26 36"
          stroke="url(#lg-fiber)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Vertical divider: fibers → keys transition ── */}
        <line x1="29" y1="14" x2="29" y2="42"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* ── Mini keyboard keys (right half): 2×3 grid ── */}
        {/* Row 1 */}
        <rect x="32" y="15" width="10" height="9" rx="2.5"
          fill="hsl(var(--primary))" opacity="0.15"
          stroke="url(#lg-key)" strokeWidth="1.2"
        />
        <rect x="45" y="15" width="10" height="9" rx="2.5"
          fill="hsl(var(--primary))" opacity="0.08"
          stroke="url(#lg-key)" strokeWidth="1.2"
        />
        {/* Row 2 */}
        <rect x="32" y="27" width="10" height="9" rx="2.5"
          fill="hsl(var(--accent))" opacity="0.25"
          stroke="url(#lg-key)" strokeWidth="1.5"
        />
        <rect x="45" y="27" width="10" height="9" rx="2.5"
          fill="hsl(var(--primary))" opacity="0.08"
          stroke="url(#lg-key)" strokeWidth="1.2"
        />
        {/* Row 3 — wide spacebar key */}
        <rect x="32" y="39" width="23" height="7" rx="2.5"
          fill="hsl(var(--primary))" opacity="0.1"
          stroke="url(#lg-key)" strokeWidth="1.2"
        />

        {/* ── Active key highlight dot (center of accent key) ── */}
        <circle cx="37" cy="31.5" r="2" fill="hsl(var(--accent))" />
      </svg>
    </div>
  );
}