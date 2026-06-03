import React, { useState, useRef, useEffect } from "react";
import NavBar, { navItems } from "@/components/layout/NavBar";
import {
  Info, Eye, Globe, FileText,
  Download, Heart, AlertTriangle, Lock, Accessibility, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const WS_URL = "ws://192.168.4.1:8081";
const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 3px #38bdf8", backgroundColor: "#e0f2fe" };

function useEMGSimple(wsUrl, onDer, onIzq) {
  const ws = useRef(null);
  const cbRef = useRef({ onDer, onIzq });
  cbRef.current = { onDer, onIzq };
  useEffect(() => {
    let last = 0;
    const DEBOUNCE = 800;
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (e) => {
      const now = Date.now();
      if (now - last < DEBOUNCE) return;
      try {
        const data = JSON.parse(e.data);
        const izq = data.izq?.click === 1;
        const der = data.der?.click === 1;
        if (!izq && !der) return;
        if (izq && der) return;
        last = now;
        if (der) cbRef.current.onDer();
        if (izq) cbRef.current.onIzq();
      } catch {}
    };
    ws.current.onerror = () => {};
    ws.current.onclose = () => {};
    return () => ws.current?.close();
  }, [wsUrl]);
}

function ConfirmDialog({ title, subtitle, onConfirm, onCancel, confirmOption, confirmLabel = "✅ Ver más", cancelLabel = "❌ Cancelar" }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl border border-border p-5 max-w-xs w-full soft-shadow text-center space-y-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        <div className="flex gap-2">
          <button onClick={onConfirm} style={confirmOption === 0 ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">{confirmLabel}</button>
          <button onClick={onCancel} style={confirmOption === 1 ? { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}

function CardModal({ section, onClose }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent-foreground border-accent/30",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  };
  const Icon = section.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-card rounded-2xl border border-border soft-shadow w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border shrink-0", colorMap[section.color])}>
              <Icon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold">{section.title}</h2>
          </div>
          <button onClick={onClose}
            style={{ backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 font-semibold transition-all text-sm">
            <X className="w-4 h-4" /> Cerrar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{section.summary}</p>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">{section.detail}</div>
        </div>
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
const TOTAL_BLOCKS = 9;

export default function InfoPage() {
  const navigate = useNavigate();
  const [activeBlock, setActiveBlock] = useState(1);
  const [navBloqueada, setNavBloqueada] = useState(false);
  const [navIdx, setNavIdx] = useState(0);
  const [navConfirmOpen, setNavConfirmOpen] = useState(false);
  const [navConfirmOption, setNavConfirmOption] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOption, setConfirmOption] = useState(0);
  const [modalSection, setModalSection] = useState(null);
  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [downloadConfirmOption, setDownloadConfirmOption] = useState(0);

  const stateRef = useRef({});
  stateRef.current = { activeBlock, navBloqueada, navIdx, navConfirmOpen, navConfirmOption, confirmOpen, confirmOption, modalSection, downloadConfirmOpen, downloadConfirmOption };

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  useEMGSimple(WS_URL,
    () => {
      const s = stateRef.current;
      if (s.modalSection !== null) return;
      if (s.navConfirmOpen) { setNavConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.confirmOpen) { setConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.downloadConfirmOpen) { setDownloadConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.activeBlock === 0 && s.navBloqueada) { setNavIdx((i) => (i + 1 >= navItems.length ? 0 : i + 1)); return; }
      setActiveBlock((b) => (b + 1) % TOTAL_BLOCKS);
    },
    () => {
      const s = stateRef.current;
      if (s.modalSection !== null) { setModalSection(null); return; }
      if (s.navConfirmOpen) {
        if (s.navConfirmOption === 0) navigate(navItems[s.navIdx].to);
        else { setNavConfirmOpen(false); setNavConfirmOption(0); }
        return;
      }
      if (s.confirmOpen) {
        if (s.confirmOption === 0) { setModalSection(s.activeBlock - 1); setConfirmOpen(false); setConfirmOption(0); }
        else { setConfirmOpen(false); setConfirmOption(0); }
        return;
      }
      if (s.downloadConfirmOpen) {
        if (s.downloadConfirmOption === 0) {
          const docIdx = s.activeBlock - INFO_SECTIONS.length - 1;
          if (docIdx === 0) handleDownload(DOC_NORMATIVIDAD, "MioAssist_Normatividad_2026.txt");
          else handleDownload(DOC_GUIA, "MioAssist_Guia_Uso_2026.txt");
          setDownloadConfirmOpen(false); setDownloadConfirmOption(0);
        } else { setDownloadConfirmOpen(false); setDownloadConfirmOption(0); }
        return;
      }
      if (s.activeBlock === 0) {
        if (!s.navBloqueada) { setNavBloqueada(true); setNavIdx(0); }
        else { setNavConfirmOpen(true); setNavConfirmOption(0); }
        return;
      }
      if (s.activeBlock >= 1 && s.activeBlock <= INFO_SECTIONS.length) { setConfirmOpen(true); setConfirmOption(0); return; }
      if (s.activeBlock > INFO_SECTIONS.length) { setDownloadConfirmOpen(true); setDownloadConfirmOption(0); }
    }
  );

  useEffect(() => { if (activeBlock !== 0) { setNavBloqueada(false); setNavIdx(0); } }, [activeBlock]);
  useEffect(() => {
    const id = activeBlock === 0 ? "emg-navbar" : `emg-block-${activeBlock}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeBlock]);

  const navActive = activeBlock === 0;
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent-foreground border-accent/30",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  };

  return (
    <div className="min-h-screen bg-background">
      {modalSection !== null && <CardModal section={INFO_SECTIONS[modalSection]} onClose={() => setModalSection(null)} />}
      {navConfirmOpen && <ConfirmDialog title={navItems[navIdx].label} subtitle="¿Ir a esta sección?" confirmOption={navConfirmOption} confirmLabel="✅ Confirmar" onConfirm={() => navigate(navItems[navIdx].to)} onCancel={() => { setNavConfirmOpen(false); setNavConfirmOption(0); }} />}
      {confirmOpen && activeBlock >= 1 && activeBlock <= INFO_SECTIONS.length && (
        <ConfirmDialog title={INFO_SECTIONS[activeBlock - 1].title} subtitle="¿Quieres leer más?" confirmOption={confirmOption}
          onConfirm={() => { setModalSection(activeBlock - 1); setConfirmOpen(false); setConfirmOption(0); }}
          onCancel={() => { setConfirmOpen(false); setConfirmOption(0); }} />
      )}
      {downloadConfirmOpen && (
        <ConfirmDialog title="Descargar documento" subtitle="¿Quieres descargar este documento?" confirmOption={downloadConfirmOption} confirmLabel="✅ Descargar"
          onConfirm={() => {
            const docIdx = activeBlock - INFO_SECTIONS.length - 1;
            if (docIdx === 0) handleDownload(DOC_NORMATIVIDAD, "MioAssist_Normatividad_2026.txt");
            else handleDownload(DOC_GUIA, "MioAssist_Guia_Uso_2026.txt");
            setDownloadConfirmOpen(false); setDownloadConfirmOption(0);
          }}
          onCancel={() => { setDownloadConfirmOpen(false); setDownloadConfirmOption(0); }} />
      )}

      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 py-5 space-y-4">

        <div id="emg-navbar" style={navActive ? { outline: "3px solid #38bdf8", outlineOffset: "4px", borderRadius: "1rem", backgroundColor: "#e0f2fe" } : {}}>
          <NavBar bloqueada={navBloqueada} selectedIdx={navIdx} />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Centro de información</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Ética · Privacidad · Seguridad · Accesibilidad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight">Información <span className="font-semibold">importante</span></h2>
          <p className="text-muted-foreground mt-0.5 text-sm">MioAssist opera bajo principios éticos, legales y clínicos estrictos.</p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-2.5 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700"><strong className="text-amber-800">Aviso importante —</strong> MioAssist es un sistema de <strong>asistencia para la comunicación</strong>, no un dispositivo de diagnóstico médico.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2.5 flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-primary" /> Secciones informativas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INFO_SECTIONS.map((s, i) => {
              const blockIdx = i + 1;
              const isActive = activeBlock === blockIdx;
              const Icon = s.icon;
              return (
                <div key={s.title} id={`emg-block-${blockIdx}`}
                  style={isActive ? STYLE_ACTIVE : {}}
                  className="rounded-2xl border border-border/70 bg-card soft-shadow p-4 flex flex-col gap-2.5 transition-all cursor-pointer hover:border-accent/50"
                  onClick={() => setModalSection(i)}>
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border shrink-0", colorMap[s.color])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{s.summary}</p>
                  <span className="text-xs font-semibold text-primary">Ver más →</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary" /> Documentos</h3>
          <p className="text-xs text-muted-foreground mb-2.5">Documentos técnicos y guías disponibles para descarga.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: "Análisis de Normatividad y Sustentabilidad", text: DOC_NORMATIVIDAD, filename: "MioAssist_Normatividad_2026.txt" },
              { title: "Guía de uso del sistema", text: DOC_GUIA, filename: "MioAssist_Guia_Uso_2026.txt" },
            ].map((doc, i) => {
              const blockIdx = INFO_SECTIONS.length + 1 + i;
              const isActive = activeBlock === blockIdx;
              return (
                <div key={doc.title} id={`emg-block-${blockIdx}`}
                  style={isActive ? STYLE_ACTIVE : {}}
                  className="rounded-2xl border border-border/70 bg-card soft-shadow px-4 py-3 flex items-center justify-between gap-3 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{doc.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Versión 1.0 · Abril 2026</div>
                    </div>
                  </div>
                  <button onClick={() => handleDownload(doc.text, doc.filename)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shrink-0">
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}