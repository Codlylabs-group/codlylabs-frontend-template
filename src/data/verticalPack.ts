import type {
  VerticalPackTimelineItem,
  VerticalConnector,
  VerticalPackSummary,
} from '../types/verticalPack'
import type { Language } from '../i18n'

type VerticalPackStaticData = {
  summary: VerticalPackSummary
  timeline: VerticalPackTimelineItem[]
  connectors: VerticalConnector[]
  portfolio: Array<{
    slug: string
    name: string
    badge: string
    summary: string
  }>
}

const STATIC_DATA: Record<Language, VerticalPackStaticData> = {
  en: {
    summary: {
      vertical: 'Vertical packs: Retail, Healthcare, and Fintech',
      pocTemplates: 120,
      curatedCases: 320,
      complianceModules: ['PCI billing', 'GDPR customer data', 'PCI auditing'],
    },
    timeline: [
      {
        phase: 'Week 1-4',
        focus: 'Discovery + Benchmarks',
        deliverables: [
          '120 retail-specific PoCs (pricing, inventory, marketing)',
          'Industry KPI and cost benchmarks',
          'Initial roadmap with validated success criteria',
        ],
      },
      {
        phase: 'Week 5-8',
        focus: 'Integrations + Compliance',
        deliverables: [
          'Connectors: Salesforce, ServiceNow, HubSpot, core banking',
          'Compliance templates (AML/KYC, PCI, Privacy by Design)',
          'Change management runbooks with executive roles',
        ],
      },
      {
        phase: 'Week 9-12',
        focus: 'Pack Operationalization',
        deliverables: [
          'Adoption playbooks and success monitoring',
          'CFO/CEO-ready documents with vertical ROI Oracle',
          'Triggers for continuous opportunity discovery',
        ],
      },
    ],
    connectors: [
      { name: 'SerpAPI Search', system: 'Search', status: 'ready' },
      { name: 'SerpAPI Scholar', system: 'Search', status: 'ready' },
      { name: 'PubMed Search', system: 'Search', status: 'ready' },
      { name: 'Gmail Reader', system: 'Email', status: 'ready' },
      { name: 'SendGrid Email', system: 'Email', status: 'ready' },
      { name: 'Slack Messenger', system: 'Communication', status: 'ready' },
      { name: 'Twilio SMS', system: 'Communication', status: 'ready' },
      { name: 'Google Calendar', system: 'Productivity', status: 'ready' },
      { name: 'Google Meet', system: 'Productivity', status: 'ready' },
      { name: 'Notion Pages', system: 'Productivity', status: 'ready' },
      { name: 'GitHub Repos', system: 'Development', status: 'ready' },
      { name: 'Jira Issues', system: 'Development', status: 'ready' },
      { name: 'Webhook Trigger', system: 'Automation', status: 'ready' },
      { name: 'OCR Extract', system: 'Document Processing', status: 'ready' },
    ],
    portfolio: [
      {
        slug: 'fintech',
        name: 'Banking & Fintech',
        badge: 'Mature',
        summary:
          'AI validation with design patterns inspired by SOX, Basel and similar regulatory frameworks. Risk and fraud PoCs ready to deploy in your on-prem data center with zero sensitive-data movement.',
      },
      {
        slug: 'retail',
        name: 'Retail & E-commerce',
        badge: 'Mature',
        summary:
          'Predictive solutions that target >7% net margin lift and 50% stockout reduction. Includes dynamic pricing and conversational assistants.',
      },
      {
        slug: 'healthcare',
        name: 'Healthcare & Pharma',
        badge: 'Ready',
        summary:
          'AI for R&D and diagnostics with design patterns inspired by HIPAA and GDPR principles. Automates extraction from journals and clinical records following privacy-by-design practices.',
      },
    ],
  },
  es: {
    summary: {
      vertical: 'Vertical packs: Retail, Salud y Finanzas',
      pocTemplates: 120,
      curatedCases: 320,
      complianceModules: ['Facturación PCI', 'Datos de clientes GDPR', 'Auditoría PCI'],
    },
    timeline: [
      {
        phase: 'Semana 1-4',
        focus: 'Discovery + Benchmarks',
        deliverables: [
          '120 PoCs específicos para retail (pricing, inventario, marketing)',
          'Benchmarks de KPIs y costos por sector',
          'Roadmap inicial con criterios de éxito validados',
        ],
      },
      {
        phase: 'Semana 5-8',
        focus: 'Integraciones + Compliance',
        deliverables: [
          'Conectores: Salesforce, ServiceNow, HubSpot, core banking',
          'Plantillas de compliance (AML/KYC, PCI, Privacy by Design)',
          'Runbooks de change management con roles ejecutivos',
        ],
      },
      {
        phase: 'Semana 9-12',
        focus: 'Operacionalización del Pack',
        deliverables: [
          'Playbooks de adopción y monitoreo de resultados',
          'Documentos para CFO/CEO con ROI Oracle por vertical',
          'Activadores para descubrimiento continuo de oportunidades',
        ],
      },
    ],
    connectors: [
      { name: 'SerpAPI Search', system: 'Busqueda', status: 'ready' },
      { name: 'SerpAPI Scholar', system: 'Busqueda', status: 'ready' },
      { name: 'PubMed Search', system: 'Busqueda', status: 'ready' },
      { name: 'Gmail Reader', system: 'Email', status: 'ready' },
      { name: 'SendGrid Email', system: 'Email', status: 'ready' },
      { name: 'Slack Messenger', system: 'Comunicacion', status: 'ready' },
      { name: 'Twilio SMS', system: 'Comunicacion', status: 'ready' },
      { name: 'Google Calendar', system: 'Productividad', status: 'ready' },
      { name: 'Google Meet', system: 'Productividad', status: 'ready' },
      { name: 'Notion Pages', system: 'Productividad', status: 'ready' },
      { name: 'GitHub Repos', system: 'Desarrollo', status: 'ready' },
      { name: 'Jira Issues', system: 'Desarrollo', status: 'ready' },
      { name: 'Webhook Trigger', system: 'Automatizacion', status: 'ready' },
      { name: 'OCR Extract', system: 'Procesamiento Documental', status: 'ready' },
    ],
    portfolio: [
      {
        slug: 'fintech',
        name: 'Banca & Fintech',
        badge: 'Dominado',
        summary:
          'Adopción de IA con patrones de diseño inspirados en marcos regulatorios (SOX, Basilea, etc.). PoCs de riesgo y fraude listas para desplegar en data center on-prem, con cero movimiento de datos sensibles.',
      },
      {
        slug: 'retail',
        name: 'Retail & E-commerce',
        badge: 'Dominado',
        summary:
          'Soluciones predictivas para aumentar el margen neto >7% y reducir stockout en 50%. Incluye PoCs de pricing dinámico y asistentes conversacionales.',
      },
      {
        slug: 'healthcare',
        name: 'Salud & Pharma',
        badge: 'Listo',
        summary:
          'IA para I+D y diagnóstico con patrones de diseño inspirados en principios de HIPAA y GDPR. Automatiza extracción de journals y registros clínicos siguiendo prácticas de privacy-by-design.',
      },
    ],
  },
}

export function getVerticalPackStaticData(language: Language): VerticalPackStaticData {
  return STATIC_DATA[language] || STATIC_DATA.en
}
