import type { RoiOracleCase } from '../types/roi'

export const roiOracleCases: RoiOracleCase[] = [
  {
    id: 'retail-inventory-optimization',
    title: 'Optimización de inventario con señales de demanda',
    vertical: 'Retail',
    summary:
      'Conciliar datos de POS, e-commerce y logística para reequilibrar inventario casi en tiempo real, reduciendo faltantes y exceso de stock mientras disminuye el capital de trabajo.',
    roiMin: 600,
    roiMax: 1500,
    paybackMonths: 2,
    timeline: '5–7 weeks',
    estimatedWeeks: 6,
    riskLevel: 'Low',
    confidence: 'High',
    dataAssets: ['POS', 'Inventario', 'Clima', 'Promociones'],
    reasoningHighlights: [
      'Reusa salidas del pronóstico de demanda (Retail Pack) en lugar de comenzar desde cero',
      'Se integra con los flujos actuales de reabastecimiento y tickets',
    ],
  },
  {
    id: 'finance-accounts-receivable-oracle',
    title: 'Aceleración de cobranzas y oráculo de riesgo',
    vertical: 'Finance',
    summary:
      'Combina ERP, tesorería y datos de clientes para priorizar facturas vencidas, acelerar el seguimiento y proyectar ahorro en capital de trabajo.',
    roiMin: 420,
    roiMax: 900,
    paybackMonths: 1.5,
    timeline: '6–8 weeks',
    estimatedWeeks: 7,
    riskLevel: 'Medium',
    confidence: 'High',
    dataAssets: ['ERP', 'Tesorería', 'Cobranza'],
    reasoningHighlights: [
      'Aprovecha modelos existentes de riesgo crediticio (Industry DNA Finance) como base',
      'Entrega dashboards listos para CFO con rangos de upside/downside',
    ],
  },
  {
    id: 'healthcare-clinical-triage-co-pilot',
    title: 'Copiloto de adopción IA para triage clínico',
    vertical: 'Healthcare',
    summary:
      'Agrupa notas clínicas, agendas y KPIs de throughput para identificar la próxima automatización de alto impacto, alineando líderes clínicos con ROI medible y compliance.',
    roiMin: 280,
    roiMax: 520,
    paybackMonths: 2.5,
    timeline: '7–9 weeks',
    estimatedWeeks: 8,
    riskLevel: 'Medium',
    confidence: 'Medium',
    dataAssets: ['EHR', 'Agenda', 'Resultados de laboratorio'],
    reasoningHighlights: [
      'El monitoreo guiado asegura que la siguiente PoC se base en métricas validadas',
      'Playbooks de gestión del cambio incluidos reducen fricción con stakeholders',
    ],
  },
  {
    id: 'retail-personalized-marketing',
    title: 'Copiloto de marketing personalizado y conversión',
    vertical: 'Retail',
    summary:
      'Genera promociones sensibles a cohortes y fusiona datos CRM con señales de comportamiento para estimar incremento de conversión y reducción del CPA.',
    roiMin: 700,
    roiMax: 1300,
    paybackMonths: 1.5,
    timeline: '4–6 weeks',
    estimatedWeeks: 5,
    riskLevel: 'High',
    confidence: 'Medium',
    dataAssets: ['CRM', 'Commerce', 'Marketing Automation'],
    reasoningHighlights: [
      'Construido sobre el vertical pack Retail y conectores de marketing',
      'Las bandas de confianza y rangos de ROI se publican directamente en los guiones de recomendación',
    ],
  },
]
