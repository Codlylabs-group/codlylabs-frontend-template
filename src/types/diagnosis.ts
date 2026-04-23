/**
 * Types for Reasoning Agent Diagnosis (Module 2)
 * Based on: backend/app/schemas/diagnosis.py
 */

export type ComplexityLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';

export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type UseCaseCategory =
  | 'generation'
  | 'automation'
  | 'analysis'
  | 'prediction'
  | 'vision'
  | 'audio'
  | 'multimodal'
  | 'agents';

export interface KPI {
  metric: string;
  baseline: string;
  target: string;
  measurement: string;
  timeline?: string;
}

export interface Risk {
  risk: string;
  mitigation: string;
  severity: RiskSeverity;
}

export interface AlternativeConsidered {
  option: string;
  why_considered?: string;
  why_not_final: string;
}

export interface ComplexityBreakdown {
  technical: ComplexityLevel;
  organizational: ComplexityLevel;
  data: ComplexityLevel;
  integration: ComplexityLevel;
}

export interface OrganizationalRequirements {
  team: string;
  data_access: string;
  infrastructure: string;
  business_involvement: string;
  compliance?: string;
}

export interface ReasoningOutput {
  reasoning_agent_version: string;
  generated_at: string;

  reasoning: Record<string, string>;

  use_case_title: string;
  use_case_description: string;
  category: string;
  is_hybrid: boolean;

  tech_stack: Record<string, string[]>;
  kpis: KPI[];
  complexity: ComplexityBreakdown;
  estimated_timeline: Record<string, string>;
  risks: Risk[];
  alternatives_considered: AlternativeConsidered[];
  organizational_requirements: OrganizationalRequirements;

  deployment_mode?: string;
  missing_information?: string[];
  next_steps_before_implementation?: string[];

  confidence_score: number;
  confidence_reasoning: string;

  client_proposed_solution?: string;
  client_solution_validation?: Record<string, any>;
}

export interface DiagnosisResponse {
  session_id: string;
  diagnosis: ReasoningOutput;
  processing_time_seconds?: number;
}

