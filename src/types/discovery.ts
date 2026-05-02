/**
 * Types for Discovery Agent (Module 1)
 * Based on: backend/app/schemas/discovery.py
 */

export interface Message {
  role: 'agent' | 'client';
  message: string;
  thought?: string;
  timestamp: string;
}

export interface OrganizationContext {
  industry: string;
  industry_confidence: number;
  company_size: 'SMB' | 'Mid-Market' | 'Enterprise' | 'Unknown';
  maturity_level: 'Low' | 'Medium' | 'High' | 'Unknown';
}

export interface VolumeIndicator {
  metric: string;
  value: number;
  unit: string;
}

export interface DataLandscape {
  data_types_mentioned: string[];
  data_sources: string[];
  data_quality?: string | null;
  volume_indicators?: VolumeIndicator;
}

export interface Constraints {
  budget_mentioned: boolean;
  budget_level: 'Limited' | 'Moderate' | 'Flexible' | 'Not Mentioned';
  timeline_mentioned: boolean;
  timeline?: string;
  compliance_requirements: string[];
  technical_constraints: string[];
}

export interface AdditionalContext {
  solutions_tried: string[];
  pain_points: string[];
  success_metrics: string[];
  stakeholders_mentioned: string[];
  expected_impact?: string | null;
}

export interface CurrentProcess {
  description: string;
  involved_roles: string[];
  tools_used: string[];
  workflow_steps: string[];
  time_cost?: string | null;
  monetary_cost?: string | null;
}

export interface PainPoint {
  description: string;
  impact: string;
  frequency: string;
}

export interface Stakeholder {
  role: string;
  involvement: string;
}

export interface ConversationMetadata {
  total_messages: number;
  client_provided_details: 'Comprehensive' | 'Moderate' | 'Minimal';
  confidence_score: number;
  missing_critical_info: string[];
}

export interface DetectedSignals {
  urgency_level: 'Low' | 'Medium' | 'High';
  budget_implied: 'Limited' | 'Moderate' | 'Flexible';
  technical_sophistication: 'Low' | 'Medium' | 'High';
  decision_stage: 'Exploring' | 'Evaluating' | 'Ready to implement';
}

export interface AgentPerformance {
  objectives_achieved: Record<string, boolean>;
  conversation_quality: Record<string, any>;
}

export interface DiscoverySummary {
  session_id: string;
  narrative: string;
  business_problem: string;
  business_objective: string;
  organization_context: OrganizationContext;
  data_landscape: DataLandscape;
  constraints: Constraints;
  current_process?: CurrentProcess | null;
  pain_points_detailed?: PainPoint[];
  stakeholders_detailed?: Stakeholder[];
  additional_context: AdditionalContext;
  conversation_metadata: ConversationMetadata;
  full_conversation: Message[];
  detected_signals: DetectedSignals;
  agent_performance: AgentPerformance;
  created_at: string;
  data_type?: string;
}

// API Request/Response Types

export interface StartDiscoveryRequest {
  initial_message: string;
  language?: string;
  // Opción B: vertical pre-seleccionada antes de arrancar el chat. Si llega,
  // queda fijada en la session y el pre-gen la usa sin invalidación posterior.
  selected_vertical?: string;
}

export interface ContinueDiscoveryRequest {
  session_id: string;
  user_message: string;
  language?: string;
}

export interface ConfirmSynthesisRequest {
  session_id: string;
  user_confirmation: string;
  user_corrections?: string;
  language?: string;
}

export interface DiscoveryProgressResponse {
  objectives_achieved: Record<string, boolean>;
  estimated_completion: string;
}

export interface DiscoveryResponse {
  session_id: string;
  agent_response: string;
  agent_thought?: string;
  status: 'in_progress' | 'ready_for_confirmation' | 'completed' | 'completed_with_low_confidence';
  progress?: DiscoveryProgressResponse;
  discovery_summary?: DiscoverySummary;
  next_step?: string;
  warning?: string;
}

export interface SynthesisResponse {
  session_id: string;
  synthesis_narrative: string;
  synthesis_data: Record<string, any>;
  confidence_score: number;
  missing_info: string[];
}
