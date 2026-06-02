import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { useEMGPage } from "@/hooks/useEMGPage";
import {
  Info, Eye, Globe, FileText,
  Download, ChevronDown, ChevronUp,
  Heart, AlertTriangle, Lock, Accessibility
} from "lucide-react";
import { cn } from "@/lib/utils";

const STYLE_ACTIVE = {
  borderColor: "#38bdf8",
  boxShadow: "0 0 0 2px #38bdf8",
};

function InfoCard({ icon: Icon, title, summary, detail, color = "primary", isActive, expanded, onToggle }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent-foreground border-accent/30",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  };
  return (
    <div
      style={isActive ? STYLE_ACTIVE : {}}
      className="rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden transition-all"
    >
      <div className="p-6">
        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center mb-4 border", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/60 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
            {detail}
          </div>
        )}
      </div>
      <div className="px-6 pb-5">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? "Ocultar" : "Ver más"}
        </button>
      </div>
    </div>
  );
}

function DocCard({ title, preview, filename, isActive, onDownload }) {
  return (
    <div
      style={isActive ? STYLE_ACTIVE : {}}
      className="rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden flex flex-col transition-all"
    >
      <div className="px-6 pt-6 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-48 px-6 py-4">
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{preview}</pre>
      </div>
      <div className="px-6 pb-5 pt-3 border-t border-border/60">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Download className="w-4 h-4" />
          Descargar documento
        </button>
      </div>
    </div>
  );
}

const INFO_SECTIONS = [
  { icon: Heart, color: "emerald", title: "Ética del sistema", summary: "MioAssist está diseñado bajo principios éticos de beneficencia, no maleficencia, autonomía y justicia para personas con discapacidad motora.", detail: `MioAssist fue desarrollado siguiendo principios bioéticos fundamentales:\n\n• Beneficencia: El sistema busca mejorar la calidad de vida y autonomía del usuario.\n• No maleficencia: No se recopilan datos sin consentimiento explícito.\n• Autonomía: El usuario controla en todo momento sus datos y configuraciones.\n• Justicia: Diseñado para ser accesible a personas con movilidad reducida.\n\nEl sistema NO sustituye criterio médico ni diagnóstico clínico profesional.` },
  { icon: AlertTriangle, color: "amber", title: "Uso responsable — No diagnóstico", summary: "MioAssist es exclusivamente un sistema de asistencia para la comunicación. No realiza diagnósticos médicos ni sustituye evaluación de profesionales de salud.", detail: `ADVERTENCIA IMPORTANTE:\n\n• Este sistema es asistivo, NO diagnóstico.\n• Las métricas EMG son de referencia, no diagnóstico clínico.\n• Siempre consulte con su médico o terapeuta ocupacional.\n• No use MioAssist como sustituto de atención médica.\n• Los datos de señal EMG mostrados son indicativos.\n\nPara decisiones clínicas, acuda siempre a un profesional certificado de salud.` },
  { icon: Eye, color: "primary", title: "Privacidad y datos", summary: "Sus datos biométricos EMG y métricas clínicas son tratados como datos sensibles de salud, con máxima protección y solo compartidos con su autorización.", detail: `Tratamiento de datos personales sensibles:\n\n• Señales EMG: datos biométricos de uso exclusivo del sistema.\n• Métricas clínicas: velocidad, precisión, fatiga — solo para monitoreo.\n• Datos de escritura: usados para predicción local, no se transmiten sin permiso.\n\nUsted tiene derecho a:\n— Acceder a sus datos en cualquier momento.\n— Solicitar corrección o eliminación.\n— Revocar el consentimiento de compartir con médicos.` },
  { icon: Lock, color: "violet", title: "Seguridad del usuario", summary: "Implementamos medidas técnicas y organizativas para proteger su información sensible de salud durante toda su sesión.", detail: `Medidas de seguridad implementadas:\n\n• Conexión cifrada (HTTPS/TLS) en todas las comunicaciones.\n• Datos de sesión no persisten en servidores sin consentimiento.\n• Control de acceso por roles: usuario / médico / administrador.\n• Sesiones con tiempo de expiración automático.\n• Sin acceso de terceros sin autorización explícita.` },
  { icon: Accessibility, color: "accent", title: "Inclusión y accesibilidad", summary: "MioAssist está diseñado para ser accesible a personas con distintas capacidades, siguiendo estándares WCAG 2.1 y principios de diseño universal.", detail: `Compromisos de accesibilidad:\n\n• Diseño de alto contraste y tipografía legible.\n• Navegación por teclado y compatibilidad con lectores de pantalla.\n• Teclado virtual adaptativo para usuarios con movilidad reducida.\n• Interfaz personalizable según necesidades individuales.\n• Compatible con dispositivos de entrada alternativos (switches, EMG).` },
  { icon: Globe, color: "emerald", title: "Transferencia de datos médicos", summary: "Solo con su autorización explícita, sus datos pueden compartirse con su médico o terapeuta para monitoreo clínico.", detail: `Política de transferencia de datos:\n\n¿Qué se puede compartir?\n— Métricas de sesión (velocidad, precisión, fatiga EMG).\n— Tiempo de uso y progreso en ejercicios.\n— Informes clínicos generados.\n\n¿A quién?\n— Solo al profesional de salud que usted autorice.\n— Nunca a terceros comerciales.` },
];

const DOC_NORMATIVIDAD = `ANÁLISIS DE NORMATIVIDAD Y SUSTENTABILIDAD\nMioAssist — Sistema de Escritura Asistida por EMG\nVersión 1.0 · Abril 2026`;
const DOC_GUIA = `GUÍA DE USO DEL SISTEMA\nMioAssist — Escritura Asistida por EMG\nVersión 1.0 · Abril 2026`;

// Bloques: 6 InfoCards + 2 DocCards = 8 bloques
const TOTAL_BLOCKS = INFO_SECTIONS.length + 2;

export default function InfoPage() {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (idx) => setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const { activeBlock } = useEMGPage({
    blockCount: TOTAL_BLOCKS,
    onBlockAction: (idx) => {
      if (idx < INFO_SECTIONS.length) {
        toggleCard(idx);
      } else {
        // DocCards — descargar
        const docIdx = idx - INFO_SECTIONS.length;
        if (docIdx === 0) handleDownload(DOC_NORMATIVIDAD, "MioAssist_Normatividad_2026.txt");
        else handleDownload(DOC_GUIA, "MioAssist_Guia_Uso_2026.txt");
      }
    },
    wsUrl: "ws://192.168.4.1:8081",
    ownerId: "infopage",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 lg:py-12">

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Centro de información</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ética · Privacidad · Seguridad · Accesibilidad</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-3">
            Información <span className="font-semibold">importante</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            MioAssist opera bajo principios éticos, legales y clínicos estrictos.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-amber-800 text-sm">Aviso importante</div>
            <div className="text-amber-700 text-sm mt-0.5">
              MioAssist es un sistema de <strong>asistencia para la comunicación</strong>, no un dispositivo de diagnóstico médico.
            </div>
          </div>
        </div>

        <section className="mb-14">
          <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" /> Secciones informativas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INFO_SECTIONS.map((s, i) => (
              <div key={s.title} id={`emg-block-${i}`}>
                <InfoCard
                  {...s}
                  isActive={activeBlock === i}
                  expanded={!!expandedCards[i]}
                  onToggle={() => toggleCard(i)}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Documentos
          </h3>
          <p className="text-sm text-muted-foreground mb-5">Documentos técnicos y guías disponibles para descarga.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: "Análisis de Normatividad y Sustentabilidad", text: DOC_NORMATIVIDAD, filename: "MioAssist_Normatividad_2026.txt" },
              { title: "Guía de uso del sistema", text: DOC_GUIA, filename: "MioAssist_Guia_Uso_2026.txt" },
            ].map((doc, i) => (
              <div key={doc.title} id={`emg-block-${INFO_SECTIONS.length + i}`}>
                <DocCard
                  title={doc.title}
                  preview={doc.text}
                  filename={doc.filename}
                  isActive={activeBlock === INFO_SECTIONS.length + i}
                  onDownload={() => handleDownload(doc.text, doc.filename)}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}