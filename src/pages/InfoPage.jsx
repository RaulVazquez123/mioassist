import React, { useState } from "react";
import Header from "@/components/layout/Header";
import {
  Info, Shield, Eye, UserCheck, Globe, FileText,
  Download, ChevronDown, ChevronUp, BookOpen, Heart,
  AlertTriangle, Lock, Accessibility
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Expandable section card ── */
function InfoCard({ icon: Icon, title, summary, detail, color = "primary" }) {
  const [expanded, setExpanded] = useState(false);
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent-foreground border-accent/30",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  };
  return (
    <div className="rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden">
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
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? "Ocultar" : "Ver más"}
        </button>
      </div>
    </div>
  );
}

/* ── Document card ── */
function DocCard({ title, preview, filename }) {
  const handleDownload = () => {
    const blob = new Blob([preview], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden flex flex-col">
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
          onClick={handleDownload}
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
  {
    icon: Heart,
    color: "emerald",
    title: "Ética del sistema",
    summary: "MioAssist está diseñado bajo principios éticos de beneficencia, no maleficencia, autonomía y justicia para personas con discapacidad motora.",
    detail: `MioAssist fue desarrollado siguiendo principios bioéticos fundamentales:

• Beneficencia: El sistema busca mejorar la calidad de vida y autonomía del usuario.
• No maleficencia: No se recopilan datos sin consentimiento explícito.
• Autonomía: El usuario controla en todo momento sus datos y configuraciones.
• Justicia: Diseñado para ser accesible a personas con movilidad reducida.

El sistema NO sustituye criterio médico ni diagnóstico clínico profesional.`
  },
  {
    icon: AlertTriangle,
    color: "amber",
    title: "Uso responsable — No diagnóstico",
    summary: "MioAssist es exclusivamente un sistema de asistencia para la comunicación. No realiza diagnósticos médicos ni sustituye evaluación de profesionales de salud.",
    detail: `ADVERTENCIA IMPORTANTE:

• Este sistema es asistivo, NO diagnóstico.
• Las métricas EMG son de referencia, no diagnóstico clínico.
• Siempre consulte con su médico o terapeuta ocupacional.
• No use MioAssist como sustituto de atención médica.
• Los datos de señal EMG mostrados son indicativos.

Para decisiones clínicas, acuda siempre a un profesional certificado de salud.`
  },
  {
    icon: Eye,
    color: "primary",
    title: "Privacidad y datos",
    summary: "Sus datos biométricos EMG y métricas clínicas son tratados como datos sensibles de salud, con máxima protección y solo compartidos con su autorización.",
    detail: `Tratamiento de datos personales sensibles:

• Señales EMG: datos biométricos de uso exclusivo del sistema.
• Métricas clínicas: velocidad, precisión, fatiga — solo para monitoreo.
• Datos de escritura: usados para predicción local, no se transmiten sin permiso.

Usted tiene derecho a:
— Acceder a sus datos en cualquier momento.
— Solicitar corrección o eliminación.
— Revocar el consentimiento de compartir con médicos.

Consulte el Aviso de Privacidad completo para más información.`
  },
  {
    icon: Lock,
    color: "violet",
    title: "Seguridad del usuario",
    summary: "Implementamos medidas técnicas y organizativas para proteger su información sensible de salud durante toda su sesión.",
    detail: `Medidas de seguridad implementadas:

• Conexión cifrada (HTTPS/TLS) en todas las comunicaciones.
• Datos de sesión no persisten en servidores sin consentimiento.
• Control de acceso por roles: usuario / médico / administrador.
• Sesiones con tiempo de expiración automático.
• Sin acceso de terceros sin autorización explícita.
• Arquitectura preparada para cifrado AES-256 en tránsito y en reposo.`
  },
  {
    icon: Accessibility,
    color: "accent",
    title: "Inclusión y accesibilidad",
    summary: "MioAssist está diseñado para ser accesible a personas con distintas capacidades, siguiendo estándares WCAG 2.1 y principios de diseño universal.",
    detail: `Compromisos de accesibilidad:

• Diseño de alto contraste y tipografía legible.
• Navegación por teclado y compatibilidad con lectores de pantalla.
• Teclado virtual adaptativo para usuarios con movilidad reducida.
• Interfaz personalizable según necesidades individuales.
• Compatible con dispositivos de entrada alternativos (switches, EMG).
• Textos claros y lenguaje simple sin tecnicismos innecesarios.

Estándares aplicados: WCAG 2.1 AA, ISO 9241-171 (accesibilidad SW).`
  },
  {
    icon: Globe,
    color: "emerald",
    title: "Transferencia de datos médicos",
    summary: "Solo con su autorización explícita, sus datos pueden compartirse con su médico o terapeuta para monitoreo clínico.",
    detail: `Política de transferencia de datos:

¿Qué se puede compartir?
— Métricas de sesión (velocidad, precisión, fatiga EMG).
— Tiempo de uso y progreso en ejercicios.
— Informes clínicos generados.

¿A quién?
— Solo al profesional de salud que usted autorice.
— Nunca a terceros comerciales.

¿Cómo revocar?
— En su Perfil > Datos del paciente > desactivar "Compartir con médico".
— El acceso se revoca de forma inmediata.`
  },
];

const DOC_NORMATIVIDAD = `ANÁLISIS DE NORMATIVIDAD Y SUSTENTABILIDAD
MioAssist — Sistema de Escritura Asistida por EMG
Versión 1.0 · Abril 2026
════════════════════════════════════════

1. MARCO REGULATORIO APLICABLE

1.1 México — COFEPRIS
Clasificación: Dispositivo médico software clase II.
Aplica: NOM-241-SSA1-2012 (BPF dispositivos médicos).
Requisito: Registro sanitario ante COFEPRIS para comercialización.

1.2 Estados Unidos — FDA
Aplica: 21 CFR Part 11 (registros electrónicos).
Software como Dispositivo Médico (SaMD) — FDA 2019 Guidance.
Categoría: Baja prioridad de aplicación (asistivo, no diagnóstico).

1.3 Unión Europea — CE
Reglamento MDR 2017/745 — Clase I (asistivo).
Directiva de IA de Alto Riesgo si se añaden funciones diagnósticas.

2. ESTÁNDARES TÉCNICOS

ISO 14971:2019 — Gestión de riesgos para dispositivos médicos.
IEC 62304:2006 — Software de dispositivos médicos (ciclo de vida).
IEC 62366:2015 — Usabilidad en dispositivos médicos.
ISO 13485:2016 — Sistema de gestión de calidad.

3. PROTECCIÓN DE DATOS

México: Ley Federal de Protección de Datos Personales en Posesión 
de los Particulares (LFPDPPP) y su Reglamento.
GDPR (Art. 9): Datos de salud como categoría especial.
Consentimiento explícito obligatorio para datos biométricos EMG.

4. SUSTENTABILIDAD

• Uso de infraestructura cloud con certificación ISO 27001.
• Minimización de datos (Privacy by Design).
• Sin hardware adicional desechable en versión software.
• Código abierto para auditoría independiente (roadmap).

════════════════════════════════════════
Documento informativo — No constituye asesoría legal.
© 2026 MioAssist`;

const DOC_GUIA = `GUÍA DE USO DEL SISTEMA
MioAssist — Escritura Asistida por EMG
Versión 1.0 · Abril 2026
════════════════════════════════════════

INTRODUCCIÓN
MioAssist es una aplicación web de escritura asistida mediante 
señales electromiográficas (EMG). Permite a personas con movilidad 
reducida comunicarse usando contracciones musculares mínimas.

════════════════════════════════════════
MÓDULO 1: ESCRITURA

• Top 5 letras: muestra las 5 predicciones más probables basadas 
  en la última letra escrita. Seleccione con clic o EMG.

• Teclado QWERTY: teclado completo con soporte para:
  — Mayúsculas (botón Shift)
  — Acentos (á é í ó ú)
  — Números y símbolos (#123)
  — Borrar (Delete) y Limpiar (Eraser)

• Diccionario predictivo: lista de palabras sugeridas en el panel 
  derecho. Seleccione una para insertarla automáticamente.

• Área de texto: escriba su mensaje. Use los botones de acción 
  para copiar, compartir, descargar o escuchar (voz).

════════════════════════════════════════
MÓDULO 2: PRÁCTICA

Ejercicios progresivos por nivel:
• Básico: frases esenciales de comunicación cotidiana.
• Intermedio: mensajes completos y vocabulario médico.
• Avanzado: dictado clínico y resistencia prolongada.

Cada ejercicio muestra la frase objetivo y compara en tiempo 
real lo que escribe vs. lo esperado, con indicador de progreso.

════════════════════════════════════════
MÓDULO 3: PERFIL EMG

• Métricas EMG: señal, intensidad, precisión y velocidad.
• Datos del paciente: información clínica y personal editable.
• Exportación: genere informes para compartir con su médico.

════════════════════════════════════════
PRECAUCIONES DE USO

1. No use el sistema si experimenta dolor muscular agudo.
2. Descanse al menos 10 minutos por cada hora de uso.
3. Ajuste la sensibilidad del sensor según tolerancia.
4. Consulte a su terapeuta antes de aumentar la intensidad.
5. No conduzca ni opere maquinaria durante el uso.

════════════════════════════════════════
SOPORTE TÉCNICO
contacto@mioassist.mx | www.mioassist.mx
© 2026 MioAssist — Todos los derechos reservados`;

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 lg:py-12">

        {/* Hero */}
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
            Aquí encontrará todo lo que necesita saber sobre el uso responsable del sistema.
          </p>
        </div>

        {/* Alert banner */}
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-amber-800 text-sm">Aviso importante</div>
            <div className="text-amber-700 text-sm mt-0.5">
              MioAssist es un sistema de <strong>asistencia para la comunicación</strong>, no un dispositivo de diagnóstico médico. 
              No sustituye la evaluación de profesionales de salud.
            </div>
          </div>
        </div>

        {/* Info sections grid */}
        <section className="mb-14">
          <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" /> Secciones informativas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INFO_SECTIONS.map((s) => (
              <InfoCard key={s.title} {...s} />
            ))}
          </div>
        </section>

        {/* Documents */}
        <section>
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Documentos
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Documentos técnicos y guías disponibles para descarga.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DocCard
              title="Análisis de Normatividad y Sustentabilidad"
              preview={DOC_NORMATIVIDAD}
              filename="MioAssist_Normatividad_2026.txt"
            />
            <DocCard
              title="Guía de uso del sistema"
              preview={DOC_GUIA}
              filename="MioAssist_Guia_Uso_2026.txt"
            />
          </div>
        </section>
      </main>
    </div>
  );
}