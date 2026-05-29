import React, { useState, useMemo } from "react";
import { Check, Save, Pencil, X, Share2, Shield, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSession, updateProfile } from "@/lib/auth";
import Keyboard from "@/components/writer/Keyboard";
import TopLetters from "@/components/writer/TopLetters";
import SuggestionsSidebar from "@/components/writer/SuggestionsSidebar";
import { Link } from "react-router-dom";

/* ── All editable profile fields ── */
const FIELDS = [
  { key: "nombre",          label: "Nombre completo",           section: "Datos personales" },
  { key: "correo",          label: "Correo electrónico",        section: "Datos personales" },
  { key: "telefono",        label: "Teléfono",                  section: "Datos personales" },
  { key: "edad",            label: "Edad",                      section: "Datos personales" },
  { key: "doctor",          label: "Doctor / terapeuta",        section: "Datos clínicos" },
  { key: "correoDoctor",    label: "Correo del doctor",         section: "Datos clínicos" },
  { key: "telefonoDoctor",  label: "Teléfono del doctor",       section: "Datos clínicos" },
  { key: "objetivo",        label: "Objetivo de uso",           section: "Datos clínicos" },
];

const SUGGESTIONS = {
  nombre:         ["nombre", "apellido", "completo"],
  correo:         ["correo", "gmail", "hotmail"],
  telefono:       ["teléfono", "móvil", "contacto"],
  edad:           ["años", "edad"],
  doctor:         ["doctor", "terapeuta", "médico", "Dr"],
  correoDoctor:   ["hospital", "clínica", "correo"],
  telefonoDoctor: ["teléfono", "contacto", "urgencias"],
  objetivo:       ["comunicación", "rehabilitación", "diaria", "familiar", "médica"],
};

function getSections(fields) {
  const sections = {};
  fields.forEach((f) => {
    if (!sections[f.section]) sections[f.section] = [];
    sections[f.section].push(f);
  });
  return sections;
}

export default function UserDataForm() {
  const session = getSession();
  const [data, setData] = useState(() => ({
    nombre: "", correo: "", telefono: "", edad: "",
    doctor: "", correoDoctor: "", telefonoDoctor: "", objetivo: "",
    ...(session || {}),
  }));
  const [activeKey, setActiveKey] = useState(null);
  const [saved, setSaved] = useState(false);
  const [shareWithDoctor, setShareWithDoctor] = useState(
    () => localStorage.getItem("mioassist_share_doctor") === "true"
  );

  const toggleShareDoctor = () => {
    const next = !shareWithDoctor;
    setShareWithDoctor(next);
    localStorage.setItem("mioassist_share_doctor", String(next));
  };

  const activeField = FIELDS.find((f) => f.key === activeKey);
  const activeValue = activeKey ? (data[activeKey] || "") : "";

  /* Top-letter prediction based on last char of active field */
  const topLetters = useMemo(() => {
    const last = activeValue.slice(-1).toLowerCase();
    const follow = {
      a: ["r", "n", "l", "s", "d"], e: ["n", "r", "s", "l", "d"],
      o: ["s", "n", "r", "l", "m"], n: ["a", "e", "o", "t", "i"],
      s: ["e", "a", "o", "i", "u"], r: ["a", "e", "o", "i", "u"],
    };
    if (/[a-záéíóúñ]/.test(last) && follow[last]) return follow[last];
    return ["e", "a", "o", "s", "r"];
  }, [activeValue]);

  /* Keyboard handlers — write into the active field */
  const handleType = (ch) => {
    if (!activeKey) return;
    setData((d) => ({ ...d, [activeKey]: (d[activeKey] || "") + ch }));
  };
  const handleBackspace = () => {
    if (!activeKey) return;
    setData((d) => ({ ...d, [activeKey]: (d[activeKey] || "").slice(0, -1) }));
  };
  const handleClear = () => {
    if (!activeKey) return;
    setData((d) => ({ ...d, [activeKey]: "" }));
  };
  const handleSpace = () => {
    if (!activeKey) return;
    setData((d) => ({ ...d, [activeKey]: (d[activeKey] || "") + " " }));
  };
  const handlePickWord = (w) => {
    if (!activeKey) return;
    setData((d) => {
      const cur = d[activeKey] || "";
      return { ...d, [activeKey]: cur.endsWith(" ") || cur === "" ? cur + w : cur + " " + w };
    });
  };

  const handleSave = () => {
    updateProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = getSections(FIELDS);

  return (
    /* ── Split layout: fields LEFT (scrollable) + keyboard RIGHT (sticky) ── */
    <div className="flex flex-col xl:flex-row gap-6 items-start">

      {/* ════ LEFT COLUMN — field cards ════ */}
      <div className="w-full xl:flex-1 space-y-6 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto xl:pr-2">

        {/* Active field indicator banner */}
        {activeField ? (
          <div className="rounded-2xl border-2 border-accent bg-accent/5 px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">
                  Editando con teclado EMG
                </div>
                <div className="font-semibold text-foreground truncate">{activeField.label}</div>
              </div>
            </div>
            <button
              onClick={() => setActiveKey(null)}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card px-5 py-3.5 flex items-center gap-2.5">
            <Pencil className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Toca un campo para activar el teclado EMG
            </span>
          </div>
        )}

        {/* Field sections */}
        {Object.entries(sections).map(([section, fields]) => (
          <div key={section} className="rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 bg-secondary/30">
              <h3 className="font-semibold text-sm text-foreground/80">{section}</h3>
            </div>
            <div className="p-4 space-y-2">
              {fields.map(({ key, label }) => {
                const isActive = activeKey === key;
                const val = data[key] || "";
                return (
                  <button
                    key={key}
                    onClick={() => setActiveKey(key)}
                    className={cn(
                      "w-full text-left rounded-2xl border-2 p-4 transition-all",
                      isActive
                        ? "border-accent bg-accent/5"
                        : "border-border/60 bg-background hover:border-primary/30 hover:bg-primary/3"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className={cn(
                          "text-xs font-semibold uppercase tracking-wider mb-1",
                          isActive ? "text-accent-foreground" : "text-muted-foreground"
                        )}>
                          {label}
                        </div>
                        <div className={cn(
                          "text-base font-medium min-h-[1.5rem]",
                          val ? "text-foreground" : "text-muted-foreground/40 italic"
                        )}>
                          {val || "Sin datos"}
                        </div>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        isActive ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                      )}>
                        <Pencil className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Inline value preview with cursor when active */}
                    {isActive && (
                      <div className="mt-3 px-3 py-2 rounded-xl bg-card border border-accent/30 font-mono text-lg tracking-wide min-h-[2.5rem] flex items-center">
                        <span>{val}</span>
                        <span className="w-0.5 h-5 bg-accent ml-0.5 animate-pulse rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Data sharing toggle */}
        <div className="rounded-3xl border border-border/70 bg-card soft-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 bg-secondary/30 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground/80">Transferencia de datos médicos</h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium text-sm">Compartir datos con médico</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Permite que tu médico o terapeuta acceda a tus métricas de sesión EMG.
                </div>
              </div>
              <button
                onClick={toggleShareDoctor}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-all shrink-0 mt-0.5",
                  shareWithDoctor ? "bg-primary" : "bg-secondary border border-border"
                )}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                  shareWithDoctor ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {/* Status indicator */}
            {shareWithDoctor && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary/8 border border-primary/20">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-primary">Datos compartidos con profesional de salud</div>
                  <div className="text-[10px] text-muted-foreground">
                    {data.doctor ? `Dr(a). ${data.doctor}` : "Doctor no especificado"} · Métricas EMG, velocidad, precisión
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Puedes revocar este permiso en cualquier momento desactivando la opción.{" "}
              <Link to="/privacy" className="text-primary underline">Ver Aviso de Privacidad</Link>
            </p>
          </div>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          className={cn(
            "w-full h-14 rounded-2xl font-semibold text-base gap-2 transition-all",
            saved
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-primary to-accent text-primary-foreground"
          )}
        >
          {saved ? <><Check className="w-5 h-5" /> Guardado</> : <><Save className="w-5 h-5" /> Guardar cambios</>}
        </Button>
      </div>

      {/* ════ RIGHT COLUMN — sticky keyboard zone ════ */}
      <div className="w-full xl:w-[560px] xl:sticky xl:top-24 space-y-4">

        {/* Keyboard header: shows active field prominently */}
        <div className={cn(
          "rounded-2xl border-2 px-5 py-3 transition-all",
          activeField ? "border-accent bg-accent/5" : "border-border/60 bg-card"
        )}>
          {activeField ? (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-accent-foreground/70 font-semibold mb-0.5">
                Teclado activo →
              </div>
              <div className="font-semibold text-foreground">{activeField.label}</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              Selecciona un campo para escribir
            </div>
          )}
        </div>

        <TopLetters
          letters={topLetters}
          onPick={activeKey ? handleType : () => {}}
        />

        <Keyboard
          onType={handleType}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSpace={handleSpace}
          onOpenDictionary={() => {}}
        />

        <SuggestionsSidebar
          suggestions={activeKey ? (SUGGESTIONS[activeKey] || []) : []}
          onPick={handlePickWord}
          highlighted={false}
        />
      </div>
    </div>
  );
}