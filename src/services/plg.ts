/**
 * PLG (Product-Led Growth) Service
 * Phase 3 - Game Changer #1
 *
 * Service for free diagnostic API calls
 */

import { api } from './api';

export interface FreeDiagnosticRequest {
  industry: string;
  company_size: string;
  business_problem: string;
  email?: string;
  company_name?: string;
  language?: 'en' | 'es';
}

export interface ROIPrediction {
  conservative: {
    roi_percent: number;
    annual_savings: number;
    investment_cost: number;
  };
  realistic: {
    roi_percent: number;
    annual_savings: number;
    investment_cost: number;
  };
  optimistic: {
    roi_percent: number;
    annual_savings: number;
    investment_cost: number;
  };
  confidence_score: number;
  based_on_cases: number;
  payback_period_months: number;
  roi_reference?: string;
}

export interface RecommendedPOC {
  use_case_id: string;
  title: string;
  description: string;
  estimated_roi: string;
  payback_months?: number;
  complexity: string;
  key_benefits: string[];
  tech_stack: string[];
  development_timeline?: string;
}

export interface ROIMethodology {
  calculation_steps: string[];
  assumptions: string[];
  evidence_quality: string;
  total_matching_cases: number;
  cases_with_roi_evidence: number;
  cases_with_payback_evidence: number;
  roi_data_points: number;
  payback_data_points: number;
  base_investment_usd: number;
  weighted_mean_roi_percent: number;
  weighted_std_roi_percent: number;
  estimated_payback_mean_months: number;
  external_citations_requested: number;
  external_citations_found: number;
  external_citations_provider: string;
  model_version: string;
}

export interface ExternalCitation {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  published_date?: string;
  search_query?: string;
  citation_confidence?: number;
  retrieved_at?: string;
}

export interface ROISourceCase {
  use_case_id: string;
  title: string;
  match_score: number;
  industries: string[];
  roi_indicators: Record<string, string>;
  kpi_targets: string[];
  timeline: Record<string, string>;
  evidence_used: string[];
  roi_weight_used?: number | null;
  payback_weight_used?: number | null;
  estimated_roi_percent?: number | null;
  estimated_payback_months?: number | null;
  external_citation?: ExternalCitation | null;
}

export interface FreeDiagnosticResponse {
  diagnostic_id: string;
  timestamp: string;
  industry: string;
  company_size: string;
  business_problem: string;
  roi_prediction: ROIPrediction;
  roi_methodology: ROIMethodology;
  roi_sources: ROISourceCase[];
  recommended_pocs: RecommendedPOC[];
  market_insights: string;
  success_factors: string[];
  common_risks: string[];
  next_steps: string;
  cta_message: string;
  cta_link: string;
  pdf_report_url?: string;
}

export interface IndustryInfo {
  name: string;
  count: number;
}

export interface PLGStats {
  total_diagnostics: number;
  avg_roi_predicted: string | null;
  avg_payback_months: number | null;
  total_use_cases: number;
  roi_benchmarks: number;
  industries_covered: number;
  most_popular_industries: Array<{
    name: string;
    diagnostics: number;
  }>;
  confidence_score_avg: number | null;
  conversion_rate: string | null;
  last_updated: string;
}

export interface DemoRequest {
  diagnostic_id?: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  preferred_date?: string;
  notes?: string;
  language?: 'en' | 'es';
}

export interface DemoRequestResponse {
  success: boolean;
  message: string;
  lead_id: string;
  next_steps: string;
}

export interface ROIOracleEvidenceSource {
  use_case_id: string;
  title: string;
  match_score: number;
  evidence_used: string[];
  roi_weight_used?: number | null;
  payback_weight_used?: number | null;
  estimated_roi_percent?: number | null;
  estimated_payback_months?: number | null;
  citation: ExternalCitation;
}

export interface ROIOracleCase {
  diagnostic_id: string;
  timestamp: string;
  industry: string;
  company_size: string;
  business_problem: string;
  title: string;
  summary: string;
  roi_min_percent: number;
  roi_realistic_percent: number;
  roi_max_percent: number;
  payback_months?: number | null;
  estimated_investment_usd?: number | null;
  implementation_timeline?: string | null;
  timeline?: string | null;
  technologies: string[];
  risk_level: 'Low' | 'Medium' | 'High' | string;
  confidence_label: 'Low' | 'Medium' | 'High' | string;
  confidence_score: number;
  evidence_quality: string;
  methodology_steps: string[];
  assumptions: string[];
  evidence_sources: ROIOracleEvidenceSource[];
}

export interface ROIOracleResponse {
  total_real_cases: number;
  returned_cases: number;
  avg_realistic_roi_percent?: number | null;
  avg_payback_months?: number | null;
  cases: ROIOracleCase[];
}

// Phase 8: Anonymous generation types
export interface AnonymousGenerateRequest {
  prompt: string;
  language?: 'en' | 'es';
  template_id?: string;
  generation_mode?: 'auto' | 'app' | 'poc';
  vertical?: 'fintech' | 'retail' | 'healthcare' | 'general';
}

export interface AnonymousGenerateResponse {
  anon_session_id: string;
  poc_id: string;
  session_id: string;
  status: 'generating' | 'ready' | 'failed';
  preview_url?: string;
  share_slug?: string;
  share_url?: string;
  message?: string;
}

export interface LinkSessionResponse {
  linked: boolean;
  poc_id: string;
  session_id: string;
  message: string;
}

class PLGService {
  /**
   * Get free ROI diagnostic (no authentication required)
   */
  async getFreeDiagnostic(request: FreeDiagnosticRequest): Promise<FreeDiagnosticResponse> {
    const response = await api.post<FreeDiagnosticResponse>('/api/v1/plg/free-diagnostic', request);
    return response.data;
  }

  /**
   * Smart Consultant: Infer context from text/url
   */
  async smartInfer(text: string, url?: string): Promise<Partial<FreeDiagnosticRequest> & { use_case_hint?: string }> {
    const response = await api.post('/api/v1/plg/smart-infer', { text, url });
    return response.data;
  }

  /**
   * Get list of supported industries
   */
  async getIndustries(): Promise<{
    total_industries: number;
    industries: IndustryInfo[];
    total_use_cases: number;
  }> {
    const response = await api.get('/api/v1/plg/industries');
    return response.data;
  }

  /**
   * Get PLG statistics for landing page
   */
  async getStats(): Promise<PLGStats> {
    const response = await api.get<PLGStats>('/api/v1/plg/stats');
    return response.data;
  }

  /**
   * Get ROI Oracle cases backed by real diagnostics and external citations.
   */
  async getROIOracleCases(params?: { limit?: number; industry?: string }): Promise<ROIOracleResponse> {
    const response = await api.get<ROIOracleResponse>('/api/v1/plg/roi-oracle', { params });
    return response.data;
  }

  /**
   * Request a personalized demo
   */
  async requestDemo(request: DemoRequest): Promise<DemoRequestResponse> {
    const response = await api.post<DemoRequestResponse>('/api/v1/plg/request-demo', request);
    return response.data;
  }

  /**
   * Download PDF report for diagnostic
   */
  downloadReport(diagnosticId: string): void {
    window.open(`${api.defaults.baseURL}/api/v1/plg/download-report/${diagnosticId}`, '_blank');
  }

  // ─── Phase 8: Anonymous generation ──────────────────────

  /**
   * Generate a PoC anonymously (no auth required)
   */
  async anonymousGenerate(data: AnonymousGenerateRequest): Promise<AnonymousGenerateResponse> {
    const response = await api.post<AnonymousGenerateResponse>(
      '/api/v1/plg/anonymous-generate',
      data,
      { timeout: 20000 },
    );
    return response.data;
  }

  /**
   * Poll status of an anonymous generation
   */
  async anonymousStatus(anonSessionId: string): Promise<AnonymousGenerateResponse> {
    const response = await api.get<AnonymousGenerateResponse>(
      `/api/v1/plg/anonymous-generate/${anonSessionId}/status`
    );
    return response.data;
  }

  /**
   * Link an anonymous session to the current authenticated user
   */
  async linkSession(anonSessionId: string): Promise<LinkSessionResponse> {
    const response = await api.post<LinkSessionResponse>('/api/v1/plg/link-session', {
      anon_session_id: anonSessionId,
    });
    return response.data;
  }

  // ─── Anonymous Editor ──────────────────────────────────────

  /**
   * Get anonymous editor session info (interactions, preview_url, etc.)
   */
  async anonymousEditorInfo(anonSessionId: string): Promise<{
    poc_id: string
    preview_url: string | null
    prompt: string
    interaction_count: number
    max_interactions: number
    status: string
  }> {
    const response = await api.get(`/api/v1/plg/anonymous-editor/${anonSessionId}/info`)
    return response.data
  }

  /**
   * Chat with the AI agent anonymously (limited to N interactions)
   */
  async anonymousEditorChat(
    anonSessionId: string,
    message: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<{
    success: boolean
    message: string
    files_modified: string[]
    files_created: string[]
    suggestions: string[]
    errors: string[]
    interaction_count: number
    max_interactions: number
  }> {
    const response = await api.post(`/api/v1/plg/anonymous-editor/${anonSessionId}/chat`, {
      message,
      conversation_history: conversationHistory || [],
    })
    return response.data
  }

  /**
   * Track a funnel event (fire-and-forget, no auth)
   */
  trackFunnelEvent(event: string, anonSessionId?: string): void {
    api.post('/api/v1/plg/funnel/event', {
      event,
      anon_session_id: anonSessionId,
    }).catch(() => {/* silent */});
  }
}

export const plgService = new PLGService();
export default plgService;
