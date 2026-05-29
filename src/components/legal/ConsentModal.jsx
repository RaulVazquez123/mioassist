import React, { useState } from "react";
import { Shield, AlertTriangle, Lock, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function ConsentModal({ onAccept }) {
  const [checks, setChecks] = useState({
    terms: false,
    privacy: false,
    biometric: false,
    dataShare: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const toggle = (key) => setChecks((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-[hsl(196_85%_22%)] px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Términos y Consentimiento</h2>
              <p className="text-xs text-primary-foreground/70">Lectura obligatoria para continuar</p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Warning */}
          <div className="rounded-2xl border border-amber-400/40 bg-amber-50 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Aviso médico importante:</strong> MioAssist es un sistema de <strong>asistencia para la comunicación</strong>, 
              NO un dispositivo de diagnóstico médico. No sustituye la evaluación de profesionales de salud. 
              Uso bajo responsabilidad del usuario y su equipo clínico.
            </p>
          </div>

          {/* Limitations */}
          <div className="rounded-2xl border border-border/60 bg-background px-4 py-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Limitaciones del sistema
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Las métricas EMG son indicativas, no clínicamente diagnósticas.</li>
              <li>La precisión del sistema puede variar según condición muscular.</li>
              <li>El sistema no está indicado para emergencias médicas.</li>
              <li>Consulte a su médico o terapeuta antes de uso intensivo.</li>
            </ul>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-border/60 bg-background px-4 py-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Seguridad y privacidad
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sus datos biométricos (señales EMG) y métricas clínicas son tratados como datos sensibles de salud. 
              Solo se comparten con profesionales de salud que usted autorice explícitamente. 
              Puede consultar el <Link to="/privacy" className="text-primary underline">Aviso de Privacidad completo</Link>.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            {[
              {
                key: "terms",
                label: "Acepto los Términos y Condiciones de uso de MioAssist, incluyendo que es un sistema asistivo NO diagnóstico y que su uso es bajo mi responsabilidad."
              },
              {
                key: "privacy",
                label: "He leído y acepto el Aviso de Privacidad. Entiendo que mis datos serán tratados como datos sensibles de salud conforme a la LFPDPPP."
              },
              {
                key: "biometric",
                label: "Autorizo el uso de mis datos biométricos (señales EMG) y métricas clínicas con fines de asistencia, monitoreo y apoyo terapéutico."
              },
              {
                key: "dataShare",
                label: "Entiendo que puedo autorizar el envío de mis métricas a mi médico o terapeuta desde mi perfil, y que puedo revocar este permiso en cualquier momento."
              },
            ].map(({ key, label }) => (
              <label
                key={key}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all",
                  checks[key]
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 bg-background hover:border-border"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                  checks[key] ? "bg-primary border-primary" : "border-border"
                )}>
                  {checks[key] && (
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checks[key]}
                  onChange={() => toggle(key)}
                />
                <span className="text-xs leading-relaxed text-foreground/80">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/60 bg-card">
          <button
            disabled={!allChecked}
            onClick={onAccept}
            className={cn(
              "w-full h-12 rounded-2xl font-semibold text-sm transition-all",
              allChecked
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            {allChecked ? "Continuar a MioAssist →" : "Acepta todos los puntos para continuar"}
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Al continuar confirmas haber leído y aceptado los términos anteriores.
          </p>
        </div>
      </div>
    </div>
  );
}