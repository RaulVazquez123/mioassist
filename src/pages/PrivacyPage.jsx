import React, { useState, useRef, useEffect } from "react";
import NavBar, { navItems } from "@/components/layout/NavBar";
import { Shield, Mail, X, ChevronDown, ChevronUp } from "lucide-react";
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
      <div className="bg-card rounded-3xl border border-border p-8 max-w-sm w-full soft-shadow text-center space-y-5">
        <h3 className="text-xl font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <div className="flex gap-3">
          <button onClick={onConfirm} style={confirmOption === 0 ? { backgroundColor: "#7dd3fc", borderColor: "#38bdf8", boxShadow: "0 0 0 2px #38bdf8", color: "#0f172a" } : {}} className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all">✅ Ver más</button>
          <button onClick={onCancel} style={confirmOption === 1 ? { backgroundColor: "#fca5a5", borderColor: "#f87171", boxShadow: "0 0 0 2px #f87171", color: "#0f172a" } : {}} className="flex-1 h-12 rounded-2xl border-2 border-border font-semibold text-sm transition-all">❌ Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function CardModal({ title, children, onClose, modalBtn, setModalBtn }) {
  const scrollRef = useRef(null);
  const btnStyle = (idx) => modalBtn === idx ? STYLE_BTN_ACTIVE : {};

  const handleSelect = () => {
    if (modalBtn === 0) onClose();
    if (modalBtn === 1) scrollRef.current?.scrollBy({ top: -200, behavior: "smooth" });
    if (modalBtn === 2) scrollRef.current?.scrollBy({ top: 200, behavior: "smooth" });
  };
  CardModal._handleSelect = handleSelect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-card rounded-3xl border border-border soft-shadow w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { setModalBtn(1); scrollRef.current?.scrollBy({ top: -200, behavior: "smooth" }); }}
              style={btnStyle(1)} className="w-11 h-11 rounded-2xl border-2 border-border flex items-center justify-center transition-all">
              <ChevronUp className="w-5 h-5" />
            </button>
            <button onClick={() => { setModalBtn(2); scrollRef.current?.scrollBy({ top: 200, behavior: "smooth" }); }}
              style={btnStyle(2)} className="w-11 h-11 rounded-2xl border-2 border-border flex items-center justify-center transition-all">
              <ChevronDown className="w-5 h-5" />
            </button>
            <button onClick={onClose} style={btnStyle(0)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-border font-semibold transition-all">
              <X className="w-4 h-4" /> Cerrar
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-5 text-base leading-relaxed">
          {children}
        </div>
        <div className="px-8 py-3 border-t border-border/60 shrink-0">
          <p className="text-xs text-muted-foreground text-center">Derecha → cicla botones · Izquierda → ejecuta</p>
        </div>
      </div>
    </div>
  );
}

const TOTAL_BLOCKS = 3;

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [activeBlock, setActiveBlock] = useState(1);
  const [navBloqueada, setNavBloqueada] = useState(false);
  const [navIdx, setNavIdx] = useState(0);
  const [navConfirmOpen, setNavConfirmOpen] = useState(false);
  const [navConfirmOption, setNavConfirmOption] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOption, setConfirmOption] = useState(0);
  const [modalOpen, setModalOpen] = useState(null);
  const [modalBtn, setModalBtn] = useState(0);

  const stateRef = useRef({});
  stateRef.current = { activeBlock, navBloqueada, navIdx, navConfirmOpen, navConfirmOption, confirmOpen, confirmOption, modalOpen, modalBtn };

  useEMGSimple(WS_URL,
    () => {
      const s = stateRef.current;
      if (s.modalOpen !== null) { setModalBtn((b) => (b + 1) % 3); return; }
      if (s.navConfirmOpen) { setNavConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.confirmOpen) { setConfirmOption((o) => o === 0 ? 1 : 0); return; }
      if (s.activeBlock === 0 && s.navBloqueada) { setNavIdx((i) => (i + 1 >= navItems.length ? 0 : i + 1)); return; }
      setActiveBlock((b) => (b + 1) % TOTAL_BLOCKS);
    },
    () => {
      const s = stateRef.current;
      if (s.modalOpen !== null) { CardModal._handleSelect?.(); return; }
      if (s.navConfirmOpen) {
        if (s.navConfirmOption === 0) navigate(navItems[s.navIdx].to);
        else { setNavConfirmOpen(false); setNavConfirmOption(0); }
        return;
      }
      if (s.confirmOpen) {
        if (s.confirmOption === 0) { setModalOpen(s.activeBlock); setModalBtn(0); setConfirmOpen(false); setConfirmOption(0); }
        else { setConfirmOpen(false); setConfirmOption(0); }
        return;
      }
      if (s.activeBlock === 0) {
        if (!s.navBloqueada) { setNavBloqueada(true); setNavIdx(0); }
        else { setNavConfirmOpen(true); setNavConfirmOption(0); }
        return;
      }
      setConfirmOpen(true); setConfirmOption(0);
    }
  );

  useEffect(() => { if (activeBlock !== 0) { setNavBloqueada(false); setNavIdx(0); } }, [activeBlock]);
  useEffect(() => {
    const id = activeBlock === 0 ? "emg-navbar" : `emg-block-${activeBlock}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeBlock]);

  const navActive = activeBlock === 0;

  return (
    <div className="min-h-screen bg-background">
      {modalOpen === 1 && (
        <CardModal title="Datos, finalidades y consentimiento" onClose={() => setModalOpen(null)} modalBtn={modalBtn} setModalBtn={setModalBtn}>
          <section className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Identidad del Responsable</h3>
              <p className="text-muted-foreground"><strong>MioAssist</strong>, CDMX, México — responsable del tratamiento de datos conforme a la LFPDPPP y su Reglamento.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Datos personales recabados</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Identificación:</strong> nombre, correo electrónico.</li>
                <li><strong>Biométricos sensibles:</strong> señales EMG, patrones musculares.</li>
                <li><strong>Clínicos:</strong> diagnóstico, terapeuta, objetivos.</li>
                <li><strong>Uso:</strong> velocidad, precisión, fatiga muscular.</li>
                <li><strong>Sesión:</strong> texto escrito, palabras seleccionadas.</li>
              </ul>
              <p className="mt-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">⚠️ Señales EMG = <strong>datos sensibles</strong> (Art. 3 LFPDPPP). Requieren consentimiento expreso.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Finalidades primarias</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Escritura asistida por EMG.</li>
                <li>Predicción de texto en tiempo real.</li>
                <li>Almacenar perfil y configuraciones.</li>
                <li>Monitorear métricas de sesión.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Finalidades secundarias</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Compartir métricas con médico (con consentimiento).</li>
                <li>Informes de progreso terapéutico.</li>
                <li>Mejora del sistema (datos anonimizados).</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Revocación del consentimiento</h3>
              <p className="text-muted-foreground">Puede revocar finalidades secundarias desde <strong>Perfil › Datos del paciente › Compartir datos con médico</strong>. La revocación es inmediata para transferencias futuras.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Cambios al aviso</h3>
              <p className="text-muted-foreground">Cambios relevantes serán notificados con 30 días de anticipación. Versión vigente siempre disponible en la sección "Perfil".</p>
            </div>
          </section>
        </CardModal>
      )}
      {modalOpen === 2 && (
        <CardModal title="Transferencias, derechos y seguridad" onClose={() => setModalOpen(null)} modalBtn={modalBtn} setModalBtn={setModalBtn}>
          <section className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Transferencia de datos</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Destinatario</th>
                    <th className="text-left py-2 pr-4 font-semibold">Finalidad</th>
                    <th className="text-left py-2 font-semibold">Consentimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr><td className="py-2 pr-4 text-muted-foreground">Médico / Terapeuta</td><td className="py-2 pr-4 text-muted-foreground">Monitoreo clínico</td><td className="py-2 text-emerald-600 font-medium">Expreso</td></tr>
                  <tr><td className="py-2 pr-4 text-muted-foreground">Proveedor cloud</td><td className="py-2 pr-4 text-muted-foreground">Almacenamiento</td><td className="py-2 text-amber-600 font-medium">Necesario</td></tr>
                  <tr><td className="py-2 pr-4 text-muted-foreground">Autoridades</td><td className="py-2 pr-4 text-muted-foreground">Obligación legal</td><td className="py-2 text-muted-foreground">Sin consentimiento</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Derechos ARCO</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { letter: "A", title: "Acceso", desc: "Conocer qué datos tenemos sobre usted." },
                  { letter: "R", title: "Rectificación", desc: "Corregir datos inexactos o incompletos." },
                  { letter: "C", title: "Cancelación", desc: "Solicitar la eliminación de sus datos." },
                  { letter: "O", title: "Oposición", desc: "Oponerse al tratamiento de sus datos." },
                ].map(({ letter, title, desc }) => (
                  <div key={letter} className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">{letter}</span>
                      <span className="font-semibold">{title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-muted-foreground">✉️ <strong>privacidad@mioassist.mx</strong> · Respuesta en 20 días hábiles.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Medidas de seguridad</h3>
              <div className="grid grid-cols-2 gap-2">
                {["HTTPS/TLS en todas las transmisiones.", "Control de acceso por roles.", "Sesiones con expiración automática.", "Infraestructura ISO 27001.", "Cifrado AES-256 en reposo.", "Sin logs en servidores de terceros."].map((m) => (
                  <div key={m} className="flex items-start gap-2 text-muted-foreground"><span className="text-primary mt-1">•</span><span>{m}</span></div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="font-semibold">Contacto — Responsable de Privacidad</div>
                <div className="text-sm text-muted-foreground">privacidad@mioassist.mx · MioAssist · Ciudad de México, México</div>
              </div>
            </div>
          </section>
        </CardModal>
      )}

      {navConfirmOpen && <ConfirmDialog title={navItems[navIdx].label} subtitle="¿Ir a esta sección?" confirmOption={navConfirmOption}
        onConfirm={() => navigate(navItems[navIdx].to)} onCancel={() => { setNavConfirmOpen(false); setNavConfirmOption(0); }} />}
      {confirmOpen && (
        <ConfirmDialog
          title={activeBlock === 1 ? "Datos, finalidades y consentimiento" : "Transferencias, derechos y seguridad"}
          subtitle="¿Quieres leer más?" confirmOption={confirmOption}
          onConfirm={() => { setModalOpen(activeBlock); setModalBtn(0); setConfirmOpen(false); setConfirmOption(0); }}
          onCancel={() => { setConfirmOpen(false); setConfirmOption(0); }} />
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 space-y-4" style={{ height: "calc(100vh - 32px)", display: "flex", flexDirection: "column" }}>

        <div id="emg-navbar" style={navActive ? { outline: "3px solid #38bdf8", outlineOffset: "4px", borderRadius: "1rem", backgroundColor: "#e0f2fe" } : {}}>
          <NavBar bloqueada={navBloqueada} selectedIdx={navIdx} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Aviso de Privacidad</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Abril 2026 · LFPDPPP (México)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight">Privacidad y <span className="font-semibold">datos</span></h2>
          <p className="text-sm text-muted-foreground mt-0.5">Tratamiento de datos personales conforme a la legislación mexicana.</p>
        </div>

        {/* Cards iguales llenando pantalla */}
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          
          {/* Card 1 */}
          <div id="emg-block-1" style={activeBlock === 1 ? STYLE_ACTIVE : {}}
            className="rounded-3xl border border-border/70 bg-card soft-shadow p-7 flex flex-col gap-4 cursor-pointer transition-all hover:border-accent/50"
            onClick={() => setModalOpen(1)}>
            <div>
              <h3 className="font-semibold text-xl mb-1">Datos, finalidades y consentimiento</h3>
              <p className="text-sm text-muted-foreground">Todo sobre qué datos recabamos y para qué los usamos.</p>
            </div>
            <div className="space-y-2.5 flex-1">
              {[
                { title: "Identidad del responsable", desc: "MioAssist, CDMX — responsable conforme a la LFPDPPP." },
                { title: "Datos recabados", desc: "Nombre, correo, señales EMG, métricas clínicas y de sesión." },
                { title: "Datos sensibles EMG", desc: "⚠️ Requieren consentimiento expreso (Art. 3 LFPDPPP)." },
                { title: "Finalidades primarias", desc: "Escritura EMG, predicción de texto, perfil, métricas." },
                { title: "Finalidades secundarias", desc: "Compartir con médico, informes terapéuticos, mejora del sistema." },
                { title: "Revocación", desc: "Perfil › Datos del paciente › Compartir datos con médico." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 px-4 py-2.5 rounded-xl bg-secondary/40 border border-border/40">
                  <span className="text-primary mt-0.5 shrink-0 text-sm">→</span>
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-primary">Ver más →</span>
          </div>

          {/* Card 2 */}
          <div id="emg-block-2" style={activeBlock === 2 ? STYLE_ACTIVE : {}}
            className="rounded-3xl border border-border/70 bg-card soft-shadow p-7 flex flex-col gap-4 cursor-pointer transition-all hover:border-accent/50"
            onClick={() => setModalOpen(2)}>
            <div>
              <h3 className="font-semibold text-xl mb-1">Transferencias, derechos y seguridad</h3>
              <p className="text-sm text-muted-foreground">Sus derechos y cómo protegemos su información.</p>
            </div>
            <div className="space-y-2.5 flex-1">
              {[
                { title: "Transferencia a médico", desc: "Solo con consentimiento expreso del titular." },
                { title: "Proveedor cloud", desc: "Almacenamiento seguro — necesario para el servicio." },
                { title: "Derecho de Acceso (A)", desc: "Conocer qué datos tenemos sobre usted en cualquier momento." },
                { title: "Rectificación y Cancelación (R/C)", desc: "Corregir datos inexactos o solicitar su eliminación." },
                { title: "Oposición (O)", desc: "Oponerse al tratamiento. Contacto: privacidad@mioassist.mx" },
                { title: "Seguridad técnica", desc: "HTTPS/TLS, AES-256, ISO 27001, expiración de sesión automática." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 px-4 py-2.5 rounded-xl bg-secondary/40 border border-border/40">
                  <span className="text-primary mt-0.5 shrink-0 text-sm">→</span>
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-primary">Ver más →</span>
          </div>

        </div>

      </main>
    </div>
  );
}