import React from "react";

// Animated EMG-like live bars, purely decorative
export default function EMGStatusBar() {
  const bars = Array.from({ length: 28 });
  return (
    <div className="flex items-center gap-[3px] h-6" aria-hidden>
      {bars.map((_, i) => (
        <span
          key={i}
          className="emg-bar w-[3px] rounded-full bg-gradient-to-t from-primary/60 to-accent"
          style={{
            height: `${20 + ((i * 37) % 80)}%`,
            animationDelay: `${(i % 10) * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}