export interface Poc {
  id: string
  name: string
  description: string
  prompt: string
  interface: 'ImageUpload' | 'DataUpload' | 'DocumentUpload' | 'AudioUpload' | 'AIChat' | 'Dashboard' | 'TimeSeries'
}

export interface Vertical {
  id: string
  name: string
  icon: string
  description: string
  pocs: Poc[]
}

export const verticals: Vertical[] = [
  // 1. Retail & Consumer Goods
  {
    id: 'retail-consumer',
    name: 'Retail & Consumer Goods',
    icon: 'Store',
    description: 'Soluciones de IA para retail, e-commerce, bienes de consumo y distribución mayorista. Desde auditoría visual de góndolas hasta recomendaciones personalizadas y pricing dinámico.',
    pocs: [
      {
        id: 'shelf-detection',
        name: 'Shelf Detection',
        description: 'Auditoría automática de inventario en góndolas que analiza fotos de estanterías para detectar productos faltantes, mal ubicados o con facing incorrecto. Reduce el Out-of-Stock hasta un 20% con revisiones visuales instantáneas comparadas contra el planograma de la tienda.',
        prompt: 'Genera una POC completa de "Shelf Detection" para retail. Frontend: Implementa una interfaz limpia con una zona de carga de imágenes (drag & drop) y una galería lateral. El panel principal debe mostrar la imagen analizada con bounding boxes sobre los productos detectados (verde para stock, rojo para faltantes). Abajo, incluye una tabla detallada con las columnas: SKU, Categoría, Estado, y Confianza (%). Backend: Utiliza el modelo de visión del SDK para detectar objetos y compararlos contra un planograma predefinido. Objetivo: Reducir el "Out-of-Stock" en un 20% mediante auditorías visuales automatizadas.',
        interface: 'ImageUpload'
      },
      {
        id: 'quality-inspection-retail',
        name: 'Quality Inspection',
        description: 'Control de calidad visual automatizado que inspecciona productos en línea de empaque detectando defectos como roturas, manchas o deformaciones. Clasifica cada pieza como aprobada o rechazada con explicación del defecto, eliminando la subjetividad de la inspección manual.',
        prompt: 'Crea una POC de "Quality Inspection" con visión computacional. Frontend: Interfaz que muestre la imagen del producto inspeccionado y destaque defectos con mapas de calor. Incluye un indicador grande de "APROBADO" (Verde) o "RECHAZADO" (Rojo) y una lista de defectos encontrados. Backend: Entrena un modelo de clasificación de imágenes para detectar anomalías (roturas, manchas) usando el SDK. Objetivo: Automatizar el 100% de la inspección visual en línea de empaque.',
        interface: 'ImageUpload'
      },
      {
        id: 'visual-search',
        name: 'Visual Search',
        description: 'Buscador visual que permite encontrar productos similares subiendo una foto de referencia, sin necesidad de conocer nombre o código. Aumenta la conversión en e-commerce facilitando el descubrimiento de productos por apariencia y ordenando resultados por similitud visual.',
        prompt: 'Desarrolla una POC de "Visual Search" para e-commerce. Frontend: Buscador visual donde el usuario sube una foto de referencia. Muestra una grilla de resultados con "Productos Similares" ordenados por similitud visual, incluyendo precio y botón de compra. Backend: Usa embeddings de imágenes del SDK para buscar en el catálogo vectorial los items más cercanos. Objetivo: Aumentar la conversión permitiendo a los usuarios encontrar productos sin saber el nombre.',
        interface: 'ImageUpload'
      },
      {
        id: 'virtual-try-on',
        name: 'Virtual Try-On',
        description: 'Probador virtual que superpone prendas de forma realista sobre la foto del usuario, adaptándose a su pose y complexión. Reduce devoluciones de compras online hasta un 30% al permitir visualizar cómo queda la prenda antes de comprarla.',
        prompt: 'Genera una POC de "Virtual Try-On". Frontend: El usuario sube su foto de cuerpo entero y selecciona una prenda de un carrusel lateral. La interfaz muestra la prenda superpuesta en el usuario de forma realista. Backend: Utiliza modelos generativos de inpainting o superposición inteligente del SDK para adaptar la prenda a la pose del usuario. Objetivo: Reducir las devoluciones de ropa en compras online un 30%.',
        interface: 'ImageUpload'
      },
      {
        id: 'store-layout-optimization',
        name: 'Store Layout Optimization',
        description: 'Optimización de la distribución física de tienda mediante mapas de calor que muestran zonas de mayor y menor tráfico de clientes. Identifica zonas frías y sugiere reubicación de productos para maximizar exposición, procesando cámaras existentes sin hardware adicional.',
        prompt: 'Crea una POC de "Store Layout Optimization". Frontend: Un plano de planta interactivo de la tienda superpuesto con un mapa de calor dinámico que muestra las zonas de mayor tráfico. Incluye métricas laterales como "Tiempo de permanencia promedio" y "Zonas frías". Backend: Procesa grabaciones de CCTV con visión artificial para trackear el movimiento de personas y generar densidades. Objetivo: Optimizar la disposición de estanterías para maximizar la exposición de productos.',
        interface: 'ImageUpload'
      },
      {
        id: 'queue-management',
        name: 'Queue Management',
        description: 'Sistema de gestión de colas que cuenta personas en fila en tiempo real y predice tiempos de espera por caja. Genera alertas automáticas cuando la espera supera umbrales definidos para abrir más cajas o reasignar personal.',
        prompt: 'Desarrolla una POC para "Queue Management". Frontend: Dashboard en tiempo real con feeds de cámaras de cajas. Sobre cada feed, muestra un contador de personas en fila y un tiempo estimado de espera. Alerta visual (parpadeo rojo) si la espera supera los 5 min. Backend: Detección de personas y conteo en zonas definidas de la imagen usando el SDK. Objetivo: Mejorar la satisfacción del cliente reduciendo tiempos de espera.',
        interface: 'ImageUpload'
      },
      {
        id: 'cashierless-checkout',
        name: 'Cashierless Checkout',
        description: 'Sistema de checkout sin cajeros que detecta automáticamente los productos que el cliente toma de los estantes y actualiza un carrito virtual en tiempo real. Ofrece una experiencia de compra sin fricción tipo Amazon Go combinando seguimiento visual con reconocimiento de productos.',
        prompt: 'Prototipa un sistema de "Cashierless Checkout". Frontend: Simulación de app móvil que muestra el "Carrito Virtual" del usuario actualizándose en tiempo real a medida que toma productos de los estantes (detectados por cámara). Botón de "Pagar y Salir". Backend: Seguimiento multi-cámara y reconocimiento de acciones (tomar/dejar objeto) sobre productos específicos. Objetivo: Experiencia de compra sin fricción tipo Amazon Go.',
        interface: 'ImageUpload'
      },
      {
        id: 'product-recommendations',
        name: 'Product Recommendations',
        description: 'Motor de recomendaciones personalizadas que analiza el historial de compras para sugerir productos con alta probabilidad de interés para cada cliente. Aumenta el ticket promedio hasta un 15% mediante cross-selling inteligente que aprende de patrones de consumo reales.',
        prompt: 'Genera una POC de "Product Recommendations". Frontend: Sube un dataset de historial de compras. El sistema devuelve una tabla de "Usuarios" y al expandir cada uno, muestra un carrusel de "Productos Recomendados" con score de afinidad. Backend: Modelo de filtrado colaborativo o basado en contenido del SDK para predecir preferencias. Objetivo: Aumentar el ticket promedio de compra en un 15%.',
        interface: 'DataUpload'
      },
      {
        id: 'dynamic-pricing-retail',
        name: 'Dynamic Pricing',
        description: 'Optimización de precios en tiempo real que analiza demanda, competencia y elasticidad para sugerir el precio óptimo por producto. Permite simular escenarios de cambio de precio y ver el impacto proyectado en margen y volumen antes de aplicarlos.',
        prompt: 'Crea una POC de "Dynamic Pricing". Frontend: Gráfico de líneas mostrando la evolución del precio de un producto vs demanda y competencia. Panel de control para simular cambios de precio y ver el impacto proyectado en margen y volumen. Backend: Algoritmo de regresión que ingesta precios de competidores y elasticidad de demanda para sugerir el precio óptimo. Objetivo: Maximizar márgenes sin perder cuota de mercado.',
        interface: 'DataUpload'
      },
      {
        id: 'demand-forecasting-retail',
        name: 'Demand Forecasting',
        description: 'Predicción de demanda a 30 días que combina histórico de ventas, estacionalidad y tendencias para anticipar necesidades de stock por SKU. Genera sugerencias automáticas de reabastecimiento con intervalos de confianza para decisiones informadas.',
        prompt: 'Desarrolla una POC de "Demand Forecasting". Frontend: Gráfico de series temporales con datos históricos (negro) y predicción a 30 días (azul con intervalo de confianza). Tabla inferior con sugerencias de "Reabastecimiento" por SKU. Backend: Modelo predictivo (Prophet o LSTM) del SDK entrenado con histórico de ventas y estacionalidad. Objetivo: Optimizar inventarios y reducir costos de almacenamiento.',
        interface: 'DataUpload'
      },
      {
        id: 'churn-prediction-retail',
        name: 'Churn Prediction',
        description: 'Identificación temprana de clientes en riesgo de abandono mediante análisis de patrones de comportamiento y transacciones. Clasifica cada cliente por nivel de riesgo, explica los factores contribuyentes y sugiere acciones concretas de retención por segmento.',
        prompt: 'Crea una POC de "Churn Prediction". Frontend: Lista de clientes segmentados por "Riesgo de Abandono" (Alto, Medio, Bajo). Al hacer click, ficha del cliente con "Factores de Riesgo" (ej. baja interacción reciente) y "Acción Recomendada". Backend: Modelo de clasificación binaria (Churn/No-Churn) basado en comportamiento reciente y transacciones. Objetivo: Retener clientes valiosos mediante acciones proactivas.',
        interface: 'DataUpload'
      },
      {
        id: 'customer-clv',
        name: 'Customer CLV',
        description: 'Predicción del valor de vida de cada cliente (CLV) que segmenta la base por valor futuro proyectado, no solo por compras pasadas. Identifica qué clientes merecen mayor inversión en fidelización modelando cohortes de comportamiento histórico.',
        prompt: 'Genera una POC de "Customer Lifetime Value". Frontend: Dashboard que segmenta la base de clientes por CLV proyectado. Gráficos de distribución de valor. Detalle por cliente mostrando valor histórico vs valor futuro potencial. Backend: Modelos predictivos de regresión sobre cohortes de clientes para estimar gasto futuro. Objetivo: Enfocar recursos de marketing en los clientes de mayor valor a largo plazo.',
        interface: 'DataUpload'
      },
      {
        id: 'review-analysis',
        name: 'Review Analysis',
        description: 'Análisis automático de sentimiento en reseñas de productos que identifica quejas principales, elogios frecuentes y tendencias emergentes. Procesa miles de opiniones generando distribución de sentimiento y nubes de palabras clave filtrables por producto o periodo.',
        prompt: 'Desarrolla una POC de "Review Analysis". Frontend: Dashboard con nube de palabras clave, gráfico de torta de Sentimiento (Positivo/Neutro/Negativo) y lista de reseñas filtrables. Destacados: "Quejas principales" y "Elogios principales". Backend: Procesamiento de Lenguaje Natural (NLP) para análisis de sentimiento y extracción de tópicos en reseñas de texto. Objetivo: Entender la voz del cliente para mejorar productos.',
        interface: 'DocumentUpload'
      },
      {
        id: 'product-description-generator',
        name: 'Product Description Generator',
        description: 'Generador automático de descripciones de productos optimizadas para SEO que convierte especificaciones técnicas en textos comerciales persuasivos. Produce múltiples variaciones por producto para A/B testing, acelerando la catalogación con tono de marca consistente.',
        prompt: 'Crea una POC de "Product Description Generator". Frontend: Formulario donde se ingresan características técnicas (ej. "Camiseta, Algodón, Azul"). Botón "Generar". Resultado: 3 variaciones de descripción persuasiva optimizada para SEO. Backend: LLM generative configurado con prompts de marketing para convertir specs en texto comercial atractivo. Objetivo: Acelerar la catalogación de nuevos productos.',
        interface: 'AIChat'
      },
      {
        id: 'shopping-assistant',
        name: 'Shopping Assistant',
        description: 'Chatbot inteligente que ayuda a encontrar productos respondiendo preguntas en lenguaje natural como "busco zapatillas para correr en lluvia". Recomienda artículos del catálogo real con explicaciones personalizadas conectando la consulta con el inventario disponible.',
        prompt: 'Diseña una POC de "Shopping Assistant". Frontend: Widget de chat en una web e-commerce simulada. El usuario pregunta "Busco zapatillas para correr en lluvia" y el bot responde con recomendaciones visuales (tarjetas de producto) y explicaciones. Backend: Agente conversacional conectado al catálogo de productos vía RAG para recomendar items basados en necesidades. Objetivo: Guiar al usuario en la compra y aumentar conversión.',
        interface: 'AIChat'
      },
      {
        id: 'virtual-stylist',
        name: 'Virtual Stylist',
        description: 'Estilista virtual que sugiere outfits completos combinando prendas del catálogo según evento, estilo personal y tendencias de moda. Explica por qué las prendas combinan y ofrece alternativas, funcionando como personal shopper digital disponible 24/7.',
        prompt: 'Genera una POC de "Virtual Stylist". Frontend: Chat interaactivo donde el usuario define su evento ("boda de día") y estilo. El bot responde con "Looks Completos" (outfits) generados visualmente o compuestos por items de la tienda, explicando por qué combinan. Backend: LLM con conocimiento de moda y reglas de estilo, capaz de combinar prendas del catálogo. Objetivo: Ofrecer un servicio diferencial de personal shopper.',
        interface: 'AIChat'
      },
      {
        id: 'inventory-dashboard',
        name: 'Inventory Management Dashboard',
        description: 'Panel de control de inventario en tiempo real con KPIs de venta diaria, stock total y rotación por categoría. Genera alertas de stock crítico y sugiere pedidos automáticos basados en velocidad de venta y tiempos de reposición del proveedor.',
        prompt: 'Crea una POC de "Inventory Management Dashboard". Frontend: Panel de control con KPIs: Venta Diaria, Stock Total, Rotación. Tablas con alertas de "Stock Crítico" y sugerencias de pedido automático. Backend: Análisis de datos transaccionales en tiempo real para calcular niveles de inventario y puntos de reorden. Objetivo: Visibilidad total del inventario para evitar quiebres y sobrestock.',
        interface: 'Dashboard'
      },
      {
        id: 'social-media-sentiment',
        name: 'Social Media Sentiment',
        description: 'Monitor de sentimiento en redes sociales que rastrea menciones de la marca en tiempo real y detecta cambios abruptos en la percepción pública. Genera alertas de crisis de reputación cuando el sentimiento negativo se dispara para activar respuesta inmediata.',
        prompt: 'Desarrolla una POC de "Social Media Sentiment". Frontend: Monitor en tiempo real mostrando feed de menciones en Twitter/Instagram. Gráfico de evolución de sentimiento en la última semana. Alertas de "Crisis de Reputación" si el sentimiento negativo se dispara. Backend: Scraper o ingestión de API social + análisis de sentimiento NLP. Objetivo: Gestión proactiva de la reputación de marca.',
        interface: 'DocumentUpload'
      },
      {
        id: 'voice-commerce',
        name: 'Voice Commerce',
        description: 'Sistema de compras por voz que permite agregar productos al carrito mediante comandos hablados como "añadir 2 cartones de leche". Transcribe el audio en tiempo real, interpreta la intención de compra y confirma visualmente cada acción en el carrito.',
        prompt: 'Crea una POC de "Voice Commerce". Frontend: App móvil con botón de micrófono prominente. El usuario dice "Añadir 2 cartones de leche y pan". La pantalla muestra la transcripción y confirma la acción en el carrito visualmente. Backend: Servicio Speech-to-Text para transcribir el audio e intent recognition para mapear comandos a acciones de compra. Objetivo: Facilitar la compra rápida ("re-stock") sin manos.',
        interface: 'AudioUpload'
      },
      {
        id: 'next-best-action',
        name: 'Next Best Action (CRM)',
        description: 'Motor de sugerencia de la próxima mejor acción para cada cliente que evalúa perfil, historial y contexto para recomendar la oferta óptima. Muestra probabilidad de aceptación de cada acción para priorizar contactos de mayor impacto.',
        prompt: 'Genera una POC de "Next Best Action". Frontend: Vista de agente de CRM. Al seleccionar un cliente, muestra su perfil y una tarjeta destacada: "Sugerencia: Ofrecer descuento del 10% en Calzado - Probabilidad de aceptación 85%". Backend: Modelo de recomendación que evalúa el estado del cliente y reglas de negocio para determinar la oferta óptima. Objetivo: Maximizar el valor de cada interacción con el cliente.',
        interface: 'AIChat'
      },
      {
        id: 'demand-sensing-cpg',
        name: 'Demand Sensing',
        description: 'Predicción de demanda a muy corto plazo (diario/semanal) para productos de consumo masivo que incorpora señales en tiempo real como clima, eventos locales y datos de punto de venta. Permite reaccionar en horas a cambios inesperados que los pronósticos mensuales no capturan.',
        prompt: 'Desarrolla una POC de "Demand Sensing" para CPG. Frontend: Tablero de pronóstico a muy corto plazo (diario/semanal). Indicadores de factores externos (clima, eventos locales) que están influyendo en la demanda hoy. Backend: Modelo de series temporales multivariante que incorpora señales en tiempo real (sell-out, clima) para ajustar el forecast. Objetivo: Reaccionar rápidamente a cambios en la demanda del consumidor.',
        interface: 'DataUpload'
      },
      {
        id: 'b2b-collections-agent',
        name: 'B2B Collections Agent',
        description: 'Agente virtual de cobranzas B2B que contacta clientes morosos por email o chat, negocia fechas de pago según reglas predefinidas y escala casos complejos a gestores humanos. Opera 24/7 gestionando decenas de cuentas preservando la relación comercial.',
        prompt: 'Crea una POC de "B2B Collections Agent". Frontend: Chat interface donde el gestor supervisa al bot. El bot inicia conversaciones (simuladas por email/chat) con clientes morosos, negocia fechas de pago según reglas predefinidas y escala casos complejos. Backend: Agente conversacional con acceso a datos de deuda y políticas de negociación. Objetivo: Automatizar la recuperación de deuda temprana manteniendo la relación.',
        interface: 'AIChat'
      },
      {
        id: 'social-media-copilot',
        name: 'Social Media Response Co-Pilot',
        description: 'Asistente para community managers que analiza cada comentario entrante y genera tres opciones de respuesta con diferentes tonos (casual, formal, empática). Reduce el tiempo de respuesta de minutos a segundos manteniendo coherencia con el tono de la marca.',
        prompt: 'Diseña una POC de "Social Media Response Co-Pilot". Frontend: Dashboard de Community Manager. Muestra comentarios de usuarios entrantes. Al lado de cada uno, 3 sugerencias de respuesta generadas por IA (Casual, Formal, Empática) listas para enviar o editar. Backend: LLM analizando el contexto del post y el tono de marca para generar respuestas adecuadas. Objetivo: Aumentar la velocidad de respuesta y engagement en redes.',
        interface: 'AIChat'
      },
      {
        id: 'brand-perception-tracking',
        name: 'Brand Perception Tracking',
        description: 'Monitor de percepción de marca 360° que compara atributos (precio, calidad, servicio, innovación) contra competidores en base a menciones reales en medios y redes sociales. Genera un radar visual del posicionamiento percibido vs deseado con insights accionables.',
        prompt: 'Genera una POC de "Brand Perception Tracking". Frontend: Dashboard estratégico tipo "Radar de Marca". Gráficos de araña comparando la marca vs competidores en atributos (Precio, Calidad, Servicio, Innovación) extraídos de menciones web. Backend: Minería de texto y análisis de aspectos (Aspect-Based Sentiment Analysis) sobre noticias y foros. Objetivo: Entender el posicionamiento real de la marca en el mercado.',
        interface: 'Dashboard'
      }
    ]
  },
  // 2. Manufacturing & Industry
  {
     id: 'manufacturing-heavy-industry',
     name: 'Manufacturing & Industry',
     icon: 'Factory',
     description: 'Industria 4.0, automotriz, aeroespacial y construcción. Control de calidad visual, mantenimiento predictivo y optimización de procesos productivos.',
     pocs: [
       {
         id: 'defect-detection',
         name: 'Defect Detection',
         description: 'Detección automática de defectos en productos durante la fabricación que identifica ralladuras, abolladuras y deformaciones en tiempo real sobre la línea de producción. Asegura calidad cero defectos reduciendo inspección manual y rechazando piezas defectuosas antes del empaque.',
         prompt: 'Genera una POC de "Defect Detection" industrial. Frontend: Pantalla de monitoreo de línea. Muestra stream de video de la cinta transportadora. Resalta en tiempo real productos defectuosos con bounding box roja y etiqueta el tipo de defecto (ej. "Ralladura", "Abolladura"). Backend: Modelo de Computer Vision entrenado con dataset de piezas defectuosas/buenas. Objetivo: Asegurar calidad cero defectos y reducir inspección manual.',
         interface: 'ImageUpload'
       },
       {
         id: 'safety-equipment',
         name: 'Safety Equipment Verification',
         description: 'Verificación automática del uso correcto de equipos de protección personal (casco, chaleco, gafas) en zonas de riesgo de planta. Genera alertas visuales inmediatas ante incumplimientos y registra infracciones por hora para gestión de seguridad laboral.',
         prompt: 'Crea una POC de "Safety PPE Verification". Frontend: Dashboard de seguridad de planta. Muestra feeds de cámaras de zonas peligrosas. Alerta visual inmediata si detecta un operario sin casco o chaleco. Registra "Infracciones por hora". Backend: Detección de objetos (Personas, Cascos, Chalecos) y lógica de intersección para validar cumplimiento. Objetivo: Mejorar la seguridad laboral y cumplimiento normativo.',
         interface: 'ImageUpload'
       },
       {
         id: 'assembly-monitoring',
         name: 'Assembly Line Monitoring',
         description: 'Monitoreo de línea de ensamblaje en tiempo real que mide tiempos de ciclo por estación, detecta paradas e identifica cuellos de botella automáticamente. Compara el rendimiento actual contra el estándar para optimizar la productividad del turno.',
         prompt: 'Desarrolla una POC de "Assembly Line Monitoring". Frontend: Línea de tiempo (Gantt chart) en tiempo real de cada estación de trabajo. Muestra el tiempo de ciclo actual vs estándar. Detecta paradas o "idling". Backend: Análisis de video para reconocer acciones humanas (atornillar, soldar) y medir tiempos de ciclo automáticamente. Objetivo: Identificar cuellos de botella en el proceso de ensamblaje.',
         interface: 'ImageUpload'
       },
       {
         id: 'quality-control',
         name: 'Quality Control Inspection',
         description: 'Estación de inspección de calidad final que fotografía cada pieza terminada y emite un veredicto PASA/FALLA en menos de 2 segundos con las razones. Estandariza criterios de calidad eliminando variabilidad entre inspectores y agilizando la liberación de producto.',
         prompt: 'Genera una POC de "Quality Control Inspection". Frontend: Estación de calidad digital. El inspector coloca la pieza, el sistema toma una foto y muestra en < 2 segundos un semforo: VERDE (Pasa) o ROJO (Falla) con las razones. Backend: Modelo de clasificación de alta precisión para validación final de producto terminado. Objetivo: Estandarizar criterios de calidad y agilizar liberación.',
         interface: 'ImageUpload'
       },
       {
         id: 'predictive-maintenance',
         name: 'Predictive Maintenance',
         description: 'Mantenimiento predictivo que monitorea la salud de maquinaria industrial mediante análisis de telemetría IoT (vibración, temperatura, presión). Predice la probabilidad de falla a 7 días y estima la vida útil remanente para planificar intervenciones antes de paradas no planificadas.',
         prompt: 'Crea una POC de "Predictive Maintenance". Frontend: Dashboard de estado de flota de máquinas. Semáforos de salud por máquina. Gráfico de "Probabilidad de Falla en 7 días". Al hacer drill-down, muestra lecturas de sensores (vibración, temperatura) anómalas. Backend: Modelo de detección de anomalías o regresión (RUL - Remaining Useful Life) basado en telemetría IoT. Objetivo: Reducir paradas no planificadas.',
         interface: 'DataUpload'
       },
       {
         id: 'production-forecasting',
         name: 'Production Forecasting',
         description: 'Pronóstico de producción que correlaciona órdenes de venta, disponibilidad de materia prima y eficiencia histórica para proyectar capacidad. Permite simular escenarios como agregar turnos o cambiar mix de producto y ver el impacto antes de decidir.',
         prompt: 'Desarrolla una POC de "Production Forecasting". Frontend: Gráfico comparativo de "Capacidad Instalada" vs "Producción Proyectada". Permite simular escenarios (ej. "¿Qué pasa si agrego un turno extra?"). Backend: Modelo predictivo que correlaciona órdenes de venta, disponibilidad de materia prima y eficiencia histórica. Objetivo: Planificación de producción optimizada.',
         interface: 'DataUpload'
       },
       {
         id: 'yield-optimization',
         name: 'Yield Optimization',
         description: 'Optimización de rendimiento de procesos industriales que analiza parámetros (temperatura, presión, velocidad) para encontrar la combinación ideal que maximice el yield. Sugiere ajustes específicos basados en el histórico de mejores lotes para reducir desperdicio.',
         prompt: 'Genera una POC de "Yield Optimization". Frontend: Panel de control de parámetros de proceso (Temperatura, Presión, Velocidad). El sistema sugiere "Ajustes Recomendados" (ej. bajar temp 2°C) para maximizar el Yield. Backend: Modelo de optimización (Machine Learning) entrenado con histórico de lotes para encontrar la "Golden Batch". Objetivo: Reducir desperdicio y maximizar output.',
         interface: 'DataUpload'
       },
       {
         id: 'energy-consumption',
         name: 'Energy Consumption Prediction',
         description: 'Predicción de consumo energético por línea de producción con anticipación de 24 horas para evitar picos tarifarios. Compara consumo actual vs línea base y sugiere optimizaciones para reducir la factura energética y la huella de carbono.',
         prompt: 'Crea una POC de "Energy Consumption Prediction". Frontend: Dashboard de gestión energética. Muestra consumo actual vs línea base. Predicción de consumo para las próximas 24h (para evitar picos tarifarios). Desglose por línea de producción. Backend: Regresión de series temporales correlacionando producción con consumo energético. Objetivo: Reducir la factura energética y huella de carbono.',
         interface: 'DataUpload'
       },
       {
         id: 'sound-analysis',
         name: 'Equipment Sound Analysis',
         description: 'Detección de fallas mecánicas mediante análisis de la firma acústica de equipos en operación. Identifica patrones de desgaste de rodamientos, desbalanceo o fricción anormal sin necesidad de detener la máquina, usando solo micrófonos industriales.',
         prompt: 'Desarrolla una POC de "Equipment Sound Analysis". Frontend: Visualizador de espectrograma de audio en tiempo real. Alerta "Patrón de Desgaste de Rodamiento Detectado" cuando el audio cambia su firma. Backend: Procesamiento de señales de audio (FFT) y clasificación con redes neuronales para identificar firmas acústicas de fallas mecánicas. Objetivo: Mantenimiento predictivo no intrusivo mediante micrófonos.',
         interface: 'AudioUpload'
       },
       {
         id: 'oee-monitoring',
         name: 'OEE Monitoring',
         description: 'Dashboard de Eficiencia General de Equipos (OEE) que calcula automáticamente Disponibilidad, Rendimiento y Calidad por máquina y turno. Identifica las principales causas de pérdida de eficiencia para priorizar acciones de mejora continua.',
         prompt: 'Genera una POC de "OEE Monitoring". Frontend: Dashboard clásico de OEE con tres relojes: Disponibilidad, Rendimiento, Calidad. Gráfico de tendencias por turno. Lista de paradas con causas (paro menor, avería). Backend: Cálculo automático de OEE ingustando estados de máquina PLC. Objetivo: Visualizar y mejorar la eficiencia real de planta.',
         interface: 'Dashboard'
       },
       {
         id: 'production-dashboard',
         name: 'Production Line Dashboard',
         description: 'Gemelo digital simplificado de la línea de producción que muestra estado (Running/Stopped), velocidad actual y objetivo del turno en tiempo real. Centraliza datos IoT de múltiples fuentes para control operativo inmediato por parte de jefes de planta.',
         prompt: 'Crea una POC de "Production Line Dashboard". Frontend: Twin digital simplificado de la línea. Muestra estado (Running/Stopped), velocidad actual (piezas/min) y objetivo del turno en tiempo real. Backend: Agregación de datos IoT de múltiples fuentes para visualización centralizada. Objetivo: Control operativo en tiempo real para jefes de planta.',
         interface: 'Dashboard'
       },
       {
         id: 'inv-management-mfg',
         name: 'Inventory Management',
         description: 'Gestión de inventario de materia prima con alertas de punto de reorden y visualización de cobertura de stock en días de producción asegurados. Calcula consumo proyectado vs stock actual para evitar paradas de línea por falta de materiales.',
         prompt: 'Desarrolla una POC de "Manufacturing Inventory". Frontend: Tabla de stock de materia prima con alertas de "Punto de Reorden". Visualización de cobertura de stock (días de producción asegurados). Backend: Cálculo de consumo proyectado vs stock actual. Objetivo: Evitar paradas de línea por falta de materiales.',
         interface: 'Dashboard'
       },
       {
         id: 'raw-material-quality',
         name: 'Raw Material Quality Prediction',
         description: 'Predicción de calidad de materias primas al momento de recepción que evalúa parámetros del certificado del proveedor para anticipar problemas en producción. Permite rechazar lotes de baja calidad antes de procesarlos, ahorrando tiempo y recursos.',
         prompt: 'Genera una POC de "Raw Material Quality". Frontend: Al recibir un lote de proveedor, se ingresan sus parámetros de certificado (COA). El sistema predice "Probabilidad de Problemas en Producción: Alta/Baja". Backend: Modelo predictivo que correlaciona variables de materia prima con resultados de calidad finales históricos. Objetivo: Rechazar lotes malos antes de procesarlos.',
         interface: 'DataUpload'
       },
       {
         id: 'digital-twin',
         name: 'Digital Twin',
         description: 'Gemelo digital interactivo de una célula de manufactura que permite visualizar estados en tiempo real y correr simulaciones predictivas. Valida cambios de layout y optimiza flujos virtualmente antes de implementarlos en la planta física.',
         prompt: 'Crea una POC de "Digital Twin". Frontend: Modelo 3D interactivo de una célula de manufactura. Permite ver estados en tiempo real y correr simulaciones "Fast Forward" para ver colas o bloqueos futuros. Backend: Simulación de eventos discretos alimentada por datos reales de planta. Objetivo: Optimizar flujos y validar cambios layout virtualmente.',
         interface: 'Dashboard'
       },
       {
         id: 'supply-chain-visibility',
         name: 'Supply Chain Visibility',
         description: 'Torre de control logística con mapa mundial interactivo que muestra ubicación de proveedores, fábricas y tránsitos en tiempo real. Alerta sobre retrasos por clima o problemas portuarios para mitigar interrupciones en la cadena de suministro.',
         prompt: 'Desarrolla una POC de "Supply Chain Visibility". Frontend: Mapa mundial interactivo mostrando ubicaciones de proveedores, fábricas y tránsitos (barcos/aviones). Alerta de retrasos por clima o problemas portuarios. Backend: Integración de APIs logísticas y datos externos para trackeo global. Objetivo: Torre de control logística para mitigar interrupciones.',
         interface: 'Dashboard'
       },
       {
         id: 'assembly-line-anomaly',
         name: 'Assembly Line Anomaly Detection',
         description: 'Detección de anomalías en estaciones de ensamblaje manual que verifica si el operario siguió la secuencia correcta de pasos y usó la herramienta adecuada. Garantiza estandarización de procesos complejos alertando en tiempo real ante desviaciones del procedimiento.',
         prompt: 'Genera una POC de "Assembly Anomaly Detection". Frontend: Video stream de estación de ensamblaje. Detecta si el operario saltó un paso o usó la herramienta incorrecta, mostrando alerta "Secuencia Incorrecta". Backend: Reconocimiento de acciones en video (Action Recognition) contra un SOP digitalizado. Objetivo: Garantizar estandarización y calidad en ensamblaje manual complejo.',
         interface: 'ImageUpload'
       },
       {
         id: 'site-safety-ppe',
         name: 'Safety PPE Compliance',
         description: 'Verificación automática de seguridad en obra que detecta trabajadores sin casco o arnés en altura mediante cámaras. Genera reportes diarios de índice de seguridad por contratista para prevenir accidentes fatales en construcción.',
         prompt: 'Crea una POC de "Construction Site Safety". Frontend: Dashboard para obra en construcción. Detecta trabajadores sin casco o arnés en altura. Genera reportes diarios de "Índice de Seguridad" por contratista. Backend: Detección de objetos robusta para entornos exteriores y cambiantes. Objetivo: Prevenir accidentes fatales en construcción.',
         interface: 'ImageUpload'
       },
       {
         id: 'aircraft-maintenance',
         name: 'Aircraft Maintenance',
         description: 'Inspección visual de fuselaje y componentes aeronáuticos a partir de fotos de alta resolución tomadas por drones. Detecta grietas, abolladuras y corrosión clasificándolas por severidad y ubicándolas en un mapa del avión para agilizar revisiones.',
         prompt: 'Desarrolla una POC de "Aircraft Visual Inspection". Frontend: Interfaz para subir fotos de alta resolución del fuselaje tomadas por drones. Detecta grietas, abolladuras o corrosión, clasificándolas por severidad y ubicándolas en un mapa del avión. Backend: Modelo de segmentación semántica de alta precisión para defectos estructurales. Objetivo: Agilizar revisiones de aeronaves y mejorar seguridad.',
         interface: 'ImageUpload'
       },
       {
         id: 'quality-inspection-multimodal',
         name: 'Quality Inspection Multimodal',
         description: 'Inspección de calidad multimodal donde el operario sube una foto del defecto y dicta una nota de voz explicando el problema. El sistema transcribe, analiza la imagen y clasifica el defecto automáticamente con mínimo esfuerzo del operario.',
         prompt: 'Genera una POC de "Multimodal Quality Inspection". Frontend: El operario sube una foto del defecto y dicta una nota de voz explicando el problema. El sistema transcribe, analiza la imagen y clasifica el defecto automáticamente en el sistema de calidad. Backend: Modelo multimodal (VLM) que combina features visuales y contexto de texto para una clasificación precisa. Objetivo: Enriquecer el registro de calidad con mínimo esfuerzo del operario.',
         interface: 'ImageUpload'
       },
       {
         id: 'warehouse-drones',
         name: 'Warehouse Inventory Counting Drones',
         description: 'Conteo automatizado de inventario en almacén mediante drones que capturan imágenes de pallets en estanterías de difícil acceso. Lee códigos de barras y cuenta cajas automáticamente desde imágenes aéreas para acelerar la toma de inventario cíclico.',
         prompt: 'Crea una POC de "Drone Inventory Counting". Frontend: Dashboard de misión de drones. Muestra progreso del vuelo en almacén. Procesa las imágenes capturadas de pallets en altura para leer códigos de barras y contar cajas. Backend: OCR y detección de objetos aplicados a imágenes aéreas/drones. Objetivo: Automatizar la toma de inventario cíclico en zonas de difícil acceso.',
         interface: 'ImageUpload'
       }
     ]
  },
  // 3. Energy, Oil & Gas
  {
      id: 'energy-oil-gas',
      name: 'Energy, Oil & Gas',
      icon: 'Zap',
      description: 'Energía eléctrica, petróleo, gas y minería. Monitoreo predictivo de infraestructura crítica, detección de fugas y seguridad en operaciones extractivas.',
      pocs: [
        {
          id: 'predictive-maintenance-energy',
          name: 'Predictive Maintenance',
          description: 'Predicción de fallos en infraestructura eléctrica que monitorea transformadores y líneas mediante sensores SCADA para anticipar fallas inminentes. Muestra probabilidades de falla por equipo en un mapa GIS con gráficos de tendencias históricas para reducir cortes de servicio.',
          prompt: 'Genera una POC de "Predictive Maintenance" para utilities. Frontend: Mapa GIS de la red eléctrica. Puntos críticos en rojo. Al hacer clic en un transformador, muestra "Probabilidad de Falla: 89%" y gráficos de temperatura/carga histórica. Backend: Modelos de regresión sobre series temporales de sensores SCADA para predecir fallas inminentes. Objetivo: Reducir cortes de servicio y penalizaciones.',
          interface: 'TimeSeries'
        },
        {
          id: 'leak-detection',
          name: 'Leak Detection',
          description: 'Detección automática de fugas en oleoductos y gasoductos combinando análisis de presión en tiempo real con video térmico infrarrojo. Localiza la fuga con coordenadas GPS exactas y genera alertas inmediatas para respuesta a incidentes ambientales.',
          prompt: 'Crea una POC de "Leak Detection" para Oil & Gas. Frontend: Dashboard de monitoreo de oleoductos. Alerta sonora y visual al detectar caída de presión anómala o mancha térmica en video infrarrojo. Ubicación GPS exacta de la fuga. Backend: Análisis de flujo y presión en tiempo real combinado con visión térmica (si hay video). Objetivo: Respuesta inmediata a incidentes ambientales.',
          interface: 'ImageUpload'
        },
        {
          id: 'mining-safety-monitoring',
          name: 'Mining Safety Monitoring',
          description: 'Vigilancia de seguridad en operaciones mineras a cielo abierto que monitorea ubicación de camiones gigantes y personal en tiempo real. Genera alertas de proximidad peligrosa y entrada a zonas de voladura mediante geofencing dinámico para cero accidentes.',
          prompt: 'Desarrolla una POC de "Mining Safety". Frontend: Panel de control de mina a cielo abierto. Muestra ubicación de camiones gigantes y personal. Alerta de "Proximidad Peligrosa" o "Entrada a Zona de Voladura". Backend: Fusión de sensores GPS y visión artificial para geofencing dinámico de seguridad. Objetivo: Cero accidentes en operaciones mineras.',
          interface: 'ImageUpload'
        },
       {
         id: 'supply-chain-risk',
         name: 'Supply Chain Disruption Risk',
         description: 'Monitoreo de noticias globales y eventos que pueden disrumpir la cadena de suministro de commodities energéticos y mineros. Genera alertas con score de impacto estimado ante huelgas, desastres naturales o bloqueos portuarios para tomar decisiones preventivas.',
         prompt: 'Desarrolla una POC de "Supply Chain Risk". Frontend: Monitor de noticias globales filtrado por commodities críticos. Alerta: "Huelga en puerto de Rosario afecta exportación de soja". Score de impacto estimado. Backend: NLP sobre feeds de noticias y redes sociales para detectar eventos disruptivos en logística. Objetivo: Anticiparse a shocks de oferta.',
         interface: 'Dashboard'
       },
       {
         id: 'incident-root-cause',
         name: 'Incident Root Cause Classification',
         description: 'Clasificación automática de causas raíz en reportes de incidentes de seguridad industrial (HSE) que estandariza la información y sugiere medidas correctivas. Reduce la subjetividad en el análisis de accidentes aprendiendo de miles de reportes históricos.',
         prompt: 'Genera una POC de "Incident Root Cause". Frontend: Sistema de reporte de incidentes HSE. Al ingresar la descripción del accidente, sugiere automáticamente: "Causa Raíz: Falla de Procedimiento" y "Medida Correctiva: Capacitación". Backend: Clasificación de texto (NLP) entrenada con históricos de incidentes industriales para estandarizar reportes. Objetivo: Mejorar la seguridad aprendiendo del pasado.',
         interface: 'DataUpload'
       }
      ]
  },
  // 4. Agriculture & Agritech
  {
      id: 'agriculture-agritech',
      name: 'Agriculture & Agritech',
      icon: 'Wheat',
      description: 'Agricultura de precisión, ganadería y agroindustria. Detección de enfermedades en cultivos, análisis satelital, pronósticos de cosecha y gestión integral de campo.',
      pocs: [
       {
         id: 'crop-disease',
         name: 'Crop Disease Detection',
         description: 'Detección de enfermedades en cultivos mediante fotografía de hojas en campo que identifica la patología (roya, mildiú, tizón) y sugiere el tratamiento adecuado. Permite a agrónomos diagnosticar en segundos desde el celular para actuar antes de que la enfermedad se propague.',
         prompt: 'Genera una POC de "Crop Disease Detection". Frontend: App móvil para agrónomos. Toman foto de una hoja enferma en campo. El sistema identifica la enfermedad (ej. "Roya", "Mildiú") y sugiere el fungicida adecuado. Backend: Clasificación de imágenes de plantas con CNNs entrenadas en patología vegetal. Objetivo: Detección temprana para salvar la cosecha.',
         interface: 'ImageUpload'
       },
       {
         id: 'pest-detection',
         name: 'Pest Detection',
         description: 'Identificación y conteo automático de plagas agrícolas a partir de fotos de trampas cromáticas, clasificando insectos por especie. Genera gráficos de presión de plaga por sector del lote para optimizar la aplicación de pesticidas con manejo integrado.',
         prompt: 'Crea una POC de "Pest Detection". Frontend: Upload de fotos de trampas cromáticas. El sistema cuenta automáticamente los insectos atrapados por especie (Mosca blanca, Trips). Gráfico de "Presión de Plaga" por sector. Backend: Object Detection para insectos pequeños en superficies complejas. Objetivo: Optimizar la aplicación de pesticidas (MIP).',
         interface: 'ImageUpload'
       },
       {
         id: 'drone-imagery',
         name: 'Drone Imagery Analysis',
         description: 'Análisis de cultivos con imágenes multiespectrales de drones que genera mapas NDVI interactivos para identificar zonas de estrés hídrico o deficiencia de nitrógeno. Habilita agricultura de precisión con fertilización variable según el estado real de cada zona del lote.',
         prompt: 'Desarrolla una POC de "Drone Crop Analysis". Frontend: Mapa NDVI (Índice de Vegetación) interactivo generado por vuelo de drone. Zonas rojas indican estrés hídrico o falta de nitrógeno. Backend: Procesamiento de imágenes multiespectrales para calcular índices agronómicos. Objetivo: Agricultura de precisión y fertilización variable.',
         interface: 'ImageUpload'
       },
       {
         id: 'yield-prediction',
         name: 'Yield Prediction',
         description: 'Predicción de rendimiento de cosecha por lote que integra datos satelitales, clima histórico y muestras de campo para estimar toneladas por hectárea. Permite planificar logística de cosecha, almacenamiento y venta futura con comparativas contra campañas anteriores.',
         prompt: 'Genera una POC de "Yield Prediction". Frontend: Dashboard de estimación de cosecha. Predicción de toneladas/ha por lote para la campaña actual. Comparativa con años anteriores. Backend: Modelo predictivo que integra datos satelitales, clima histórico y muestras de campo. Objetivo: Planificar logística de cosecha y venta futura.',
         interface: 'DataUpload'
       },
       {
         id: 'soil-analysis',
         name: 'Soil Analysis',
         description: 'Análisis geoestadístico de calidad del suelo que interpola nutrientes (fósforo, potasio, pH) a partir de muestreos puntuales para generar mapas continuos. Produce recetas de fertilización variable por zona para maximizar la fertilidad al menor costo.',
         prompt: 'Crea una POC de "Soil Analysis". Frontend: Mapa de nutrientes del suelo (P, K, pH) interpolado a partir de muestreos puntuales. Generación de "Receta de Fertilización" variable para maquinaria. Backend: Análisis geoestadístico (Kriging) y recomendaciones agronómicas basadas en reglas. Objetivo: Maximizar fertilidad del suelo al menor costo.',
         interface: 'DataUpload'
       },
       {
         id: 'weather-agri',
         name: 'Weather Forecasting for Agriculture',
         description: 'Pronóstico climático hiperlocal para agricultura con alertas de riesgo de helada, ventanas óptimas de pulverización y recomendaciones de acción inmediata. Protege cultivos contra eventos climáticos adversos combinando modelos meteorológicos globales con datos de estaciones locales.',
         prompt: 'Desarrolla una POC de "Agro-Weather". Frontend: Dashboard climático hiperlocal. Alertas de "Riesgo de Helada" para esta noche con recomendación de acción (ej. encender riego). Ventana de pulverización óptima por viento. Backend: Downscaling de modelos meteorológicos globales y ajuste con estaciones locales. Objetivo: Protección de cultivos contra eventos climáticos.',
         interface: 'DataUpload'
       },
       {
         id: 'precision-farming',
         name: 'Precision Farming Optimization',
         description: 'Optimización de agricultura de precisión que cruza mapas de rendimiento histórico con topografía para generar prescripciones de siembra variable por zona. Calcula el ROI de invertir más recursos donde rinden más, maximizando la productividad de cada hectárea.',
         prompt: 'Genera una POC de "Precision Farming". Frontend: Calculadora de ROI para agricultura variable. Muestra mapa de "Dosis Variable de Semilla" optimizado para el potencial de cada zona del lote. Backend: Algoritmo de optimización que cruza mapas de rendimiento histórico con topografía. Objetivo: Poner más recursos donde rinden más.',
         interface: 'DataUpload'
       },
       {
         id: 'smart-farming',
         name: 'Smart Farming Dashboard',
         description: 'Centro de comando unificado para gestión remota del campo que integra nivel de silos, ubicación de maquinaria y humedad del suelo en un solo mapa. Centraliza toda la telemetría IoT de dispositivos de campo para tomar decisiones operativas sin salir de la oficina.',
         prompt: 'Crea una POC de "Smart Farming Dashboard". Frontend: Centro de comando unificado. Estado de silos (nivel), ubicación de tractores, humedad del suelo (sensores IoT). Todo en un solo mapa. Backend: Plataforma IoT que centraliza telemetría de diversos dispositivos de campo. Objetivo: Gestión remota eficiente del establecimiento.',
         interface: 'Dashboard'
       }
      ]
  },
  // 5. Healthcare & Life Sciences
  {
      id: 'healthcare-pharma',
      name: 'Healthcare & Life Sciences',
      icon: 'Stethoscope',
      description: 'Hospitales, farmacéuticas, laboratorios y cuidado del paciente. Diagnóstico asistido por imagen, predicción clínica y automatización de registros médicos.',
      pocs: [
       {
         id: 'xray-analysis',
         name: 'X-Ray Analysis',
         description: 'Diagnóstico asistido en radiografías de tórax que resalta zonas sospechosas como nódulos u opacidades y sugiere diagnósticos probables con porcentaje de confianza. Funciona como segunda opinión experta para reducir errores diagnósticos en atención primaria.',
         prompt: 'Genera una POC de "Chest X-Ray Assistant". Frontend: Visor DICOM web. El médico carga una placa de tórax. El sistema resalta zonas sospechosas (ej. nódulos, opacidades) y sugiere "Probable Neumonía (92%)". Backend: Modelo de Deep Learning (CNN) entrenado en datasets radiológicos (tipo CheXpert). Objetivo: Segunda opinión experta para reducir errores diagnósticos.',
         interface: 'ImageUpload'
       },
       {
         id: 'ct-mri-analysis',
         name: 'CT/MRI Analysis',
         description: 'Segmentación volumétrica automática de tumores en resonancias magnéticas que calcula volumen exacto y marca límites en cortes axiales y sagitales. Herramienta de planificación quirúrgica precisa que reduce el tiempo de análisis de imágenes complejas.',
         prompt: 'Crea una POC de "Brain Tumor Segmentation" en MRI. Frontend: Visor de resonancia magnética 3D. Segmentación volumétrica automática del tumor en diferentes cortes axiales/sagitales. Cálculo de volumen tumoral exacto. Backend: 3D-UNet para segmentación médica de tejidos blandos. Objetivo: Planificación quirúrgica precisa.',
         interface: 'ImageUpload'
       },
       {
         id: 'mammography-analysis',
         name: 'Mammography Analysis',
         description: 'Screening de mamografías que detecta microcalcificaciones difíciles de ver a simple vista y genera un score BIRADS preliminar automático. Aumenta la detección temprana de cáncer de mama asistiendo a radiólogos con una segunda lectura inteligente.',
         prompt: 'Desarrolla una POC de "Mammography Screening". Frontend: Interfaz de screening. Marca microcalcificaciones difíciles de ver a simple vista. Genera un score BIRADS preliminar automático. Backend: Detección de anomalías en mamografías digitales de alta resolución. Objetivo: Aumentar la detección temprana de cáncer de mama.',
         interface: 'ImageUpload'
       },
       {
         id: 'retinography',
         name: 'Retinography',
         description: 'Detección de retinopatía diabética a partir de imágenes de fondo de ojo, clasificando en 5 grados de severidad con generación automática de reporte oftalmológico. Habilita screening masivo para prevenir ceguera por diabetes en atención primaria.',
         prompt: 'Genera una POC de "Diabetic Retinopathy Detection". Frontend: Upload de imagen de fondo de ojo. Clasificación en 5 grados de severidad (No DR -> Proliferativa). Generación de reporte oftalmológico PDF. Backend: Clasificación de imágenes de retina para screening masivo. Objetivo: Prevenir ceguera por diabetes.',
         interface: 'ImageUpload'
       },
       {
         id: 'dermatology',
         name: 'Dermatology',
         description: 'Clasificación de lesiones cutáneas que analiza fotos macro de lunares evaluando bordes, color y simetría (criterio ABCD) para estimar probabilidad de malignidad. Permite triaje dermatológico rápido diferenciando melanomas, nevus y carcinomas.',
         prompt: 'Crea una POC de "Skin Lesion Classifier". Frontend: App dermatológica (simulada). Foto macro de la lesión (lunar). Análisis de bordes, color y simetría (ABCD). Probabilidad de "Malignidad". Backend: Clasificación de lesiones cutáneas (Melanoma, Nevus, Carcinoma). Objetivo: Triaje dermatológico rápido.',
         interface: 'ImageUpload'
       },
       {
         id: 'ecg-analysis',
         name: 'ECG Analysis',
         description: 'Análisis automatizado de ECG Holter que navega horas de grabación resaltando latidos ectópicos, pausas y episodios de fibrilación auricular. Resume la carga arrítmica total para diagnóstico cardiológico eficiente sin revisar manualmente todo el trazado.',
         prompt: 'Desarrolla una POC de "ECG Arrhythmia Detection". Frontend: Visor de trazado ECG "Holter". Navegación por horas de grabación. Resaltado automático de latidos ectópicos o pausas. Resumen de "Carga de Fibrilación Auricular". Backend: Análisis de series temporales fisiológicas para detectar patrones arrítmicos. Objetivo: Diagnóstico cardiológico automatizado.',
         interface: 'ImageUpload'
       },
       {
         id: 'readmission-prediction',
         name: 'Readmission Prediction',
         description: 'Predicción de riesgo de reingreso hospitalario a 30 días para pacientes próximos al alta, con score de riesgo y factores contribuyentes explicados. Permite intervenir con cuidados domiciliarios preventivos en pacientes de alto riesgo antes del alta.',
         prompt: 'Genera una POC de "Hospital Readmission Risk". Frontend: Lista de pacientes listos para el alta. Score de riesgo de reingreso a 30 días (Alto/Bajo). Factores contribuyentes (ej. "Múltiples comorbilidades", "Vive solo"). Backend: Modelo predictivo tabular sobre historia clínica electrónica. Objetivo: Intervenir con cuidados domiciliarios para evitar reingresos.',
         interface: 'DataUpload'
       },
       {
         id: 'sepsis-prediction',
         name: 'Sepsis Prediction',
         description: 'Sistema de alerta temprana de sepsis en UCI que monitorea signos vitales y laboratorios en tiempo real para detectar deterioro rápido. Genera alertas cuando el riesgo sube permitiendo actuar en la hora dorada para salvar vidas.',
         prompt: 'Crea una POC de "Early Sepsis Warning". Frontend: Monitor de UCI. Semáforo de riesgo de sepsis por cama. Alerta pop-up si el score sube rápidamente. Muestra tendencia de lactato y presión arterial. Backend: Modelo de ML en tiempo real procesando vitales y laboratorios. Objetivo: Actuar en la "Golden Hour" para salvar vidas.',
         interface: 'DataUpload'
       },
       {
         id: 'no-shows-prediction',
         name: 'No-Shows Prediction',
         description: 'Predicción de inasistencias a citas médicas que marca pacientes con alta probabilidad de faltar y sugiere acciones preventivas como recordatorios por WhatsApp o sobre-turnos. Maximiza la utilización de recursos médicos reduciendo huecos en agenda.',
         prompt: 'Desarrolla una POC de "Medical No-Show Prediction". Frontend: Agenda de turnos médicos. Pacientes con alta probabilidad de falta marcados en rojo. Sugerencia: "Enviar recordatorio por WhatsApp" o "Sobre-turnar". Backend: Clasificación binaria basada en historial de asistencia y demografía. Objetivo: Maximizar utilización de recursos médicos.',
         interface: 'DataUpload'
       },
       {
         id: 'disease-progression',
         name: 'Disease Progression',
         description: 'Modelado de progresión de enfermedades crónicas como diabetes que proyecta trayectorias de indicadores (HbA1c) a 5 años según adherencia al tratamiento. Incluye simulador "qué pasa si" para medicina preventiva personalizada.',
         prompt: 'Genera una POC de "Chronic Disease Modeling" (Diabetes). Frontend: Gráfico de trayectoria de HbA1c proyectada a 5 años según adherencia al tratamiento actual. Simulador "¿Qué pasa si baja de peso?". Backend: Modelado longitudinal de datos de pacientes crónicos. Objetivo: Medicina preventiva personalizada.',
         interface: 'DataUpload'
       },
       {
         id: 'clinical-extraction',
         name: 'Clinical Information Extraction',
         description: 'Extracción automática de datos estructurados (síntomas, diagnósticos, medicación, alergias) desde notas clínicas en texto libre. Llena formularios de historia clínica electrónica automáticamente, eliminando carga administrativa del personal médico.',
         prompt: 'Crea una POC de "Structured Clinical Data". Frontend: Panel dividido. Izquierda: Nota clínica en texto libre (PDF/Texto). Derecha: Formulario estructurado llenado automáticamente (Síntomas, Diagnósticos, Medicación, Alergias). Backend: Clinical NLP (NER - Named Entity Recognition) para estructurar datos no estructurados. Objetivo: Llenado automático de registros (EHR).',
         interface: 'DocumentUpload'
       },
       {
         id: 'radiological-report',
         name: 'Radiological Report Generation',
         description: 'Generación automática de informes radiológicos completos a partir de hallazgos seleccionados o imágenes, con conclusión y recomendaciones. Ahorra tiempo de dictado a radiólogos con borradores editables listos para firma digital.',
         prompt: 'Desarrolla una POC de "Auto-Radiology Reporting". Frontend: El radiólogo selecciona hallazgos clave o sube la imagen. El sistema redacta el informe completo: "Tórax: Campos pulmonares limpios... Conclusión: Normal". Botón "Editar y Firmar". Backend: Generación de texto (NLG) condicionado a inputs médicos estructurados o visuales. Objetivo: Ahorrar tiempo de dictado a radiólogos.',
         interface: 'AIChat'
       },
       {
         id: 'medical-coding',
         name: 'Medical Coding Automation',
         description: 'Codificación médica automática (CIE-10/CPT) que sugiere códigos de facturación a partir de la historia clínica con justificación vinculada al texto fuente. Acelera la facturación hospitalaria y reduce denegaciones por errores de codificación.',
         prompt: 'Genera una POC de "Auto-Coding ICD-10". Frontend: Lista de episodios clínicos. Sugerencia automática de códigos de facturación (CIE-10 / CPT) con justificación (link al fragmento de texto de la historia). Backend: Clasificación de texto multicategoría sobre ontologías médicas masivas. Objetivo: Acelerar facturación médica y reducir denegaciones.',
         interface: 'DocumentUpload'
       },
       {
         id: 'clinical-guidelines',
         name: 'Clinical Guidelines Assistant',
         description: 'Asistente conversacional de guías clínicas institucionales que responde preguntas de médicos residentes con resúmenes de protocolos, dosis y referencias. Mejora la adherencia a protocolos basados en evidencia consultando documentos del hospital en tiempo real.',
         prompt: 'Crea una POC de "Clinical Protocol Bot". Frontend: Chat para médicos residentes. Pregunta: "¿Cuál es el tratamiento de primera línea para neumonía adquirida en comunidad?". Respuesta: Resumen del protocolo del hospital con dosis y referencias. Backend: RAG (Retrieval Augmented Generation) sobre PDFs de guías clínicas institucionales. Objetivo: Adherencia a protocolos basadados en evidencia.',
         interface: 'DocumentUpload'
       },
       {
         id: 'medical-transcription',
         name: 'Medical Transcription',
         description: 'Transcripción automática de consultas médicas que separa hablantes (médico/paciente) y genera nota clínica SOAP al finalizar. Elimina el tecleo durante la consulta para que el médico mantenga los ojos en el paciente.',
         prompt: 'Desarrolla una POC de "Ambient Clinical Scribe". Frontend: Grabadora de voz en consulta. Transcripción en tiempo real separando hablantes (Médico/Paciente). Generación automática de nota SOAP al finalizar. Backend: Speech-to-Text médico especializado + Resumen LLM. Objetivo: Eliminar el tecleo durante la consulta ("ojos en el paciente").',
         interface: 'AudioUpload'
       },
       {
         id: 'sleep-analysis',
         name: 'Sleep Analysis',
         description: 'Análisis de etapas del sueño a partir de audio (ronquidos/respiración) o señales de wearables que genera hipnogramas con métricas de eficiencia y apneas por hora. Permite diagnóstico de trastornos del sueño desde casa sin polisomnografía.',
         prompt: 'Genera una POC de "Sleep Staging AI". Frontend: Hipnograma (gráfico de fases del sueño) generado a partir de audio (ronquidos/respiración) o señales de wearables. Métricas: Eficiencia de sueño, Apneas/hora. Backend: Clasificación de series temporales de bio-señales. Objetivo: Diagnóstico de trastornos del sueño en casa.',
         interface: 'AudioUpload'
       },
       {
         id: 'medical-assistant',
         name: 'Medical Assistant',
         description: 'Copiloto médico integrado a la historia clínica que alerta sobre interacciones medicamentosas y sugiere diagnósticos diferenciales basados en los síntomas ingresados. Sistema de apoyo a la decisión clínica disponible en tiempo real durante la consulta.',
         prompt: 'Crea una POC de "AI Medical Copilot". Frontend: Asistente lateral en la historia clínica. Alerta de interacciones medicamentosas. Sugiere diagnósticos diferenciales basados en síntomas ingresados. Backend: Sistema experto probabilístico o LLM médico validado. Objetivo: Apoyo a la decisión clínica (CDSS).',
         interface: 'AIChat'
       },
       {
         id: 'patient-triage',
         name: 'Patient Triage Dashboard',
         description: 'Dashboard de triaje de urgencias que ordena la lista de espera por gravedad (Score Manchester/ESI), muestra tiempos de espera por nivel y alerta cuando un paciente se descompensa. Optimiza el flujo en guardia con priorización automática.',
         prompt: 'Desarrolla una POC de "ER Triage Dashboard". Frontend: Lista de espera de urgencias ordenada por gravedad (Score Manchester/ESI). Tiempos de espera por nivel de triaje. Alerta de "Paciente descompensándose". Backend: Priorización automática basada en signos vitales y motivo de consulta. Objetivo: Optimizar flujo en guardia.',
         interface: 'Dashboard'
       },
       {
         id: 'drug-discovery',
         name: 'Drug Discovery',
         description: 'Descubrimiento de fármacos in-silico con visualización molecular 3D que muestra el acoplamiento de la molécula candidata a la proteína objetivo. Predice afinidad de unión para acelerar el screening virtual de miles de compuestos candidatos.',
         prompt: 'Genera una POC de "In-Silico Drug Discovery". Frontend: Visualizador molecular 3D. Muestra la molécula candidata acoplada (docking) a la proteína objetivo. Score de afinidad predicho. Backend: Modelos geométricos de Deep Learning para predicción de interacciones proteína-ligando. Objetivo: Acelerar screening virtual de fármacos.',
         interface: 'DataUpload'
       },
       {
         id: 'clinical-trial-matching',
         name: 'Clinical Trial Matching',
         description: 'Matching semántico entre la historia clínica de pacientes y criterios de inclusión/exclusión de ensayos clínicos abiertos. Aumenta el reclutamiento en investigación al identificar automáticamente pacientes que califican para estudios activos.',
         prompt: 'Crea una POC de "Trial Matcher". Frontend: Buscador de ensayos. Ingreso ID paciente. Output: Lista de ensayos clínicos abiertos para los que califica (criterios de inclusión/exclusión ok). Backend: Matching semántico complejo entre historia clínica del paciente y documentos de protocolo de ensayos. Objetivo: Aumentar reclutamiento en ensayos.',
         interface: 'DataUpload'
       },
       {
         id: 'genomics-analysis',
         name: 'Genomics Analysis',
         description: 'Análisis automatizado de variantes genómicas con anotación de patogenicidad consultando bases de datos como ClinVar. Pipeline de bioinformática para medicina de precisión oncológica que interpreta resultados genéticos de forma accionable.',
         prompt: 'Desarrolla una POC de "Variant Caller Analysis". Frontend: Lista de variantes genéticas detectadas en la muestra. Anotación automática con bases de datos (ClinVar) para indicar patogenicidad. Backend: Bioinformática pipeline automatizada con interpretación de variantes por IA. Objetivo: Medicina de precisión oncológica.',
         interface: 'DataUpload'
       },
       {
         id: 'bed-optimization',
         name: 'Hospital Bed Optimization',
         description: 'Optimización de asignación de camas hospitalarias con predicción de altas para las próximas 4 horas y recomendación de asignación óptima. Reduce tiempos de espera de cama visualizando disponibilidad, estado de limpieza y flujo de pacientes predicho.',
         prompt: 'Genera una POC de "Bed Management AI". Frontend: Visualización del hospital (Camas Libres/Ocupadas/Limpieza). Predicción de altas para las próximas 4 horas. Recomendación de asignación óptima. Backend: Optimización de recursos basada en flujo de pacientes predicho. Objetivo: Reducir tiempos de espera de cama.',
         interface: 'DataUpload'
       },
       {
         id: 'mental-health-chatbot',
         name: 'Mental Health Chatbot',
         description: 'Chatbot de soporte emocional con ejercicios guiados de respiración y terapia cognitivo-conductual, disponible 24/7. Incluye detección de riesgo suicida para derivación humana inmediata, con guardrails estrictos de seguridad clínica.',
         prompt: 'Crea una POC de "Emotional Support Bot". Frontend: Interfaz de chat cálida y empática. Ejercicios guiados de respiración o CBT (Cognitive Behavioral Therapy). Detección de riesgo suicida para derivación humana inmediata. Backend: LLM finetuneado en psicología y contención emocional con guardrails estrictos. Objetivo: Acompañamiento 24/7 en salud mental.',
         interface: 'AIChat'
       },
       {
         id: 'drug-discovery-screening',
         name: 'Drug Discovery Screening',
         description: 'Predicción de propiedades ADMET (Absorción, Distribución, Metabolismo, Excreción, Toxicidad) para moléculas candidatas con semáforos de riesgo. Filtra compuestos tóxicos tempranamente en el pipeline farmacéutico ahorrando años de desarrollo.',
         prompt: 'Desarrolla una POC de "ADMET Prediction". Frontend: Tabla de moléculas candidatas. Predicciones semafóricas de Absorción, Distribución, Metabolismo, Excreción y Toxicidad. Backend: Modelos QSAR (Quantitative Structure-Activity Relationship) modernos. Objetivo: Filtrar candidatos tóxicos tempranamente.',
         interface: 'DataUpload'
       },
       {
         id: 'patient-triage-routing',
         name: 'Patient Triage & Routing',
         description: 'Chatbot de autotriaje que evalúa síntomas del paciente mediante preguntas guiadas y recomienda el nivel de atención apropiado: autocuidado, consulta virtual o urgencias. Descomprime servicios de emergencia desviando casos leves a canales adecuados.',
         prompt: 'Genera una POC de "Symptom Checker & Routing". Frontend: Chatbot de autotriaje para pacientes. "¿Qué sientes?". Recomendación final: "Autocuidado / Consulta Virtual / Ir a Urgencias (Hospital X)". Backend: Árbol de decisión clínica o sistema experto probabilístico. Objetivo: Descomprimir urgencias de casos leves.',
         interface: 'AIChat'
       }
     ]
  },
  // 5. Travel & Hospitality
  {
      id: 'travel-hospitality',
      name: 'Travel & Hospitality',
      icon: 'Plane',
      description: 'Turismo, hotelería, aerolíneas y experiencias de viaje. Pricing dinámico, concierge multilingüe y check-in biométrico sin contacto.',
      pocs: [
        {
          id: 'travel-price-optimization',
          name: 'Dynamic Pricing Optimization',
          description: 'Optimización de tarifas hoteleras en tiempo real que considera eventos locales, precios de competidores y demanda histórica para maximizar el RevPAR. Muestra calendario de ocupación con precios sugeridos por día y comparativo de pace de reservas vs año anterior.',
          prompt: 'Desarrolla una POC de "Travel Dynamic Pricing". Frontend: Panel de Revenue Manager. Calendario de ocupación con precios sugeridos por día. Gráfico de "Pace de Reservas" vs Año Anterior. Backend: Algoritmo de pricing que considera eventos locales, precios de competidores (scraping) y demanda histórica. Objetivo: Maximizar RevPAR (Revenue Per Available Room).',
          interface: 'DataUpload'
        },
        {
          id: 'multilingual-concierge',
          name: 'Multilingual Concierge',
          description: 'Concierge virtual multilingüe que atiende huéspedes en su idioma nativo (japonés, mandarín, árabe, etc.) para reservas de restaurante, solicitudes de servicio y recomendaciones locales. Ofrece atención 5 estrellas sin barreras idiomáticas las 24 horas.',
          prompt: 'Crea una POC de "Hotel AI Concierge". Frontend: Kiosco digital en lobby o App móvil. El huésped habla en su idioma (ej. Japonés) pidiendo "Reservar mesa para cenar". El sistema responde en Japonés y confirma la reserva. Backend: Speech-to-Speech translation + Agente conversacional integrado al PMS del hotel. Objetivo: Atención 5 estrellas sin barreras idiomáticas.',
          interface: 'AIChat'
        },
        {
          id: 'smart-checkin',
          name: 'Smart Check-in',
          description: 'Check-in biométrico sin contacto que combina escaneo de pasaporte con verificación facial para registrar huéspedes en menos de 2 minutos. Emite llave digital (QR/NFC) eliminando colas en recepción y mejorando la primera impresión del hotel.',
          prompt: 'Genera una POC de "Biometric Check-in". Frontend: Kiosco de auto-atención. Escaneo de pasaporte + Selfie. Match biométrico instantáneo. Emisión de llave digital (QR/NFC). Backend: Verificación de identidad (IDV) y reconocimiento facial 1:1. Objetivo: Reducir tiempo de check-in de 15 min a 2 min.',
          interface: 'ImageUpload'
        }
      ]
  },
  // 6. Tech, Telecom & IT
  {
      id: 'tech-telecom',
      name: 'Tech, Telecom & IT',
      icon: 'Terminal',
      description: 'Software, telecomunicaciones, ISPs y servicios IT. Generación automática de código, optimización de redes y soporte técnico inteligente.',
      pocs: [
        {
          id: 'automated-code-generation',
          name: 'Automated Code Generation',
          description: 'Generación automática de tests unitarios y código boilerplate a partir de código fuente existente. Pega un bloque de código legacy y obtiene una suite de pruebas cubriendo el 90% de ramas, acelerando la cobertura de testing del equipo.',
          prompt: 'Crea una POC de "Auto-Unit Tests". Frontend: Panel IDE. Pega un bloque de código Legacy. Botón: "Generar Suite de Pruebas". Resultado: Código de tests (Jest/PyTest) cubriendo el 90% de ramas. Backend: LLM de código (ej. StarCoder) instruido para generar tests robustos dado un snippet. Objetivo: Aumentar cobertura de código rápidamente.',
          interface: 'AIChat'
        },
        {
          id: 'product-release-notes',
          name: 'Product Release Notes',
          description: 'Generación automática de release notes a partir de tickets de Jira o commits de Git, produciendo dos versiones: una técnica para devs y otra legible para clientes. Agrupa cambios por categoría (Features, Fixes) y redacta en lenguaje natural.',
          prompt: 'Desarrolla una POC de "Auto-Changelog". Frontend: Input: Lista de IDs de tickets de Jira o Commits de Git. Output: Documento "Release Notes v2.1" formateado para cliente final, y otro técnico para devs. Backend: Resumen de texto (Summarization) que agrupa cambios por categoría (Features, Fixes) y redacta en lenguaje natural. Objetivo: Automatizar documentación de releases.',
          interface: 'DataUpload'
        },
        {
          id: 'rfp-response-assistant',
          name: 'RFP Response Assistant',
          description: 'Asistente para responder licitaciones IT (RFP) que analiza el documento completo y responde preguntas sobre cumplimiento de requisitos con referencias exactas. Genera borradores de respuesta basados en capacidades y respuestas anteriores de la empresa.',
          prompt: 'Genera una POC de "RFP Assistant". Frontend: Uploader de PDF de licitación (RFP). Chatbot lateral. Usuario: "¿Cumplimos el requisito de ISO 27001?". Bot: "Sí, ver anexo de seguridad pág 4". Botón "Generar Borrador de Respuesta". Backend: RAG sobre base de conocimiento de capacidades de la empresa y respuestas anteriores. Objetivo: Reducir tiempo de respuesta a licitaciones en un 50%.',
          interface: 'AIChat'
        },
        {
          id: 'runbook-automation',
          name: 'Runbook Automation Agent',
          description: 'Bot de operaciones (SRE) que ejecuta runbooks de forma autónoma ante alertas de infraestructura: diagnostica, identifica causa raíz y propone acciones con confirmación humana. Reduce el MTTR (tiempo medio de recuperación) automatizando respuestas de nivel 1.',
          prompt: 'Crea una POC de "SRE Runbook Bot". Frontend: Chat de Ops (Slack/Teams). Alerta: "High CPU en DB-01". Bot: "Ejecutando diagnóstico... Top queries identificadas. ¿Desea matar la sesión #452? (Runbook: DB-Kill-Session)". Backend: Agente con permisos de ejecución de scripts (Python/Bash) en entorno controlado. Objetivo: Reducir MTTR (Mean Time To Recovery).',
          interface: 'AIChat'
        },
       {
         id: 'network-optimization',
         name: 'Network Optimization',
         description: 'Optimización de red celular mediante mapas de calor de congestión con sugerencias de ajuste de antenas o balanceo de carga para aliviar celdas saturadas. Mejora la calidad de servicio sin inversión en hardware adicional usando datos de tráfico en tiempo real.',
         prompt: 'Desarrolla una POC de "Telco Network Optimizer". Frontend: Mapa de calor de congestión de red celular. Sugerencia de "Tilt de Antena" o "Balanceo de Carga" para aliviar celdas saturadas. Backend: Algoritmos de optimización de grafos sobre datos de tráfico de red en tiempo real. Objetivo: Mejorar QoS sin hardware adicional.',
         interface: 'DataUpload'
       },
       {
         id: 'churn-prediction-telecom',
         name: 'Telecom Churn Prediction',
         description: 'Predicción de abandono de suscriptores de telecomunicaciones que identifica clientes con alta probabilidad de portarse a la competencia. Analiza patrones de uso, facturación y llamadas a soporte para activar retención proactiva antes de la solicitud de baja.',
         prompt: 'Genera una POC de "Subscriber Churn Prevention". Frontend: Dashboard de retención. Lista de clientes con "Score de Portabilidad" alto. Alerta: "El cliente X ha llamado 3 veces al soporte y bajó su consumo de datos". Backend: Predicción de churn basada en patrones de uso, facturación y logs de soporte. Objetivo: Retención proactiva.',
         interface: 'DataUpload'
       },
       {
         id: 'network-anomaly',
         name: 'Network Anomaly Detection',
         description: 'Detección de anomalías en tráfico de red que identifica picos sospechosos, comunicaciones con IPs maliciosas y patrones de ataque DDoS en formación. Monitorea netflow data en tiempo real para ciberseguridad de red sin firmas conocidas.',
         prompt: 'Crea una POC de "Network Intrusion Monitor". Frontend: Monitor de tráfico de red (Flows). Detección de picos anómalos o comunicaciones con IPs maliciosas. Alerta "Posible DDoS iniciando". Backend: Detección de anomalías no supervisada (Isolation Forest) sobre netflow data. Objetivo: Ciberseguridad de red en tiempo real.',
         interface: 'DataUpload'
       },
       {
         id: '5g-optimization',
         name: '5G Coverage Optimization',
         description: 'Planificador de cobertura 5G con simulación de propagación de señal en entornos urbanos 3D considerando edificios y obstáculos. Sugiere ubicación óptima de small cells para despliegue eficiente de infraestructura de nueva generación.',
         prompt: 'Desarrolla una POC de "5G Planner". Frontend: Mapa 3D de la ciudad. Simulación de propagación de señal 5G mmWave considerando edificios y árboles. Sugerencia de "Mejor ubicación para nueva Small Cell". Backend: Ray-tracing para simulación de RF (Radiofrecuencia) en entornos urbanos. Objetivo: Despliegue eficiente de infraestructura 5G.',
         interface: 'DataUpload'
       },
       {
         id: 'call-center-analytics',
         name: 'Call Center Analytics',
         description: 'Análisis inteligente de llamadas de soporte que extrae métricas de calidad (silencios, interrupciones, sentimiento) y detecta problemas frecuentes del día. Procesa grabaciones masivamente para QA automático y detección temprana de incidencias.',
         prompt: 'Genera una POC de "Call Intelligence". Frontend: Dashboard de QA. Análisis de llamadas grabadas: % de Silencio, Interrupciones, Sentimiento del Cliente. "Nube de problemas" frecuentes de hoy. Backend: Speech-to-Text + NLP para extraer insights de grabaciones de audio masivas. Objetivo: Mejorar calidad de atención y detectar problemas emergentes.',
         interface: 'DocumentUpload'
       },
       {
         id: 'telecom-chatbot',
         name: 'Telecom Customer Service Chatbot',
         description: 'Bot de soporte técnico para ISP que diagnostica problemas de conexión automáticamente consultando el estado real del módem del cliente. Resuelve incidencias de nivel 1 (reinicio remoto, ajustes de señal) sin intervención humana, deflectando hasta 60% de llamadas.',
         prompt: 'Crea una POC de "ISP Support Bot". Frontend: Chat en app móvil. Usuario: "Mi internet está lento". Bot: "Veo que su módem tiene señal débil. ¿Podría reiniciarlo? (He enviado la señal de reset)". Backend: Integración con APIs de diagnóstico de red del ISP para resolver problemas automáticamente. Objetivo: Deflectar el 60% de llamadas de soporte técnico nivel 1.',
         interface: 'AIChat'
       },
       {
         id: 'ticket-triage',
         name: 'IT Ticket Triage & Routing',
         description: 'Clasificación automática de tickets de soporte IT que asigna categoría (Hardware/Software/Red), prioridad (P1-P4) y grupo resolutor correcto al instante. Elimina la mesa de entrada manual enrutando cada ticket al equipo adecuado desde el primer momento.',
         prompt: 'Desarrolla una POC de "IT Service Desk Auto-Triager". Frontend: Cola de tickets entrantes. Asignación automática de Categoría (Hardware/Software/Red) y Prioridad (P1-P4). Enrutamiento al grupo resolutor correcto. Backend: Clasificación de texto supervisada entrenada con histórico de tickets de Jira/ServiceNow. Objetivo: Eliminar la mesa de entrada manual.',
         interface: 'DocumentUpload'
       }
      ]
  },
  // 7. Corporate Services
  {
      id: 'corporate-services',
      name: 'Corporate Services',
      icon: 'Briefcase',
      description: 'Recursos humanos, compras, finanzas corporativas y atención al cliente. Autoservicio de empleados, monitoreo de proveedores y generación de documentos comerciales.',
      pocs: [
        {
          id: 'policy-handbook-gen',
          name: 'Policy Handbook Generator',
          description: 'Asistente de RRHH que responde preguntas de empleados consultando el manual interno, convenios colectivos y políticas actualizadas en tiempo real. Ofrece autoservicio 24/7 para consultas como días de licencia, beneficios y procesos administrativos.',
          prompt: 'Crea una POC de "HR Copilot". Frontend: Chat para empleados. Pregunta: "¿Cuántos días de duelo me corresponden?". Respuesta: "Según la política actualizada en 2024, son 3 días hábiles. Aquí está el formulario...". Backend: RAG sobre manual de empleados y convenios colectivos. Objetivo: Auto-servicio de RRHH.',
          interface: 'AIChat'
        },
        {
          id: 'supplier-risk-monitor',
          name: 'Supplier Risk Monitoring',
          description: 'Monitor de riesgo de proveedores con semáforos de salud financiera, legal y reputacional actualizados automáticamente. Alerta ante cambios adversos en el score crediticio o noticias negativas de un proveedor crítico para compras seguras.',
          prompt: 'Desarrolla una POC de "Vendor Risk Radar". Frontend: Perfil de proveedor. Semáforos de riesgo: Financiero (Credit score), Legal (Juicios), Reputacional (Noticias negativas). Alerta de cambios. Backend: Agregación de datos de burós de crédito y scraping de noticias legales. Objetivo: Compras seguras y compliance.',
          interface: 'Dashboard'
        },
        {
          id: 'market-research-gen',
          name: 'Market Research Generator',
          description: 'Agente autónomo de investigación de mercado que busca, lee y sintetiza información web para generar reportes estructurados con tamaño de mercado, competidores y tendencias. Entrega un PDF profesional citando fuentes en minutos en lugar de semanas.',
          prompt: 'Genera una POC de "Market Intel Agent". Frontend: Input: "Analizar mercado de Café en cápsulas en México". Output: Reporte PDF estructurado con Tamaño de Mercado, Competidores Principales y Tendencias de Consumo, citando fuentes. Backend: Agente de búsqueda web autónomo que navega, lee reportes y sintetiza información. Objetivo: Acelerar research estratégico.',
          interface: 'AIChat'
        },
        {
          id: 'voice-customer-analytics',
          name: 'Voice of Customer Analytics',
          description: 'Dashboard de Voz del Cliente que agrega feedback de encuestas, llamadas y chats para identificar los top pain points de la semana. Correlaciona temas emergentes con indicadores como NPS para accionar mejoras basadas en datos reales.',
          prompt: 'Crea una POC de "VoC Dashboard". Frontend: Visualización de feedback agregado (Encuestas + Llamadas + Chat). "Top 5 Pain Points" de la semana. Análisis de correlación entre temas y NPS (Net Promoter Score). Backend: NLP avanzado (Topic Modeling + Sentiment) integrando múltiples fuentes de texto. Objetivo: Customer Centricity basado en datos.',
          interface: 'Dashboard'
        },
        {
          id: 'sales-email-generator',
          name: 'Sales Email Generator',
          description: 'Generador de emails de ventas hiper-personalizados que analiza el perfil profesional del prospecto para crear mensajes de apertura relevantes. Produce 3 variaciones con técnicas de copywriting probadas para aumentar la tasa de apertura de cold emails.',
          prompt: 'Desarrolla una POC de "Cold Email Writer". Frontend: Input: URL de LinkedIn del prospecto y Producto a vender. Output: 3 opciones de email de apertura hiper-personalizados mencionando su experiencia reciente o posts. Backend: Scraping de perfil profesional + LLM generation con técnicas de copywriting (AIDA). Objetivo: Aumentar tasa de apertura de cold emails.',
          interface: 'AIChat'
        },
        {
          id: 'policy-exception',
          name: 'Policy Exception Justification',
          description: 'Evaluador inteligente de excepciones a políticas de gastos que analiza la justificación del empleado contra reglas históricas y recomienda aprobar o rechazar. Automatiza la auditoría de gastos fuera de política con criterios consistentes y trazables.',
          prompt: 'Genera una POC de "Expense Approval AI". Frontend: El empleado sube un gasto fuera de política (ej. cena cara). El sistema evalúa la justificación ("Cena con cliente VIP") y recomienda "Aprobar Excepcionalmente" o "Rechazar". Backend: Clasificación de texto comparando justificación contra reglas de negocio históricas. Objetivo: Auditoría de gastos inteligente.',
          interface: 'AIChat'
        },
        {
          id: 'partner-playbook',
          name: 'Partner Playbook Generator',
          description: 'Generador de kits de onboarding para partners que produce listas de precios, presentaciones y contratos personalizados según tipo de partner y región. Habilita canales de venta más rápido con documentación comercial generada dinámicamente.',
          prompt: 'Crea una POC de "Partner Onboarding Gen". Frontend: Input: Tipo de Partner (Reseller/Integrador) y Región. Output: Kit de bienvenida personalizado con listas de precios, presentaciones y contratos relevantes generados dinámicamente. Backend: Ensamblado de documentos (Document Assembly) inteligente. Objetivo: Habilitar canales de venta más rápido.',
          interface: 'AIChat'
        }
      ]
  },
  // 8. Public Sector & Smart Cities
  {
      id: 'public-sector-smart-cities',
      name: 'Public Sector & Smart Cities',
      icon: 'Landmark',
      description: 'Gobierno digital, ciudades inteligentes, servicios ciudadanos y gestión de emergencias. Automatización de trámites, vigilancia epidemiológica y optimización de servicios públicos.',
      pocs: [
       {
         id: 'traffic-violation',
         name: 'Traffic Violation Detection',
         description: 'Detección automática de infracciones de tránsito (cruce en rojo, exceso de velocidad) mediante análisis de video con reconocimiento de patentes. Genera evidencia fotográfica validable para fiscalización automatizada sin intervención humana.',
         prompt: 'Genera una POC de "Traffic Sentinel". Frontend: Interfaz de revisión de multas. Muestra clip de video del vehículo cruzando en rojo. Identifica patente (LPR) y marca/modelo. Agente de tránsito valida con un click. Backend: Video Analytics en bordes de calle para detectar infracciones y OCR para patentes. Objetivo: Seguridad vial y fiscalización automatizada.',
         interface: 'ImageUpload'
       },
       {
         id: 'infrastructure-damage',
         name: 'Infrastructure Damage Assessment',
         description: 'Detección automática de baches y deterioro vial a partir de video capturado por flota municipal (camiones de basura, buses). Genera un mapa georreferenciado con priorización de reparaciones por severidad para mantenimiento vial eficiente.',
         prompt: 'Crea una POC de "Pothole Detector". Frontend: Mapa de la ciudad con "Baches Identificados" por severidad. Fotos georreferenciadas tomadas por camiones de basura o buses. Priorización de reparaciones automática. Backend: Detección de objetos en video recolectado por flota municipal. Objetivo: Mantenimiento vial eficiente.',
         interface: 'ImageUpload'
       },
       {
         id: 'service-demand',
         name: 'Service Demand Forecasting',
         description: 'Predicción de demanda de servicios públicos (agua, electricidad) por barrio con simulación de impacto de eventos extremos como olas de calor. Permite planificar infraestructura y asignación de recursos anticipándose a picos estacionales.',
         prompt: 'Desarrolla una POC de "Utility Demand Forecast". Frontend: Gráfico de consumo de agua proyectado por barrio para el próximo verano. Simulación de impacto de ola de calor. Backend: Predicción de series temporales correlacionando consumo histórico con pronóstico climático. Objetivo: Planificación de infraestructura y recursos.',
         interface: 'DataUpload'
       },
       {
         id: 'citizen-request',
         name: 'Citizen Request Classification',
         description: 'Clasificación automática de reportes ciudadanos que combina foto y texto ("árbol caído en calle X") para asignar categoría, urgencia y cuadrilla responsable al instante. Acelera la respuesta al vecino eliminando la clasificación manual.',
         prompt: 'Genera una POC de "Citizen 311 Router". Frontend: App "Reporta tu Ciudad". Ciudadano envía foto y texto "Árbol caído en calle X". Sistema clasifica automáticamente como "Espacios Verdes - Urgencia Alta" y asigna cuadrilla. Backend: Clasificación multimodal (Texto + Imagen) de reportes. Objetivo: Respuesta rápida al vecino.',
         interface: 'DocumentUpload'
       },
       {
         id: 'doc-processing-public',
         name: 'Document Processing Automation',
         description: 'Digitalización inteligente de documentos administrativos que aplica OCR a expedientes escaneados y extrae metadatos (fechas, personas, números de causa) para indexación y búsqueda. Transforma archivos en papel en información accesible y buscable.',
         prompt: 'Crea una POC de "Expediente Digital AI". Frontend: Mesa de entradas digital. OCR de documentos escaneados antiguos. Extracción de metadatos (Fechas, Personas, Autos) e indexación para búsqueda. Backend: OCR y NER (Named Entity Recognition) sobre documentos legales/administrativos. Objetivo: Digitalización y despapelización del estado.',
         interface: 'DocumentUpload'
       },
       {
         id: 'permit-processing',
         name: 'Permit Application Processing',
         description: 'Procesamiento automático de solicitudes de permisos de obra que verifica planos contra código de edificación (FOS, FOT, alturas). Emite pre-aprobación o lista de correcciones al instante, acelerando el trámite de semanas a minutos.',
         prompt: 'Desarrolla una POC de "Auto-Permisos de Obra". Frontend: Portal de arquitectos. Suben planos CAD/PDF. Sistema chequea automáticamente código de edificación (FOS, FOT, alturas). Emite "Pre-aprobación" o lista de correcciones. Backend: Análisis geométrico de planos y validación contra reglas normativas. Objetivo: Acelerar inversiones en construcción.',
         interface: 'DocumentUpload'
       },
       {
         id: 'citizen-assistant',
         name: 'Virtual Assistant for Citizens',
         description: 'Asistente virtual para trámites gubernamentales que guía al ciudadano paso a paso: requisitos, formularios, turnos disponibles y estado de expedientes. Simplifica la burocracia ofreciendo un canal de atención inteligente 24/7.',
         prompt: 'Genera una POC de "GobBot". Frontend: Chat en web municipal. Ciudadano: "¿Cómo renuevo mi licencia de conducir?". Bot: "Debes pedir turno aquí (link). Requisitos: DNI y Libre Deuda. ¿Quieres que busque turnos libres?". Backend: Agente conversacional conectado a base de trámites y sistema de turnos. Objetivo: Simplificar la burocracia.',
         interface: 'AIChat'
       },
       {
         id: 'faq-chatbot',
         name: 'FAQ Chatbot',
         description: 'Chatbot de preguntas frecuentes gubernamentales que responde consultas sobre fechas de cobro, feriados, vacunación y trámites comunes. Descongestiona líneas telefónicas con una base de conocimiento actualizable en tiempo real.',
         prompt: 'Crea una POC de "Info-Gov Bot". Frontend: Widget flotante en sitio de gobierno. Responde preguntas sobre fechas de cobro, feriados, vacunación, etc. Backend: RAG simple sobre base de preguntas frecuentes actualizable. Objetivo: Descongestionar líneas telefónicas.',
         interface: 'AIChat'
       },
       {
         id: 'emergency-response',
         name: 'Emergency Response Optimization',
         description: 'Optimización del despacho de emergencias (911) con modelo predictivo de demanda espacio-temporal que sugiere postas óptimas para ambulancias en espera. Reduce el tiempo de arribo mediante posicionamiento inteligente basado en patrones de incidentes.',
         prompt: 'Desarrolla una POC de "911 Dispatch Optimizer". Frontend: Mapa de calor de incidentes en tiempo real. Ubicación óptima sugerida para ambulancias en espera (Postas). Backend: Modelo predictivo de demanda de emergencias espacio-temporal. Objetivo: Reducir tiempo de arribo de ambulancias.',
         interface: 'DataUpload'
       },
       {
         id: 'waste-management',
         name: 'Waste Management Optimization',
         description: 'Ruteo dinámico de camiones de basura que solo visita contenedores con sensores IoT que superan el 75% de capacidad. Calcula ahorro de kilómetros y combustible optimizando rutas diariamente para recolección eficiente y sustentable.',
         prompt: 'Genera una POC de "Smart Waste Routing". Frontend: Ruta dinámica para camiones de basura. Solo visita contenedores con sensores > 75% llenos. Ahorro de Km y combustible calculado. Backend: Algoritmo de ruteo de vehículos (VRP) dinámico basado en datos IoT de contenedores. Objetivo: Recolección eficiente y sustentable.',
         interface: 'DataUpload'
       },
       {
         id: 'social-fraud',
         name: 'Social Benefit Fraud Detection',
         description: 'Detección de fraude en beneficios sociales que cruza bases de datos para identificar incompatibilidades (ej. cobrar desempleo con aportes activos). Genera flags de riesgo por beneficiario asegurando que la ayuda social llegue a quien realmente la necesita.',
         prompt: 'Crea una POC de "Social Benefit Fraud". Frontend: Lista de beneficiarios con "Flags de Riesgo". Ej: "Percibe beneficio de desempleo pero registra aportes activos". Backend: Cruce de bases de datos y reglas de negocio para detectar incompatibilidades. Objetivo: Asegurar que la ayuda llegue a quien la necesita.',
         interface: 'DataUpload'
       },
       {
         id: 'public-health',
         name: 'Public Health Surveillance',
         description: 'Dashboard epidemiológico que detecta brotes tempranamente (dengue, gripe) combinando datos de guardias hospitalarias con señales digitales como búsquedas web. Genera mapas de calor de casos para respuesta sanitaria anticipada a nivel regional.',
         prompt: 'Desarrolla una POC de "Epi-Monitor". Frontend: Dashboard epidemiológico. Detección temprana de brotes (ej. Dengue, Gripe) basada en aumento de búsquedas web y reportes de guardia. Mapa de calor de casos. Backend: Vigilancia digital basada en datos no tradicionales (Google Trends, Redes Sociales). Objetivo: Respuesta sanitaria anticipada.',
         interface: 'Dashboard'
       },
       {
         id: 'smart-parking',
         name: 'Smart Parking Detection',
         description: 'Detección visual de disponibilidad de estacionamiento en la vía pública usando cámaras de seguridad existentes. Muestra lugares libres en tiempo real en una app para conductores, reduciendo tráfico causado por la búsqueda de estacionamiento.',
         prompt: 'Genera una POC de "City Parking AI". Frontend: App para conductores "Dónde Estacionar". Muestra lugares libres en la calle en tiempo real (Puntos Verdes). Backend: Visión artificial aplicada a cámaras de seguridad pública existentes para detectar espacios vacíos. Objetivo: Reducir tráfico por búsqueda de estacionamiento.',
         interface: 'ImageUpload'
       },
       {
         id: 'regulatory-navigator',
         name: 'Regulatory Document Navigator',
         description: 'Buscador semántico de normativa legal y regulaciones que permite consultas en lenguaje natural como "normativa sobre ruidos molestos en zona residencial". Trae los artículos vigentes específicos para facilitar el acceso a la justicia y normativa clara.',
         prompt: 'Crea una POC de "Legal Gov Search". Frontend: Buscador semántico para el Boletín Oficial. Usuario: "Normativa sobre ruidos molestos en zona residencial". Sistema trae los artículos vigentes específicos. Backend: Búsqueda semántica (Embeddings) sobre corpus legal digesto. Objetivo: Acceso a la justicia y normativa clara.',
         interface: 'AIChat'
       }
      ]
  },
  // 10. Education
  {
      id: 'education',
      name: 'Education',
      icon: 'GraduationCap',
      description: 'Educación K-12, universidades, EdTech y capacitación corporativa. Control de asistencia, predicción de deserción, tutores virtuales y corrección automática.',
      pocs: [
       {
         id: 'attendance-tracking',
         name: 'Attendance Tracking',
         description: 'Control de asistencia automático por reconocimiento facial que registra la presencia de cada estudiante al entrar al aula sin intervención manual. Elimina la toma de lista en clases masivas ahorrando minutos de clase diariamente.',
         prompt: 'Genera una POC de "Facial Attendance". Frontend: Kiosco en entrada del aula. Estudiante mira a la cámara -> "Bienvenido, Juan. Asistencia registrada". Backend: Reconocimiento facial 1:N contra base de alumnos. Objetivo: Eliminar la toma de lista manual en clases masivas.',
         interface: 'ImageUpload'
       },
       {
         id: 'exam-proctoring',
         name: 'Exam Proctoring',
         description: 'Supervisión automática de exámenes remotos que detecta ausencia de persona, presencia de terceros o mirada fuera de pantalla prolongada. Garantiza integridad académica en evaluaciones online con alertas en tiempo real para el docente.',
         prompt: 'Crea una POC de "AI Proctor". Frontend: Interfaz de examen. Feed de webcam del alumno. Alerta roja si: "No hay nadie", "Hay más de una persona" o "Mira fuera de la pantalla > 5s". Backend: Gaze tracking y detección de personas. Objetivo: Integridad académica en exámenes remotos.',
         interface: 'ImageUpload'
       },
       {
         id: 'lab-safety',
         name: 'Lab Safety Monitoring',
         description: 'Monitoreo de seguridad en laboratorios académicos que alerta si un estudiante se quita las gafas de protección o manipula reactivos sin guantes. Previene accidentes químicos en universidades con vigilancia continua de cumplimiento de protocolo.',
         prompt: 'Desarrolla una POC de "Lab Safety Eye". Frontend: Monitor de seguridad. Alerta si un estudiante se quita las gafas de protección o manipula reactivos sin guantes. Backend: Detección de EPP específica para laboratorio. Objetivo: Prevenir accidentes químicos en universidades.',
         interface: 'ImageUpload'
       },
       {
         id: 'dropout-prediction',
         name: 'Student Dropout Prediction',
         description: 'Predicción de deserción estudiantil que identifica alumnos en riesgo de abandonar basándose en notas, asistencia y patrones de comportamiento. Explica las causas probables y sugiere intervenciones al equipo de consejería para retención temprana.',
         prompt: 'Genera una POC de "Dropout Radar". Frontend: Dashboard para consejeros. Lista de riesgo. "Alumno X: Riesgo Alto (80%). Causas: Bajó notas en Matemáticas + 3 inasistencias seguidas". Backend: Modelo de clasificación (XGBoost) sobre historial académico y de asistencia. Objetivo: Retención estudiantil temprana.',
         interface: 'DataUpload'
       },
       {
         id: 'performance-forecasting',
         name: 'Performance Forecasting',
         description: 'Predicción de nota final proyectada basada en entregas y evaluaciones parciales del alumno. Muestra qué calificación necesita en las instancias restantes para alcanzar su objetivo, motivando con metas claras y alcanzables.',
         prompt: 'Crea una POC de "Grade Predictor". Frontend: Vista de alumno. "Basado en tus entregas actuales, tu nota final proyectada es 7.5. Para llegar a 9, necesitas sacar 10 en el final". Backend: Regresión lineal simple basada en pesos del syllabus. Objetivo: Motivar a los alumnos con metas claras.',
         interface: 'DataUpload'
       },
       {
         id: 'course-recommendation',
         name: 'Course Recommendation',
         description: 'Sistema de recomendación de cursos electivos que analiza intereses y perfil del alumno para sugerir las materias con mayor afinidad. Personaliza la trayectoria académica maximizando la satisfacción y relevancia de las optativas elegidas.',
         prompt: 'Desarrolla una POC de "Elective Matcher". Frontend: Perfil del alumno (Intereses: IA, Robótica). Sistema sugiere: "Curso recomendado: \'Visión por Computadora Avanzada\' (Match 95%)". Backend: Sistema de recomendación basado en contenido (syllabus vs intereses). Objetivo: Personalizar la trayectoria académica.',
         interface: 'DataUpload'
       },
       {
         id: 'essay-grading',
         name: 'Essay Grading Automation',
         description: 'Corrección automática de ensayos en lote que evalúa cada texto según rúbrica predefinida y genera feedback constructivo personalizado. Reduce la carga administrativa docente de horas a minutos manteniendo evaluaciones consistentes.',
         prompt: 'Genera una POC de "Auto-Grader". Frontend: Profesor sube lote de 50 ensayos (PDF). Sistema devuelve tabla con: Alumno, Nota Sugerida (A-F) y Feedback ("Buena estructura, pero falta citar fuentes"). Backend: LLM evaluador con rúbrica predefinida en el prompt. Objetivo: Reducir carga administrativa docente.',
         interface: 'DocumentUpload'
       },
       {
         id: 'plagiarism-detection',
         name: 'Plagiarism Detection',
         description: 'Detección de plagio y contenido generado por IA en trabajos académicos que compara contra fuentes web y analiza huella lingüística. Resalta párrafos sospechosos con porcentaje de coincidencia y probabilidad de generación artificial.',
         prompt: 'Crea una POC de "Plagiarism Hunter". Frontend: Subida de tesis. Reporte: "15% coincidencias con Wikipedia. 40% probabilidad de texto generado por IA". Resaltado de párrafos sospechosos. Backend: Comparación de n-gramas y detectores de huella de LLM. Objetivo: Calidad académica.',
         interface: 'DocumentUpload'
       },
       {
         id: 'curriculum-analysis',
         name: 'Curriculum Analysis',
         description: 'Auditoría de planes de estudio que detecta brechas temáticas comparando los programas de la carrera contra demandas actuales del mercado laboral. Identifica contenidos faltantes como ética en IA o sostenibilidad para actualizar la oferta académica.',
         prompt: 'Desarrolla una POC de "Syllabus Audit". Frontend: Sube todos los programas de la carrera de "Ingeniería". Output: "Brecha detectada: No hay contenidos de \'Ética en IA\' mandatarios". Backend: Análisis de tópicos (Topic Modeling) sobre corpus curricular. Objetivo: Actualizar planes de estudio a demandas del mercado.',
         interface: 'DocumentUpload'
       },
       {
         id: 'virtual-tutor',
         name: 'Virtual Tutor',
         description: 'Tutor virtual socrático disponible 24/7 que guía al alumno paso a paso sin darle la respuesta directa, incluyendo capacidad de leer ecuaciones y fórmulas desde foto. Apoya el estudio fuera de horario con explicaciones adaptadas al nivel del estudiante.',
         prompt: 'Genera una POC de "Math Tutor Bot". Frontend: Chat educativo. Alumno sube foto de ecuación cuadrática. Bot: "No te daré la respuesta directa. Primero, ¿recuerdas la fórmula general?". Paso a paso socrático. Backend: LLM con instrucciones de "Tutor Socrático" y capacidad de visión (OCR matemático). Objetivo: Apoyo al estudio fuera de hora.',
         interface: 'AIChat'
       },
       {
         id: 'study-plans',
         name: 'Personalized Study Plans',
         description: 'Generador de planes de estudio personalizados que organiza sesiones de repaso según el tiempo disponible, temas pendientes y fecha de examen. Crea un calendario detallado optimizando la distribución del estudio para máximo aprovechamiento.',
         prompt: 'Crea una POC de "Study Planner". Frontend: Input: "Tengo examen de Historia en 5 días. Temas: Revolución Francesa y Napoleón. Tengo 2 horas libres por día". Output: Calendario detallado de sesiones de estudio. Backend: Planning algorithm generado por LLM. Objetivo: Organización del tiempo del estudiante.',
         interface: 'AIChat'
       },
       {
         id: 'lecture-summarization',
         name: 'Lecture Summarization',
         description: 'Resumen automático de clases grabadas que transcribe el audio, extrae los conceptos clave y genera un glosario y resumen ejecutivo. Produce material de repaso instantáneo a partir de grabaciones de clase sin esfuerzo adicional del docente.',
         prompt: 'Desarrolla una POC de "Class Recap". Frontend: Sube grabación de audio de la clase (1 hora). Output: "Resumen Ejecutivo", "Conceptos Clave" y "Glosario". Backend: Whisper (STT) + Summarization LLM. Objetivo: Material de repaso instantáneo.',
         interface: 'AudioUpload'
       },
       {
         id: 'learning-disability',
         name: 'Learning Disability Detection',
         description: 'Screening de dislexia y dificultades de aprendizaje que analiza la lectura en voz alta del niño detectando patrones de error fonético y falta de fluidez. Genera un reporte preliminar sugiriendo evaluación profesional para inclusión educativa temprana.',
         prompt: 'Genera una POC de "Dyslexia Screening". Frontend: Niño lee un texto en voz alta frente a la app. Sistema analiza fluidez y errores fonéticos. Reporte: "Posible riesgo de dislexia - Sugiere evaluación profesional". Backend: Reconocimiento de voz alineado a texto esperado para detectar patrones de error específicos. Objetivo: Inclusión educativa.',
         interface: 'AudioUpload'
       },
       {
         id: 'skill-gap',
         name: 'Skill Gap Analysis',
         description: 'Análisis de brechas de habilidades que compara CVs de empleados contra descripciones de puestos objetivo para generar una matriz de skills faltantes. Sugiere cursos específicos por equipo para planes de upskilling corporativo dirigidos.',
         prompt: 'Crea una POC de "Corporate Skill Gap". Frontend: Sube CVs de empleados y Job Descriptions objetivo. Output: Matriz de calor "Skills Faltantes". Sugerencia: "Curso de Python Intermedio para el equipo de Finanzas". Backend: Matching semántico de habilidades (Skills Graph). Objetivo: Upskilling corporativo dirigido.',
         interface: 'DocumentUpload'
       },
       {
         id: 'career-path',
         name: 'Career Path Recommendation',
         description: 'Coach de carrera virtual que recomienda trayectorias profesionales basadas en intereses, habilidades y demanda del mercado laboral actual. Genera roadmaps de aprendizaje personalizados con cursos y certificaciones para alcanzar el objetivo profesional.',
         prompt: 'Desarrolla una POC de "Career Coach". Frontend: Chat. "¿Qué te gusta hacer?". Usuario: "Resolver problemas y diseñar interfaces". Bot: "Podrías ser Product Designer o UX Engineer. Aquí hay un roadmap de aprendizaje". Backend: Agente de orientación vocacional basado en perfiles de mercado laboral. Objetivo: Orientación de carrera.',
         interface: 'AIChat'
       }
      ]
  },
  // 11. Legal Tech
  {
      id: 'legal',
      name: 'Legal Tech',
      icon: 'Scale',
      description: 'Estudios jurídicos, departamentos legales corporativos y administración de justicia. Revisión de contratos, búsqueda de jurisprudencia y predicción de litigios.',
      pocs: [
       {
         id: 'contract-analysis',
         name: 'Contract Analysis',
         description: 'Revisión automática de contratos que detecta cláusulas riesgosas, omisiones y términos desfavorables con referencias a la página exacta. Sugiere redacciones alternativas y acelera el due diligence legal de semanas a horas.',
         prompt: 'Genera una POC de "Contract Reviewer". Frontend: Abogado sube PDF "Contrato de Servicios". Panel lateral muestra "Riesgos Detectados": Cláusula de indemnización abusiva (Pág 3). Sugerencia de redacción alternativa. Backend: NLP Legal para extracción de cláusulas y clasificación de riesgo. Objetivo: Acelerar due diligence legal.',
         interface: 'DocumentUpload'
       },
       {
         id: 'legal-research',
         name: 'Legal Research',
         description: 'Buscador semántico de jurisprudencia que encuentra fallos relevantes usando lenguaje natural en lugar de búsquedas por keywords. Resume el holding de cada sentencia y cita los precedentes más relevantes para el caso en investigación.',
         prompt: 'Crea una POC de "Case Law Search". Frontend: Buscador: "Fallos sobre despido por uso de redes sociales en horario laboral". Resultados: Lista de sentencias relevantes con resumen del "Holding" (decisión clave). Backend: RAG sobre base de datos de jurisprudencia. Objetivo: Investigación legal eficiente.',
         interface: 'AIChat'
       },
       {
         id: 'doc-classification-legal',
         name: 'Legal Document Classification',
         description: 'Clasificación automática de documentos legales entrantes (demandas, cédulas, escritos de trámite) que etiqueta tipo y urgencia al instante. Organiza el expediente digital eliminando la clasificación manual de la mesa de entradas.',
         prompt: 'Desarrolla una POC de "Legal Inbox Sorter". Frontend: Bandeja de entrada de documentos. Sistema etiqueta automáticamente: "Demanda", "Cédula de Notificación", "Escrito de Mero Trámite". Backend: Clasificación de texto supervisada sobre tipos documentales legales. Objetivo: Organización del expediente digital.',
         interface: 'DocumentUpload'
       },
       {
         id: 'due-diligence',
         name: 'Due Diligence Automation',
         description: 'Automatización de due diligence para fusiones y adquisiciones que procesa miles de contratos extrayendo cláusulas clave como cambio de control, vencimientos y obligaciones pendientes. Genera un dashboard resumen para toma de decisiones M&A informadas.',
         prompt: 'Genera una POC de "M&A Due Diligence". Frontend: Data Room virtual. Sube 1000 contratos. Dashboard: "15 contratos tienen cláusula de Cambio de Control". "5 contratos vencen el próximo mes". Backend: Extracción de entidades masiva (Bulk Extraction) sobre corpus contractual. Objetivo: Fusiones y adquisiciones seguras.',
         interface: 'DocumentUpload'
       },
       {
         id: 'litigation-risk',
         name: 'Litigation Risk Prediction',
         description: 'Predicción de resultado de litigios basada en datos históricos del fuero judicial asignado, incluyendo probabilidad de sentencia favorable y duración estimada. Permite diseñar estrategia procesal con datos reales en lugar de intuición.',
         prompt: 'Crea una POC de "Judgement Predictor". Frontend: Input: Hechos del caso y Juzgado asignado. Output: "Probabilidad de Sentencia Favorable: 65%. Duración estimada: 18 meses". Backend: Modelo predictivo entrenado con históricos del fuero judicial específico. Objetivo: Estrategia procesal basada en datos.',
         interface: 'DataUpload'
       },
       {
         id: 'legal-chatbot',
         name: 'Legal Chatbot',
         description: 'Asistente legal virtual para consultas corporativas internas que responde preguntas frecuentes sobre NDAs, políticas de firma y procesos legales estándar. Descongestiona al equipo legal de consultas rutinarias con respuestas inmediatas basadas en políticas vigentes.',
         prompt: 'Desarrolla una POC de "In-House Legal Bot". Frontend: Chat para empleados de la empresa. "¿Puedo firmar este NDA?". Bot: "Si es el estándar de la empresa, sí. Si es del proveedor, envíalo a revisión". Backend: Árbol de decisión de políticas legales corporativas. Objetivo: Descongestionar al equipo legal de consultas rutinarias.',
         interface: 'AIChat'
       }
      ]
  },
  // 12. Real Estate
  {
      id: 'real-estate',
      name: 'Real Estate',
      icon: 'Building',
      description: 'Inmobiliarias, proptech, administración de propiedades e inversión inmobiliaria. Tasación automática, tours virtuales y procesamiento de contratos.',
      pocs: [
       {
         id: 'virtual-tours',
         name: 'Virtual Property Tours',
         description: 'Generación de tours virtuales 360° a partir de fotos panorámicas de cada habitación con navegación tipo Street View entre ambientes. Permite venta de propiedades remota con visitas virtuales inmersivas sin desplazamiento físico.',
         prompt: 'Genera una POC de "360 Tour Stitcher". Frontend: Sube fotos panorámicas de habitaciones. Viewer web recorrible tipo Street View. Hotspots para pasar de una sala a otra. Backend: Stitching de imágenes y construcción de grafo de navegación. Objetivo: Venta de propiedades remota.',
         interface: 'ImageUpload'
       },
       {
         id: 'property-valuation',
         name: 'Property Valuation',
         description: 'Tasación automática de propiedades (AVM) que estima el valor de mercado basándose en ubicación, superficie, amenities y ventas recientes comparables en la zona. Genera valuaciones instantáneas con desglose de factores para inversores e inmobiliarias.',
         prompt: 'Crea una POC de "AI Appraiser". Frontend: Mapa. Click en una parcela. Pop-up: "Valor Estimado: $250.000 USD". Comparables: "Ventas recientes en 500m a la redonda". Backend: Modelo de regresión espacial (Hedonic Pricing) basado en m2, ubicación y amenities. Objetivo: Tasaciones instantáneas.',
         interface: 'DataUpload'
       },
       {
         id: 'tenant-screening',
         name: 'Tenant Screening',
         description: 'Evaluación de riesgo de inquilinos con score de buen pagador (0-100) que combina historial crediticio, datos alternativos y antecedentes de desalojo. Permite alquiler seguro con decisiones informadas más allá del recibo de sueldo.',
         prompt: 'Desarrolla una POC de "Tenant Score". Frontend: Ficha del postulante. Score de "Buen Pagador" (0-100). Alerta: "Historial de desalojo detectado". Backend: Scoring crediticio enriquecido con datos alternativos. Objetivo: Alquiler seguro.',
         interface: 'DataUpload'
       },
       {
         id: 'maintenance-pred-realestate',
         name: 'Maintenance Prediction',
         description: 'Mantenimiento predictivo de edificios inteligentes que alerta cuando ascensores, HVAC o instalaciones requieren servicio basándose en datos IoT de uso y ciclos. Reduce expensas y paradas de servicio anticipándose a fallas antes de que ocurran.',
         prompt: 'Genera una POC de "Building Health Monitor". Frontend: Dashboard de Facilty Manager. Alerta: "Ascensor 2 requiere service (Ciclos excedidos)". "Filtros de HVAC saturados". Backend: Mantenimiento predictivo basado en IoT de edificios inteligentes. Objetivo: Reducir expensas y paradas.',
         interface: 'DataUpload'
       },
       {
         id: 'pricing-opt-realestate',
         name: 'Pricing Optimization',
         description: 'Optimizador de precio de alquiler que analiza oferta y demanda en portales inmobiliarios para sugerir la tarifa que maximice rentabilidad con ocupación óptima. Calcula el retorno de inversión proyectado para decisiones de inversión inmobiliaria.',
         prompt: 'Crea una POC de "Rental Yield Optimizer". Frontend: Calculadora para inversores. "¿Cuánto cobrar por este depto?". Sugerencia: "$800 USD/mes para ocupación del 95%". Backend: Análisis de oferta/demanda en portales inmobiliarios. Objetivo: Maximizar retorno de inversión.',
         interface: 'DataUpload'
       },
       {
         id: 'real-estate-contract',
         name: 'Real Estate Contract Processing',
         description: 'Extracción automática de datos clave de contratos de alquiler escaneados (inquilino, vencimiento, monto, cláusulas de ajuste) para gestión de cartera de propiedades. Digitaliza contratos en papel en registros estructurados y buscables.',
         prompt: 'Desarrolla una POC de "Lease Extractor". Frontend: Sube contrato de alquiler escaneado. Tabla resumen: "Inquilino: Juan Perez", "Vencimiento: 30/12/2026", "Ajuste: Semestral IPC". Backend: Extracción de entidades legal específica para Real Estate. Objetivo: Gestión de cartera de propiedades.',
         interface: 'DocumentUpload'
       }
      ]
  },
  // 13. Security & Cyber
  {
      id: 'security-cyber',
      name: 'Security & Cyber',
      icon: 'Shield',
      description: 'Ciberseguridad, vigilancia física, prevención de fraude y protección de infraestructura. Detección de deepfakes, monitoreo de intrusiones y correlación de eventos.',
      pocs: [
       {
         id: 'deepfake-detection',
         name: 'Deepfake Detection',
         description: 'Detección de deepfakes en video y audio que analiza frame por frame buscando artefactos de generación sintética como inconsistencias de parpadeo o iluminación. Verifica autenticidad de material digital con porcentaje de confianza para pruebas legales.',
         prompt: 'Genera una POC de "Deepfake Shield". Frontend: Uploader de video sospechoso. Análisis frame por frame. Resultado: "Probabilidad de Deepfake: 98% (Inconsistencia de parpadeo detectada)". Backend: Redes neuronales convolucionales especializadas en detectar artefactos de generación sintética. Objetivo: Verificar autenticidad de pruebas digitales.',
         interface: 'ImageUpload'
       },
       {
         id: 'physical-security',
         name: 'Physical Security Monitoring',
         description: 'Monitoreo perimetral inteligente que detecta personas realizando actividades sospechosas (saltar cercas, correr, merodear) en cámaras de seguridad. Genera alertas sonoras y visuales inmediatas al personal de guardia con evidencia fotográfica.',
         prompt: 'Crea una POC de "Intruder Alert". Frontend: Panel de guardia. Feed de cámara perimetral. Bounding box roja sobre persona saltando la cerca. Alerta sonora inmediata. Backend: Detección de personas y clasificación de actividad (Saltar, Correr, Merodear). Objetivo: Seguridad perimetral automatizada.',
         interface: 'ImageUpload'
       },
       {
         id: 'zero-day',
         name: 'Zero-Day Threat Detection',
         description: 'Detección de amenazas zero-day y ransomware mediante análisis comportamental de endpoints que identifica actividad anómala de procesos. Detecta ataques que los antivirus basados en firmas no pueden ver, complementando la defensa tradicional.',
         prompt: 'Desarrolla una POC de "Zero-Day Hunter". Frontend: Dashboard de SOC. Alerta crítica: "Comportamiento de proceso anómalo detectado en Server-X - Posible Ransomware". Backend: Análisis comportamental de endpoints (EDR) usando ML no supervisado. Objetivo: Detectar ataques que los antivirus no ven.',
         interface: 'DataUpload'
       },
       {
         id: 'phishing-detection',
         name: 'Phishing Detection',
         description: 'Detección de emails de phishing que analiza URLs sospechosas, reputación de dominio y contenido del mensaje para alertar al usuario antes de hacer clic. Protege empleados de ingeniería social con banners de advertencia contextuales.',
         prompt: 'Genera una POC de "Anti-Phishing Gateway". Frontend: Plugin de correo. Banner rojo en email entrante: "PELIGRO: Este link simula ser del Banco X pero la URL es sospechosa". Backend: Análisis de URLs, reputación de dominio y NLP del cuerpo del correo. Objetivo: Proteger a empleados de ingeniería social.',
         interface: 'DocumentUpload'
       },
       {
         id: 'insider-threat',
         name: 'Insider Threat Detection',
         description: 'Detección de amenazas internas (insider threat) que monitorea comportamiento de usuarios y entidades para identificar actividad anómala como descargas masivas fuera de horario. Previene fuga de información sensible con análisis de patrones UEBA.',
         prompt: 'Crea una POC de "Insider Risk". Frontend: Reporte confidencial de RRHH/Seguridad. "Usuario X descargó 50GB de datos sensibles fuera de horario laboral -> Riesgo Alto". Backend: User and Entity Behavior Analytics (UEBA). Objetivo: Prevenir fuga de información.',
         interface: 'DataUpload'
       },
       {
         id: 'malware-class',
         name: 'Malware Classification',
         description: 'Laboratorio virtual de análisis de malware que clasifica binarios sospechosos por familia (Emotet, Ransomware, Trojan) y detalla sus capacidades (keylogging, propagación). Genera inteligencia de amenazas procesable para equipos de ciberseguridad.',
         prompt: 'Desarrolla una POC de "Malware Lab". Frontend: Sube binario sospechoso. Output: "Familia: Emotet. Tipo: Trojan Banking. Capacidades: Keylogging, Network Spreading". Backend: Análisis estático y dinámico (Sandbox) clasificando comportamiento con ML. Objetivo: Inteligencia de amenazas.',
         interface: 'DataUpload'
       },
       {
         id: 'nids',
         name: 'Network Intrusion Detection (NIDS)',
         description: 'Sistema de detección de intrusiones en red (NIDS) que clasifica tráfico en tiempo real identificando escaneos de puertos, ataques conocidos y anomalías comportamentales. Proporciona defensa activa complementaria a firewalls tradicionales.',
         prompt: 'Genera una POC de "AI NIDS". Frontend: Monitor de red en tiempo real. Visualización de flujos. Alerta: "Escaneo de puertos detectado desde IP externa". Backend: Clasificación de tráfico de red para firmas de ataques conocidos y anomalías. Objetivo: Defensa de red activa.',
         interface: 'DataUpload'
       },
       {
         id: 'api-security-cyber',
         name: 'API Security Monitoring',
         description: 'Monitoreo de seguridad de APIs que detecta y bloquea ataques como SQL Injection, BOLA y credential stuffing analizando patrones de tráfico HTTP/JSON. Protege el backend expuesto con análisis profundo de payloads en tiempo real.',
         prompt: 'Crea una POC de "API Security Guard". Frontend: Dashboard de WAF (Web App Firewall). Bloqueos de "SQL Injection" y "BOLA (Broken Object Level Authorization)". Backend: Análisis profundo de payloads HTTP/JSON. Objetivo: Proteger el backend expuesto.',
         interface: 'DataUpload'
       },
       {
         id: 'siem-ml',
         name: 'SIEM with ML',
         description: 'SIEM de nueva generación que correlaciona eventos de seguridad dispersos para reconstruir la cadena de ataque completa (login fallido + creación admin + descarga masiva). Reduce falsos positivos con correlación inteligente para visibilidad unificada.',
         prompt: 'Desarrolla una POC de "Next-Gen SIEM". Frontend: Lista de incidentes correlacionados. "Incidente #123: Login fallido múltiple + Creación de usuario admin + Descarga masiva = Ataque completado". Backend: Reglas de correlación difusa y ML para reducir falsos positivos. Objetivo: Visibilidad unificada.',
         interface: 'DataUpload'
       },
       {
         id: 'vuln-dashboard',
         name: 'Vulnerability Assessment Dashboard',
         description: 'Dashboard de gestión de vulnerabilidades que prioriza CVEs por riesgo real de explotación (no solo severidad teórica) y estima tiempo de parcheo. Visualiza la postura de seguridad de la infraestructura en una matriz de riesgo accionable.',
         prompt: 'Genera una POC de "Vuln Manager". Frontend: Matriz de riesgo. "Server web desactualizado (CVE-2023-XXXX) - Criticidad Alta". Tiempo estimado de parcheo. Backend: Escaneo de infraestructura y priorización basada en riesgo de explotación real. Objetivo: Hardening de infraestructura.',
         interface: 'Dashboard'
       },
       {
         id: 'surveillance-threat',
         name: 'AI Surveillance for Threat Detection',
         description: 'Detección de armas de fuego y blancas en feeds de cámaras de seguridad de centros comerciales, escuelas o espacios públicos. Envía alertas inmediatas con foto al equipo de seguridad para prevención de incidentes violentos.',
         prompt: 'Crea una POC de "Weapon Detector". Frontend: Feed de cámara en centro comercial. Alerta: "Arma detectada (Pistola) en entrada Norte". Envío de foto a seguridad. Backend: Detección de objetos entrenada específicamente en armas de fuego y blancas. Objetivo: Prevención de tiroteos y crímenes.',
         interface: 'ImageUpload'
       },
       {
         id: 'perimeter-security',
         name: 'Perimeter Security Monitoring',
         description: 'Cerca virtual inteligente que detecta cruce no autorizado de vehículos o personas en perímetros de infraestructura crítica. Utiliza video analytics con reglas de cruce de línea y clasificación de objetos sobre mapa satelital del predio.',
         prompt: 'Desarrolla una POC de "Virtual Fence". Frontend: Mapa satelital del predio. Línea roja virtual. Alerta si un vehículo cruza la línea en zona no autorizada. Backend: Video Analytics con reglas de cruce de línea y clasificación de vehículos. Objetivo: Proteger infraestructura crítica.',
         interface: 'ImageUpload'
       },
       {
         id: 'crowd-analysis',
         name: 'Crowd Behavior Analysis',
         description: 'Análisis de densidad y comportamiento de multitudes en estadios y eventos masivos que alerta ante riesgo de estampida cuando la densidad supera umbrales de seguridad. Monitorea flujo de personas por sector para gestión de eventos seguros.',
         prompt: 'Genera una POC de "Crowd Safety". Frontend: Mapa de calor de densidad en estadio. Alerta: "Posible estampida en Sector 4 - Densidad > 6 personas/m2". Backend: Estimación de densidad de multitudes y flujo óptico. Objetivo: Gestión de eventos masivos seguros.',
         interface: 'ImageUpload'
       }
     ]
  },
  // 14. Logistics
  {
      id: 'logistics',
      name: 'Logistics',
      icon: 'Truck',
      description: 'Logística, transporte, almacenes y cadena de suministro. Optimización de rutas, control de daños en paquetes y predicción de tiempos de entrega.',
      pocs: [
       {
         id: 'package-condition',
         name: 'Package Condition Inspection',
         description: 'Inspección automática de estado de paquetes en cinta transportadora que detecta aplastamientos, roturas y deformaciones. Documenta el daño con foto y clasificación para gestión de reclamos logísticos con evidencia objetiva.',
         prompt: 'Genera una POC de "Package Inspector". Frontend: Cinta transportadora virtual. Escaneo automático de caja. "Estado: Ok / Dañado (Aplastamiento cara sup)". Backend: Detección de daños en packaging con visión artificial. Objetivo: Reclamos logísticos.',
         interface: 'ImageUpload'
       },
       {
         id: 'loading-optimization',
         name: 'Loading Optimization Visual',
         description: 'Optimización 3D de carga de camiones tipo "Tetris" que calcula la disposición óptima de pallets para maximizar el factor de carga. Visualiza el plan de estiba paso a paso con estimación de espacio disponible final.',
         prompt: 'Crea una POC de "Load Master 3D". Frontend: Modelo 3D de camión semivacío. Sistema proyecta "Tetris" óptimo para acomodar los próximos 20 pallets. "Espacio disponible final: 15%". Backend: Algoritmo de Bin Packing 3D. Objetivo: Maximizar factor de carga.',
         interface: 'ImageUpload'
       },
       {
         id: 'warehouse-safety',
         name: 'Warehouse Safety Monitoring',
         description: 'Monitoreo de seguridad en almacén que detecta peatones en zonas de circulación de montacargas y alerta ante proximidad peligrosa. Previene accidentes en depósito con predicción de trayectorias y alertas vibratorias en tablets de operadores.',
         prompt: 'Desarrolla una POC de "Forklift Safety". Frontend: Mapa de almacén en tiempo real. Alerta vibratoria en tablet de montacargas si detecta peatón en punto ciego. Backend: Detección de personas/vehículos y predicción de trayectoria. Objetivo: Cero accidentes en depósito.',
         interface: 'ImageUpload'
       },
       {
         id: 'delivery-time',
         name: 'Delivery Time Prediction',
         description: 'Predicción de tiempo de entrega con ventana de 15 minutos que considera tráfico histórico, clima actual y desempeño del chofer específico. Mejora la experiencia de última milla con ETAs precisos mostrados en tracking del cliente.',
         prompt: 'Genera una POC de "Precise ETA". Frontend: Tracking de envío. "Tu paquete llega entre las 14:15 y 14:30". Mapa con ubicación del chofer. Backend: ML considerando tráfico histórico, clima actual y desempeño del chofer específico. Objetivo: Mejorar experiencia de última milla.',
         interface: 'DataUpload'
       },
       {
         id: 'route-optimization',
         name: 'Route Optimization',
         description: 'Optimización de rutas de distribución para múltiples puntos de entrega que calcula el recorrido óptimo minimizando tiempo y combustible. Visualiza la ruta en mapa con ahorro estimado vs ruta original para decisiones de despacho.',
         prompt: 'Crea una POC de "Route Planner". Frontend: Mapa con 50 puntos de entrega desordenados. Click "Optimizar". Resultado: Ruta óptima dibujada. Ahorro: "2h 15m y 12L de combustible". Backend: VRP (Vehicle Routing Problem) Solver. Objetivo: Eficiencia logística.',
         interface: 'DataUpload'
       },
       {
         id: 'demand-forecasting-logistics',
         name: 'Demand Forecasting',
         description: 'Previsión de volumen de envíos con estacionalidad que anticipa picos de demanda (ej. Navidad) y alerta cuando la capacidad de flota será superada. Permite planificar contratación temporal de choferes y vehículos con semanas de anticipación.',
         prompt: 'Desarrolla una POC de "Logistics Capacity Plan". Frontend: Gráfico de barras "Envíos esperados por día" para Navidad. Alerta: "Capacidad de flota superada el 23/12". Backend: Serie temporal de volumen de envíos con estacionalidad fuerte. Objetivo: Hiring temporal de choferes.',
         interface: 'DataUpload'
       },
       {
         id: 'vehicle-maintenance',
         name: 'Vehicle Maintenance Prediction',
         description: 'Mantenimiento predictivo de flota vehicular que analiza telemetría CAN bus para predecir fallas de frenos, motor o transmisión con probabilidad y urgencia. Maximiza disponibilidad de unidades ordenando detener vehículos de alto riesgo inmediatamente.',
         prompt: 'Genera una POC de "Fleet Health". Frontend: Lista de camiones. "Unidad 405: Riesgo de falla de Frenos (90%) - Detener inmediato". Backend: Análisis de telemetría vehicular (CAN bus). Objetivo: Disponibilidad de flota.',
         interface: 'DataUpload'
       },
       {
         id: 'shipping-doc-processing',
         name: 'Shipping Document Processing',
         description: 'OCR inteligente para documentos de comercio exterior (Bill of Lading, packing lists) que extrae consignatario, peso y puertos de origen/destino desde fotos de documentos arrugados. Digitaliza el despacho aduanero eliminando carga de datos manual.',
         prompt: 'Crea una POC de "Bill of Lading OCR". Frontend: Sube foto de Bill of Lading arrugado. Sistema extrae: "Consignatario, Peso, Puerto Origen/Destino". Backend: OCR inteligente especializado en formularios logísticos. Objetivo: Aduana sin papeles.',
         interface: 'DocumentUpload'
       },
       {
         id: 'invoice-extraction',
         name: 'Invoice Extraction',
         description: 'Automatización de cuentas por pagar que extrae datos de facturas multi-formato y los valida automáticamente contra órdenes de compra (3-way match). Procesa facturas touchless reduciendo el ciclo de pago y errores de carga manual.',
         prompt: 'Desarrolla una POC de "Invoice AP Automation". Frontend: Sube factura PDF. Sistema valida contra Orden de Compra automáticamente (3-way match). Backend: Extracción de pares clave-valor (KIE) en facturas multi-formato. Objetivo: Cuentas a pagar touchless.',
         interface: 'DocumentUpload'
       },
       {
         id: 'fleet-tracking',
         name: 'Fleet Tracking Dashboard',
         description: 'Centro de comando de flota con mapa global mostrando ubicación de todos los vehículos en tiempo real con filtros por estado. Alerta de geofence cuando una unidad sale de ruta autorizada para control operativo centralizado.',
         prompt: 'Genera una POC de "Fleet Command Center". Frontend: Mapa global. Iconos de barcos/camiones. Filtro "En tránsito". Alerta geofence "Unidad salió de ruta autorizada". Backend: Ingestión masiva de streams GPS. Objetivo: Control operativo.',
         interface: 'Dashboard'
       },
       {
         id: 'carbon-footprint',
         name: 'Carbon Footprint Optimization',
         description: 'Dashboard de emisiones CO2e por ruta logística con sugerencias de optimización multimodal (ej. cambiar a tren en tramos largos). Calcula la reducción de huella de carbono certificable para cumplimiento de metas de sostenibilidad.',
         prompt: 'Crea una POC de "Green Logistics". Frontend: Dashboard de emisiones CO2e por ruta. Sugerencia "Cambiar a transporte férreo en tramos > 500km reduce huella 40%". Backend: Calculadora de carbono certificada + Algoritmo de optimización multimodal. Objetivo: Sustentabilidad.',
         interface: 'Dashboard'
       },
       {
         id: 'container-packing',
         name: 'Container Packing Optimization',
         description: 'Optimización 3D de llenado de contenedores marítimos con restricciones de peso, fragilidad y apilabilidad. Genera un plan de estiba paso a paso visualizado en 3D para reducir envío de espacio vacío y maximizar cada contenedor.',
         prompt: 'Desarrolla una POC de "Smart Container". Frontend: Visualización 3D de contenedor. Lista de cajas a cargar. Sistema genera plano de estiba paso a paso para no dejar huecos. Backend: Algoritmo de empaquetado 3D con restricciones de peso/fragilidad. Objetivo: Reducir envío de "aire".',
         interface: 'Dashboard'
       },
       {
         id: 'robot-coordination',
         name: 'Warehouse Robot Coordination',
         description: 'Orquestación de flota de robots AGV en almacén con prevención de colisiones y gestión de tráfico intralogístico. Visualiza el movimiento de robots en mapa 2D del piso para automatización eficiente de picking y traslado de mercadería.',
         prompt: 'Genera una POC de "Swarm Control". Frontend: Mapa 2D de piso de almacén. Puntos moviéndose (robots AGV). Prevención de colisiones visualizada. Backend: Orquestación de flota de robots y traffic management. Objetivo: Automatización intralogística.',
         interface: 'Dashboard'
       }
      ]
  },
  // 15. Emerging Tech & GenAI
  {
      id: 'emerging-tech-genai',
      name: 'Emerging Tech & GenAI',
      icon: 'Sparkles',
      description: 'IA Generativa, visión avanzada, aprendizaje por refuerzo y tecnologías emergentes. Generación de imágenes, video y música, explicabilidad de modelos y datos sintéticos.',
      pocs: [
       {
         id: 'video-analysis',
         name: 'Video Analysis',
         description: 'Análisis inteligente de contenido de video que genera marcadores automáticos en la timeline (aparición de marcas, acciones específicas, texto en pantalla). Permite moderación de contenido y extracción de insights de video a escala.',
         prompt: 'Crea una POC de "Video Insights". Frontend: Uploader de video MP4. Timeline interactiva con marcadores automáticos: "Aparece marca (0:15)", "Acción violenta (1:20)". Backend: Reconocimiento de acciones y objetos en video. Objetivo: Moderación de contenido.',
         interface: 'ImageUpload'
       },
       {
         id: 'vision-nlp',
         name: 'Vision + NLP Multimodal',
         description: 'Análisis multimodal que combina comprensión visual y textual para interpretar contenido complejo como memes, infografías o publicaciones de redes sociales. Extrae significado cruzando el texto con el contexto visual de la imagen.',
         prompt: 'Desarrolla una POC de "Meme Analyzer". Frontend: Sube imagen (meme). Sistema explica el chiste cruzando el texto OCR con el contexto visual. Backend: VLM (Vision-Language Model). Objetivo: Entendimiento de redes sociales.',
         interface: 'ImageUpload'
       },
       {
         id: 'audio-vision',
         name: 'Audio + Vision Multimodal',
         description: 'Análisis multimodal de reuniones que combina transcripción de audio con identificación visual de hablantes para generar minutas con action items. Resuelve quién dijo qué y extrae compromisos clave de videoconferencias automáticamente.',
         prompt: 'Genera una POC de "Meeting Highlights". Frontend: Video de reunión de Zoom. Transcripción automática + Detección de quién habla por video. Resumen de "Action Items". Backend: Diarización de speaker multimodal. Objetivo: Productividad.',
         interface: 'ImageUpload'
       },
       {
         id: '3d-reconstruction',
         name: '3D Reconstruction',
         description: 'Reconstrucción de modelos 3D a partir de video del objeto desde múltiples ángulos, generando un asset rotable e inspeccionable. Ideal para catálogos de e-commerce 3D donde el cliente puede explorar el producto desde cualquier perspectiva.',
         prompt: 'Crea una POC de "Photogrammetry App". Frontend: Sube video girando alrededor de un zapato. Output: Modelo 3D (GLB) rotable e inspeccionable. Backend: NeRF (Neural Radiance Fields) o Fotogrametría clásica. Objetivo: E-commerce 3D.',
         interface: 'ImageUpload'
       },
       {
         id: 'edge-cv',
         name: 'Edge Computer Vision',
         description: 'Visión computacional optimizada para dispositivos edge de bajo costo ($50 USD) que ejecuta detección de personas a 30 FPS sin conexión a la nube. Dashboard de rendimiento mostrando FPS y consumo de CPU para IoT Vision accesible.',
         prompt: 'Desarrolla una POC de "Raspberry Pi Cam". Frontend: Dashboard mostrando FPS y consumo de CPU de un dispositivo remoto. Detección de personas corriendo a 30FPS en hardware de $50 USD. Backend: Modelos cuantizados (TinyML) optimizados para ARM. Objetivo: IoT Vision.',
         interface: 'ImageUpload'
       },
       {
         id: 'edge-ml',
         name: 'Edge ML Inference',
         description: 'Inferencia de modelos de anomalía directamente en el dispositivo edge sin enviar datos a la nube, preservando privacidad y ancho de banda. Detecta patrones anómalos en sensores industriales localmente para respuesta inmediata sin latencia de red.',
         prompt: 'Genera una POC de "Edge Sensor AI". Frontend: Gráfico de acelerómetro de un motor. Detección de anomalía local sin enviar datos a la nube. Backend: Anomaly detection on-device. Objetivo: Privacidad y ancho de banda.',
         interface: 'DataUpload'
       },
       {
         id: 'federated-learning',
         name: 'Federated Learning',
         description: 'Entrenamiento colaborativo de modelos entre múltiples organizaciones (hospitales, bancos) sin compartir datos sensibles entre ellas. Cada nodo entrena localmente y solo comparte mejoras al modelo, preservando privacidad y cumplimiento regulatorio.',
         prompt: 'Crea una POC de "Privacy-First AI". Frontend: Mapa de nodos (Hospital A, Hospital B). "Entrenamiento colaborativo: Modelo global actualizado sin compartir datos de pacientes". Backend: Federated Averaging protocol. Objetivo: Colaboración en datos sensibles.',
         interface: 'DataUpload'
       },
       {
         id: 'reinforcement-learning',
         name: 'Reinforcement Learning',
         description: 'Demostración de aprendizaje por refuerzo donde un agente aprende a optimizar tareas complejas mediante prueba y error con recompensas. Visualiza el progreso del agente aprendiendo en tiempo real, aplicable a control de procesos y robótica.',
         prompt: 'Desarrolla una POC de "AI Game Player". Frontend: Visualización de un agente aprendiendo a jugar (ej. Snake o navegar laberinto). Gráfico de "Recompensa acumulada" subiendo. Backend: RL (Q-Learning / PPO). Objetivo: Control de procesos complejos.',
         interface: 'DataUpload'
       },
       {
         id: 'graph-neural-networks',
         name: 'Graph Neural Networks',
         description: 'Detección de fraude organizado mediante redes neuronales en grafos que analizan la topología de transacciones para identificar comunidades sospechosas. Detecta redes de fraude que el análisis de transacciones individuales no puede ver.',
         prompt: 'Genera una POC de "Fraud Ring Detector". Frontend: Grafo de transacciones interactivo. Nodos rojos indican "Comunidad de Fraude" detectada por su topología. Backend: GNN (Graph Neural Network) para clasificación de nodos. Objetivo: Crimen financiero organizado.',
         interface: 'DataUpload'
       },
       {
         id: 'automl',
         name: 'AutoML & Hyperparameter Tuning',
         description: 'Plataforma AutoML que permite subir un CSV y con un clic obtener el mejor modelo entrenado con leaderboard comparativo de algoritmos. Democratiza Data Science permitiendo a analistas de negocio crear modelos predictivos sin código.',
         prompt: 'Crea una POC de "AutoML Studio". Frontend: Sube CSV. Click "Entrenar". Sistema prueba XGBoost, LightGBM, Random Forest. Muestra Leaderboard. "Mejor modelo: XGBoost (AUC 0.95)". Backend: Búsqueda de hiperparámetros automatizada (Optuna). Objetivo: Democratizar Data Science.',
         interface: 'DataUpload'
       },
       {
         id: 'text-to-image',
         name: 'Text-to-Image Generation',
         description: 'Estudio creativo de generación de imágenes a partir de descripciones de texto que produce 4 variaciones con opciones de mejora y variantes. Herramienta de diseño gráfico asistido para marketing, publicidad y creación de contenido visual.',
         prompt: 'Desarrolla una POC de "Creative Studio". Frontend: Prompt: "Gato cyberpunk neón". Galería de 4 imágenes generadas. Botones de "Upscale" y "Variations". Backend: Stable Diffusion piping. Objetivo: Diseño gráfico asistido.',
         interface: 'ImageUpload'
       },
       {
         id: 'text-to-video',
         name: 'Text-to-Video Generation',
         description: 'Generación de clips de video cortos a partir de descripciones textuales para creación de contenido, publicidad y storyboarding. Produce videos de 4 segundos en loop que pueden usarse como assets de redes sociales o presentaciones.',
         prompt: 'Genera una POC de "Video Gen". Prompt: "Drone flying over futuristic city". Output: Video corto de 4 segundos en loop. Backend: Modelos de difusión de video. Objetivo: Creación de contenido.',
         interface: 'ImageUpload'
       },
       {
         id: 'text-to-3d',
         name: 'Text-to-3D Generation',
         description: 'Generación de assets 3D descargables a partir de descripciones textuales para desarrollo de videojuegos, arquitectura y e-commerce. Crea modelos tridimensionales listos para usar sin necesidad de modelado manual.',
         prompt: 'Crea una POC de "3D Asset Gen". Prompt: "Una silla de madera medieval". Output: Modelo 3D descargable para videojuegos. Backend: Point-E / Shap-E. Objetivo: Desarrollo de juegos.',
         interface: 'ImageUpload'
       },
       {
         id: 'voice-cloning',
         name: 'Voice Cloning & Synthesis',
         description: 'Clonación de voz que genera una réplica sintética a partir de solo 1 minuto de grabación, permitiendo producir locuciones personalizadas a escala. Ideal para e-learning, audiolibros y contenido multilingüe con la voz del presentador original.',
         prompt: 'Desarrolla una POC de "Voice Alchemist". Frontend: Graba 1 minuto de tu voz. Luego escribe texto y escucha cómo lo dice "tu" voz sintética. Backend: Few-shot TTS (Text-to-Speech). Objetivo: Locución personalizada a escala.',
         interface: 'AudioUpload'
       },
       {
         id: 'music-generation',
         name: 'Music Generation',
         description: 'Compositor musical por IA que genera pistas de audio en el estilo y duración solicitados, libres de royalties. Produce música de fondo para videos, podcasts y contenido digital sin costos de licenciamiento ni necesidad de conocimientos musicales.',
         prompt: 'Genera una POC de "AI Composer". Frontend: Estilo: "Lo-Fi Hip Hop". Duración: 30s. Click "Generar". Reproductor de audio. Backend: Modelos generativos de audio simbólico o de forma de onda (MusicGen). Objetivo: Música libre de royalties.',
         interface: 'AudioUpload'
       },
       {
         id: 'synthetic-data',
         name: 'Synthetic Data Generation',
         description: 'Generación de datasets sintéticos estadísticamente equivalentes al original pero completamente anónimos, multiplicando el volumen de datos disponibles. Resuelve problemas de privacidad y desbalance de clases para entrenamiento de modelos sin datos reales.',
         prompt: 'Crea una POC de "Data Augmenter". Frontend: Sube dataset pequeño (100 filas) de fraude. Output: Dataset sintético de 10.000 filas estadísticamente idéntico pero anónimo. Backend: GANs (Generative Adversarial Networks) o VAEs tabulares. Objetivo: Privacidad y data augmentation.',
         interface: 'DataUpload'
       },
       {
         id: 'ai-design-assistant',
         name: 'AI-Powered Design Assistant',
         description: 'Asistente de diseño que genera logos y assets visuales vectoriales a partir del nombre de empresa, industria y estilo deseado. Produce múltiples propuestas de branding en minutos para iteración rápida sin diseñador gráfico.',
         prompt: 'Desarrolla una POC de "Logo Maker". Frontend: Nombre empresa: "SolarTech". Industria: "Energía". Estilo: "Minimalista". Output: 5 logos vectoriales generados. Backend: Generación condicional de vectores (SVG). Objetivo: Branding rápido.',
         interface: 'ImageUpload'
       },
       {
         id: 'model-interpretability',
         name: 'Model Interpretability',
         description: 'Explicabilidad de decisiones de modelos de IA que muestra gráficamente qué variables influyeron en cada predicción (ej. "ingresos bajos -20pts, deuda alta -15pts"). Genera confianza y transparencia en modelos de caja negra para cumplimiento regulatorio.',
         prompt: 'Genera una POC de "Black Box Opener". Frontend: Predicción: "Crédito Rechazado". Gráfico SHAP (Waterfall): "Ingresos bajos (-20pts), Deuda alta (-15pts) explicaron la decisión". Backend: Algoritmos SHAP/LIME sobre caja negra. Objetivo: Confianza y transparencia.',
         interface: 'DataUpload'
       },
       {
         id: 'bias-detection',
         name: 'Bias Detection',
         description: 'Auditoría de equidad (fairness) en modelos de IA que detecta sesgos contra grupos demográficos específicos comparando tasas de error por segmento. Genera reportes de cumplimiento de IA ética con métricas estándar de la industria.',
         prompt: 'Crea una POC de "Fairness Auditor". Frontend: Sube modelo y dataset de test. Reporte: "Sesgo detectado contra grupo demográfico Mujeres (Tasa de falsos positivos 2x mayor)". Backend: Métricas de equidad (Fairness Metrics). Objetivo: IA Ética.',
         interface: 'DataUpload'
       },
       {
         id: 'counterfactual',
         name: 'Counterfactual Explanations',
         description: 'Generador de explicaciones contrafactuales que le dice al usuario exactamente qué cambiar para obtener un resultado diferente (ej. "si aumenta su sueldo en $500, sería aprobado"). Convierte predicciones en recomendaciones accionables.',
         prompt: 'Desarrolla una POC de "What-If Analyzer". Frontend: "Cliente rechazado". Sugerencia: "Si aumentara su sueldo en $500 o redujera deuda en $1000, sería aprobado". Backend: Búsqueda del contrafáctico más cercano en el espacio de features. Objetivo: Accionabilidad.',
         interface: 'DataUpload'
       },
       {
         id: 'feature-attribution',
         name: 'Feature Attribution Analysis',
         description: 'Análisis de importancia de variables que revela qué factores impactan más en una predicción o resultado de negocio, ordenados por relevancia. Genera insights accionables respondiendo preguntas como "qué mueve más el precio de una casa".',
         prompt: 'Genera una POC de "Key Drivers". Frontend: Gráfico de barras horizontal. "¿Qué variables impactan más en el precio de una casa?". 1. Ubicación, 2. Metros cuadrados, 3. Antigüedad. Backend: Permutation Importance o Feature Importance de Random Forest. Objetivo: Insights de negocio.',
         interface: 'DataUpload'
       }
      ]
  }
]
