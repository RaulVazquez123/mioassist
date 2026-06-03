import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Volume2, Twitter, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STYLE_DEFAULT  = {};
const STYLE_SELECTED = { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", color: "#0f172a", boxShadow: "0 0 0 2px #38bdf8" };

export default function ActionBar({ text, emgZona, emgActionIndex }) {
  const [copied, setCopied] = React.useState(false);
  const disabled = !text.trim();

  const handleCopy = async () => {
    if (disabled) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Texto copiado");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleWhatsApp = () => {
    if (disabled) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleTwitter = () => {
    if (disabled) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownload = () => {
    if (disabled) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mioassist-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Texto descargado");
  };

  const handleSpeak = () => {
    if (disabled) return;
    if (!("speechSynthesis" in window)) { toast.error("Tu navegador no soporta lectura en voz"); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  const actions = [
    { key: "copy", label: copied ? "Copiado" : "Copiar", icon: copied ? Check : Copy, onClick: handleCopy, tone: "default" },
    { key: "wa",   label: "WhatsApp",      icon: MessageCircle, onClick: handleWhatsApp, tone: "green" },
    { key: "x",    label: "Publicar en X", icon: Twitter,       onClick: handleTwitter,  tone: "default" },
    { key: "dl",   label: "Descargar",     icon: Download,      onClick: handleDownload, tone: "default" },
    { key: "tts",  label: "Leer en voz",   icon: Volume2,       onClick: handleSpeak,    tone: "accent" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {actions.map(({ key, label, icon: Icon, onClick, tone }, i) => {
        const isSelected = emgZona === "actions" && emgActionIndex === i;
        return (
          <Button
            key={key}
            onClick={onClick}
            disabled={disabled}
            variant="outline"
            size="sm"
            style={isSelected ? STYLE_SELECTED : STYLE_DEFAULT}
            className={cn(
              "h-8 px-3 rounded-xl border-border/70 bg-card hover:bg-secondary transition-all soft-shadow text-xs",
              tone === "accent" && "hover:border-accent hover:text-accent-foreground",
              tone === "green"  && "hover:border-emerald-500/50 hover:text-emerald-600",
            )}
          >
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            <span className="font-medium">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}