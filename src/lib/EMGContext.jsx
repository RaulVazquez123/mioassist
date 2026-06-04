import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

const EMGContext = createContext(null);

// Guarda sesión en localStorage
function guardarSesion(sesion) {
  try {
    const prev = JSON.parse(localStorage.getItem("mioassist_sesiones_historial") || "[]");
    prev.push(sesion);
    localStorage.setItem("mioassist_sesiones_historial", JSON.stringify(prev.slice(-50)));
  } catch {}
}

export function EMGProvider({ children, wsUrl = "ws://192.168.4.1:8081" }) {
  const ws = useRef(null);
  const [emgData, setEmgData] = useState({
    izq: { click: 0, rms: 0, mnf: 0, conectado: 0 },
    der: { click: 0, rms: 0, mnf: 0, conectado: 0 },
  });
  const [latencia, setLatencia] = useState(0);
  const [pico, setPico] = useState(0);
  const [connected, setConnected] = useState(false);
  const lastMsgTime = useRef(null);
  const ultimaAccion = useRef(0);
  const DEBOUNCE_MS = 800;

  const ownerRef = useRef(null);
  const callbacksRef = useRef({});

  // Sesión EMG
  const sesionRef = useRef(null);
  const graciaTimerRef = useRef(null);
  const rmsAcumulado = useRef([]);
  const interaccionesRef = useRef(0);

  const iniciarSesion = useCallback(() => {
    if (graciaTimerRef.current) { clearTimeout(graciaTimerRef.current); graciaTimerRef.current = null; }
    if (sesionRef.current) return; // ya hay sesión activa
    sesionRef.current = {
      inicio: Date.now(),
      rmsAcumulado: [],
      interacciones: 0,
    };
    rmsAcumulado.current = [];
    interaccionesRef.current = 0;
    console.log("📊 Sesión EMG iniciada");
  }, []);

  const cerrarSesion = useCallback(() => {
    if (!sesionRef.current) return;
    const sesion = sesionRef.current;
    const fin = Date.now();
    const duracionMin = Math.round((fin - sesion.inicio) / 60000);
    const rmsArr = rmsAcumulado.current;
    const rmsPromedio = rmsArr.length > 0 ? Math.round(rmsArr.reduce((a, b) => a + b, 0) / rmsArr.length) : 0;
    const picoSesion = rmsArr.length > 0 ? Math.round(Math.max(...rmsArr)) : 0;

    const sesionGuardada = {
      fecha: new Date(sesion.inicio).toISOString(),
      duracionMin,
      rmsPromedio,
      picoSesion,
      interacciones: interaccionesRef.current,
    };

    guardarSesion(sesionGuardada);
    localStorage.setItem("mioassist_ultima_sesion", JSON.stringify(sesionGuardada));
    sesionRef.current = null;
    console.log("📊 Sesión EMG cerrada:", sesionGuardada);
  }, []);

  const claimEMG = useCallback((owner, onDer, onIzq) => {
    ownerRef.current = owner;
    callbacksRef.current = { onDer, onIzq };
  }, []);

  const releaseEMG = useCallback((owner) => {
    if (ownerRef.current === owner) {
      ownerRef.current = null;
      callbacksRef.current = {};
    }
  }, []);

  useEffect(() => {
    let intervalo;

    const conectar = () => {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setConnected(true);
        iniciarSesion();
        console.log("✅ EMG Context WebSocket conectado:", wsUrl);
      };

      ws.current.onmessage = (event) => {
        const ahora = Date.now();
        if (lastMsgTime.current) setLatencia(ahora - lastMsgTime.current);
        lastMsgTime.current = ahora;

        try {
          const data = JSON.parse(event.data);
          setEmgData(data);

          const maxRms = Math.max(data.izq?.rms || 0, data.der?.rms || 0);
          if (maxRms > 0) {
            setPico((prev) => Math.max(prev * 0.95, maxRms));
            if (sesionRef.current) rmsAcumulado.current.push(maxRms);
          }

          if (!data.izq?.conectado || !data.der?.conectado) return;
          if (ahora - ultimaAccion.current < DEBOUNCE_MS) return;
          const clickIzq = data.izq?.click === 1;
          const clickDer = data.der?.click === 1;
          if (!clickIzq && !clickDer) return;
          if (clickIzq && clickDer) return;
          ultimaAccion.current = ahora;

          // Contar interacciones en sesión
          if (sesionRef.current) interaccionesRef.current++;

          if (clickDer) callbacksRef.current.onDer?.();
          if (clickIzq) callbacksRef.current.onIzq?.();
        } catch (e) {}
      };

      ws.current.onclose = () => {
        setConnected(false);
        // 1 minuto de gracia antes de cerrar sesión
        graciaTimerRef.current = setTimeout(() => {
          cerrarSesion();
          graciaTimerRef.current = null;
        }, 60000);
      };

      ws.current.onerror = () => setConnected(false);
    };

    conectar();

    intervalo = setInterval(() => {
      if (!ws.current || ws.current.readyState === WebSocket.CLOSED) conectar();
    }, 5000);

    return () => {
      clearInterval(intervalo);
      if (graciaTimerRef.current) clearTimeout(graciaTimerRef.current);
      cerrarSesion();
      ws.current?.close();
    };
  }, [wsUrl]);

  const umbral = 500;
  const rmsActual = Math.max(emgData.izq?.rms || 0, emgData.der?.rms || 0);

  return (
    <EMGContext.Provider value={{
      emgData, connected, rmsActual, pico, umbral, latencia,
      izqConectado: emgData.izq?.conectado === 1,
      derConectado: emgData.der?.conectado === 1,
      izqRms: emgData.izq?.rms || 0,
      derRms: emgData.der?.rms || 0,
      izqMnf: emgData.izq?.mnf || 0,
      derMnf: emgData.der?.mnf || 0,
      claimEMG,
      releaseEMG,
    }}>
      {children}
    </EMGContext.Provider>
  );
}

export function useEMG() {
  const ctx = useContext(EMGContext);
  if (!ctx) return {
    emgData: { izq: { click: 0, rms: 0, mnf: 0, conectado: 0 }, der: { click: 0, rms: 0, mnf: 0, conectado: 0 } },
    connected: false, rmsActual: 0, pico: 0, umbral: 500, latencia: 0,
    izqConectado: false, derConectado: false,
    izqRms: 0, derRms: 0, izqMnf: 0, derMnf: 0,
    claimEMG: () => {}, releaseEMG: () => {},
  };
  return ctx;
}