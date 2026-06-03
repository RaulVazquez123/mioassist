import React, { useState, useRef, useEffect } from "react";
import NavBar, { navItems } from "@/components/layout/NavBar";
import { Scale, ShieldCheck, Cpu, FileCheck, Globe, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const WS_URL = "ws://192.168.4.1:8081";
const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 3px #38bdf8", backgroundColor: "#e0f2fe" };
const STYLE_BTN_ACTIVE = { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" };

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

function ConfirmDialog({ title, subtitle, onConfirm, onCancel, confirmOption }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl border border-border p-5 max-w-xs w-full soft-shadow text-center space-y-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        <div className="flex gap-2">
          <button onClick={onConfirm} style={confirmOption === 0 ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">✅ Ver más</button>
          <button onClick={onCancel} style={confirmOption === 1 ? { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" } : {}} className="flex-1 h-9 rounded-xl border-2 border-border font-semibold text-xs transition-all">❌ Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function CardModal({ reg, onClose, modalBtn, setModalBtn }) {
  const scrollRef = useRef(null);
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    sky: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    rose: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };
  const Icon = reg.icon;

  const handleSelect = () => {
    if (modalBtn === 0) onClose();
    if (modalBtn === 1) scrollRef.current?.scrollBy({ top: -200, behavior: "smooth" });
    if (modalBtn === 2) scrollRef.current?.scrollBy({ top: 200, behavior: "smooth" });
  };
  useEffect(() => { CardModal._handleSelect = handleSelect; });

  const btnStyle = (idx) => modalBtn === idx ? STYLE_BTN_ACTIVE : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-card rounded-2xl border border-border soft-shadow w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", colorMap[reg.color])}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-muted-foreground">{reg.code}</div>
              <h2 className="text-sm font-semibold leading-snug">{reg.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => { setModalBtn(1); scrollRef.current?.scrollBy({ top: -200, behavior: "smooth" }); }}
              style={btnStyle(1)} className="w-9 h-9 rounded-xl border-2 border-border flex items-center justify-center transition-all">
              <ChevronUp className="w-4 h-4" />
            </button>
            <button onClick={() => { setModalBtn(2); scrollRef.current?.scrollBy({ top: 200, behavior: "smooth" }); }}
              style={btnStyle(2)} className="w-9 h-9 rounded-xl border-2 border-border flex items-center justify-center transition-all">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button onClick={onClose} style={btnStyle(0)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-border font-semibold text-xs transition-all">
              <X className="w-3.5 h-3.5" /> Cerrar
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3 text-sm leading-relaxed">
          <p className="text-muted-foreground">{reg.summary}</p>
          <div className="text-foreground whitespace-pre-line text-xs leading-relaxed">{reg.detail}</div>
        </div>
        <div className="px-5 py-2.5 border-t border-border/60 shrink-0">
          <p className="text-[10px] text-muted-foreground text-center">Derecha → cicla botones · Izquierda → ejecuta seleccionado</p>
        </div>
      </div>
    </div>
  );
}

const REGULATIONS = [
  { icon: ShieldCheck, color: "emerald", code: "COFEPRIS", scope: "México", title: "Comisión Federal para la Protección contra Riesgos Sanitarios", summary: "MioAssist se clasifica como software de dispositivo médico (SaMD) clase II, sujeto a regulación sanitaria para su uso clínico en México.", detail: `Aplicabilidad a MioAssist:\n\nClasificación: Software como Dispositivo Médico (SaMD) Clase II.\nNorma aplicable: NOM-241-SSA1-2012 — Buenas Prácticas de Fabricación para Establecimientos dedicados a la Fabricación de Dispositivos Médicos.\n\nRequisitos para comercialización:\n• Registro sanitario ante COFEPRIS.\n• Etiquetado con leyendas de precaución y uso previsto.\n• Sistema de trazabilidad y farmacovigilancia (tecnovigilancia).\n• Documentación técnica del ciclo de vida del software.\n\nEstado actual de MioAssist:\n• En fase de desarrollo y validación clínica.\n• Se recomienda uso bajo supervisión de terapeuta certificado.\n• No disponible para prescripción clínica hasta obtener registro sanitario.` },
  { icon: Globe, color: "sky", code: "FDA 21 CFR", scope: "EE.UU.", title: "Food and Drug Administration — Software Medical Device", summary: "Bajo la guía de la FDA para SaMD, MioAssist se clasifica como dispositivo de baja prioridad de aplicación por ser asistivo y no diagnóstico.", detail: `Clasificación FDA para MioAssist:\n\nCategoría: Software como Dispositivo Médico (SaMD).\nRiesgo: Baja prioridad de aplicación normativa.\n\nJustificación:\n• Función asistiva de comunicación, NO diagnóstica.\n• No altera el estado clínico del paciente directamente.\n• No reemplaza decisiones de diagnóstico o tratamiento médico.\n\nReferencias normativas:\n• FDA Guidance: "Policy for Device Software Functions" (2019).\n• 21 CFR Part 11: Registros electrónicos y firmas electrónicas.\n• De Novo Classification si se añaden funciones diagnósticas.` },
  { icon: Scale, color: "violet", code: "ISO 14971:2019", scope: "Internacional", title: "Gestión de Riesgos para Dispositivos Médicos", summary: "Estándar internacional que define el proceso de identificación, evaluación y control de riesgos en el ciclo de vida del dispositivo médico.", detail: `Aplicación del ISO 14971 en MioAssist:\n\nProceso de gestión de riesgos:\n1. Identificación de peligros del sistema EMG.\n2. Estimación del riesgo (probabilidad × severidad).\n3. Evaluación: ¿el riesgo es aceptable?\n4. Control de riesgos (diseño, advertencias, información).\n5. Evaluación de riesgo residual.\n6. Revisión del beneficio-riesgo global.\n\nRiesgos identificados:\n• Fatiga muscular por uso prolongado → Control: alertas de descanso.\n• Dependencia excesiva → Control: aviso de uso complementario.\n• Error en predicción de texto → Control: siempre editable manualmente.\n• Privacidad de datos de salud → Control: cifrado y consentimiento.` },
  { icon: Cpu, color: "primary", code: "IEC 62304:2006+AMD1:2015", scope: "Internacional", title: "Software de Dispositivos Médicos — Ciclo de Vida", summary: "Estándar que define los procesos del ciclo de vida del software médico: desarrollo, mantenimiento, gestión de problemas y configuración.", detail: `Procesos IEC 62304 aplicados a MioAssist:\n\nClase de seguridad del software: Clase B.\n\nProcesos obligatorios:\n• SWD — Desarrollo de software.\n• SWM — Mantenimiento de software.\n• SWCM — Gestión de configuración.\n• SWPR — Gestión de problemas.\n• SWRM — Gestión de requisitos.\n\nArtefactos de documentación:\n→ Plan de desarrollo de software.\n→ Especificación de requisitos.\n→ Arquitectura del software.\n→ Plan de verificación y validación.\n→ Historial de versiones y cambios.` },
  { icon: FileCheck, color: "amber", code: "LFPDPPP", scope: "México", title: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares", summary: "Ley mexicana que regula el tratamiento de datos personales, incluyendo datos sensibles de salud como las señales EMG y métricas clínicas.", detail: `Aplicación a MioAssist:\n\nDatos sensibles tratados (Art. 3, fracc. VI):\n• Señales EMG — datos biométricos.\n• Métricas de salud — velocidad, fatiga, precisión.\n• Información médica del paciente y terapeuta.\n\nObligaciones del Responsable:\n• Aviso de privacidad claro y accesible (Art. 15-16).\n• Consentimiento expreso para datos sensibles (Art. 9).\n• Implementar medidas de seguridad técnicas y organizativas (Art. 19).\n• Atender derechos ARCO en plazos establecidos (Art. 22-25).\n\nTransferencias:\n• Solo con consentimiento explícito del titular.\n• Excepciones: orden judicial o emergencia de salud pública.` },
  { icon: ShieldCheck, color: "rose", code: "LGS / NOM-004-SSA3-2012", scope: "México", title: "Ley General de Salud y Expediente Clínico", summary: "Marco legal que regula los servicios de salud, el expediente clínico y la confidencialidad de la información médica en México.", detail: `Relevancia para MioAssist:\n\nLey General de Salud (Art. 77 BIS):\n• Derecho del paciente a la confidencialidad de su información.\n• Prohibición de divulgar datos médicos sin consentimiento.\n\nNOM-004-SSA3-2012 — Expediente Clínico:\n• Los registros de sesión pueden formar parte del expediente.\n• Deben guardarse mínimo 5 años (pacientes adultos).\n• Acceso limitado a personal autorizado.\n\nDerechos del paciente (Art. 51 LGS):\n• Recibir información clara sobre su diagnóstico y tratamiento.\n• Decidir sobre procedimientos que afecten su integridad.\n• Rechazar el tratamiento sin consecuencias adversas.` },
];

const TOTAL_BLOCKS = 7;

export default function LegalPage() {
  const navigate = useNavigate();
  const [activeBlock, setActiveBlock] = useState(1);
  const [navBloqueada, setNavBloqueada] = useState(false);
  const [navIdx, setNavIdx] = useState(0);
  const [navConfirmOpen, setNavConfirmOpen] = useState(false);
  const [navConfirmOption, setNavConfirmOption] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOption, setConfirmOption] = useState(0);
  const [modalReg, setModalReg] = useState(null);
  const [modalBtn, setModalBtn] = useState(0);

  const stateRef = useRef({});
  stateRef.current = { activeBlock, navBloqueada, navIdx, navConfirmOpen, navConfirmOption, confirmOpen, confirmOption, modalReg, modalBtn };

  useEMGSimple(WS_URL,
    () => {
      const s = stateRef.current;
      if (s.modalReg !== null) { setModalBtn((b) => (b + 1) % 3); return; }
      if (s.navConfirmOpen) { setNavConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.confirmOpen) { setConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.activeBlock === 0 && s.navBloqueada) { setNavIdx((i) => (i + 1 >= navItems.length ? 0 : i + 1)); return; }
      setActiveBlock((b) => (b + 1) % TOTAL_BLOCKS);
    },
    () => {
      const s = stateRef.current;
      if (s.modalReg !== null) { CardModal._handleSelect?.(); return; }
      if (s.navConfirmOpen) {
        if (s.navConfirmOption === 0) navigate(navItems[s.navIdx].to);
        else { setNavConfirmOpen(false); setNavConfirmOption(0); }
        return;
      }
      if (s.confirmOpen) {
        if (s.confirmOption === 0) { setModalReg(s.activeBlock - 1); setModalBtn(0); setConfirmOpen(false); setConfirmOption(0); }
        else { setConfirmOpen(false); setConfirmOption(0); }
        return;
      }
      if (s.activeBlock === 0) {
        if (!s.navBloqueada) { setNavBloqueada(true); setNavIdx(0); }
        else { setNavConfirmOpen(true); setNavConfirmOption(0); }
        return;
      }
      if (s.activeBlock >= 1) { setConfirmOpen(true); setConfirmOption(0); }
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
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    sky: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    rose: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };

  return (
    <div className="min-h-screen bg-background">
      {modalReg !== null && (
        <CardModal reg={REGULATIONS[modalReg]} onClose={() => setModalReg(null)} modalBtn={modalBtn} setModalBtn={setModalBtn} />
      )}
      {navConfirmOpen && <ConfirmDialog title={navItems[navIdx].label} subtitle="¿Ir a esta sección?" confirmOption={navConfirmOption}
        onConfirm={() => navigate(navItems[navIdx].to)} onCancel={() => { setNavConfirmOpen(false); setNavConfirmOption(0); }} />}
      {confirmOpen && activeBlock >= 1 && (
        <ConfirmDialog title={REGULATIONS[activeBlock - 1].title} subtitle="¿Quieres leer más?" confirmOption={confirmOption}
          onConfirm={() => { setModalReg(activeBlock - 1); setModalBtn(0); setConfirmOpen(false); setConfirmOption(0); }}
          onCancel={() => { setConfirmOpen(false); setConfirmOption(0); }} />
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 space-y-3">
        <div id="emg-navbar" style={navActive ? { outline: "3px solid #38bdf8", outlineOffset: "4px", borderRadius: "1rem", backgroundColor: "#e0f2fe" } : {}}>
          <NavBar bloqueada={navBloqueada} selectedIdx={navIdx} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Normativa</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">COFEPRIS · FDA · ISO · Ley de Datos · Ley General de Salud</span>
            </div>
            <h2 className="text-xl font-light tracking-tight">Marco legal y <span className="font-semibold">regulación</span></h2>
            <p className="text-xs text-muted-foreground mt-0.5">MioAssist opera bajo el marco regulatorio aplicable a software de dispositivos médicos (SaMD).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REGULATIONS.map((r, i) => {
            const blockIdx = i + 1;
            const isActive = activeBlock === blockIdx;
            const Icon = r.icon;
            return (
              <div key={r.code} id={`emg-block-${blockIdx}`}
                style={isActive ? STYLE_ACTIVE : {}}
                className="rounded-2xl border border-border/70 bg-card soft-shadow p-4 flex flex-col gap-2.5 transition-all cursor-pointer hover:border-accent/50"
                onClick={() => setModalReg(i)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border shrink-0", colorMap[r.color])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-muted-foreground">{r.code}</div>
                      <h3 className="font-semibold text-sm leading-tight">{r.title}</h3>
                    </div>
                  </div>
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ml-2", colorMap[r.color])}>{r.scope}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.summary}</p>
                <span className="text-xs font-semibold text-primary">Ver más →</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-800"><strong>Aviso legal:</strong> La información presentada es de carácter orientativo. No constituye asesoría jurídica ni regulatoria.</p>
        </div>
      </main>
    </div>
  );
}