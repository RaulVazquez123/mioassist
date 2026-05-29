import React from "react";
import Header from "@/components/layout/Header";
import { Shield, Mail, FileText } from "lucide-react";

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary inline-block" />
        {title}
      </h3>
      <div className="text-sm text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 lg:py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Aviso de Privacidad</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">
            Aviso de <span className="font-semibold">Privacidad</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Última actualización: Abril 2026 · Formato conforme a la LFPDPPP (México)
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card soft-shadow p-7 sm:p-10 space-y-0">

          <Section title="Identidad y domicilio del Responsable">
            <p>
              <strong>MioAssist</strong> (en adelante "el Responsable"), con domicilio en Ciudad de México, México, 
              es responsable del tratamiento de sus datos personales conforme a lo establecido en la 
              Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
            </p>
          </Section>

          <Section title="Datos personales recabados">
            <p>El Responsable recaba las siguientes categorías de datos personales:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
              <li><strong>Datos de identificación:</strong> nombre completo, correo electrónico.</li>
              <li><strong>Datos biométricos sensibles:</strong> señales EMG (electromiográficas), patrones musculares.</li>
              <li><strong>Datos clínicos:</strong> diagnóstico, terapeuta asignado, objetivos terapéuticos.</li>
              <li><strong>Datos de uso:</strong> métricas de escritura, velocidad, precisión, tiempo de uso, fatiga muscular.</li>
              <li><strong>Datos de sesión:</strong> texto escrito durante sesiones, palabras seleccionadas.</li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              ⚠️ Las señales EMG son datos biométricos y se consideran <strong>datos personales sensibles</strong> conforme al Art. 3, fracc. VI de la LFPDPPP. Requieren consentimiento expreso para su tratamiento.
            </p>
          </Section>

          <Section title="Finalidad del tratamiento">
            <p>Sus datos personales serán utilizados para las siguientes finalidades:</p>
            <div className="mt-2 space-y-2">
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <div className="font-semibold text-xs uppercase tracking-wider text-primary mb-1">Finalidades primarias (necesarias)</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Proveer el servicio de escritura asistida por EMG.</li>
                  <li>Procesar señales EMG para predicción de texto en tiempo real.</li>
                  <li>Almacenar configuraciones y perfil del usuario.</li>
                  <li>Monitorear métricas de sesión para retroalimentación al usuario.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Finalidades secundarias (opcionales)</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Compartir métricas clínicas con profesionales de salud autorizados por usted.</li>
                  <li>Generar informes de progreso terapéutico.</li>
                  <li>Mejora y desarrollo del sistema (datos anonimizados).</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Si no desea que sus datos sean utilizados para finalidades secundarias, puede manifestarlo en su Perfil &gt; Datos del paciente.
            </p>
          </Section>

          <Section title="Transferencia de datos">
            <p>Sus datos personales podrán ser transferidos a:</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Destinatario</th>
                    <th className="text-left py-2 pr-4 font-semibold">Finalidad</th>
                    <th className="text-left py-2 font-semibold">Consentimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="py-2 pr-4">Médico / Terapeuta autorizado</td>
                    <td className="py-2 pr-4">Monitoreo clínico</td>
                    <td className="py-2 text-emerald-600 font-medium">Expreso del titular</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Proveedor de infraestructura cloud</td>
                    <td className="py-2 pr-4">Almacenamiento seguro</td>
                    <td className="py-2 text-amber-600 font-medium">Necesario para el servicio</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Autoridades competentes</td>
                    <td className="py-2 pr-4">Obligación legal</td>
                    <td className="py-2 text-muted-foreground">Sin consentimiento (ley)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              No se realizan transferencias internacionales de datos sensibles sin consentimiento expreso adicional.
            </p>
          </Section>

          <Section title="Derechos ARCO">
            <p>
              Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar y Oponerse</strong> al tratamiento de sus datos personales (derechos ARCO), así como a revocar el consentimiento otorgado.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { letter: "A", title: "Acceso", desc: "Conocer qué datos tenemos sobre usted." },
                { letter: "R", title: "Rectificación", desc: "Corregir datos inexactos o incompletos." },
                { letter: "C", title: "Cancelación", desc: "Solicitar la eliminación de sus datos." },
                { letter: "O", title: "Oposición", desc: "Oponerse al uso de sus datos." },
              ].map(({ letter, title, desc }) => (
                <div key={letter} className="rounded-xl border border-border/60 bg-background px-3 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{letter}</span>
                    <span className="font-semibold text-xs">{title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs">
              Para ejercer sus derechos ARCO, envíe su solicitud a: <strong>privacidad@mioassist.mx</strong>. 
              Recibirá respuesta en un plazo no mayor a 20 días hábiles.
            </p>
          </Section>

          <Section title="Medidas de seguridad">
            <ul className="list-disc list-inside space-y-1">
              <li>Transmisión de datos mediante protocolo HTTPS/TLS cifrado.</li>
              <li>Control de acceso por roles (usuario, médico, administrador).</li>
              <li>Sesiones con expiración automática para proteger datos inactivos.</li>
              <li>Infraestructura con certificación ISO 27001 (proveedor cloud).</li>
              <li>Arquitectura preparada para cifrado AES-256 en reposo.</li>
              <li>Sin registro de datos de escritura en servidores de terceros.</li>
            </ul>
          </Section>

          <Section title="Revocación del consentimiento">
            <p>
              Puede revocar el consentimiento para el tratamiento de sus datos en cualquier momento, 
              especialmente para finalidades secundarias (compartir con médico, mejora del sistema).
            </p>
            <p className="mt-2">
              Para revocar: vaya a <strong>Perfil &gt; Datos del paciente &gt; Compartir datos con médico</strong> y 
              desactive la opción. La revocación será efectiva de forma inmediata para transferencias futuras.
            </p>
          </Section>

          <Section title="Cambios al aviso de privacidad">
            <p>
              El presente aviso puede ser modificado. Cualquier cambio relevante será notificado mediante 
              aviso en la aplicación con al menos 30 días de anticipación. La versión vigente siempre 
              estará disponible en la sección "Perfil" y en el pie de página de la aplicación.
            </p>
          </Section>

          {/* Contact */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Contacto del Responsable de Privacidad</div>
              <div className="text-sm text-muted-foreground mt-1">
                privacidad@mioassist.mx · MioAssist · Ciudad de México, México
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}