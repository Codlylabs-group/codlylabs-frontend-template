import type { Message, DiscoverySummary, DiscoveryProgressResponse } from '../types/discovery'

const now = Date.now()

const timestamp = (offsetMinutes: number) =>
  new Date(now + offsetMinutes * 60 * 1000).toISOString()

export const devDiscoveryMessages: Message[] = [
  {
    role: 'client',
    message: 'Estamos lanzando una tienda omnicanal y necesitamos automatizar la respuesta a clientes con recomendaciones personalizadas.',
    timestamp: timestamp(0),
  },
  {
    role: 'agent',
    message:
      'Perfecto, ¿podrías contarme cuánta información de compras y navegación tienen disponible hoy y en qué sistemas?',
    timestamp: timestamp(1),
  },
  {
    role: 'client',
    message:
      'Tenemos datos históricos de pedidos, clics y tickets en Salesforce y Redshift, pero no están unificados. Queremos una PoC que entregue respuestas rápidas y personalizadas.',
    timestamp: timestamp(2),
  },
  {
    role: 'agent',
    message:
      'Gracias. Con esa base podemos priorizar recomendadores en la app móvil y canal web. Identifiqué que los recursos más valiosos son las métricas de conversión y los atributos de productos.',
    timestamp: timestamp(3),
  },
  {
    role: 'client',
    message:
      'Además, el equipo comercial requiere que podamos exportar un reporte ejecutivo y un plan de adopción.',
    timestamp: timestamp(4),
  },
  {
    role: 'agent',
    message:
      'Excelente. Estamos listos para generar la PoC. En unos minutos tendremos el DNA del caso y podrás ver la recomendación y la síntesis ejecutiva.',
    timestamp: timestamp(5),
  },
]

export const devDiscoveryProgress: DiscoveryProgressResponse = {
  estimated_completion: '100',
  objectives_achieved: {
    business_problem: true,
    organization_context: true,
    business_objective: true,
    data_landscape: true,
    volume_scale: true,
    constraints: true,
    current_process: true,
    pain_points: true,
    tech_stack: true,
    team_info: true,
    stakeholders: true,
    previous_attempts: true,
    success_metrics: true,
    timeline: true,
  },
}

export const devDiscoverySummary: DiscoverySummary = {
  session_id: 'dev-session',
  narrative:
    'La PoC propuesta responde a la necesidad de unificador datos de ventas y recomendaciones personalizadas, entregando insights accionables para el equipo comercial.',
  business_problem: 'Respuestas lentas y descoordinadas entre canales digitales.',
  business_objective: 'Aumentar las conversiones a través de recomendaciones personalizadas.',
  data_type: 'text',  // Texto - inferirá GENERATIVE (chatbot/RAG)
  organization_context: {
    industry: 'Retail',
    industry_confidence: 0.8,
    company_size: 'Mid-Market',
    maturity_level: 'Medium',
  },
  data_landscape: {
    data_types_mentioned: ['Transactions', 'Tickets', 'Clicks'],
    data_sources: ['Salesforce', 'Redshift'],
  },
  constraints: {
    budget_mentioned: true,
    budget_level: 'Moderate',
    timeline_mentioned: true,
    timeline: '8 semanas',
    compliance_requirements: ['GDPR'],
    technical_constraints: ['Integración con Salesforce', 'Límite de capacidad en Redshift'],
  },
  additional_context: {
    solutions_tried: ['Automatización básica con reglas', 'Tableros manuales'],
    pain_points: ['Falta de personalización', 'Respuestas tardías'],
    success_metrics: ['Conversión', 'CSAT'],
    stakeholders_mentioned: ['Comercial', 'Data & Tech'],
  },
  conversation_metadata: {
    total_messages: devDiscoveryMessages.length,
    client_provided_details: 'Comprehensive',
    confidence_score: 0.95,
    missing_critical_info: [],
  },
  full_conversation: devDiscoveryMessages,
  detected_signals: {
    urgency_level: 'High',
    budget_implied: 'Moderate',
    technical_sophistication: 'Medium',
    decision_stage: 'Ready to implement',
  },
  agent_performance: {
    objectives_achieved: devDiscoveryProgress.objectives_achieved,
    conversation_quality: {},
  },
  created_at: new Date(now).toISOString(),
}

// ==================== RAYOS X - COMPUTER VISION ====================
export const devDiscoveryMessagesXray: Message[] = [
  {
    role: 'client',
    message: 'Somos una red de clínicas de diagnóstico por imágenes y queremos usar IA para ayudar a los radiólogos a detectar anomalías en rayos X y tomografías.',
    timestamp: timestamp(0),
  },
  {
    role: 'agent',
    message: '¿Qué tipo de estudios tienen mayor volumen y cuáles son las anomalías más comunes que buscan detectar?',
    timestamp: timestamp(1),
  },
  {
    role: 'client',
    message: 'Principalmente rayos X de tórax y radiografías de huesos. Queremos detectar fracturas, neumonía, nódulos pulmonares y calcificaciones. Procesamos unos 500 estudios diarios.',
    timestamp: timestamp(2),
  },
  {
    role: 'agent',
    message: '¿Cuentan con imágenes etiquetadas o diagnósticos previos que puedan servir como conjunto de entrenamiento?',
    timestamp: timestamp(3),
  },
  {
    role: 'client',
    message: 'Sí, tenemos unos 10,000 estudios históricos con reportes médicos asociados en nuestro PACS. Las imágenes están en formato DICOM y anonimizadas.',
    timestamp: timestamp(4),
  },
  {
    role: 'agent',
    message: 'Perfecto. Con ese volumen y calidad de datos podemos crear una PoC que clasifique estudios y priorice casos sospechosos para revisión urgente.',
    timestamp: timestamp(5),
  },
]

export const devDiscoverySummaryXray: DiscoverySummary = {
  session_id: 'dev-session-xray',
  narrative:
    'La PoC propuesta ayuda a radiólogos a detectar anomalías en rayos X mediante IA de visión artificial, priorizando casos urgentes y mejorando tiempos de diagnóstico.',
  business_problem: 'Volumen alto de estudios y riesgo de pasar por alto anomalías importantes.',
  business_objective: 'Asistir a radiólogos en detección temprana de anomalías y priorizar casos urgentes.',
  data_type: 'image',  // CRITICAL: Esto hace que se infiera COMPUTER_VISION
  organization_context: {
    industry: 'Healthcare',
    industry_confidence: 0.95,
    company_size: 'Mid-Market',
    maturity_level: 'Medium',
  },
  data_landscape: {
    data_types_mentioned: ['Medical Images', 'DICOM', 'Radiology Reports'],
    data_sources: ['PACS', 'Historical Database'],
  },
  constraints: {
    budget_mentioned: false,
    budget_level: 'Not Mentioned',
    timeline_mentioned: false,
    timeline: 'No especificado',
    compliance_requirements: ['HIPAA', 'Data Anonymization'],
    technical_constraints: ['Integración con PACS', 'Formato DICOM'],
  },
  additional_context: {
    solutions_tried: ['Revisión manual completa'],
    pain_points: ['Alto volumen', 'Riesgo de errores humanos', 'Tiempos de respuesta lentos'],
    success_metrics: ['Sensibilidad de detección', 'Tiempo de diagnóstico', 'Casos priorizados correctamente'],
    stakeholders_mentioned: ['Radiólogos', 'Dirección médica'],
  },
  conversation_metadata: {
    total_messages: devDiscoveryMessagesXray.length,
    client_provided_details: 'Comprehensive',
    confidence_score: 0.92,
    missing_critical_info: [],
  },
  full_conversation: devDiscoveryMessagesXray,
  detected_signals: {
    urgency_level: 'High',
    budget_implied: 'Moderate',
    technical_sophistication: 'Medium',
    decision_stage: 'Evaluating',
  },
  agent_performance: {
    objectives_achieved: devDiscoveryProgress.objectives_achieved,
    conversation_quality: {},
  },
  created_at: new Date(now).toISOString(),
}

// ==================== DETECCIÓN DE FRAUDE ====================
export const devDiscoveryMessagesFraud: Message[] = [
  {
    role: 'client',
    message: 'Somos un banco digital y estamos teniendo problemas con transacciones fraudulentas. Necesitamos un sistema que detecte fraude en tiempo real.',
    timestamp: timestamp(0),
  },
  {
    role: 'agent',
    message: '¿Qué tipos de fraude son los más comunes? ¿Transferencias, uso de tarjetas, apertura de cuentas?',
    timestamp: timestamp(1),
  },
  {
    role: 'client',
    message: 'Principalmente fraude en transferencias y pagos con tarjeta. Vemos patrones como múltiples transacciones pequeñas seguidas de una grande, o pagos desde ubicaciones geográficas inconsistentes.',
    timestamp: timestamp(2),
  },
  {
    role: 'agent',
    message: '¿Qué información tienen disponible para cada transacción? ¿Monto, ubicación, dispositivo, historial del cliente?',
    timestamp: timestamp(3),
  },
  {
    role: 'client',
    message: 'Tenemos todo: montos, timestamps, IPs, geolocalización, tipo de dispositivo, historial completo del cliente, y datos de más de 2 millones de transacciones etiquetadas como legítimas o fraudulentas.',
    timestamp: timestamp(4),
  },
  {
    role: 'agent',
    message: 'Excelente. Con esos datos podemos construir un modelo de ML que asigne un score de riesgo a cada transacción y bloquee automáticamente las más sospechosas.',
    timestamp: timestamp(5),
  },
]

export const devDiscoverySummaryFraud: DiscoverySummary = {
  session_id: 'dev-session-fraud',
  narrative:
    'La PoC propuesta detecta transacciones fraudulentas en tiempo real mediante modelos de machine learning, reduciendo pérdidas y mejorando la seguridad.',
  business_problem: 'Alto volumen de fraude en transacciones digitales causando pérdidas financieras.',
  business_objective: 'Detectar y bloquear transacciones fraudulentas en tiempo real minimizando falsos positivos.',
  data_type: 'structured',  // Datos tabulares/estructurados - inferirá ML_PREDICTIVE
  organization_context: {
    industry: 'Financial Services',
    industry_confidence: 0.98,
    company_size: 'Enterprise',
    maturity_level: 'High',
  },
  data_landscape: {
    data_types_mentioned: ['Transactions', 'Geolocation', 'Device Data', 'Customer Behavior'],
    data_sources: ['Transaction Database', 'Fraud Labels', 'Customer Profiles'],
  },
  constraints: {
    budget_mentioned: false,
    budget_level: 'Flexible',
    timeline_mentioned: false,
    timeline: 'Urgente',
    compliance_requirements: ['PCI-DSS', 'Data Privacy', 'Financial Regulations'],
    technical_constraints: ['Latencia < 100ms', 'Alta disponibilidad'],
  },
  additional_context: {
    solutions_tried: ['Reglas básicas', 'Revisión manual'],
    pain_points: ['Alto volumen de fraude', 'Falsos positivos', 'Detección tardía'],
    success_metrics: ['Precisión del modelo', 'Recall', 'Tasa de falsos positivos', 'Pérdidas evitadas'],
    stakeholders_mentioned: ['Risk & Fraud team', 'CTO', 'Compliance'],
  },
  conversation_metadata: {
    total_messages: devDiscoveryMessagesFraud.length,
    client_provided_details: 'Comprehensive',
    confidence_score: 0.96,
    missing_critical_info: [],
  },
  full_conversation: devDiscoveryMessagesFraud,
  detected_signals: {
    urgency_level: 'High',
    budget_implied: 'Flexible',
    technical_sophistication: 'High',
    decision_stage: 'Ready to implement',
  },
  agent_performance: {
    objectives_achieved: devDiscoveryProgress.objectives_achieved,
    conversation_quality: {},
  },
  created_at: new Date(now).toISOString(),
}

// ==================== RECOMENDACIONES DE PRODUCTOS ====================
export const devDiscoveryMessagesEcommerce: Message[] = [
  {
    role: 'client',
    message: 'Tengo un e-commerce de ropa y quiero implementar un sistema de recomendaciones personalizadas para aumentar las ventas.',
    timestamp: timestamp(0),
  },
  {
    role: 'agent',
    message: '¿Qué información tienen sobre el comportamiento de los usuarios? ¿Clicks, vistas, compras, tiempo en página?',
    timestamp: timestamp(1),
  },
  {
    role: 'client',
    message: 'Tenemos todo rastreado en Google Analytics y nuestro CRM: historial de navegación, productos vistos, carritos abandonados, compras completadas, y valoraciones de productos.',
    timestamp: timestamp(2),
  },
  {
    role: 'agent',
    message: '¿Tienen un catálogo grande? ¿Qué atributos de productos almacenan: categoría, precio, marca, talla, color?',
    timestamp: timestamp(3),
  },
  {
    role: 'client',
    message: 'Tenemos unos 5,000 productos con categoría, marca, precio, colores, tallas, y descripciones. También tenemos datos de 50,000 clientes con sus historiales de compra.',
    timestamp: timestamp(4),
  },
  {
    role: 'agent',
    message: 'Perfecto. Podemos crear un sistema híbrido de recomendaciones que combine filtrado colaborativo y content-based, mostrando productos relevantes en tiempo real.',
    timestamp: timestamp(5),
  },
]

export const devDiscoverySummaryEcommerce: DiscoverySummary = {
  session_id: 'dev-session-ecommerce',
  narrative:
    'La PoC propuesta implementa un motor de recomendaciones personalizadas para e-commerce, aumentando conversión y ticket promedio mediante IA.',
  business_problem: 'Baja conversión y dificultad para que clientes descubran productos relevantes.',
  business_objective: 'Aumentar ventas mediante recomendaciones personalizadas en tiempo real.',
  data_type: 'text',  // Texto (descripciones, categorías) + structured - inferirá GENERATIVE o ECOMMERCE
  organization_context: {
    industry: 'Retail',
    industry_confidence: 0.9,
    company_size: 'SMB',
    maturity_level: 'Medium',
  },
  data_landscape: {
    data_types_mentioned: ['User Behavior', 'Product Catalog', 'Purchase History', 'Product Ratings'],
    data_sources: ['Google Analytics', 'CRM', 'E-commerce Platform'],
  },
  constraints: {
    budget_mentioned: false,
    budget_level: 'Moderate',
    timeline_mentioned: false,
    timeline: '6-8 semanas',
    compliance_requirements: ['GDPR', 'Privacy Policy'],
    technical_constraints: ['Integración con plataforma actual', 'Tiempo de respuesta < 200ms'],
  },
  additional_context: {
    solutions_tried: ['Recomendaciones manuales', 'Productos más vendidos'],
    pain_points: ['Baja conversión', 'Carritos abandonados', 'Descubrimiento de productos'],
    success_metrics: ['Tasa de conversión', 'Ticket promedio', 'CTR de recomendaciones'],
    stakeholders_mentioned: ['Marketing', 'E-commerce Manager', 'Tech Team'],
  },
  conversation_metadata: {
    total_messages: devDiscoveryMessagesEcommerce.length,
    client_provided_details: 'Comprehensive',
    confidence_score: 0.93,
    missing_critical_info: [],
  },
  full_conversation: devDiscoveryMessagesEcommerce,
  detected_signals: {
    urgency_level: 'Medium',
    budget_implied: 'Moderate',
    technical_sophistication: 'Medium',
    decision_stage: 'Exploring',
  },
  agent_performance: {
    objectives_achieved: devDiscoveryProgress.objectives_achieved,
    conversation_quality: {},
  },
  created_at: new Date(now).toISOString(),
}
