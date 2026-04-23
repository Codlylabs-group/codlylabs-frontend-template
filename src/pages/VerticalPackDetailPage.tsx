import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Clock,
  Zap,
  CheckCircle2,
  Star,
  AlertCircle,
  LogIn,
  TrendingUp,
  Plug,
  CheckCircle,
  BookOpen,
  Info,
} from 'lucide-react'
import { useI18n } from '../i18n'
import { getVerticalPackStaticData } from '../data/verticalPack'
import { ACCESS_TOKEN_KEY } from '../services/authStorage'
import {
  verticalPacksApi,
  VerticalPackDetail,
  CuratedBlueprintSummary,
} from '../services/verticalPacks'

// ── Fallback data (when API unavailable) — bilingual ─────────
const fallbackPacks: Record<string, Record<'en' | 'es', VerticalPackDetail>> = {
  fintech: {
    en: {
      id: 'fallback-fintech', name: 'Banking & Fintech', slug: 'fintech', vertical: 'fintech',
      description: 'Complete AI PoC pack for banking and fintech with design patterns inspired by SOX, Basel and AML regulatory frameworks. Includes pre-optimized blueprints for fraud, credit risk, KYC, and more.',
      short_description: 'AI for banking with compliance-aware patterns', badge: 'Mature', icon: null,
      status: 'active', total_blueprints: 17, total_pocs_generated: 0, sort_order: 1, created_at: null,
      price_yearly_usd: null, roi_metrics: {},
      compliance_modules: ['SOX', 'Basilea III', 'AML/KYC', 'PCI-DSS', 'FATF', 'MiFID II', 'Ley 25.246', 'UIF Res. 199-200/2024', 'BCRA Com. A Serie', 'Ley 26.831 (CNV)', 'Ley 25.326', 'Ley 21.526', 'DORA', 'EU AI Act', 'PSD2', 'EU AMLD6', 'EBA Guidelines', 'IFRS 9', 'AIFMD'],
      connectors: [
        { name: 'Core Banking API', system: 'Banking', status: 'ready' },
        { name: 'SWIFT/ISO 20022', system: 'Payments', status: 'ready' },
        { name: 'Bloomberg Terminal', system: 'Market Data', status: 'testing' },
      ],
      timeline: [
        { phase: 'Week 1-2', focus: 'Setup & Data Assessment', deliverables: ['Available data analysis', 'Secure environment setup', 'KPI definition'] },
        { phase: 'Week 3-6', focus: 'PoC Development', deliverables: ['Model development', 'Banking API integration', 'Testing with real data'] },
        { phase: 'Week 7-8', focus: 'Validation & Compliance', deliverables: ['Compliance audit', 'Regulatory documentation', 'Production plan'] },
      ],
      blueprints: [
        { id: 'fb-fraud', name: 'Fraud Detection System', slug: 'fraud-detection', short_description: 'Real-time ML fraud detection on transactions with explainability for auditors.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'AML'], tech_stack: [], kpis_expected: [{ name: 'Accuracy', value: '>95%' }, { name: 'Latency', value: '<200ms' }], estimated_build_time_minutes: 8, sort_order: 1 },
        { id: 'fb-rag-banking', name: 'Banking Regulations RAG', slug: 'banking-regulations-rag', short_description: 'RAG assistant that answers banking regulation questions using official documents.', poc_type: 'rag', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'Basilea'], tech_stack: [], kpis_expected: [{ name: 'Relevance', value: '>90%' }], estimated_build_time_minutes: 6, sort_order: 2 },
        { id: 'fb-credit', name: 'Credit Scoring with Explainability', slug: 'credit-scoring', short_description: 'Credit scoring model with SHAP values to explain decisions to regulators.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'Fair Lending'], tech_stack: [], kpis_expected: [{ name: 'AUC', value: '>0.85' }, { name: 'Explainability', value: '100%' }], estimated_build_time_minutes: 10, sort_order: 3 },
        { id: 'fb-kyc', name: 'KYC/AML Automated Screening', slug: 'kyc-aml-screening', short_description: 'Automated customer screening against sanctions and PEP lists using NLP.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['AML', 'KYC', 'FATF'], tech_stack: [], kpis_expected: [{ name: 'Recall', value: '>99%' }], estimated_build_time_minutes: 7, sort_order: 4 },
        { id: 'fb-robo', name: 'Robo-Advisor', slug: 'robo-advisor', short_description: 'Automated financial advisor with risk profiling and portfolio rebalancing.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'chat', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['MiFID', 'Suitability'], tech_stack: [], kpis_expected: [{ name: 'Sharpe Ratio', value: '>1.2' }], estimated_build_time_minutes: 10, sort_order: 5 },
        { id: 'fb-risk', name: 'Credit Risk Analysis', slug: 'credit-risk-analysis', short_description: 'Portfolio credit risk with PD/LGD/EAD models and stress testing scenarios.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'IFRS9'], tech_stack: [], kpis_expected: [{ name: 'PD Model AUC', value: '>0.82' }, { name: 'Stress Tests', value: '3 scenarios' }], estimated_build_time_minutes: 6, sort_order: 6 },
        { id: 'fb-compliance-chat', name: 'Regulatory Compliance Chatbot', slug: 'compliance-chatbot', short_description: 'RAG-powered chatbot for financial regulatory compliance queries with citations.', poc_type: 'rag', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'Basilea', 'AML'], tech_stack: [], kpis_expected: [{ name: 'Accuracy', value: '>92%' }, { name: 'Citation Rate', value: '100%' }], estimated_build_time_minutes: 6, sort_order: 7 },
        { id: 'fb-portfolio', name: 'Portfolio Optimization', slug: 'portfolio-optimization', short_description: 'MPT-based portfolio optimization with efficient frontier visualization.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['MiFID', 'Fiduciary'], tech_stack: [], kpis_expected: [{ name: 'Sharpe Improvement', value: '+0.3' }, { name: 'Risk Reduction', value: '15%' }], estimated_build_time_minutes: 5, sort_order: 8 },
        { id: 'fb-compliance-watch', name: 'ComplianceWatch — Intelligent Regulatory Monitoring', slug: 'compliance-watch', short_description: 'Autonomous regulatory monitoring with real-time alerts and compliance tracking.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'AML', 'FATF'], tech_stack: [], kpis_expected: [{ name: 'Coverage', value: '>98%' }, { name: 'Alert Latency', value: '<5min' }], estimated_build_time_minutes: 8, sort_order: 9 },
        { id: 'fb-fraud-shield', name: 'FraudShield — Real-Time Anti-Fraud Monitoring', slug: 'fraud-shield', short_description: 'Real-time fraud monitoring via webhook with Jira, Slack and email orchestration.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['AML', 'PCI-DSS'], tech_stack: [], kpis_expected: [{ name: 'Detection Rate', value: '>95%' }, { name: 'Response Time', value: '<30s' }], estimated_build_time_minutes: 8, sort_order: 10 },
        { id: 'fb-aml-watchdog', name: 'AMLWatchdog — Autonomous AML Due Diligence', slug: 'aml-watchdog', short_description: 'Autonomous AML agent with 6 integrations for complete due diligence pipeline.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['AML', 'KYC', 'FATF', 'UIF'], tech_stack: [], kpis_expected: [{ name: 'Risk Accuracy', value: '>92%' }, { name: 'Pipeline Steps', value: '8' }], estimated_build_time_minutes: 10, sort_order: 11 },
        { id: 'fb-banking-assistant', name: 'Conversational Banking Assistant', slug: 'conversational-banking-assistant', short_description: 'Multi-turn banking chatbot with intent detection, balance queries, transfers, and card management.', poc_type: 'generative', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'BCRA', 'Ley 25.326'], tech_stack: [], kpis_expected: [{ name: 'Intent Accuracy', value: '>90%' }, { name: 'Resolution Rate', value: '>85%' }], estimated_build_time_minutes: 7, sort_order: 12 },
        { id: 'fb-regulatory-reporting', name: 'Regulatory Reporting Automation', slug: 'regulatory-reporting', short_description: 'Automated generation, validation, and submission of regulatory reports across multiple frameworks.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'Basilea', 'BCRA', 'EBA'], tech_stack: [], kpis_expected: [{ name: 'Automation Rate', value: '>85%' }, { name: 'Validation Score', value: '>95%' }], estimated_build_time_minutes: 8, sort_order: 13 },
        { id: 'fb-bank-statement', name: 'Bank Statement Analysis & Income Verification', slug: 'bank-statement-analysis', short_description: 'Automated bank statement analysis with income detection, stability scoring, and DTI calculation.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'Fair Lending', 'BCRA'], tech_stack: [], kpis_expected: [{ name: 'Income Detection', value: '>95%' }, { name: 'Processing Time', value: '<3s' }], estimated_build_time_minutes: 6, sort_order: 14 },
        { id: 'fb-loan-portfolio', name: 'Loan Portfolio Risk Monitoring', slug: 'loan-portfolio-risk', short_description: 'Real-time loan portfolio monitoring with PD models, IFRS 9 staging, and early warning system.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'IFRS9', 'BCRA'], tech_stack: [], kpis_expected: [{ name: 'PD Model AUC', value: '>0.85' }, { name: 'Early Warning', value: '>80%' }], estimated_build_time_minutes: 8, sort_order: 15 },
        { id: 'fb-invoice-fraud', name: 'Invoice Fraud Detection', slug: 'invoice-fraud-detection', short_description: 'Accounts payable fraud detection with multi-signal risk scoring and vendor profiling.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'FCPA', 'Ley Penal Tributaria'], tech_stack: [], kpis_expected: [{ name: 'Detection Rate', value: '>90%' }, { name: 'False Positive', value: '<5%' }], estimated_build_time_minutes: 6, sort_order: 16 },
        { id: 'fb-debt-collection', name: 'Debt Collection Optimization', slug: 'debt-collection-optimization', short_description: 'AI-driven debt collection with propensity scoring, strategy recommendation, and campaign optimization.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['BCRA', 'Ley 25.326', 'Fair Debt'], tech_stack: [], kpis_expected: [{ name: 'Recovery Rate', value: '+25%' }, { name: 'Cost Reduction', value: '30%' }], estimated_build_time_minutes: 7, sort_order: 17 },
      ],
    },
    es: {
      id: 'fallback-fintech', name: 'Banca & Fintech', slug: 'fintech', vertical: 'fintech',
      description: 'Pack completo de PoCs de IA para banca y fintech con patrones de diseño inspirados en marcos regulatorios SOX, Basilea y AML. Incluye blueprints pre-optimizados para fraude, riesgo crediticio, KYC y más.',
      short_description: 'IA para banca con patrones alineados a compliance', badge: 'Dominado', icon: null,
      status: 'active', total_blueprints: 17, total_pocs_generated: 0, sort_order: 1, created_at: null,
      price_yearly_usd: null, roi_metrics: {},
      compliance_modules: ['SOX', 'Basilea III', 'AML/KYC', 'PCI-DSS', 'FATF', 'MiFID II', 'Ley 25.246', 'UIF Res. 199-200/2024', 'BCRA Com. A Serie', 'Ley 26.831 (CNV)', 'Ley 25.326', 'Ley 21.526', 'DORA', 'EU AI Act', 'PSD2', 'EU AMLD6', 'EBA Guidelines', 'IFRS 9', 'AIFMD'],
      connectors: [
        { name: 'Core Banking API', system: 'Banca', status: 'ready' },
        { name: 'SWIFT/ISO 20022', system: 'Pagos', status: 'ready' },
        { name: 'Bloomberg Terminal', system: 'Datos de Mercado', status: 'testing' },
      ],
      timeline: [
        { phase: 'Semana 1-2', focus: 'Setup & Evaluación de Datos', deliverables: ['Análisis de datos disponibles', 'Configuración de entorno seguro', 'Definición de KPIs'] },
        { phase: 'Semana 3-6', focus: 'Desarrollo de PoC', deliverables: ['Desarrollo de modelos', 'Integración con APIs bancarias', 'Testing con datos reales'] },
        { phase: 'Semana 7-8', focus: 'Validación & Compliance', deliverables: ['Auditoría de compliance', 'Documentación regulatoria', 'Plan de producción'] },
      ],
      blueprints: [
        { id: 'fb-fraud', name: 'Sistema de Detección de Fraude', slug: 'fraud-detection', short_description: 'Detección ML de fraude en transacciones en tiempo real con explicabilidad para auditores.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'AML'], tech_stack: [], kpis_expected: [{ name: 'Precisión', value: '>95%' }, { name: 'Latencia', value: '<200ms' }], estimated_build_time_minutes: 8, sort_order: 1 },
        { id: 'fb-rag-banking', name: 'RAG de Regulaciones Bancarias', slug: 'banking-regulations-rag', short_description: 'Asistente RAG que responde preguntas sobre regulaciones bancarias usando documentos oficiales.', poc_type: 'rag', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'Basilea'], tech_stack: [], kpis_expected: [{ name: 'Relevancia', value: '>90%' }], estimated_build_time_minutes: 6, sort_order: 2 },
        { id: 'fb-credit', name: 'Credit Scoring con Explicabilidad', slug: 'credit-scoring', short_description: 'Modelo de scoring crediticio con SHAP values para explicar decisiones a reguladores.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'Fair Lending'], tech_stack: [], kpis_expected: [{ name: 'AUC', value: '>0.85' }, { name: 'Explicabilidad', value: '100%' }], estimated_build_time_minutes: 10, sort_order: 3 },
        { id: 'fb-kyc', name: 'Screening Automatizado KYC/AML', slug: 'kyc-aml-screening', short_description: 'Screening automatizado de clientes contra listas de sanciones y PEPs con NLP.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['AML', 'KYC', 'FATF'], tech_stack: [], kpis_expected: [{ name: 'Recall', value: '>99%' }], estimated_build_time_minutes: 7, sort_order: 4 },
        { id: 'fb-robo', name: 'Robo-Advisor', slug: 'robo-advisor', short_description: 'Asesor financiero automatizado con perfilación de riesgo y rebalanceo de portafolio.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'chat', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['MiFID', 'Suitability'], tech_stack: [], kpis_expected: [{ name: 'Sharpe Ratio', value: '>1.2' }], estimated_build_time_minutes: 10, sort_order: 5 },
        { id: 'fb-risk', name: 'Análisis de Riesgo Crediticio', slug: 'credit-risk-analysis', short_description: 'Riesgo crediticio de cartera con modelos PD/LGD/EAD y escenarios de stress testing.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'IFRS9'], tech_stack: [], kpis_expected: [{ name: 'AUC Modelo PD', value: '>0.82' }, { name: 'Stress Tests', value: '3 escenarios' }], estimated_build_time_minutes: 6, sort_order: 6 },
        { id: 'fb-compliance-chat', name: 'Chatbot de Compliance Regulatorio', slug: 'compliance-chatbot', short_description: 'Chatbot RAG para consultas de compliance regulatorio financiero con citas a fuentes.', poc_type: 'rag', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'Basilea', 'AML'], tech_stack: [], kpis_expected: [{ name: 'Precisión', value: '>92%' }, { name: 'Tasa de citación', value: '100%' }], estimated_build_time_minutes: 6, sort_order: 7 },
        { id: 'fb-portfolio', name: 'Optimización de Portafolio', slug: 'portfolio-optimization', short_description: 'Optimización de portafolio basada en MPT con visualización de frontera eficiente.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['MiFID', 'Fiduciary'], tech_stack: [], kpis_expected: [{ name: 'Mejora Sharpe', value: '+0.3' }, { name: 'Reducción Riesgo', value: '15%' }], estimated_build_time_minutes: 5, sort_order: 8 },
        { id: 'fb-compliance-watch', name: 'ComplianceWatch — Monitoreo Regulatorio Inteligente', slug: 'compliance-watch', short_description: 'Monitoreo regulatorio autónomo con alertas en tiempo real y seguimiento de compliance.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'AML', 'FATF'], tech_stack: [], kpis_expected: [{ name: 'Cobertura', value: '>98%' }, { name: 'Latencia Alertas', value: '<5min' }], estimated_build_time_minutes: 8, sort_order: 9 },
        { id: 'fb-fraud-shield', name: 'FraudShield — Monitoreo Antifraude en Tiempo Real', slug: 'fraud-shield', short_description: 'Monitoreo de fraude en tiempo real via webhook con orquestación Jira, Slack y email.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['AML', 'PCI-DSS'], tech_stack: [], kpis_expected: [{ name: 'Tasa Detección', value: '>95%' }, { name: 'Tiempo Respuesta', value: '<30s' }], estimated_build_time_minutes: 8, sort_order: 10 },
        { id: 'fb-aml-watchdog', name: 'AMLWatchdog — Due Diligence Anti-Lavado Autónoma', slug: 'aml-watchdog', short_description: 'Agente AML autónomo con 6 integraciones para pipeline completo de debida diligencia.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['AML', 'KYC', 'FATF', 'UIF'], tech_stack: [], kpis_expected: [{ name: 'Precisión Riesgo', value: '>92%' }, { name: 'Pasos Pipeline', value: '8' }], estimated_build_time_minutes: 10, sort_order: 11 },
        { id: 'fb-banking-assistant', name: 'Asistente Bancario Conversacional', slug: 'conversational-banking-assistant', short_description: 'Chatbot bancario multi-turno con detección de intenciones, consultas de saldo, transferencias y gestión de tarjetas.', poc_type: 'generative', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'BCRA', 'Ley 25.326'], tech_stack: [], kpis_expected: [{ name: 'Precisión Intención', value: '>90%' }, { name: 'Tasa Resolución', value: '>85%' }], estimated_build_time_minutes: 7, sort_order: 12 },
        { id: 'fb-regulatory-reporting', name: 'Automatización de Reportes Regulatorios', slug: 'regulatory-reporting', short_description: 'Generación, validación y envío automatizado de reportes regulatorios para múltiples frameworks.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'Basilea', 'BCRA', 'EBA'], tech_stack: [], kpis_expected: [{ name: 'Tasa Automatización', value: '>85%' }, { name: 'Score Validación', value: '>95%' }], estimated_build_time_minutes: 8, sort_order: 13 },
        { id: 'fb-bank-statement', name: 'Análisis de Extractos Bancarios y Verificación de Ingresos', slug: 'bank-statement-analysis', short_description: 'Análisis automatizado de extractos bancarios con detección de ingresos, scoring de estabilidad y cálculo de DTI.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'Fair Lending', 'BCRA'], tech_stack: [], kpis_expected: [{ name: 'Detección Ingresos', value: '>95%' }, { name: 'Tiempo Proceso', value: '<3s' }], estimated_build_time_minutes: 6, sort_order: 14 },
        { id: 'fb-loan-portfolio', name: 'Monitoreo de Riesgo de Cartera Crediticia', slug: 'loan-portfolio-risk', short_description: 'Monitoreo en tiempo real de cartera crediticia con modelos PD, staging IFRS 9 y alertas tempranas.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['Basilea', 'IFRS9', 'BCRA'], tech_stack: [], kpis_expected: [{ name: 'AUC Modelo PD', value: '>0.85' }, { name: 'Alertas Tempranas', value: '>80%' }], estimated_build_time_minutes: 8, sort_order: 15 },
        { id: 'fb-invoice-fraud', name: 'Detección de Fraude en Facturas', slug: 'invoice-fraud-detection', short_description: 'Detección de fraude en cuentas a pagar con scoring multi-señal y perfilamiento de proveedores.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['SOX', 'FCPA', 'Ley Penal Tributaria'], tech_stack: [], kpis_expected: [{ name: 'Tasa Detección', value: '>90%' }, { name: 'Falsos Positivos', value: '<5%' }], estimated_build_time_minutes: 6, sort_order: 16 },
        { id: 'fb-debt-collection', name: 'Optimización de Cobranzas', slug: 'debt-collection-optimization', short_description: 'Cobranza inteligente con scoring de propensión, recomendación de estrategia y optimización de campañas.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['BCRA', 'Ley 25.326', 'Fair Debt'], tech_stack: [], kpis_expected: [{ name: 'Tasa Recupero', value: '+25%' }, { name: 'Reducción Costos', value: '30%' }], estimated_build_time_minutes: 7, sort_order: 17 },
      ],
    },
  },
  retail: {
    en: {
      id: 'fallback-retail', name: 'Retail & E-commerce', slug: 'retail', vertical: 'retail',
      description: 'AI PoC pack for retail and e-commerce. Predictive solutions for dynamic pricing, demand forecasting, customer segmentation, and inventory optimization.',
      short_description: 'Predictive AI for retail', badge: 'Mature', icon: null,
      status: 'active', total_blueprints: 8, total_pocs_generated: 0, sort_order: 2, created_at: null,
      price_yearly_usd: null, roi_metrics: {},
      compliance_modules: ['GDPR', 'CCPA', 'PCI-DSS', 'Ley 24.240', 'Ley 25.326', 'Ley 22.802', 'Ley 27.442', 'EU AI Act', 'DSA', 'EU Consumer Rights Dir.', 'EU Price Indication Dir.'],
      connectors: [
        { name: 'Shopify API', system: 'E-commerce', status: 'ready' },
        { name: 'Salesforce Commerce', system: 'CRM', status: 'ready' },
        { name: 'SAP Retail', system: 'ERP', status: 'testing' },
        { name: 'Snowflake', system: 'Data Warehouse', status: 'ready' },
      ],
      timeline: [
        { phase: 'Week 1-2', focus: 'Data & KPI Definition', deliverables: ['Data source mapping', 'Business metrics definition', 'Pipeline setup'] },
        { phase: 'Week 3-6', focus: 'Model Development', deliverables: ['Predictive models', 'A/B testing framework', 'POS/ERP integration'] },
        { phase: 'Week 7-8', focus: 'Optimization & Deploy', deliverables: ['Model optimization', 'Executive dashboard', 'Rollout plan'] },
      ],
      blueprints: [
        { id: 'fb-demand', name: 'Demand Forecasting', slug: 'demand-forecasting', short_description: 'Time series demand prediction to optimize stock and reduce waste.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['Ley 25.326', 'GDPR'], tech_stack: [], kpis_expected: [{ name: 'MAPE', value: '<15%' }, { name: 'Stockout Reduction', value: '50%' }], estimated_build_time_minutes: 5, sort_order: 1 },
        { id: 'fb-pricing', name: 'Dynamic Pricing Engine', slug: 'dynamic-pricing', short_description: 'Dynamic pricing engine that adjusts prices in real-time based on demand, competition, and inventory.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Ley 24.240', 'Ley 27.442', 'EU Price Indication Dir.'], tech_stack: [], kpis_expected: [{ name: 'Revenue Uplift', value: '8-15%' }, { name: 'Margin', value: '+5%' }], estimated_build_time_minutes: 6, sort_order: 2 },
        { id: 'fb-visual', name: 'Visual Product Search', slug: 'visual-search', short_description: 'Visual product search: upload a photo and find similar products in the catalog.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'multimodal', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Ley 25.326', 'GDPR'], tech_stack: [], kpis_expected: [{ name: 'Top-5 Accuracy', value: '>85%' }], estimated_build_time_minutes: 7, sort_order: 3 },
        { id: 'fb-inventory', name: 'Inventory Optimization', slug: 'inventory-optimization', short_description: 'Optimal reorder points and safety stock calculation to minimize costs and prevent stockouts.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['Ley 22.802'], tech_stack: [], kpis_expected: [{ name: 'Stockout Reduction', value: '40%' }, { name: 'Holding Cost Savings', value: '20%' }], estimated_build_time_minutes: 5, sort_order: 4 },
        { id: 'fb-recom', name: 'Recommendation Engine', slug: 'recommendation-engine', short_description: 'Personalized recommendation system based on purchase behavior and preferences.', poc_type: 'generative', poc_category: 'GENERATIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'DSA'], tech_stack: [], kpis_expected: [{ name: 'CTR', value: '+25%' }, { name: 'Basket Size', value: '+15%' }], estimated_build_time_minutes: 5, sort_order: 5 },
        { id: 'fb-segmentation', name: 'Customer Segmentation', slug: 'customer-segmentation', short_description: 'RFM-based customer segmentation with actionable marketing insights.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'CCPA', 'Ley 25.326'], tech_stack: [], kpis_expected: [{ name: 'Segments', value: '5-8' }, { name: 'Campaign ROI', value: '+30%' }], estimated_build_time_minutes: 5, sort_order: 6 },
        { id: 'fb-churn', name: 'Churn Prediction', slug: 'churn-prediction', short_description: 'Customer churn prediction with automated retention actions.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'Ley 25.326'], tech_stack: [], kpis_expected: [{ name: 'AUC', value: '>0.82' }, { name: 'Churn Reduction', value: '25%' }], estimated_build_time_minutes: 5, sort_order: 7 },
        { id: 'fb-shelf', name: 'Shelf Detection (Planogram Audit)', slug: 'shelf-detection', short_description: 'CV-based planogram compliance and out-of-stock detection from shelf photos.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Ley 22.802'], tech_stack: [], kpis_expected: [{ name: 'Detection Accuracy', value: '90%' }, { name: 'OOS Detection', value: '95%' }], estimated_build_time_minutes: 7, sort_order: 8 },
        { id: 'fb-competitive-intel', name: 'CompetitorRadar — Competitive Intelligence Agent', slug: 'competitive-intelligence-agent', short_description: 'Autonomous competitive intelligence agent with 4 connectors: SerpAPI + Jira + Slack + SendGrid.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'Ley 25.326'], tech_stack: ['SerpAPI', 'Jira', 'Slack', 'SendGrid'], kpis_expected: [{ name: 'Competitors', value: '4+' }, { name: 'Threat Detection', value: '>95%' }, { name: 'Alert Latency', value: '<5min' }], estimated_build_time_minutes: 8, sort_order: 9 },
      ],
    },
    es: {
      id: 'fallback-retail', name: 'Retail & E-commerce', slug: 'retail', vertical: 'retail',
      description: 'Pack de PoCs de IA para retail y e-commerce. Soluciones predictivas para pricing dinámico, forecasting de demanda, segmentación de clientes y optimización de inventario.',
      short_description: 'IA predictiva para retail', badge: 'Dominado', icon: null,
      status: 'active', total_blueprints: 9, total_pocs_generated: 0, sort_order: 2, created_at: null,
      price_yearly_usd: null, roi_metrics: {},
      compliance_modules: ['GDPR', 'CCPA', 'PCI-DSS', 'Ley 24.240', 'Ley 25.326', 'Ley 22.802', 'Ley 27.442', 'EU AI Act', 'DSA', 'EU Consumer Rights Dir.', 'EU Price Indication Dir.'],
      connectors: [
        { name: 'Shopify API', system: 'E-commerce', status: 'ready' },
        { name: 'Salesforce Commerce', system: 'CRM', status: 'ready' },
        { name: 'SAP Retail', system: 'ERP', status: 'testing' },
        { name: 'Snowflake', system: 'Data Warehouse', status: 'ready' },
      ],
      timeline: [
        { phase: 'Semana 1-2', focus: 'Datos & Definición de KPIs', deliverables: ['Mapeo de fuentes de datos', 'Definición de métricas de negocio', 'Setup de pipelines'] },
        { phase: 'Semana 3-6', focus: 'Desarrollo de Modelos', deliverables: ['Modelos predictivos', 'A/B testing framework', 'Integración con POS/ERP'] },
        { phase: 'Semana 7-8', focus: 'Optimización & Deploy', deliverables: ['Optimización de modelos', 'Dashboard ejecutivo', 'Plan de rollout'] },
      ],
      blueprints: [
        { id: 'fb-demand', name: 'Predicción de Demanda', slug: 'demand-forecasting', short_description: 'Predicción de demanda con series temporales para optimizar stock y reducir desperdicios.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['Ley 25.326', 'GDPR'], tech_stack: [], kpis_expected: [{ name: 'MAPE', value: '<15%' }, { name: 'Reducción stockout', value: '50%' }], estimated_build_time_minutes: 5, sort_order: 1 },
        { id: 'fb-pricing', name: 'Motor de Pricing Dinámico', slug: 'dynamic-pricing', short_description: 'Motor de pricing dinámico que ajusta precios en tiempo real según demanda, competencia e inventario.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Ley 24.240', 'Ley 27.442', 'EU Price Indication Dir.'], tech_stack: [], kpis_expected: [{ name: 'Incremento ingresos', value: '8-15%' }, { name: 'Margen', value: '+5%' }], estimated_build_time_minutes: 6, sort_order: 2 },
        { id: 'fb-visual', name: 'Búsqueda Visual de Productos', slug: 'visual-search', short_description: 'Búsqueda visual de productos: sube una foto y encuentra productos similares en el catálogo.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'multimodal', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Ley 25.326', 'GDPR'], tech_stack: [], kpis_expected: [{ name: 'Top-5 Accuracy', value: '>85%' }], estimated_build_time_minutes: 7, sort_order: 3 },
        { id: 'fb-inventory', name: 'Optimización de Inventario', slug: 'inventory-optimization', short_description: 'Cálculo óptimo de puntos de reorden y stock de seguridad para minimizar costos y prevenir quiebres.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['Ley 22.802'], tech_stack: [], kpis_expected: [{ name: 'Reducción quiebres', value: '40%' }, { name: 'Ahorro costos', value: '20%' }], estimated_build_time_minutes: 5, sort_order: 4 },
        { id: 'fb-recom', name: 'Motor de Recomendaciones', slug: 'recommendation-engine', short_description: 'Sistema de recomendaciones personalizadas basado en comportamiento de compra y preferencias.', poc_type: 'generative', poc_category: 'GENERATIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'DSA'], tech_stack: [], kpis_expected: [{ name: 'CTR', value: '+25%' }, { name: 'Tamaño carrito', value: '+15%' }], estimated_build_time_minutes: 5, sort_order: 5 },
        { id: 'fb-segmentation', name: 'Segmentación de Clientes', slug: 'customer-segmentation', short_description: 'Segmentación de clientes basada en RFM con insights accionables de marketing.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'CCPA', 'Ley 25.326'], tech_stack: [], kpis_expected: [{ name: 'Segmentos', value: '5-8' }, { name: 'ROI Campañas', value: '+30%' }], estimated_build_time_minutes: 5, sort_order: 6 },
        { id: 'fb-churn', name: 'Predicción de Churn', slug: 'churn-prediction', short_description: 'Predicción de abandono de clientes con acciones de retención automatizadas.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'Ley 25.326'], tech_stack: [], kpis_expected: [{ name: 'AUC', value: '>0.82' }, { name: 'Reducción churn', value: '25%' }], estimated_build_time_minutes: 5, sort_order: 7 },
        { id: 'fb-shelf', name: 'Detección de Estantes (Auditoría Planograma)', slug: 'shelf-detection', short_description: 'Detección de compliance de planograma y quiebres de stock por visión computacional.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['Ley 22.802'], tech_stack: [], kpis_expected: [{ name: 'Precisión detección', value: '90%' }, { name: 'Detección OOS', value: '95%' }], estimated_build_time_minutes: 7, sort_order: 8 },
        { id: 'fb-competitive-intel', name: 'CompetitorRadar — Agente de Inteligencia Competitiva', slug: 'competitive-intelligence-agent', short_description: 'Agente autonomo de inteligencia competitiva con 4 conectores: SerpAPI + Jira + Slack + SendGrid.', poc_type: 'autonomous_agents', poc_category: 'AUTONOMOUS_AGENTS', layout_hint: 'dashboard', complexity: 'high', is_featured: true, is_new: true, icon: null, preview_image_url: null, compliance_tags: ['GDPR', 'Ley 25.326'], tech_stack: ['SerpAPI', 'Jira', 'Slack', 'SendGrid'], kpis_expected: [{ name: 'Competidores', value: '4+' }, { name: 'Detección amenazas', value: '>95%' }, { name: 'Latencia alertas', value: '<5min' }], estimated_build_time_minutes: 8, sort_order: 9 },
      ],
    },
  },
  healthcare: {
    en: {
      id: 'fallback-healthcare', name: 'Healthcare & Pharma', slug: 'healthcare', vertical: 'healthcare',
      description: 'AI PoC pack for healthcare and pharma with design patterns inspired by HIPAA privacy principles. Includes medical image classification, clinical RAG assistants, readmission prediction, and more.',
      short_description: 'Clinical AI with privacy-aware design patterns', badge: 'Ready', icon: null,
      status: 'active', total_blueprints: 14, total_pocs_generated: 0, sort_order: 3, created_at: null,
      price_yearly_usd: null, roi_metrics: {},
      compliance_modules: ['HIPAA', 'FDA 21 CFR Part 11', 'GDPR', 'HL7/FHIR', 'Ley 26.529', 'Ley 25.326', 'ANMAT Disp. 2318/2002', 'Ley 26.862', 'Res. 1089/2012 Telemedicina', 'EU MDR 2017/745', 'EU AI Act (Alto Riesgo)', 'MDCG 2019-11', 'EMTALA', 'CMS Guidelines', 'ERISA', 'GINA', 'EMA Guidelines', 'ICH Q8-Q12', 'ONC Cures Act', 'False Claims Act', 'CMS Billing Rules', 'Obras Sociales Res. 201/2002'],
      connectors: [
        { name: 'Epic/Cerner (HL7 FHIR)', system: 'EHR', status: 'ready' },
        { name: 'PACS/DICOM', system: 'Medical Imaging', status: 'ready' },
        { name: 'Snowflake Health', system: 'Data Warehouse', status: 'testing' },
        { name: 'AWS HealthLake', system: 'Cloud FHIR', status: 'testing' },
      ],
      timeline: [
        { phase: 'Week 1-3', focus: 'Compliance Setup & Data Mapping', deliverables: ['HIPAA controls', 'De-identification pipeline', 'Data governance'] },
        { phase: 'Week 4-7', focus: 'PoC Generation & Clinical Validation', deliverables: ['Generate 4-6 PoCs', 'Clinical expert review', 'Accuracy benchmarks'] },
        { phase: 'Week 8-12', focus: 'Regulatory Readiness', deliverables: ['FDA documentation', 'Bias audit', 'Deployment architecture'] },
      ],
      blueprints: [
        { id: 'fb-xray', name: 'X-Ray Classification', slug: 'xray-classification', short_description: 'Chest X-ray classification for lung pathology detection with Grad-CAM explainability.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'FDA', 'ANMAT Disp. 2318/2002', 'EU MDR 2017/745'], tech_stack: [], kpis_expected: [{ name: 'Sensitivity', value: '>95%' }, { name: 'Specificity', value: '>92%' }], estimated_build_time_minutes: 7, sort_order: 1 },
        { id: 'fb-readmission', name: 'Patient Readmission Prediction', slug: 'readmission-prediction', short_description: '30-day hospital readmission risk prediction for proactive care management.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Ley 26.529'], tech_stack: [], kpis_expected: [{ name: 'AUC', value: '>0.78' }, { name: 'Readmission Reduction', value: '20%' }], estimated_build_time_minutes: 5, sort_order: 2 },
        { id: 'fb-icd', name: 'ICD-10 Medical Coding', slug: 'icd-coding', short_description: 'Automated ICD-10 coding from clinical notes using NLP to accelerate billing.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'document', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Ley 26.529'], tech_stack: [], kpis_expected: [{ name: 'Accuracy', value: '>88%' }, { name: 'Time Savings', value: '5x' }], estimated_build_time_minutes: 6, sort_order: 3 },
        { id: 'fb-medical-rag', name: 'Medical RAG Assistant', slug: 'medical-rag-assistant', short_description: 'Clinical decision support RAG with evidence-based citations from medical literature.', poc_type: 'rag', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Res. 1089/2012 Telemedicina'], tech_stack: [], kpis_expected: [{ name: 'Accuracy', value: '>90%' }, { name: 'Citation Rate', value: '100%' }], estimated_build_time_minutes: 6, sort_order: 4 },
        { id: 'fb-transcription', name: 'Medical Transcription', slug: 'medical-transcription', short_description: 'Audio-to-structured clinical notes with SOAP format using speech recognition.', poc_type: 'audio', poc_category: 'AUDIO', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Ley 26.529'], tech_stack: [], kpis_expected: [{ name: 'Transcription Accuracy', value: '95%' }, { name: 'Time Savings', value: '70%' }], estimated_build_time_minutes: 7, sort_order: 5 },
        { id: 'fb-retinopathy', name: 'Diabetic Retinopathy Detection', slug: 'retinopathy-detection', short_description: 'Fundus image analysis for diabetic retinopathy severity grading.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'FDA', 'ANMAT Disp. 2318/2002', 'EU MDR 2017/745'], tech_stack: [], kpis_expected: [{ name: 'Sensitivity', value: '>93%' }, { name: 'Referral Accuracy', value: '95%' }], estimated_build_time_minutes: 7, sort_order: 6 },
        { id: 'fb-sepsis', name: 'Sepsis Early Warning', slug: 'sepsis-prediction', short_description: 'Early sepsis detection from real-time vitals and lab results with alert system.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'ANMAT Disp. 2318/2002'], tech_stack: [], kpis_expected: [{ name: 'Sensitivity', value: '>92%' }, { name: 'Lead Time', value: '4-6h' }], estimated_build_time_minutes: 6, sort_order: 7 },
        { id: 'fb-ecg', name: 'ECG Arrhythmia Detection', slug: 'ecg-analysis', short_description: 'AI ECG analysis for arrhythmia classification with urgent alert system.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'FDA', 'ANMAT Disp. 2318/2002', 'EU MDR 2017/745'], tech_stack: [], kpis_expected: [{ name: 'Accuracy', value: '94%' }, { name: 'AF Detection', value: '97%' }], estimated_build_time_minutes: 7, sort_order: 8 },
        { id: 'fb-triage', name: 'Patient Triage AI', slug: 'patient-triage', short_description: 'AI triage with ESI scoring and care routing for emergency departments.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'EMTALA', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'EU AI Act Annex III-1a', 'ANMAT Disp. 2318/2002'], tech_stack: [], kpis_expected: [{ name: 'Triage Accuracy', value: '92%' }, { name: 'Avg Decision Time', value: '<30s' }, { name: 'Under-Triage Rate', value: '<3%' }], estimated_build_time_minutes: 5, sort_order: 9 },
        { id: 'fb-prior-auth', name: 'Prior Authorization Automation', slug: 'prior-authorization', short_description: 'NLP-based prior auth with coverage matching to reduce denials and turnaround time.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'CMS Guidelines', 'ERISA', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'GDPR Art. 22'], tech_stack: [], kpis_expected: [{ name: 'Auto-Approval Rate', value: '68%' }, { name: 'Turnaround Time', value: '<4h' }, { name: 'Denial Reduction', value: '45%' }], estimated_build_time_minutes: 5, sort_order: 10 },
        { id: 'fb-drug-discovery', name: 'Drug Discovery & Molecular Screening', slug: 'drug-discovery', short_description: 'AI molecular screening with ADMET prediction for drug candidate prioritization.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['FDA 21 CFR Part 11', 'EMA Guidelines', 'ICH Q8-Q12', 'ANMAT Disp. 2819/2004', 'EU AI Act Art. 6'], tech_stack: [], kpis_expected: [{ name: 'Hit Rate', value: '12%' }, { name: 'Screening Speed', value: '10K/min' }, { name: 'Toxicity Prediction AUC', value: '0.89' }], estimated_build_time_minutes: 5, sort_order: 11 },
        { id: 'fb-precision-med', name: 'Precision Medicine Engine', slug: 'precision-medicine', short_description: 'Genomic-driven personalized treatment recommendations with pharmacogenomic analysis.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'GINA', 'FDA Pharmacogenomics', 'Ley 25.326 Art. 7-8', 'EU AI Act Annex III-1a', 'GDPR Art. 9'], tech_stack: [], kpis_expected: [{ name: 'Treatment Match Accuracy', value: '87%' }, { name: 'Adverse Event Reduction', value: '40%' }, { name: 'Dosing Precision', value: '±15%' }], estimated_build_time_minutes: 5, sort_order: 12 },
        { id: 'fb-claims', name: 'Healthcare Claims & Billing Optimization', slug: 'claims-billing', short_description: 'AI claims denial prediction and billing optimization with revenue recovery.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'CMS Billing Rules', 'False Claims Act', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'Obras Sociales Res. 201/2002'], tech_stack: [], kpis_expected: [{ name: 'Denial Prediction AUC', value: '0.91' }, { name: 'Revenue Recovery', value: '+18%' }, { name: 'First-Pass Rate', value: '94%' }], estimated_build_time_minutes: 5, sort_order: 13 },
        { id: 'fb-ehr', name: 'EHR Data Integration & Analytics', slug: 'ehr-analytics', short_description: 'FHIR-based EHR analytics and population health with care gap detection.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'HL7 FHIR R4', 'ONC Cures Act', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'GDPR Art. 20'], tech_stack: [], kpis_expected: [{ name: 'Data Completeness', value: '96%' }, { name: 'Care Gap Detection', value: '89%' }, { name: 'Query Response Time', value: '<2s' }], estimated_build_time_minutes: 5, sort_order: 14 },
      ],
    },
    es: {
      id: 'fallback-healthcare', name: 'Salud & Pharma', slug: 'healthcare', vertical: 'healthcare',
      description: 'Pack de PoCs de IA para salud y pharma con patrones de diseño inspirados en los principios de privacidad de HIPAA. Incluye clasificación de imágenes médicas, asistentes RAG clínicos, predicción de readmisión y más.',
      short_description: 'IA clínica con patrones de diseño privacy-aware', badge: 'Listo', icon: null,
      status: 'active', total_blueprints: 14, total_pocs_generated: 0, sort_order: 3, created_at: null,
      price_yearly_usd: null, roi_metrics: {},
      compliance_modules: ['HIPAA', 'FDA 21 CFR Part 11', 'GDPR', 'HL7/FHIR', 'Ley 26.529', 'Ley 25.326', 'ANMAT Disp. 2318/2002', 'Ley 26.862', 'Res. 1089/2012 Telemedicina', 'EU MDR 2017/745', 'EU AI Act (Alto Riesgo)', 'MDCG 2019-11', 'EMTALA', 'CMS Guidelines', 'ERISA', 'GINA', 'EMA Guidelines', 'ICH Q8-Q12', 'ONC Cures Act', 'False Claims Act', 'CMS Billing Rules', 'Obras Sociales Res. 201/2002'],
      connectors: [
        { name: 'Epic/Cerner (HL7 FHIR)', system: 'HCE', status: 'ready' },
        { name: 'PACS/DICOM', system: 'Imágenes Médicas', status: 'ready' },
        { name: 'Snowflake Health', system: 'Data Warehouse', status: 'testing' },
        { name: 'AWS HealthLake', system: 'Cloud FHIR', status: 'testing' },
      ],
      timeline: [
        { phase: 'Semana 1-3', focus: 'Setup de Compliance & Mapeo de Datos', deliverables: ['Controles HIPAA', 'Pipeline de de-identificación', 'Gobierno de datos'] },
        { phase: 'Semana 4-7', focus: 'Generación de PoC & Validación Clínica', deliverables: ['Generar 4-6 PoCs', 'Revisión de expertos clínicos', 'Benchmarks de precisión'] },
        { phase: 'Semana 8-12', focus: 'Preparación Regulatoria', deliverables: ['Documentación FDA', 'Auditoría de sesgos', 'Arquitectura de deployment'] },
      ],
      blueprints: [
        { id: 'fb-xray', name: 'Clasificación de Rayos X', slug: 'xray-classification', short_description: 'Clasificación de radiografías de tórax para detección de patologías pulmonares con explicabilidad Grad-CAM.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'FDA', 'ANMAT Disp. 2318/2002', 'EU MDR 2017/745'], tech_stack: [], kpis_expected: [{ name: 'Sensibilidad', value: '>95%' }, { name: 'Especificidad', value: '>92%' }], estimated_build_time_minutes: 7, sort_order: 1 },
        { id: 'fb-readmission', name: 'Predicción de Readmisión', slug: 'readmission-prediction', short_description: 'Predicción de riesgo de readmisión hospitalaria a 30 días para manejo proactivo del paciente.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Ley 26.529'], tech_stack: [], kpis_expected: [{ name: 'AUC', value: '>0.78' }, { name: 'Reducción readmisión', value: '20%' }], estimated_build_time_minutes: 5, sort_order: 2 },
        { id: 'fb-icd', name: 'Codificación Médica ICD-10', slug: 'icd-coding', short_description: 'Codificación automatizada ICD-10 de notas clínicas usando NLP para acelerar facturación.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'document', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Ley 26.529'], tech_stack: [], kpis_expected: [{ name: 'Precisión', value: '>88%' }, { name: 'Ahorro tiempo', value: '5x' }], estimated_build_time_minutes: 6, sort_order: 3 },
        { id: 'fb-medical-rag', name: 'Asistente RAG Médico', slug: 'medical-rag-assistant', short_description: 'Soporte a decisiones clínicas con RAG y citas de evidencia de literatura médica.', poc_type: 'rag', poc_category: 'GENERATIVE', layout_hint: 'chat', complexity: 'medium', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Res. 1089/2012 Telemedicina'], tech_stack: [], kpis_expected: [{ name: 'Precisión', value: '>90%' }, { name: 'Tasa de citación', value: '100%' }], estimated_build_time_minutes: 6, sort_order: 4 },
        { id: 'fb-transcription', name: 'Transcripción Médica', slug: 'medical-transcription', short_description: 'Audio a notas clínicas estructuradas en formato SOAP con reconocimiento de voz.', poc_type: 'audio', poc_category: 'AUDIO', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'Ley 26.529'], tech_stack: [], kpis_expected: [{ name: 'Precisión transcripción', value: '95%' }, { name: 'Ahorro tiempo', value: '70%' }], estimated_build_time_minutes: 7, sort_order: 5 },
        { id: 'fb-retinopathy', name: 'Detección de Retinopatía Diabética', slug: 'retinopathy-detection', short_description: 'Análisis de imágenes de fondo de ojo para gradación de severidad de retinopatía diabética.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'FDA', 'ANMAT Disp. 2318/2002', 'EU MDR 2017/745'], tech_stack: [], kpis_expected: [{ name: 'Sensibilidad', value: '>93%' }, { name: 'Precisión derivación', value: '95%' }], estimated_build_time_minutes: 7, sort_order: 6 },
        { id: 'fb-sepsis', name: 'Alerta Temprana de Sepsis', slug: 'sepsis-prediction', short_description: 'Detección temprana de sepsis usando signos vitales y lab en tiempo real con alertas.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: false, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'ANMAT Disp. 2318/2002'], tech_stack: [], kpis_expected: [{ name: 'Sensibilidad', value: '>92%' }, { name: 'Tiempo anticipación', value: '4-6h' }], estimated_build_time_minutes: 6, sort_order: 7 },
        { id: 'fb-ecg', name: 'Detección de Arritmias por ECG', slug: 'ecg-analysis', short_description: 'Análisis de ECG con IA para clasificación de arritmias y alertas urgentes.', poc_type: 'computer_vision', poc_category: 'COMPUTER_VISION', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'FDA', 'ANMAT Disp. 2318/2002', 'EU MDR 2017/745'], tech_stack: [], kpis_expected: [{ name: 'Precisión', value: '94%' }, { name: 'Detección FA', value: '97%' }], estimated_build_time_minutes: 7, sort_order: 8 },
        { id: 'fb-triage', name: 'Triage de Pacientes con IA', slug: 'patient-triage', short_description: 'Triage con IA usando scoring ESI y enrutamiento de atención para urgencias.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'EMTALA', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'EU AI Act Annex III-1a', 'ANMAT Disp. 2318/2002'], tech_stack: [], kpis_expected: [{ name: 'Precisión Triage', value: '92%' }, { name: 'Tiempo decisión prom.', value: '<30s' }, { name: 'Tasa sub-triage', value: '<3%' }], estimated_build_time_minutes: 5, sort_order: 9 },
        { id: 'fb-prior-auth', name: 'Automatización de Autorización Previa', slug: 'prior-authorization', short_description: 'Autorización previa basada en NLP con matching de cobertura para reducir rechazos.', poc_type: 'nlp_documental', poc_category: 'NLP_DOCUMENTAL', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'CMS Guidelines', 'ERISA', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'GDPR Art. 22'], tech_stack: [], kpis_expected: [{ name: 'Tasa auto-aprobación', value: '68%' }, { name: 'Tiempo respuesta', value: '<4h' }, { name: 'Reducción rechazos', value: '45%' }], estimated_build_time_minutes: 5, sort_order: 10 },
        { id: 'fb-drug-discovery', name: 'Descubrimiento de Fármacos & Screening Molecular', slug: 'drug-discovery', short_description: 'Screening molecular con IA y predicción ADMET para priorización de candidatos a fármacos.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['FDA 21 CFR Part 11', 'EMA Guidelines', 'ICH Q8-Q12', 'ANMAT Disp. 2819/2004', 'EU AI Act Art. 6'], tech_stack: [], kpis_expected: [{ name: 'Tasa de acierto', value: '12%' }, { name: 'Velocidad screening', value: '10K/min' }, { name: 'AUC predicción toxicidad', value: '0.89' }], estimated_build_time_minutes: 5, sort_order: 11 },
        { id: 'fb-precision-med', name: 'Motor de Medicina de Precisión', slug: 'precision-medicine', short_description: 'Recomendaciones de tratamiento personalizadas basadas en genómica y análisis farmacogenómico.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'GINA', 'FDA Pharmacogenomics', 'Ley 25.326 Art. 7-8', 'EU AI Act Annex III-1a', 'GDPR Art. 9'], tech_stack: [], kpis_expected: [{ name: 'Precisión match tratamiento', value: '87%' }, { name: 'Reducción eventos adversos', value: '40%' }, { name: 'Precisión dosificación', value: '±15%' }], estimated_build_time_minutes: 5, sort_order: 12 },
        { id: 'fb-claims', name: 'Optimización de Facturación & Reclamos', slug: 'claims-billing', short_description: 'Predicción de rechazos de reclamos con IA y optimización de facturación con recupero de ingresos.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'CMS Billing Rules', 'False Claims Act', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'Obras Sociales Res. 201/2002'], tech_stack: [], kpis_expected: [{ name: 'AUC predicción rechazo', value: '0.91' }, { name: 'Recupero ingresos', value: '+18%' }, { name: 'Tasa primer envío', value: '94%' }], estimated_build_time_minutes: 5, sort_order: 13 },
        { id: 'fb-ehr', name: 'Integración & Analítica de HCE', slug: 'ehr-analytics', short_description: 'Analítica de HCE basada en FHIR y salud poblacional con detección de brechas de atención.', poc_type: 'ml_predictive', poc_category: 'ML_PREDICTIVE', layout_hint: 'dashboard', complexity: 'high', is_featured: true, icon: null, preview_image_url: null, compliance_tags: ['HIPAA', 'HL7 FHIR R4', 'ONC Cures Act', 'Ley 26.529', 'Ley 25.326 Art. 7-8', 'GDPR Art. 20'], tech_stack: [], kpis_expected: [{ name: 'Completitud datos', value: '96%' }, { name: 'Detección brechas', value: '89%' }, { name: 'Tiempo respuesta', value: '<2s' }], estimated_build_time_minutes: 5, sort_order: 14 },
      ],
    },
  },
}

interface VerticalPackDetailPageProps {
  // Render embebido dentro del workspace layout. Cuando está en true, se
  // omiten el wrapper full-screen y el header con back button — el workspace
  // ya provee sidebar y chrome. Las rutas de "volver al listado" usan la
  // ruta embebida (/workspace/verticals).
  embedded?: boolean
}

export default function VerticalPackDetailPage({ embedded = false }: VerticalPackDetailPageProps = {}) {
  const backToListPath = embedded ? '/workspace/verticals' : '/vertical-pack'
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const [pack, setPack] = useState<VerticalPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN_KEY)
  const staticData = getVerticalPackStaticData(language)

  useEffect(() => {
    if (!slug) return
    verticalPacksApi
      .getPackDetail(slug, language)
      .then((data) => {
        setPack(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback to static data if API unavailable
        const fb = fallbackPacks[slug]?.[language] || fallbackPacks[slug]?.['en']
        if (fb) {
          setPack(fb)
        } else {
          setError(true)
        }
        setLoading(false)
      })
  }, [slug, language])

  const localizedPack = useMemo(() => {
    if (!pack) return null

    // Get language-specific fallback data
    const langFallback = slug ? (fallbackPacks[slug]?.[language] || fallbackPacks[slug]?.['en']) : null

    if (!langFallback) {
      const staticPack = staticData.portfolio.find((item) => item.slug === pack.slug)
      return {
        ...pack,
        name: staticPack?.name || pack.name,
        badge: staticPack?.badge || pack.badge,
        short_description: staticPack?.summary || pack.short_description,
      }
    }

    const fallbackBpBySlug = new Map(langFallback.blueprints.map((bp) => [bp.slug, bp]))
    return {
      ...pack,
      name: langFallback.name,
      description: langFallback.description,
      short_description: langFallback.short_description,
      badge: langFallback.badge,
      timeline: langFallback.timeline,
      connectors: langFallback.connectors,
      blueprints: pack.blueprints.map((bp) => {
        const loc = fallbackBpBySlug.get(bp.slug)
        if (!loc) return bp
        return {
          ...bp,
          name: loc.name,
          short_description: loc.short_description,
          kpis_expected: loc.kpis_expected,
        }
      }),
    }
  }, [pack, language, slug, staticData.portfolio])

  const handleGenerate = async (bp: CuratedBlueprintSummary) => {
    if (!isLoggedIn) {
      navigate(`/login?returnTo=${encodeURIComponent(`/vertical-pack/${slug}`)}`)
      return
    }
    try {
      setGeneratingId(bp.id)
      setGenerateError(null)
      const blueprintRef = bp.id.startsWith('fb-') ? bp.slug : bp.id
      const result = await verticalPacksApi.generateFromBlueprint(blueprintRef, undefined, language)
      if (result.poc_id) {
        navigate(`/preview/${result.poc_id}`)
      }
    } catch (err: unknown) {
      // If 401 persists after auto-refresh, redirect to login
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr?.response?.status === 401) {
        navigate(`/login?returnTo=${encodeURIComponent(`/vertical-pack/${slug}`)}`)
        return
      }
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      const msg = detail || (err instanceof Error ? err.message : t('verticalPack.detail.generateError'))
      setGenerateError(`${bp.name}: ${msg}`)
      setGeneratingId(null)
    }
  }

  if (loading) {
    return (
      <div
        className={
          embedded
            ? 'flex items-center justify-center py-16'
            : 'min-h-screen bg-gray-50 flex items-center justify-center'
        }
      >
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  if (error || !localizedPack) {
    return (
      <div
        className={
          embedded
            ? 'flex flex-col items-center justify-center gap-4 py-16'
            : 'min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4'
        }
      >
        <p className="text-gray-600">{t('verticalPack.detail.notFound')}</p>
        <Link
          to={backToListPath}
          className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('verticalPack.detail.backToList')}
        </Link>
      </div>
    )
  }

  const featured = localizedPack.blueprints.filter((bp) => bp.is_featured)
  const others = localizedPack.blueprints.filter((bp) => !bp.is_featured)

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
      {/* Header con "Volver al listado" — solo en modo standalone. Dentro del
          workspace el sidebar ya provee navegación. */}
      {!embedded && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(backToListPath)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('verticalPack.detail.backToList')}</span>
            </button>
          </div>
        </div>
      )}

      <main className={embedded ? 'space-y-10' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10'}>
        {/* Error notification */}
        {generateError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{generateError}</p>
            </div>
            <button type="button" onClick={() => setGenerateError(null)} className="text-red-400 hover:text-red-600">
              &times;
            </button>
          </div>
        )}

        {/* Login banner */}
        {!isLoggedIn && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <LogIn className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              {t('verticalPack.detail.loginRequired')}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/login?returnTo=${encodeURIComponent(`/vertical-pack/${slug}`)}`)}
              className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              {t('verticalPack.detail.loginAction')}
            </button>
          </div>
        )}

        {/* Pack header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            {localizedPack.badge && (
              <span className="text-[11px] uppercase font-semibold text-white bg-brand-600 px-3 py-1 rounded-full">
                {localizedPack.badge}
              </span>
            )}
            {localizedPack.compliance_modules.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                <BookOpen className="w-3 h-3" />
                {t('verticalPack.detail.frameworksReferenced')}: {localizedPack.compliance_modules.length}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{localizedPack.name}</h1>
          <p className="text-lg text-gray-600 max-w-3xl">{localizedPack.description}</p>
        </header>

        {/* Stats row */}
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            label={t('verticalPack.detail.blueprints')}
            value={String(localizedPack.blueprints.length)}
          />
          <StatCard
            label={t('verticalPack.detail.pocsGenerated')}
            value={String(localizedPack.total_pocs_generated)}
          />
          <StatCard
            label={t('verticalPack.detail.complianceModules')}
            value={String(localizedPack.compliance_modules.length)}
          />
        </div>

        {/* ROI Metrics */}
        {localizedPack.roi_metrics && Object.keys(localizedPack.roi_metrics).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              {t('verticalPack.detail.roiTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(localizedPack.roi_metrics).map(([key, value]) => (
                <ROIMetricCard key={key} metricKey={key} value={value} />
              ))}
            </div>
          </section>
        )}

        {/* Regulatory Frameworks Referenced */}
        {localizedPack.compliance_modules.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-600" />
              {t('verticalPack.detail.complianceTitle')}
            </h2>

            {/* Legal Disclaimer */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">
                  {t('verticalPack.detail.regulatoryDisclaimerTitle')}
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {t('verticalPack.detail.regulatoryDisclaimerBody')}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localizedPack.compliance_modules.map((mod) => (
                <ComplianceModuleCard key={mod} name={mod} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Blueprints */}
        {featured.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {t('verticalPack.detail.featuredBlueprints')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((bp) => (
                <BlueprintCard
                  key={bp.id}
                  blueprint={bp}
                  onGenerate={handleGenerate}
                  generating={generatingId === bp.id}
                  isLoggedIn={isLoggedIn}
                  language={language}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Blueprints */}
        {others.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('verticalPack.detail.allBlueprints')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((bp) => (
                <BlueprintCard
                  key={bp.id}
                  blueprint={bp}
                  onGenerate={handleGenerate}
                  generating={generatingId === bp.id}
                  isLoggedIn={isLoggedIn}
                  language={language}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}


        {/* Platform Integration Kits */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t('verticalPack.connectors.title')}</h2>
            <span className="text-xs text-gray-500">{staticData.connectors.length} kits</span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {staticData.connectors.map((connector) => (
              <div
                key={connector.name}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <Plug className="w-4 h-4 text-brand-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{connector.name}</p>
                  <p className="text-xs text-gray-500">{connector.system}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm space-y-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </article>
  )
}

interface BlueprintCardProps {
  blueprint: CuratedBlueprintSummary
  onGenerate: (bp: CuratedBlueprintSummary) => void
  generating: boolean
  isLoggedIn: boolean
  language: string
  t: (key: string) => string
}

function BlueprintCard({ blueprint, onGenerate, generating, isLoggedIn, t }: BlueprintCardProps) {
  return (
    <article className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col space-y-3 overflow-hidden">
      {blueprint.is_new && (
        <span className="absolute top-3 -right-8 rotate-45 bg-emerald-500 text-white text-[10px] font-bold px-8 py-0.5 shadow-sm tracking-wider">
          NEW
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{blueprint.name}</h3>
        {blueprint.is_featured && (
          <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        )}
      </div>

      <p className="text-sm text-gray-600 flex-1">
        {blueprint.short_description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          {blueprint.poc_type}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {blueprint.layout_hint}
        </span>
        {blueprint.complexity && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" />
            {blueprint.complexity}
          </span>
        )}
      </div>

      {/* Regulatory frameworks referenced (design pattern only, not a certification) */}
      {blueprint.compliance_tags.length > 0 && (
        <div className="space-y-1">
          <div
            className="flex flex-wrap gap-1.5"
            title={t('verticalPack.detail.regulatoryDisclaimerBody')}
          >
            {blueprint.compliance_tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-0.5"
              >
                <BookOpen className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic leading-tight">
            {t('verticalPack.detail.blueprintTagsDisclaimer')}
          </p>
        </div>
      )}

      {/* KPIs */}
      {blueprint.kpis_expected.length > 0 && (
        <div className="space-y-1">
          {blueprint.kpis_expected.slice(0, 3).map((kpi, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span>{kpi.name}: <strong>{kpi.value}</strong></span>
            </div>
          ))}
        </div>
      )}

      {/* Build time */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        ~{blueprint.estimated_build_time_minutes || 5} min
      </div>

      {/* Generate button */}
      <button
        type="button"
        disabled={generating}
        onClick={() => onGenerate(blueprint)}
        className={`mt-auto w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
          isLoggedIn
            ? 'border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : isLoggedIn ? (
          t('verticalPack.detail.generatePoc')
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <LogIn className="w-3.5 h-3.5" />
            {t('verticalPack.detail.loginToGenerate')}
          </span>
        )}
      </button>
    </article>
  )
}

// ── Compliance descriptions ──────────────────────────────────
const complianceDescriptions: Record<string, { en: string; es: string }> = {
  'SOX': {
    en: 'Sarbanes-Oxley Act — Audit trails & financial controls',
    es: 'Ley Sarbanes-Oxley — Trazabilidad de auditoría y controles financieros',
  },
  'Basilea III': {
    en: 'Capital adequacy, stress testing & market risk',
    es: 'Adecuación de capital, stress testing y riesgo de mercado',
  },
  'AML/KYC': {
    en: 'Anti-Money Laundering / Know Your Customer',
    es: 'Prevención de lavado de dinero / Conozca a su cliente',
  },
  'PCI-DSS': {
    en: 'Payment Card Industry Data Security Standard',
    es: 'Estándar de seguridad de datos para la industria de tarjetas de pago',
  },
  'HIPAA': {
    en: 'Health Insurance Portability and Accountability Act',
    es: 'Ley de Portabilidad y Responsabilidad del Seguro de Salud',
  },
  'GDPR': {
    en: 'General Data Protection Regulation (EU)',
    es: 'Reglamento General de Protección de Datos (UE)',
  },
  'FDA 21 CFR Part 11': {
    en: 'Electronic records & signatures for pharma',
    es: 'Registros y firmas electrónicas para pharma',
  },
  'CCPA': {
    en: 'California Consumer Privacy Act',
    es: 'Ley de Privacidad del Consumidor de California',
  },
  'HL7/FHIR': {
    en: 'Health Level Seven / FHIR interoperability standard',
    es: 'Estándar de interoperabilidad Health Level Seven / FHIR',
  },
  'FATF': {
    en: 'Financial Action Task Force recommendations',
    es: 'Recomendaciones del Grupo de Acción Financiera Internacional',
  },
  'MiFID II': {
    en: 'Markets in Financial Instruments Directive — Investor protection and market transparency',
    es: 'Directiva de Mercados de Instrumentos Financieros — Protección al inversor y transparencia de mercado',
  },
  'Ley 25.246': {
    en: 'Argentine AML/CFT Law — Anti-money laundering and counter-terrorism financing',
    es: 'Ley de Prevención de Lavado de Activos — Prevención de lavado de dinero y financiamiento del terrorismo',
  },
  'UIF Res. 199-200/2024': {
    en: 'Argentine FIU Resolutions — KYC due diligence and suspicious activity reporting',
    es: 'Resoluciones UIF — Debida diligencia KYC y reporte de operaciones sospechosas',
  },
  'BCRA Com. A Serie': {
    en: 'Central Bank of Argentina Communications — Banking technology and IT security standards',
    es: 'Comunicaciones del BCRA — Estándares de tecnología bancaria y seguridad informática',
  },
  'Ley 26.831 (CNV)': {
    en: 'Argentine Capital Markets Law — Securities regulation and investor protection',
    es: 'Ley de Mercado de Capitales — Regulación de valores y protección al inversor',
  },
  'Ley 25.326': {
    en: 'Argentine Personal Data Protection Law — Privacy rights and data processing rules',
    es: 'Ley de Protección de Datos Personales — Derechos de privacidad y reglas de tratamiento de datos',
  },
  'Ley 21.526': {
    en: 'Argentine Financial Entities Law — Banking institution regulation and supervision',
    es: 'Ley de Entidades Financieras — Regulación y supervisión de instituciones bancarias',
  },
  'DORA': {
    en: 'Digital Operational Resilience Act (EU) — ICT risk management for financial entities',
    es: 'Ley de Resiliencia Operativa Digital (UE) — Gestión de riesgos TIC para entidades financieras',
  },
  'EU AI Act': {
    en: 'EU Artificial Intelligence Act — Risk-based AI regulation and high-risk system requirements',
    es: 'Ley de IA de la UE — Regulación de IA basada en riesgo y requisitos para sistemas de alto riesgo',
  },
  'PSD2': {
    en: 'Payment Services Directive 2 (EU) — Open banking and strong customer authentication',
    es: 'Directiva de Servicios de Pago 2 (UE) — Banca abierta y autenticación reforzada de clientes',
  },
  'EU AMLD6': {
    en: '6th Anti-Money Laundering Directive (EU) — Enhanced AML obligations and criminal liability',
    es: '6ª Directiva contra el Lavado de Dinero (UE) — Obligaciones AML reforzadas y responsabilidad penal',
  },
  'EBA Guidelines': {
    en: 'European Banking Authority Guidelines — Prudential supervision and risk management standards',
    es: 'Directrices de la Autoridad Bancaria Europea — Supervisión prudencial y estándares de gestión de riesgos',
  },
  'IFRS 9': {
    en: 'International Financial Reporting Standard 9 — Expected credit loss model and financial instruments',
    es: 'NIIF 9 — Modelo de pérdida crediticia esperada e instrumentos financieros',
  },
  'AIFMD': {
    en: 'Alternative Investment Fund Managers Directive (EU) — Hedge fund and private equity regulation',
    es: 'Directiva de Gestores de Fondos Alternativos (UE) — Regulación de hedge funds y private equity',
  },
  // ── Retail ──
  'Ley 24.240': {
    en: 'Argentine Consumer Protection Law — Consumer rights, transparent pricing, and fair advertising',
    es: 'Ley de Defensa del Consumidor — Derechos del consumidor, precios transparentes y publicidad leal',
  },
  'Ley 22.802': {
    en: 'Argentine Fair Trade Law — Product labeling, origin marking, and commercial practices',
    es: 'Ley de Lealtad Comercial — Rotulado de productos, marcado de origen y prácticas comerciales',
  },
  'Ley 27.442': {
    en: 'Argentine Competition Law — Antitrust regulation and prevention of anti-competitive practices',
    es: 'Ley de Defensa de la Competencia — Regulación antimonopolio y prevención de prácticas anticompetitivas',
  },
  'DSA': {
    en: 'Digital Services Act (EU) — Platform accountability, algorithmic transparency, and online safety',
    es: 'Ley de Servicios Digitales (UE) — Responsabilidad de plataformas, transparencia algorítmica y seguridad online',
  },
  'EU Consumer Rights Dir.': {
    en: 'EU Consumer Rights Directive — Pre-contractual information, withdrawal rights, and digital content rules',
    es: 'Directiva de Derechos del Consumidor (UE) — Información precontractual, derecho de desistimiento y contenido digital',
  },
  'EU Price Indication Dir.': {
    en: 'EU Price Indication Directive — Price transparency and unit pricing for consumer products',
    es: 'Directiva de Indicación de Precios (UE) — Transparencia de precios y precio unitario para productos de consumo',
  },
  // ── Healthcare ──
  'Ley 26.529': {
    en: 'Argentine Patient Rights Law — Informed consent, medical records access, and patient autonomy',
    es: 'Ley de Derechos del Paciente — Consentimiento informado, acceso a historia clínica y autonomía del paciente',
  },
  'ANMAT Disp. 2318/2002': {
    en: 'Argentine ANMAT Regulation — Medical device classification and software as medical device (SaMD)',
    es: 'Disposición ANMAT — Clasificación de dispositivos médicos y software como dispositivo médico (SaMD)',
  },
  'Ley 26.862': {
    en: 'Argentine Assisted Reproduction Law — Reproductive health data protection and access rights',
    es: 'Ley de Reproducción Asistida — Protección de datos de salud reproductiva y derechos de acceso',
  },
  'Res. 1089/2012 Telemedicina': {
    en: 'Argentine Telemedicine Resolution — Standards for remote clinical consultations and digital health',
    es: 'Resolución de Telemedicina — Estándares para consultas clínicas remotas y salud digital',
  },
  'EU MDR 2017/745': {
    en: 'EU Medical Devices Regulation — CE marking, clinical evaluation, and post-market surveillance for SaMD',
    es: 'Reglamento de Dispositivos Médicos (UE) — Marcado CE, evaluación clínica y vigilancia post-comercialización para SaMD',
  },
  'EU AI Act (Alto Riesgo)': {
    en: 'EU AI Act High-Risk — Mandatory requirements for AI systems in healthcare (Annex III)',
    es: 'Ley de IA de la UE Alto Riesgo — Requisitos obligatorios para sistemas de IA en salud (Anexo III)',
  },
  'MDCG 2019-11': {
    en: 'EU Medical Device Coordination Group — Guidance on qualification of software as medical device',
    es: 'Grupo de Coordinación de Dispositivos Médicos (UE) — Guía sobre calificación de software como dispositivo médico',
  },
  // ── Healthcare (new blueprints) ──
  'EMTALA': {
    en: 'Emergency Medical Treatment & Labor Act — Mandatory emergency screening and stabilization regardless of ability to pay',
    es: 'Ley EMTALA — Screening de emergencia obligatorio y estabilización independientemente de la capacidad de pago',
  },
  'CMS Guidelines': {
    en: 'Centers for Medicare & Medicaid Services — Coverage, billing, and quality reporting standards',
    es: 'Directrices CMS — Estándares de cobertura, facturación y reporte de calidad',
  },
  'ERISA': {
    en: 'Employee Retirement Income Security Act — Regulation of employer-sponsored health plans and benefits',
    es: 'Ley ERISA — Regulación de planes de salud y beneficios patrocinados por empleadores',
  },
  'GINA': {
    en: 'Genetic Information Nondiscrimination Act — Protection against genetic information discrimination in health insurance',
    es: 'Ley GINA — Protección contra discriminación por información genética en seguros de salud',
  },
  'FDA Pharmacogenomics': {
    en: 'FDA Pharmacogenomic Guidance — Biomarker-guided drug labeling and companion diagnostics',
    es: 'Guía FDA Farmacogenómica — Etiquetado de fármacos guiado por biomarcadores y diagnósticos complementarios',
  },
  'EMA Guidelines': {
    en: 'European Medicines Agency — Guidelines for AI/ML in drug development and clinical trials',
    es: 'Agencia Europea de Medicamentos — Directrices de IA/ML en desarrollo de fármacos y ensayos clínicos',
  },
  'ICH Q8-Q12': {
    en: 'International Council for Harmonisation — Pharmaceutical development, quality risk management, and lifecycle standards',
    es: 'Consejo Internacional de Armonización — Desarrollo farmacéutico, gestión de riesgos de calidad y estándares de ciclo de vida',
  },
  'ANMAT Disp. 2819/2004': {
    en: 'Argentine ANMAT Regulation — Pharmaceutical product registration and pharmacovigilance',
    es: 'Disposición ANMAT 2819/2004 — Registro de productos farmacéuticos y farmacovigilancia',
  },
  'ONC Cures Act': {
    en: 'ONC 21st Century Cures Act — Health data interoperability, information blocking prevention, and FHIR API requirements',
    es: 'ONC Ley Cures del Siglo 21 — Interoperabilidad de datos de salud, prevención de bloqueo de información y requisitos API FHIR',
  },
  'HL7 FHIR R4': {
    en: 'Health Level Seven FHIR Release 4 — Standard for healthcare data exchange and interoperability',
    es: 'HL7 FHIR Release 4 — Estándar de intercambio de datos de salud e interoperabilidad',
  },
  'CMS Billing Rules': {
    en: 'CMS Billing & Coding Rules — Correct coding initiative, medical necessity, and reimbursement policies',
    es: 'Reglas de Facturación CMS — Iniciativa de codificación correcta, necesidad médica y políticas de reembolso',
  },
  'False Claims Act': {
    en: 'Federal False Claims Act — Liability for submitting fraudulent claims to government healthcare programs',
    es: 'Ley de Reclamaciones Falsas — Responsabilidad por presentar reclamos fraudulentos a programas de salud gubernamentales',
  },
  'Obras Sociales Res. 201/2002': {
    en: 'Argentine Social Works Resolution — Healthcare billing standards for social security insurance providers',
    es: 'Resolución Obras Sociales 201/2002 — Estándares de facturación de salud para obras sociales',
  },
}

function ComplianceModuleCard({ name }: { name: string }) {
  const { t, language } = useI18n()
  const description = complianceDescriptions[name]?.[language] || t('verticalPack.detail.complianceCovered')
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
      <BookOpen className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </div>
    </article>
  )
}

function ROIMetricCard({ metricKey, value }: { metricKey: string; value: unknown }) {
  const label = metricKey
    .replace(/_pct$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const displayValue = typeof value === 'number' ? `${value}%` : String(value)
  const isPercentage = typeof value === 'number'

  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-green-700">{displayValue}</p>
      {isPercentage && (
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(Number(value), 100)}%` }}
          />
        </div>
      )}
    </article>
  )
}
