import React, { useState, useEffect, useRef } from "react";
import { useEMG } from "@/lib/EMGContext";

export default function EMGTestPage() {
  const {
    emgData, connected, rmsActual, pico, umbral, latencia,
    izqConectado, derConectado,
    izqRms, derRms, izqMnf, derMnf,
  } = useEMG();

  const [msgCount, setMsgCount] = useState(0);
  const [lastJson, setLastJson] = useState(null);
  const [log, setLog] = useState([]);
  const prevData = useRef(null);

  // Contar mensajes y guardar JSON crudo cada vez que emgData cambia
  useEffect(() => {
    if (!emgData) return;
    const json = JSON.stringify(emgData);
    if (json === prevData.current) return; // mismos datos, no contar
    prevData.current = json;
    setMsgCount((n) => n + 1);
    setLastJson(emgData);
    setLog((prev) => [
      { t: new Date().toLocaleTimeString(), data: emgData },
      ...prev.slice(0, 19),
    ]);
  }, [emgData]);

  const Cell = ({ label, value, highlight }) => (
    <div style={{
      background: highlight ? "#0f2" : "#1e293b",
      color: highlight ? "#000" : "#fff",
      padding: "8px 12px", borderRadius: 8, minWidth: 120,
    }}>
      <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: "bold", fontFamily: "monospace" }}>{String(value)}</div>
    </div>
  );

  return (
    <div style={{ background: "#0f172a", color: "#fff", minHeight: "100vh", padding: 24, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>🔬 EMG Diagnóstico</h1>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 24 }}>
        Ruta: /test-emg · Datos en tiempo real desde EMGContext (useEMG)
      </p>

      {/* Estado de conexión */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: connected ? "#14532d" : "#7f1d1d",
          padding: "8px 16px", borderRadius: 999, fontSize: 14, fontWeight: "bold"
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: connected ? "#4ade80" : "#f87171", display: "inline-block" }} />
          {connected ? "CONECTADO" : "DESCONECTADO"}
        </div>
        <span style={{ marginLeft: 16, color: "#64748b", fontSize: 12 }}>
          Mensajes recibidos: <strong style={{ color: "#fff" }}>{msgCount}</strong>
        </span>
      </div>

      {/* Métricas globales */}
      <h2 style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>MÉTRICAS GLOBALES (EMGContext)</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        <Cell label="rmsActual" value={`${rmsActual} mV`} highlight={rmsActual > 100} />
        <Cell label="pico" value={`${pico.toFixed(1)} mV`} />
        <Cell label="umbral" value={`${umbral} mV`} />
        <Cell label="latencia" value={latencia > 0 ? `${latencia} ms` : "— ms"} />
      </div>

      {/* Electrodo izquierdo */}
      <h2 style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>ELECTRODO IZQUIERDO</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        <Cell label="conectado" value={izqConectado ? "✅ SÍ" : "❌ NO"} highlight={izqConectado} />
        <Cell label="izqRms" value={`${izqRms} mV`} highlight={izqRms > 100} />
        <Cell label="izqMnf" value={`${izqMnf} Hz`} />
        <Cell label="click izq" value={emgData?.izq?.click === 1 ? "🔵 1" : "0"} highlight={emgData?.izq?.click === 1} />
      </div>

      {/* Electrodo derecho */}
      <h2 style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>ELECTRODO DERECHO</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        <Cell label="conectado" value={derConectado ? "✅ SÍ" : "❌ NO"} highlight={derConectado} />
        <Cell label="derRms" value={`${derRms} mV`} highlight={derRms > 100} />
        <Cell label="derMnf" value={`${derMnf} Hz`} />
        <Cell label="click der" value={emgData?.der?.click === 1 ? "🔵 1" : "0"} highlight={emgData?.der?.click === 1} />
      </div>

      {/* JSON crudo último mensaje */}
      <h2 style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>ÚLTIMO JSON RECIBIDO</h2>
      <pre style={{
        background: "#1e293b", padding: 16, borderRadius: 8,
        fontSize: 13, color: "#7dd3fc", marginBottom: 24, overflowX: "auto"
      }}>
        {lastJson ? JSON.stringify(lastJson, null, 2) : "— esperando datos..."}
      </pre>

      {/* Log últimos 20 mensajes */}
      <h2 style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>LOG (últimos 20 mensajes)</h2>
      <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, maxHeight: 300, overflowY: "auto" }}>
        {log.length === 0 && <div style={{ color: "#64748b" }}>— sin mensajes aún</div>}
        {log.map((entry, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "4px 0",
            borderBottom: "1px solid #334155", fontSize: 12
          }}>
            <span style={{ color: "#64748b", minWidth: 80 }}>{entry.t}</span>
            <span style={{ color: "#94a3b8" }}>
              izq rms={entry.data.izq?.rms} click={entry.data.izq?.click} |
              der rms={entry.data.der?.rms} click={entry.data.der?.click} |
              mnf_izq={entry.data.izq?.mnf} mnf_der={entry.data.der?.mnf}
            </span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, color: "#475569", fontSize: 11 }}>
        Esta página usa useEMG() del EMGContext global. Si los valores no cambian al presionar botones
        en el mock server (localhost:8082), el problema está en EMGContext o en el WebSocket.
      </p>
    </div>
  );
}