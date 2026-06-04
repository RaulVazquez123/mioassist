import React, { useState } from "react";
import { Cloud, Check, RefreshCw, Download, FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLE_ACTIVE = { borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8" };

function getPatientData() {
  try {
    const session = JSON.parse(localStorage.getItem("mioassist_session") || "{}");
    return {
      nombre: session.nombre || "No especificado",
      edad: session.edad || "—",
      doctor: session.doctor || "No especificado",
      objetivo: session.objetivo || "No especificado",
      correo: session.correo || "—",
    };
  } catch { return { nombre: "No especificado", edad: "—", doctor: "No especificado", objetivo: "No especificado", correo: "—" }; }
}

function getSessionData() {
  try {
    return JSON.parse(localStorage.getItem("mioassist_ultima_sesion") || "null");
  } catch { return null; }
}

function getPracticeData() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mioassist_practice_sessions") || "[]");
    if (!sessions.length) return null;
    const precisions = sessions.map(s => s.precision).filter(Boolean);
    const avgPrecision = precisions.length ? Math.round(precisions.reduce((a, b) => a + b, 0) / precisions.length) : null;
    return { sesiones: sessions.length, precisionPromedio: avgPrecision };
  } catch { return null; }
}

function getSesionesTotales() {
  return parseInt(localStorage.getItem("mioassist_sesiones") || "0");
}

async function generarPDF(paciente, sesion, practica, sesionesTotales) {
  // Importar jsPDF dinámicamente
  const { jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const margen = 20;
  let y = 0;

  // ── HEADER — fondo primario ──────────────────────────────────────
  doc.setFillColor(15, 118, 110); // teal-700
  doc.rect(0, 0, W, 42, "F");

  // Nombre app
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MioAssist", margen + 20, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Asistencia inteligente para escritura mediante EMG", margen + 20, 25);

  // Tipo de documento
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE CLÍNICO DE SESIÓN", margen + 20, 34);

  // Fecha arriba derecha
  const fecha = sesion ? new Date(sesion.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(fecha, W - margen, 12, { align: "right" });

  y = 52;

  // ── DATOS DEL PACIENTE ────────────────────────────────────────────
  doc.setFillColor(240, 249, 255); // blue-50
  doc.roundedRect(margen, y, W - margen * 2, 44, 3, 3, "F");
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margen, y, W - margen * 2, 44, 3, 3, "S");

  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL PACIENTE", margen + 5, y + 8);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const col1x = margen + 5;
  const col2x = W / 2 + 5;

  doc.setFont("helvetica", "bold"); doc.text("Nombre:", col1x, y + 17);
  doc.setFont("helvetica", "normal"); doc.text(paciente.nombre, col1x + 22, y + 17);

  doc.setFont("helvetica", "bold"); doc.text("Edad:", col2x, y + 17);
  doc.setFont("helvetica", "normal"); doc.text(String(paciente.edad), col2x + 15, y + 17);

  doc.setFont("helvetica", "bold"); doc.text("Médico/Terapeuta:", col1x, y + 26);
  doc.setFont("helvetica", "normal"); doc.text(paciente.doctor, col1x + 45, y + 26);

  doc.setFont("helvetica", "bold"); doc.text("Objetivo:", col2x, y + 26);
  doc.setFont("helvetica", "normal"); doc.text(paciente.objetivo.substring(0, 30), col2x + 22, y + 26);

  doc.setFont("helvetica", "bold"); doc.text("Sesiones totales:", col1x, y + 35);
  doc.setFont("helvetica", "normal"); doc.text(String(sesionesTotales), col1x + 42, y + 35);

  y += 54;

  // ── MÉTRICAS DE SESIÓN EMG ────────────────────────────────────────
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MÉTRICAS DE SESIÓN EMG", margen, y);
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.5);
  doc.line(margen, y + 2, W - margen, y + 2);
  y += 8;

  const metricas = sesion ? [
    { label: "Duración de sesión", value: `${sesion.duracionMin} min`, desc: "Tiempo con señal EMG activa" },
    { label: "Señal EMG promedio", value: `${sesion.rmsPromedio} mV`, desc: "RMS promedio de la sesión" },
    { label: "Pico de señal", value: `${sesion.picoSesion} mV`, desc: "Máxima intensidad registrada" },
    { label: "Activaciones EMG", value: String(sesion.interacciones), desc: "Total de clicks registrados" },
  ] : [
    { label: "Duración de sesión", value: "—", desc: "Sin datos de sesión" },
    { label: "Señal EMG promedio", value: "—", desc: "Sin conexión registrada" },
    { label: "Pico de señal", value: "—", desc: "Sin datos" },
    { label: "Activaciones EMG", value: "—", desc: "Sin datos" },
  ];

  const cardW = (W - margen * 2 - 9) / 4;
  metricas.forEach((m, i) => {
    const cx = margen + i * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cx, y, cardW, 28, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardW, 28, 2, 2, "S");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(m.label.toUpperCase(), cx + cardW / 2, y + 7, { align: "center" });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(m.value, cx + cardW / 2, y + 17, { align: "center" });

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(m.desc, cx + cardW / 2, y + 24, { align: "center" });
  });

  y += 38;

  // ── PRÁCTICA ──────────────────────────────────────────────────────
  if (practica) {
    doc.setTextColor(15, 118, 110);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE PRÁCTICA", margen, y);
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.5);
    doc.line(margen, y + 2, W - margen, y + 2);
    y += 8;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margen, y, W - margen * 2, 20, 3, 3, "F");
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margen, y, W - margen * 2, 20, 3, 3, "S");

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Ejercicios completados:", margen + 5, y + 8);
    doc.setFont("helvetica", "normal");
    doc.text(String(practica.sesiones), margen + 52, y + 8);

    if (practica.precisionPromedio !== null) {
      doc.setFont("helvetica", "bold");
      doc.text("Precisión promedio:", margen + 5, y + 16);
      doc.setFont("helvetica", "normal");
      doc.text(`${practica.precisionPromedio}%`, margen + 46, y + 16);
    }

    y += 30;
  }

  // ── OBSERVACIONES ─────────────────────────────────────────────────
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OBSERVACIONES CLÍNICAS", margen, y);
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.5);
  doc.line(margen, y + 2, W - margen, y + 2);
  y += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margen, y, W - margen * 2, 35, 2, 2, "S");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Espacio para notas del terapeuta...", margen + 5, y + 10);

  y += 45;

  // ── AVISO LEGAL ───────────────────────────────────────────────────
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(margen, y, W - margen * 2, 22, 2, 2, "F");
  doc.setDrawColor(253, 224, 71);
  doc.roundedRect(margen, y, W - margen * 2, 22, 2, 2, "S");

  doc.setTextColor(133, 77, 14);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("⚠ AVISO LEGAL", margen + 5, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const aviso = "MioAssist es un sistema de asistencia para la comunicación. No es un dispositivo de diagnóstico médico ni sustituye la evaluación de profesionales de salud. Los datos biométricos EMG presentados son de referencia y deben ser interpretados por un profesional certificado.";
  const lines = doc.splitTextToSize(aviso, W - margen * 2 - 10);
  doc.text(lines, margen + 5, y + 14);

  y += 30;

  // ── FOOTER ────────────────────────────────────────────────────────
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 282, W, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("MioAssist © 2026 · Sistema de Escritura Asistida por EMG · privacidad@mioassist.mx", W / 2, 291, { align: "center" });
  doc.text(`Generado el ${new Date().toLocaleString("es-MX")}`, W / 2, 295, { align: "center" });

  // Descargar
  const nombreArchivo = `MioAssist_Reporte_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nombreArchivo);
}

const REPORTS = [
  { name: "Sesión_2026-04-17.pdf", size: "84 KB", time: "Hoy 14:32", synced: true },
  { name: "Semana_14_2026.pdf", size: "210 KB", time: "Dom 09:00", synced: true },
  { name: "Semana_13_2026.pdf", size: "198 KB", time: "Dom 09:00", synced: true },
];

export default function CloudExport({ activeBlock, downloadBtnId, reportBtnId }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("14:32 hoy");
  const [generating, setGenerating] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setLastSync("ahora mismo"); }, 2000);
  };

  const handleGenerarReporte = async () => {
    setGenerating(true);
    try {
      const paciente = getPatientData();
      const sesion = getSessionData();
      const practica = getPracticeData();
      const sesionesTotales = getSesionesTotales();
      await generarPDF(paciente, sesion, practica, sesionesTotales);
    } catch (e) {
      console.error("Error generando PDF:", e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 soft-shadow flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Nube · Google Drive</h3>
            <p className="text-[11px] text-muted-foreground">Sincronización automática</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Activo
        </span>
      </div>

      <div className="rounded-2xl bg-secondary/60 border border-border/60 px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Última sync: <span className="font-semibold text-foreground">{lastSync}</span>
        </div>
        <button onClick={handleSync} className={cn("w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-all", syncing && "animate-spin")}>
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {REPORTS.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background border border-border/60 hover:border-border transition-all">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{r.name}</div>
              <div className="text-[10px] text-muted-foreground">{r.size} · {r.time}</div>
            </div>
            {r.synced && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          id={downloadBtnId}
          style={activeBlock === 3 ? STYLE_ACTIVE : {}}
          className="h-9 rounded-xl text-xs gap-1.5 border-2 border-border flex items-center justify-center font-medium transition-all hover:bg-secondary"
        >
          <Download className="w-3.5 h-3.5" /> Descargar
        </button>
        <button
          id={reportBtnId}
          onClick={handleGenerarReporte}
          disabled={generating}
          style={activeBlock === 4 ? STYLE_ACTIVE : {}}
          className="h-9 rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground border-2 border-transparent flex items-center justify-center font-medium transition-all disabled:opacity-60"
        >
          {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          {generating ? "Generando..." : "Generar reporte"}
        </button>
      </div>
    </div>
  );
}