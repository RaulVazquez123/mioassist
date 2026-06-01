import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { useEMGPage } from "@/hooks/useEMGPage";
import { Scale, ChevronDown, ChevronUp, ShieldCheck, Cpu, FileCheck, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8" };

function LegalCard({ icon: Icon, code, title, scope, summary, detail, color = "primary", isActive, expanded, onToggle }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    sky: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    rose: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };
  return (
    <div style={isActive ? STYLE_ACTIVE : {}} className="rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center border", colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", colorMap[color])}>
            {scope}
          </span>
        </div>
        <div className="text-xs font-mono text-muted-foreground mb-1">{code}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/60 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
            {detail}
          </div>
        )}
      </div>
      <div className="px-6 pb-5">
        <button onClick={onToggle} className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? "Ocultar" : "Ver más"}
        </button>
      </div>
    </div>
  );
}

const REGULATIONS = [
  { icon: ShieldCheck, color: "emerald", code: "COFEPRIS", scope: "México", title: "Comisión Federal para la Protección contra Riesgos Sanitarios", summary: "MioAssist se clasifica como software de dispositivo médico (SaMD) clase II, sujeto a regulación sanitaria para su uso clínico en México.", detail: `Aplicabilidad a MioAssist:\n\nClasificación: Software como Dispositivo Médico (SaMD) Clase II.\nNorma aplicable: NOM-241-SSA1-2012 — Buenas Prácticas de Fabricación para Establecimientos dedicados a la Fabricación de Dispositivos Médicos.\n\nRequisitos para comercialización:\n• Registro sanitario ante COFEPRIS.\n• Etiquetado con leyendas de precaución y uso previsto.\n• Sistema de trazabilidad y farmacovigilancia (tecnovigilancia).\n• Documentación técnica del ciclo de vida del software.\n\nEstado actual de MioAssist:\n• En fase de desarrollo y validación clínica.\n• Se recomienda uso bajo supervisión de terapeuta certificado.\n• No disponible para prescripción clínica hasta obtener registro sanitario.` },
  { icon: Globe, color: "sky", code: "FDA 21 CFR", scope: "EE.UU.", title: "Food and Drug Administration — Software Medical Device", summary: "Bajo la guía de la FDA para SaMD, MioAssist se clasifica como dispositivo de baja prioridad de aplicación por ser asistivo y no diagnóstico.", detail: `Clasificación FDA para MioAssist:\n\nCategoría: Software como Dispositivo Médico (SaMD).\nRiesgo: Baja prioridad de aplicación normativa (non-enforcement discretion).\n\nJustificación:\n• Función asistiva de comunicación, NO diagnóstica.\n• No altera el estado clínico del paciente directamente.\n• No reemplaza decisiones de diagnóstico o tratamiento médico.\n\nReferencias normativas:\n• FDA Guidance: "Policy for Device Software Functions" (2019).\n• 21 CFR Part 11: Registros electrónicos y firmas electrónicas.\n• De Novo Classification si se añaden funciones diagnósticas.\n\nPara exportación al mercado USA: consultar regulatory affairs specialist.` },
  { icon: Scale, color: "violet", code: "ISO 14971:2019", scope: "Internacional", title: "Gestión de Riesgos para Dispositivos Médicos", summary: "Estándar internacional que define el proceso de identificación, evaluación y control de riesgos en el ciclo de vida del dispositivo médico.", detail: `Aplicación del ISO 14971 en MioAssist:\n\nProceso de gestión de riesgos:\n1. Identificación de peligros del sistema EMG.\n2. Estimación del riesgo (probabilidad × severidad).\n3. Evaluación: ¿el riesgo es aceptable?\n4. Control de riesgos (diseño, advertencias, información).\n5. Evaluación de riesgo residual.\n6. Revisión del beneficio-riesgo global.\n\nRiesgos identificados en MioAssist:\n• Fatiga muscular por uso prolongado → Control: alertas de descanso.\n• Dependencia excesiva → Control: aviso de uso complementario.\n• Error en predicción de texto → Control: siempre editable manualmente.\n• Privacidad de datos de salud → Control: cifrado y consentimiento.\n\nDocumentación: Plan de gestión de riesgos disponible para auditores clínicos.` },
  { icon: Cpu, color: "primary", code: "IEC 62304:2006+AMD1:2015", scope: "Internacional", title: "Software de Dispositivos Médicos — Ciclo de Vida", summary: "Estándar que define los procesos del ciclo de vida del software médico: desarrollo, mantenimiento, gestión de problemas y configuración.", detail: `Procesos IEC 62304 aplicados a MioAssist:\n\nClase de seguridad del software: Clase B\n(falla puede causar lesión no grave, no muerte).\n\nProcesos obligatorios:\n• SWD — Desarrollo de software (arquitectura, diseño detallado, verificación).\n• SWM — Mantenimiento de software (gestión de cambios, actualizaciones).\n• SWCM — Gestión de configuración (control de versiones, builds).\n• SWPR — Gestión de problemas (defectos, resolución documentada).\n• SWRM — Gestión de requisitos de software.\n\nArtefactos de documentación:\n→ Plan de desarrollo de software.\n→ Especificación de requisitos de software.\n→ Arquitectura del software.\n→ Plan de verificación y validación.\n→ Historial de versiones y cambios.` },
  { icon: FileCheck, color: "amber", code: "LFPDPPP", scope: "México", title: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares", summary: "Ley mexicana que regula el tratamiento de datos personales, incluyendo datos sensibles de salud como las señales EMG y métricas clínicas.", detail: `Aplicación a MioAssist:\n\nDatos sensibles tratados (Art. 3, fracc. VI):\n• Señales EMG — datos biométricos.\n• Métricas de salud — velocidad, fatiga, precisión.\n• Información médica del paciente y terapeuta.\n\nObligaciones del Responsable (MioAssist):\n• Aviso de privacidad claro y accesible (Art. 15-16).\n• Consentimiento expreso para datos sensibles (Art. 9).\n• Implementar medidas de seguridad técnicas y organizativas (Art. 19).\n• Atender derechos ARCO en plazos establecidos (Art. 22-25).\n• Designar a un Responsable de Privacidad interno.\n\nTransferencias:\n• Solo con consentimiento explícito del titular.\n• Excepciones: orden judicial o emergencia de salud pública.\n\nSanciones por incumplimiento: INAI puede imponer multas hasta 320,000 días de salario mínimo.` },
  { icon: ShieldCheck, color: "rose", code: "LGS / NOM-004-SSA3-2012", scope: "México", title: "Ley General de Salud y Expediente Clínico", summary: "Marco legal que regula los servicios de salud, el expediente clínico y la confidencialidad de la información médica en México.", detail: `Relevancia para MioAssist:\n\nLey General de Salud (Art. 77 BIS):\n• Derecho del paciente a la confidencialidad de su información.\n• Prohibición de divulgar datos médicos sin consentimiento.\n• Aplicable cuando MioAssist comparte datos con médicos.\n\nNOM-004-SSA3-2012 — Expediente Clínico:\n• Los registros de sesión de MioAssist pueden formar parte del expediente.\n• Deben guardarse mínimo 5 años (pacientes adultos).\n• Acceso limitado a personal autorizado.\n\nDerechos del paciente (Art. 51 LGS):\n• Recibir información clara sobre su diagnóstico y tratamiento.\n• Decidir sobre procedimientos que afecten su integridad.\n• Rechazar el tratamiento sin consecuencias adversas.\n\nImplicación: MioAssist debe garantizar que los datos compartidos con profesionales de salud cumplan con confidencialidad médica y sean parte del proceso terapéutico documentado.` },
];

export default function LegalPage() {
  const [expandedCards, setExpandedCards] = useState({});
  const toggleCard = (idx) => setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const { activeBlock } = useEMGPage({
    blockCount: REGULATIONS.length,
    onBlockAction: (idx) => toggleCard(idx),
    ownerId: "legalpage",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 lg:py-12">

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Normativa</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">COFEPRIS · FDA · ISO · Ley de Datos · Ley General de Salud</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-3">
            Marco legal y <span className="font-semibold">regulación</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            MioAssist opera bajo el marco regulatorio aplicable a software de dispositivos médicos (SaMD).
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {["COFEPRIS", "FDA", "ISO 14971", "IEC 62304", "LFPDPPP", "Ley General de Salud"].map((n) => (
            <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-card text-xs font-semibold text-foreground soft-shadow">
              <Scale className="w-3 h-3 text-primary" /> {n}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {REGULATIONS.map((r, i) => (
            <div key={r.code} id={`emg-block-${i}`}>
              <LegalCard
                {...r}
                isActive={activeBlock === i}
                expanded={!!expandedCards[i]}
                onToggle={() => toggleCard(i)}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card/60 px-6 py-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Aviso legal:</strong> La información presentada es de carácter orientativo e informativo.
            No constituye asesoría jurídica ni regulatoria.
          </p>
        </div>
      </main>
    </div>
  );
}