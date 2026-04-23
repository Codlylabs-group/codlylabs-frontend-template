/**
 * ROI Oracle Types
 * Type definitions for ROI Oracle cases (400 cases)
 */

export interface ROICase {
  id: string;
  industry: string;
  subIndustry: string;
  useCase: string;
  companySize: 'SMB' | 'Mid-Market' | 'Enterprise';
  annualRevenue: number;
  employees: number;
  problem: string;
  solution: string;
  investment: {
    software: number;
    services: number;
    infrastructure: number;
    training: number;
    other: number;
    total: number;
  };
  benefits: {
    annualSavings: number;
    revenueIncrease: number;
    efficiencyGains: number;
    costAvoidance: number;
    total: number;
  };
  roi: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  paybackMonths: number;
  timeline: {
    poc: number;
    mvp: number;
    production: number;
  };
  confidence: number;
  dataSource: string;
  lastUpdated: string;
  tags: string[];
  customerInfo?: {
    name?: string;
    location?: string;
    testimonial?: string;
    revenue?: string;
    employees?: number;
  };
  similarCases: string[];
}
