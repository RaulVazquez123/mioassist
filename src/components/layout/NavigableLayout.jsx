// src/components/layout/NavigableLayout.jsx
// Wrapper que agrega navegación por flechas a cualquier página
// Uso: <NavigableLayout items={[...]}>{children}</NavigableLayout>

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export default function NavigableLayout({ children, cards = [] }) {
  const navigate = useNavigate();
  const [headerIdx, setHeaderIdx]   = useState(0);
  const [cardIdx, setCardIdx]       = useState(0);
  const [zona, setZona]             = useState("header"); // "header" | "cards"

  const HEADER_ROUTES = ["/", "/", "/profile", "/practice"];

  useEffect(() => {
    const onKey = (e) => {
      if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter"].includes(e.key)) return;
      e.preventDefault();

      if (zona === "header") {
        if (e.key === "ArrowLeft")  setHeaderIdx((i) => Math.max(0, i - 1));
        if (e.key === "ArrowRight") setHeaderIdx((i) => Math.min(3, i + 1));
        if (e.key === "ArrowDown")  { setZona("cards"); setCardIdx(0); }
        if (e.key === "Enter") {
          navigate(HEADER_ROUTES[headerIdx]);
        }
      } else {
        // zona cards
        if (e.key === "ArrowUp" && cardIdx === 0) { setZona("header"); return; }
        if (e.key === "ArrowDown")  setCardIdx((i) => Math.min(cards.length - 1, i + 1));
        if (e.key === "ArrowUp")    setCardIdx((i) => Math.max(0, i - 1));
        if (e.key === "ArrowLeft")  setCardIdx((i) => Math.max(0, i - 1));
        if (e.key === "ArrowRight") setCardIdx((i) => Math.min(cards.length - 1, i + 1));
        if (e.key === "Enter") {
          const card = cards[cardIdx];
          if (card?.onEnter) card.onEnter();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zona, headerIdx, cardIdx, cards, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header zona={zona === "header" ? "header" : undefined} headerIndex={headerIdx} />
      {/* Indicador de navegación */}
      {zona === "cards" && cards.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-3">
          <span className="opacity-70">↑↓ navegar</span>
          <span className="w-px h-3 bg-white/30" />
          <span className="opacity-70">Enter expandir</span>
          <span className="w-px h-3 bg-white/30" />
          <span className="font-medium text-accent">
            {cardIdx + 1} / {cards.length}
          </span>
        </div>
      )}
      {/* Renderizar children pasando selectedIndex */}
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { selectedIndex: zona === "cards" ? cardIdx : -1 })
          : child
      )}
    </div>
  );
}