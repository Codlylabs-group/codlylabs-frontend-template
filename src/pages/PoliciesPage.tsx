import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  Scale,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '../i18n'

type LText = {
  en: string
  es: string
}

type PolicySection = {
  title: LText
  paragraph?: LText
  bullets?: LText[]
}

type PolicyDoc = {
  id: string
  icon: LucideIcon
  title: LText
  subtitle: LText
  effectiveDate: LText
  owner: string
  sections: PolicySection[]
  contactLabel: LText
  contactEmail: string
}

const POLICY_DOCS: PolicyDoc[] = [
  {
    id: 'privacy-policy',
    icon: Lock,
    title: { en: 'Privacy Policy (Baseline v1.0)', es: 'Politica de Privacidad (Baseline v1.0)' },
    subtitle: {
      en: 'How personal and operational data is processed across the platform.',
      es: 'Como se procesan los datos personales y operativos dentro de la plataforma.',
    },
    effectiveDate: { en: 'February 19, 2026', es: '19 de febrero de 2026' },
    owner: 'CodlyLabs',
    sections: [
      {
        title: { en: 'Scope', es: 'Alcance' },
        paragraph: {
          en: 'This policy applies to CodlyLabs platform services used to generate, preview, package, and manage AI PoCs.',
          es: 'Esta politica aplica a los servicios de CodlyLabs usados para generar, previsualizar, empaquetar y gestionar PoCs de IA.',
        },
      },
      {
        title: { en: 'Data We Process', es: 'Datos que Procesamos' },
        bullets: [
          {
            en: 'Account and organization data: email, name, role, organization metadata.',
            es: 'Datos de cuenta y organizacion: email, nombre, rol y metadatos de la organizacion.',
          },
          {
            en: 'Product usage data: generation requests, run metadata, compliance runs, audit events.',
            es: 'Datos de uso del producto: requests de generacion, metadatos de ejecucion, corridas de compliance y eventos de auditoria.',
          },
          {
            en: 'PoC content data: prompts, configuration, generated artifacts.',
            es: 'Datos de contenido de PoC: prompts, configuracion y artefactos generados.',
          },
          {
            en: 'Billing data: subscription and payment status metadata.',
            es: 'Datos de facturacion: metadatos de suscripcion y estado de pagos.',
          },
        ],
      },
      {
        title: { en: 'Processing Purposes', es: 'Finalidades del Tratamiento' },
        bullets: [
          { en: 'Deliver platform functionality.', es: 'Entregar funcionalidad de la plataforma.' },
          { en: 'Improve platform reliability and security.', es: 'Mejorar la confiabilidad y seguridad de la plataforma.' },
          { en: 'Provide compliance, auditability, and operational monitoring.', es: 'Proveer compliance, auditabilidad y monitoreo operativo.' },
          { en: 'Support billing and abuse prevention.', es: 'Soportar facturacion y prevencion de abuso.' },
        ],
      },
      {
        title: { en: 'Legal Basis (where applicable)', es: 'Base Legal (cuando aplica)' },
        bullets: [
          { en: 'Contractual necessity.', es: 'Necesidad contractual.' },
          { en: 'Legitimate interest for security and platform operations.', es: 'Interes legitimo para seguridad y operaciones de la plataforma.' },
          { en: 'Consent, when explicitly required for a specific workflow.', es: 'Consentimiento, cuando sea requerido explicitamente para un flujo especifico.' },
        ],
      },
      {
        title: { en: 'Data Retention', es: 'Retencion de Datos' },
        bullets: [
          { en: 'Audit events: per configured retention policy.', es: 'Eventos de auditoria: segun politica de retencion configurada.' },
          { en: 'Compliance runs and evidence: per configured retention policy.', es: 'Corridas de compliance y evidencia: segun politica de retencion configurada.' },
          { en: 'Operational logs: per configured logging retention policy.', es: 'Logs operativos: segun politica de retencion de logs configurada.' },
          { en: 'Billing records: retained as required for accounting and legal obligations.', es: 'Registros de facturacion: retenidos segun obligaciones contables y legales.' },
        ],
      },
      {
        title: { en: 'Data Subject Rights', es: 'Derechos de Titulares' },
        paragraph: {
          en: 'CodlyLabs provides operational APIs for:',
          es: 'CodlyLabs provee APIs operativas para:',
        },
        bullets: [
          { en: 'Data inventory retrieval per PoC.', es: 'Consulta de inventario de datos por PoC.' },
          { en: 'Data export per PoC.', es: 'Exportacion de datos por PoC.' },
          { en: 'Data deletion per PoC scope.', es: 'Eliminacion de datos dentro del alcance de la PoC.' },
        ],
      },
      {
        title: { en: 'Security Controls', es: 'Controles de Seguridad' },
        bullets: [
          { en: 'Structured logging with request correlation.', es: 'Logging estructurado con correlacion por request.' },
          { en: 'Security scanning in compliance evaluation.', es: 'Escaneo de seguridad dentro de la evaluacion de compliance.' },
          { en: 'Compliance gate for delivery-sensitive actions.', es: 'Compliance gate para acciones sensibles de entrega.' },
          { en: 'Access control with role-based restrictions.', es: 'Control de acceso con restricciones por rol.' },
        ],
      },
      {
        title: { en: 'International Transfers', es: 'Transferencias Internacionales' },
        paragraph: {
          en: 'When data is processed across regions/providers, contractual and technical safeguards are applied according to applicable law.',
          es: 'Cuando los datos se procesan entre regiones/proveedores, se aplican salvaguardas contractuales y tecnicas segun la normativa aplicable.',
        },
      },
    ],
    contactLabel: { en: 'For privacy requests and inquiries:', es: 'Para consultas y solicitudes de privacidad:' },
    contactEmail: 'privacy@codlylabs.ai',
  },
  {
    id: 'terms-of-service',
    icon: Scale,
    title: { en: 'Terms of Service (Baseline v1.0)', es: 'Terminos del Servicio (Baseline v1.0)' },
    subtitle: {
      en: 'Service conditions, responsibilities, and acceptable use.',
      es: 'Condiciones de servicio, responsabilidades y uso aceptable.',
    },
    effectiveDate: { en: 'February 19, 2026', es: '19 de febrero de 2026' },
    owner: 'CodlyLabs',
    sections: [
      {
        title: { en: 'Service', es: 'Servicio' },
        paragraph: {
          en: 'CodlyLabs provides a software platform to generate, preview, and package AI PoCs.',
          es: 'CodlyLabs provee una plataforma de software para generar, previsualizar y empaquetar PoCs de IA.',
        },
      },
      {
        title: { en: 'Customer Responsibilities', es: 'Responsabilidades del Cliente' },
        bullets: [
          { en: 'Provide lawful input data and usage.', es: 'Aportar datos de entrada y uso de forma licita.' },
          { en: 'Ensure internal authorization for uploaded or processed data.', es: 'Asegurar autorizacion interna sobre datos cargados o procesados.' },
          { en: 'Review generated artifacts before production usage.', es: 'Revisar artefactos generados antes de usarlos en produccion.' },
        ],
      },
      {
        title: { en: 'Acceptable Use', es: 'Uso Aceptable' },
        paragraph: {
          en: 'Users must not use the service for:',
          es: 'Los usuarios no deben usar el servicio para:',
        },
        bullets: [
          { en: 'Illegal activity.', es: 'Actividad ilegal.' },
          { en: 'Abuse, intrusion, or unauthorized access attempts.', es: 'Abuso, intrusion o intentos de acceso no autorizado.' },
          { en: 'Uploading data they are not authorized to process.', es: 'Subir datos que no estan autorizados a procesar.' },
        ],
      },
      {
        title: { en: 'Security and Compliance Positioning', es: 'Posicion de Seguridad y Compliance' },
        bullets: [
          {
            en: 'The platform provides security baseline and compliance controls aligned with implemented scope.',
            es: 'La plataforma ofrece controles base de seguridad y compliance alineados al alcance implementado.',
          },
          {
            en: 'Claims beyond implemented scope are excluded unless explicitly documented.',
            es: 'Afirmaciones fuera del alcance implementado quedan excluidas salvo documentacion explicita.',
          },
        ],
      },
      {
        title: { en: 'Service Availability', es: 'Disponibilidad del Servicio' },
        paragraph: {
          en: 'CodlyLabs targets operational reliability but does not guarantee uninterrupted availability in all circumstances.',
          es: 'CodlyLabs apunta a alta confiabilidad operativa, pero no garantiza disponibilidad ininterrumpida en todas las circunstancias.',
        },
      },
      {
        title: { en: 'Limitation of Liability', es: 'Limitacion de Responsabilidad' },
        paragraph: {
          en: 'To the extent permitted by law, CodlyLabs is not liable for indirect or consequential damages from platform usage.',
          es: 'En la medida permitida por ley, CodlyLabs no responde por danos indirectos o consecuenciales derivados del uso de la plataforma.',
        },
      },
      {
        title: { en: 'Termination', es: 'Terminacion' },
        paragraph: {
          en: 'CodlyLabs may suspend or terminate access for violation of these terms or security abuse.',
          es: 'CodlyLabs puede suspender o terminar accesos por violacion de estos terminos o abuso de seguridad.',
        },
      },
      {
        title: { en: 'Governing Law', es: 'Ley Aplicable' },
        paragraph: {
          en: 'These terms are governed by the applicable law defined in commercial agreements.',
          es: 'Estos terminos se rigen por la ley aplicable definida en los acuerdos comerciales.',
        },
      },
    ],
    contactLabel: { en: 'For legal inquiries:', es: 'Para consultas legales:' },
    contactEmail: 'legal@codlylabs.ai',
  },
  {
    id: 'security-overview',
    icon: ShieldCheck,
    title: { en: 'Security Overview (Baseline v1.0)', es: 'Resumen de Seguridad (Baseline v1.0)' },
    subtitle: {
      en: 'Baseline controls, operational safeguards, and scope boundaries.',
      es: 'Controles base, salvaguardas operativas y limites de alcance.',
    },
    effectiveDate: { en: 'February 19, 2026', es: '19 de febrero de 2026' },
    owner: 'CodlyLabs',
    sections: [
      {
        title: { en: 'Security Architecture Highlights', es: 'Puntos Clave de Arquitectura de Seguridad' },
        bullets: [
          { en: 'API backend with authenticated access controls.', es: 'Backend API con controles de acceso autenticados.' },
          { en: 'Structured request-context logging for traceability.', es: 'Logging estructurado por contexto de request para trazabilidad.' },
          { en: 'Security scanner integrated into compliance evaluation.', es: 'Scanner de seguridad integrado en la evaluacion de compliance.' },
          { en: 'Compliance gate for download/share/deploy sensitive actions.', es: 'Compliance gate para acciones sensibles de descarga/compartido/deploy.' },
        ],
      },
      {
        title: { en: 'Data Protection Controls', es: 'Controles de Proteccion de Datos' },
        bullets: [
          { en: 'Configurable retention policies for audit and compliance evidence.', es: 'Politicas configurables de retencion para auditoria y evidencia de compliance.' },
          { en: 'Privacy inventory and data rights operational endpoints.', es: 'Inventario de privacidad y endpoints operativos para derechos de datos.' },
          { en: 'PII/PHI pattern redaction for structured logs.', es: 'Redaccion de patrones PII/PHI en logs estructurados.' },
        ],
      },
      {
        title: { en: 'Compliance Controls', es: 'Controles de Compliance' },
        bullets: [
          { en: 'Versioned compliance control catalog.', es: 'Catalogo versionado de controles de compliance.' },
          { en: 'Persisted compliance runs and per-control results.', es: 'Persistencia de corridas de compliance y resultados por control.' },
          { en: 'Evidence artifacts stored with SHA256 checksums.', es: 'Artefactos de evidencia almacenados con checksum SHA256.' },
          { en: 'Risk exceptions with owner, justification, and expiration.', es: 'Excepciones de riesgo con responsable, justificacion y vencimiento.' },
        ],
      },
      {
        title: { en: 'Operational Security', es: 'Seguridad Operativa' },
        bullets: [
          { en: 'Health and runtime observability.', es: 'Salud del sistema y observabilidad de runtime.' },
          { en: 'Incident runbooks for compliance operations.', es: 'Runbooks de incidentes para operaciones de compliance.' },
          { en: 'Alerts derived from compliance KPIs and risk thresholds.', es: 'Alertas derivadas de KPIs de compliance y umbrales de riesgo.' },
        ],
      },
      {
        title: { en: 'Current Scope Boundaries', es: 'Limites del Alcance Actual' },
        bullets: [
          {
            en: 'Security baseline and compliance-ready controls are implemented to declared scope.',
            es: 'Los controles base de seguridad y compliance-ready se implementan en el alcance declarado.',
          },
          {
            en: 'External certifications are out of scope unless explicitly announced as achieved.',
            es: 'Certificaciones externas quedan fuera de alcance salvo anuncio explicito de logro.',
          },
        ],
      },
    ],
    contactLabel: { en: 'For security questions:', es: 'Para consultas de seguridad:' },
    contactEmail: 'security@codlylabs.ai',
  },
  {
    id: 'dpa-template',
    icon: FileText,
    title: { en: 'Data Processing Addendum (Template v1.0)', es: 'Anexo de Procesamiento de Datos (DPA v1.0)' },
    subtitle: {
      en: 'Data processing terms between Controller and Processor.',
      es: 'Terminos de procesamiento de datos entre Controlador y Procesador.',
    },
    effectiveDate: { en: 'February 19, 2026', es: '19 de febrero de 2026' },
    owner: 'CodlyLabs',
    sections: [
      {
        title: { en: 'Parties', es: 'Partes' },
        paragraph: {
          en: 'This DPA governs processing of personal data by CodlyLabs (Processor) on behalf of Customer (Controller), unless otherwise contractually defined.',
          es: 'Este DPA regula el tratamiento de datos personales por CodlyLabs (Procesador) en nombre del Cliente (Controlador), salvo definicion contractual distinta.',
        },
      },
      {
        title: { en: 'Subject Matter and Duration', es: 'Objeto y Duracion' },
        paragraph: {
          en: 'Processing covers platform usage required to generate, preview, package, and monitor AI PoCs for the term of the customer agreement.',
          es: 'El tratamiento cubre el uso de la plataforma necesario para generar, previsualizar, empaquetar y monitorear PoCs de IA durante la vigencia del acuerdo con el cliente.',
        },
      },
      {
        title: { en: 'Nature and Purpose of Processing', es: 'Naturaleza y Finalidad del Tratamiento' },
        bullets: [
          { en: 'AI PoC generation and orchestration.', es: 'Generacion y orquestacion de PoCs de IA.' },
          { en: 'Compliance and audit operations.', es: 'Operaciones de compliance y auditoria.' },
          { en: 'Security monitoring and abuse prevention.', es: 'Monitoreo de seguridad y prevencion de abuso.' },
        ],
      },
      {
        title: { en: 'Categories of Data Subjects', es: 'Categorias de Titulares' },
        bullets: [
          { en: 'Customer users and administrators.', es: 'Usuarios y administradores del cliente.' },
          { en: 'End-users included in customer-provided datasets (as applicable).', es: 'Usuarios finales incluidos en datasets provistos por el cliente (cuando aplique).' },
        ],
      },
      {
        title: { en: 'Categories of Personal Data', es: 'Categorias de Datos Personales' },
        bullets: [
          { en: 'Identification and account metadata.', es: 'Metadatos de identificacion y cuenta.' },
          { en: 'Operational usage metadata.', es: 'Metadatos operativos de uso.' },
          { en: 'Data categories explicitly registered in privacy inventory workflows.', es: 'Categorias de datos registradas explicitamente en flujos de inventario de privacidad.' },
        ],
      },
      {
        title: { en: 'Processor Obligations', es: 'Obligaciones del Procesador' },
        bullets: [
          { en: 'Process data only under documented instructions.', es: 'Procesar datos solo bajo instrucciones documentadas.' },
          { en: 'Apply appropriate technical and organizational security measures.', es: 'Aplicar medidas tecnicas y organizativas de seguridad apropiadas.' },
          { en: 'Assist the Controller in data subject rights workflows within platform scope.', es: 'Asistir al Controlador en flujos de derechos de titulares dentro del alcance de la plataforma.' },
          { en: 'Maintain auditability of relevant processing actions.', es: 'Mantener auditabilidad de acciones relevantes de procesamiento.' },
        ],
      },
      {
        title: { en: 'Sub-processors', es: 'Subprocesadores' },
        paragraph: {
          en: 'CodlyLabs may use infrastructure and service providers to operate the platform. Applicable safeguards and contractual controls are maintained.',
          es: 'CodlyLabs puede usar proveedores de infraestructura y servicios para operar la plataforma. Se mantienen salvaguardas y controles contractuales aplicables.',
        },
      },
      {
        title: { en: 'Security Measures', es: 'Medidas de Seguridad' },
        bullets: [
          { en: 'Access controls and authentication.', es: 'Controles de acceso y autenticacion.' },
          { en: 'Security scanning and compliance gate operations.', es: 'Escaneo de seguridad y operaciones de compliance gate.' },
          { en: 'Structured audit trail persistence.', es: 'Persistencia estructurada de trazas de auditoria.' },
          { en: 'Retention and deletion controls per configured policies.', es: 'Controles de retencion y eliminacion segun politicas configuradas.' },
        ],
      },
      {
        title: { en: 'Breach Notification', es: 'Notificacion de Incidentes' },
        paragraph: {
          en: 'CodlyLabs notifies Customer without undue delay after confirming a relevant personal data incident within platform scope.',
          es: 'CodlyLabs notifica al Cliente sin demora indebida tras confirmar un incidente relevante de datos personales dentro del alcance de la plataforma.',
        },
      },
      {
        title: { en: 'Return/Deletion', es: 'Devolucion/Eliminacion' },
        paragraph: {
          en: 'Upon termination and as instructed by Customer, CodlyLabs supports deletion/export workflows according to contractual and legal requirements.',
          es: 'Ante terminacion y segun instruccion del Cliente, CodlyLabs soporta flujos de eliminacion/exportacion conforme requisitos contractuales y legales.',
        },
      },
      {
        title: { en: 'Audit Support', es: 'Soporte de Auditoria' },
        paragraph: {
          en: 'CodlyLabs provides reasonable evidence outputs and compliance reports within implemented platform scope.',
          es: 'CodlyLabs provee evidencias razonables y reportes de compliance dentro del alcance implementado de la plataforma.',
        },
      },
    ],
    contactLabel: { en: 'For DPA/compliance requests:', es: 'Para solicitudes DPA/compliance:' },
    contactEmail: 'privacy@codlylabs.ai',
  },
]

export default function PoliciesPage() {
  const { language, t } = useI18n()
  const isSpanish = language === 'es'
  const l = (text: LText) => (isSpanish ? text.es : text.en)

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-indigo-500/10 shadow-sm shadow-indigo-500/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CodlyLabs
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-28 pb-20 px-6 max-w-5xl mx-auto w-full space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl p-10 border border-gray-200/10"
          style={{ background: 'linear-gradient(135deg, rgba(228,223,255,0.3) 0%, #f8f9fa 50%, rgba(211,228,254,0.2) 100%)' }}>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">CodlyLabs</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {isSpanish ? 'Centro legal y de compliance' : 'Legal and compliance center'}
            </h2>
            <p className="text-gray-500 max-w-xl leading-relaxed">
              {isSpanish
                ? 'Contenido legal completo para privacidad, términos de servicio, seguridad y DPA.'
                : 'Complete legal content for privacy, terms of service, security, and DPA.'}
            </p>
          </div>
        </section>

        {/* Quick Nav */}
        <div className="flex flex-wrap gap-2">
          {POLICY_DOCS.map((doc) => (
            <a
              key={doc.id}
              href={`#${doc.id}`}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 text-xs font-semibold transition-all shadow-sm"
            >
              {l(doc.title)}
            </a>
          ))}
        </div>

        {/* Documents */}
        {POLICY_DOCS.map((doc) => {
          const Icon = doc.icon
          return (
            <article key={doc.id} id={doc.id} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{l(doc.title)}</h3>
                  <p className="text-gray-500 mt-1">{l(doc.subtitle)}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    <span className="font-semibold">{isSpanish ? 'Vigencia:' : 'Effective:'}</span>{' '}
                    {l(doc.effectiveDate)}
                    <span className="mx-2">|</span>
                    <span className="font-semibold">{isSpanish ? 'Responsable:' : 'Owner:'}</span>{' '}
                    {doc.owner}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {doc.sections.map((section, index) => (
                  <div key={`${doc.id}-${section.title.en}`}>
                    <h4 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {index + 1}. {l(section.title)}
                    </h4>
                    {section.paragraph && (
                      <p className="mt-2 text-gray-500 leading-relaxed">{l(section.paragraph)}</p>
                    )}
                    {section.bullets && (
                      <ul className="mt-3 space-y-2">
                        {section.bullets.map((item) => (
                          <li key={`${doc.id}-${section.title.en}-${item.en}`} className="flex items-start gap-2 text-gray-500">
                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0" />
                            {l(item)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-5 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">{l(doc.contactLabel)}</span>{' '}
                  <a href={`mailto:${doc.contactEmail}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    {doc.contactEmail}
                  </a>
                </p>
              </div>
            </article>
          )
        })}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-gray-50 border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <span className="text-sm text-slate-400">{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <nav className="flex gap-6">
            <Link to="/contact" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.contact')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
