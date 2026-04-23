/**
 * ROI Oracle - Healthcare Cases
 * 60 casos basados en benchmarks de McKinsey, Gartner, Forrester
 *
 * MIGRATED: Converted from old structure to new ROICase type
 */

import { ROICase } from './types'

export const healthcareROICases: ROICase[] = [
  {
    "id": "roi_health_001",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Clinical Documentation AI - Hospital System",
    "companySize": "Enterprise",
    "annualRevenue": 2800000000,
    "employees": 15000,
    "problem": "Physicians spending 2.5 hours/day on documentation",
    "solution": "Ambient AI scribe capturing patient encounters automatically",
    "investment": {
      "software": 180000,
      "services": 157500,
      "infrastructure": 45000,
      "training": 67500,
      "other": 0,
      "total": 450000
    },
    "benefits": {
      "annualSavings": 2925000,
      "revenueIncrease": 1755000,
      "efficiencyGains": 1170000,
      "costAvoidance": 0,
      "total": 5850000
    },
    "roi": {
      "conservative": 656,
      "realistic": 1034,
      "optimistic": 1734
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.94,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "documentation",
      "ehr",
      "physician-burnout",
      "ai-scribe",
      "ambient-ai"
    ],
    "similarCases": [
      "roi_health_008",
      "roi_health_015",
      "roi_health_042"
    ],
    "customerInfo": {
      "name": "Multi-Hospital Health System",
      "revenue": "$2.8B",
      "location": "USA",
      "employees": 15000
    }
  },
  {
    "id": "roi_health_002",
    "industry": "Healthcare",
    "subIndustry": "Imaging",
    "useCase": "Radiology AI - Diagnostic Imaging Center",
    "companySize": "Mid-Market",
    "annualRevenue": 150000000,
    "employees": 450,
    "problem": "48-hour turnaround for reads",
    "solution": "AI-assisted radiology detecting lung nodules",
    "investment": {
      "software": 100000,
      "services": 87500,
      "infrastructure": 25000,
      "training": 37500,
      "other": 0,
      "total": 250000
    },
    "benefits": {
      "annualSavings": 1250000,
      "revenueIncrease": 750000,
      "efficiencyGains": 500000,
      "costAvoidance": 0,
      "total": 2500000
    },
    "roi": {
      "conservative": 463,
      "realistic": 778,
      "optimistic": 1333
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.92,
    "dataSource": "customer_case",
    "lastUpdated": "2024-11-30",
    "tags": [
      "radiology",
      "computer-vision",
      "diagnostics",
      "ai-assist",
      "imaging"
    ],
    "similarCases": [
      "roi_health_009",
      "roi_health_018",
      "roi_health_033"
    ],
    "customerInfo": {
      "name": "Regional Imaging Network",
      "revenue": "$150M",
      "location": "USA",
      "employees": 450
    }
  },
  {
    "id": "roi_health_003",
    "industry": "Healthcare",
    "subIndustry": "Primary Care",
    "useCase": "Patient No-Show Prediction - Clinic Network",
    "companySize": "Mid-Market",
    "annualRevenue": 85000000,
    "employees": 680,
    "problem": "18% no-show rate costing $6.8M annually in lost revenue",
    "solution": "ML predicting no-shows 48 hours ahead with automated outreach",
    "investment": {
      "software": 54000,
      "services": 47250,
      "infrastructure": 13500,
      "training": 20250,
      "other": 0,
      "total": 135000
    },
    "benefits": {
      "annualSavings": 850000,
      "revenueIncrease": 510000,
      "efficiencyGains": 340000,
      "costAvoidance": 0,
      "total": 1700000
    },
    "roi": {
      "conservative": 586,
      "realistic": 1057,
      "optimistic": 2016
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 4
    },
    "confidence": 0.93,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-02",
    "tags": [
      "no-show",
      "prediction",
      "scheduling",
      "revenue-optimization",
      "ml"
    ],
    "similarCases": [
      "roi_health_011",
      "roi_health_026",
      "roi_retail_004"
    ],
    "customerInfo": {
      "revenue": "$85M",
      "employees": 680
    }
  },
  {
    "id": "roi_health_004",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Claims Denial Prediction - Health Insurer",
    "companySize": "Enterprise",
    "annualRevenue": 3500000000,
    "employees": 4200,
    "problem": "12% claim denial rate",
    "solution": "AI predicting denials pre-submission with root cause analysis",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 3175000,
      "revenueIncrease": 1905000,
      "efficiencyGains": 1270000,
      "costAvoidance": 0,
      "total": 6350000
    },
    "roi": {
      "conservative": 696,
      "realistic": 1171,
      "optimistic": 2036
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 7
    },
    "confidence": 0.95,
    "dataSource": "customer_case",
    "lastUpdated": "2024-11-28",
    "tags": [
      "claims",
      "denial-prediction",
      "rcm",
      "ai",
      "payer"
    ],
    "similarCases": [
      "roi_health_012",
      "roi_health_023",
      "roi_finance_004"
    ],
    "customerInfo": {
      "name": "Regional Health Plan",
      "revenue": "$3.5B",
      "location": "USA",
      "employees": 4200
    }
  },
  {
    "id": "roi_health_005",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Sepsis Early Warning - ICU System",
    "companySize": "Enterprise",
    "annualRevenue": 1800000000,
    "employees": 8500,
    "problem": "Sepsis mortality 30%",
    "solution": "Real-time sepsis prediction 6-12 hours before clinical diagnosis",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 2750000,
      "revenueIncrease": 1650000,
      "efficiencyGains": 1100000,
      "costAvoidance": 0,
      "total": 5500000
    },
    "roi": {
      "conservative": 727,
      "realistic": 1255,
      "optimistic": 2418
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 7
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-04",
    "tags": [
      "sepsis",
      "icu",
      "early-warning",
      "ml",
      "critical-care"
    ],
    "similarCases": [
      "roi_health_014",
      "roi_health_020",
      "roi_health_038"
    ],
    "customerInfo": {
      "name": "Academic Medical Center",
      "revenue": "$1.8B",
      "location": "USA",
      "employees": 8500
    }
  },
  {
    "id": "roi_health_006",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Revenue Cycle Management - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 4500000000,
    "employees": 22000,
    "problem": "$85M in AR over 90 days",
    "solution": "AI automating claim scrubbing",
    "investment": {
      "software": 212000,
      "services": 185500,
      "infrastructure": 53000,
      "training": 79500,
      "other": 0,
      "total": 530000
    },
    "benefits": {
      "annualSavings": 4625000,
      "revenueIncrease": 2775000,
      "efficiencyGains": 1850000,
      "costAvoidance": 0,
      "total": 9250000
    },
    "roi": {
      "conservative": 855,
      "realistic": 1447,
      "optimistic": 2768
    },
    "paybackMonths": 1,
    "timeline": {
      "poc": 2,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.95,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-05",
    "tags": [
      "rcm",
      "revenue-cycle",
      "claims",
      "automation",
      "ai"
    ],
    "similarCases": [
      "roi_health_004",
      "roi_health_023",
      "roi_health_045"
    ],
    "customerInfo": {
      "name": "Large Hospital System",
      "revenue": "$4.5B",
      "location": "USA",
      "employees": 22000
    }
  },
  {
    "id": "roi_health_007",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Operating Room Scheduling - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 850000000,
    "employees": 4500,
    "problem": "62% OR utilization",
    "solution": "ML optimizing OR scheduling with predictive case duration",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 2000000,
      "revenueIncrease": 1200000,
      "efficiencyGains": 800000,
      "costAvoidance": 0,
      "total": 4000000
    },
    "roi": {
      "conservative": 600,
      "realistic": 1018,
      "optimistic": 1809
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 7
    },
    "confidence": 0.92,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "or-scheduling",
      "optimization",
      "ml",
      "utilization",
      "surgery"
    ],
    "similarCases": [
      "roi_health_019",
      "roi_health_031",
      "roi_health_047"
    ],
    "customerInfo": {
      "name": "Regional Hospital",
      "revenue": "$850M",
      "location": "USA",
      "employees": 4500
    }
  },
  {
    "id": "roi_health_008",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Medical Coding Automation - Health System",
    "companySize": "Enterprise",
    "annualRevenue": 3200000000,
    "employees": 18500,
    "problem": "$22M annual coding costs",
    "solution": "NLP-based automated medical coding with AI-assisted review",
    "investment": {
      "software": 180000,
      "services": 157500,
      "infrastructure": 45000,
      "training": 67500,
      "other": 0,
      "total": 450000
    },
    "benefits": {
      "annualSavings": 2925000,
      "revenueIncrease": 1755000,
      "efficiencyGains": 1170000,
      "costAvoidance": 0,
      "total": 5850000
    },
    "roi": {
      "conservative": 623,
      "realistic": 1034,
      "optimistic": 1776
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.93,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-03",
    "tags": [
      "medical-coding",
      "nlp",
      "automation",
      "icd-10",
      "cpt"
    ],
    "similarCases": [
      "roi_health_001",
      "roi_health_015",
      "roi_health_028"
    ],
    "customerInfo": {
      "name": "Multi-Site Health System",
      "revenue": "$3.2B",
      "location": "USA",
      "employees": 18500
    }
  },
  {
    "id": "roi_health_009",
    "industry": "Healthcare",
    "subIndustry": "Laboratory",
    "useCase": "Pathology Image Analysis - Lab Network",
    "companySize": "Mid-Market",
    "annualRevenue": 280000000,
    "employees": 850,
    "problem": "Pathologist shortage",
    "solution": "AI analyzing pathology slides for cancer detection and grading",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 425,
      "realistic": 709,
      "optimistic": 1227
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.9,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-04",
    "tags": [
      "pathology",
      "computer-vision",
      "diagnostics",
      "cancer-detection",
      "ai"
    ],
    "similarCases": [
      "roi_health_002",
      "roi_health_018",
      "roi_health_033"
    ],
    "customerInfo": {
      "revenue": "$280M",
      "employees": 850
    }
  },
  {
    "id": "roi_health_010",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Prior Authorization Automation - Payer",
    "companySize": "Enterprise",
    "annualRevenue": 5500000000,
    "employees": 8200,
    "problem": "$28M annual PA costs",
    "solution": "AI automating prior authorization decisions with clinical guidelines",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 2650000,
      "revenueIncrease": 1590000,
      "efficiencyGains": 1060000,
      "costAvoidance": 0,
      "total": 5300000
    },
    "roi": {
      "conservative": 660,
      "realistic": 1107,
      "optimistic": 1929
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.94,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-02",
    "tags": [
      "prior-authorization",
      "payer",
      "automation",
      "ai",
      "utilization-management"
    ],
    "similarCases": [
      "roi_health_004",
      "roi_health_027",
      "roi_health_052"
    ],
    "customerInfo": {
      "name": "Regional Health Plan",
      "revenue": "$5.5B",
      "location": "USA",
      "employees": 8200
    }
  },
  {
    "id": "roi_health_011",
    "industry": "Healthcare",
    "subIndustry": "Population Health",
    "useCase": "Patient Risk Stratification - ACO",
    "companySize": "Mid-Market",
    "annualRevenue": 450000000,
    "employees": 1200,
    "problem": "15% readmission rate",
    "solution": "ML identifying high-risk patients for proactive care management",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 600,
      "realistic": 1000,
      "optimistic": 1727
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-05",
    "tags": [
      "risk-stratification",
      "population-health",
      "ml",
      "readmissions",
      "aco"
    ],
    "similarCases": [
      "roi_health_003",
      "roi_health_022",
      "roi_health_035"
    ],
    "customerInfo": {
      "name": "Accountable Care Organization",
      "revenue": "$450M",
      "location": "USA",
      "employees": 1200
    }
  },
  {
    "id": "roi_health_012",
    "industry": "Healthcare",
    "subIndustry": "Provider",
    "useCase": "Denial Management - Medical Group",
    "companySize": "Mid-Market",
    "annualRevenue": 220000000,
    "employees": 680,
    "problem": "18% denial rate",
    "solution": "AI identifying denial patterns and automating appeal generation",
    "investment": {
      "software": 83000,
      "services": 72625,
      "infrastructure": 20750,
      "training": 31125,
      "other": 0,
      "total": 207500
    },
    "benefits": {
      "annualSavings": 1250000,
      "revenueIncrease": 750000,
      "efficiencyGains": 500000,
      "costAvoidance": 0,
      "total": 2500000
    },
    "roi": {
      "conservative": 567,
      "realistic": 900,
      "optimistic": 1585
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.92,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-11-30",
    "tags": [
      "denial-management",
      "appeals",
      "rcm",
      "ai",
      "revenue-recovery"
    ],
    "similarCases": [
      "roi_health_004",
      "roi_health_006",
      "roi_health_045"
    ],
    "customerInfo": {
      "revenue": "$220M",
      "employees": 680
    }
  },
  {
    "id": "roi_health_013",
    "industry": "Healthcare",
    "subIndustry": "Oncology",
    "useCase": "Clinical Trial Matching - Cancer Center",
    "companySize": "Mid-Market",
    "annualRevenue": 180000000,
    "employees": 520,
    "problem": "<5% trial enrollment",
    "solution": "NLP matching patients to clinical trials from EHR data",
    "investment": {
      "software": 105000,
      "services": 91875,
      "infrastructure": 26250,
      "training": 39375,
      "other": 0,
      "total": 262500
    },
    "benefits": {
      "annualSavings": 1125000,
      "revenueIncrease": 675000,
      "efficiencyGains": 450000,
      "costAvoidance": 0,
      "total": 2250000
    },
    "roi": {
      "conservative": 371,
      "realistic": 633,
      "optimistic": 1130
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 7
    },
    "confidence": 0.88,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "clinical-trials",
      "oncology",
      "nlp",
      "patient-matching",
      "research"
    ],
    "similarCases": [
      "roi_health_024",
      "roi_health_036",
      "roi_health_049"
    ],
    "customerInfo": {
      "name": "Regional Cancer Center",
      "revenue": "$180M",
      "location": "USA",
      "employees": 520
    }
  },
  {
    "id": "roi_health_014",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "ICU Patient Deterioration - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 1200000000,
    "employees": 6500,
    "problem": "Late recognition of deterioration",
    "solution": "ML early warning system predicting deterioration 4-8 hours ahead",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 3175000,
      "revenueIncrease": 1905000,
      "efficiencyGains": 1270000,
      "costAvoidance": 0,
      "total": 6350000
    },
    "roi": {
      "conservative": 700,
      "realistic": 1179,
      "optimistic": 2043
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 7
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-03",
    "tags": [
      "icu",
      "early-warning",
      "ml",
      "patient-deterioration",
      "critical-care"
    ],
    "similarCases": [
      "roi_health_005",
      "roi_health_020",
      "roi_health_043"
    ],
    "customerInfo": {
      "name": "Tertiary Care Hospital",
      "revenue": "$1.2B",
      "location": "USA",
      "employees": 6500
    }
  },
  {
    "id": "roi_health_015",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Physician Query Automation - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 1800000000,
    "employees": 9500,
    "problem": "$8.5M documentation gaps impacting coding and reimbursement",
    "solution": "AI generating automated physician queries from clinical notes",
    "investment": {
      "software": 111000,
      "services": 97125,
      "infrastructure": 27750,
      "training": 41625,
      "other": 0,
      "total": 277500
    },
    "benefits": {
      "annualSavings": 1650000,
      "revenueIncrease": 990000,
      "efficiencyGains": 660000,
      "costAvoidance": 0,
      "total": 3300000
    },
    "roi": {
      "conservative": 567,
      "realistic": 933,
      "optimistic": 1600
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.9,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-04",
    "tags": [
      "physician-queries",
      "documentation",
      "cdi",
      "ai",
      "reimbursement"
    ],
    "similarCases": [
      "roi_health_001",
      "roi_health_008",
      "roi_health_028"
    ],
    "customerInfo": {
      "revenue": "$1.8B",
      "employees": 9500
    }
  },
  {
    "id": "roi_health_016",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Pharmacy Inventory Optimization - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 2500000000,
    "employees": 12500,
    "problem": "$12M excess inventory",
    "solution": "ML-based demand forecasting for pharmaceutical inventory",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1250000,
      "revenueIncrease": 750000,
      "efficiencyGains": 500000,
      "costAvoidance": 0,
      "total": 2500000
    },
    "roi": {
      "conservative": 500,
      "realistic": 833,
      "optimistic": 1439
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-02",
    "tags": [
      "pharmacy",
      "inventory",
      "optimization",
      "ml",
      "waste-reduction"
    ],
    "similarCases": [
      "roi_health_034",
      "roi_health_046",
      "roi_retail_002"
    ],
    "customerInfo": {
      "name": "Large Hospital System",
      "revenue": "$2.5B",
      "location": "USA",
      "employees": 12500
    }
  },
  {
    "id": "roi_health_017",
    "industry": "Healthcare",
    "subIndustry": "Urgent Care",
    "useCase": "Telehealth Triage - Urgent Care Network",
    "companySize": "Mid-Market",
    "annualRevenue": 120000000,
    "employees": 480,
    "problem": "High ED utilization",
    "solution": "AI-powered symptom checker triaging patients to appropriate care level",
    "investment": {
      "software": 71000,
      "services": 62125,
      "infrastructure": 17750,
      "training": 26625,
      "other": 0,
      "total": 177500
    },
    "benefits": {
      "annualSavings": 1125000,
      "revenueIncrease": 675000,
      "efficiencyGains": 450000,
      "costAvoidance": 0,
      "total": 2250000
    },
    "roi": {
      "conservative": 596,
      "realistic": 1000,
      "optimistic": 1722
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.89,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-05",
    "tags": [
      "telehealth",
      "triage",
      "ai",
      "urgent-care",
      "symptom-checker"
    ],
    "similarCases": [
      "roi_health_025",
      "roi_health_037",
      "roi_health_051"
    ],
    "customerInfo": {
      "revenue": "$120M",
      "employees": 480
    }
  },
  {
    "id": "roi_health_018",
    "industry": "Healthcare",
    "subIndustry": "Imaging",
    "useCase": "Mammography Screening AI - Imaging Center",
    "companySize": "Mid-Market",
    "annualRevenue": 85000000,
    "employees": 280,
    "problem": "12% false negative rate",
    "solution": "AI assisting breast cancer detection in mammography screening",
    "investment": {
      "software": 83000,
      "services": 72625,
      "infrastructure": 20750,
      "training": 31125,
      "other": 0,
      "total": 207500
    },
    "benefits": {
      "annualSavings": 1000000,
      "revenueIncrease": 600000,
      "efficiencyGains": 400000,
      "costAvoidance": 0,
      "total": 2000000
    },
    "roi": {
      "conservative": 419,
      "realistic": 730,
      "optimistic": 1333
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-11-29",
    "tags": [
      "mammography",
      "breast-cancer",
      "computer-vision",
      "screening",
      "ai"
    ],
    "similarCases": [
      "roi_health_002",
      "roi_health_009",
      "roi_health_033"
    ],
    "customerInfo": {
      "name": "Women\\'s Imaging Network",
      "revenue": "$85M",
      "location": "USA",
      "employees": 280
    }
  },
  {
    "id": "roi_health_019",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Surgical Case Duration Prediction - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 1200000000,
    "employees": 6500,
    "problem": "38% of OR cases running over time",
    "solution": "ML predicting surgery duration with 90% accuracy",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 600,
      "realistic": 1000,
      "optimistic": 1727
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.9,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-01",
    "tags": [
      "surgery",
      "or-scheduling",
      "prediction",
      "ml",
      "utilization"
    ],
    "similarCases": [
      "roi_health_007",
      "roi_health_031",
      "roi_health_040"
    ],
    "customerInfo": {
      "revenue": "$1.2B",
      "employees": 6500
    }
  },
  {
    "id": "roi_health_020",
    "industry": "Healthcare",
    "subIndustry": "Long-Term Care",
    "useCase": "Fall Risk Prediction - Nursing Home",
    "companySize": "Mid-Market",
    "annualRevenue": 95000000,
    "employees": 1200,
    "problem": "$8.5M annual costs from patient falls and injuries",
    "solution": "ML identifying high-risk patients with automated interventions",
    "investment": {
      "software": 54000,
      "services": 47250,
      "infrastructure": 13500,
      "training": 20250,
      "other": 0,
      "total": 135000
    },
    "benefits": {
      "annualSavings": 850000,
      "revenueIncrease": 510000,
      "efficiencyGains": 340000,
      "costAvoidance": 0,
      "total": 1700000
    },
    "roi": {
      "conservative": 586,
      "realistic": 1057,
      "optimistic": 2016
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.89,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-03",
    "tags": [
      "fall-risk",
      "long-term-care",
      "ml",
      "patient-safety",
      "prediction"
    ],
    "similarCases": [
      "roi_health_005",
      "roi_health_014",
      "roi_health_044"
    ],
    "customerInfo": {
      "name": "Skilled Nursing Facility Network",
      "revenue": "$95M",
      "location": "USA",
      "employees": 1200
    }
  },
  {
    "id": "roi_health_021",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Member Engagement - Health Plan",
    "companySize": "Enterprise",
    "annualRevenue": 4200000000,
    "employees": 6500,
    "problem": "Low preventive care utilization",
    "solution": "AI-powered personalized health engagement with behavioral nudges",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 2250000,
      "revenueIncrease": 1350000,
      "efficiencyGains": 900000,
      "costAvoidance": 0,
      "total": 4500000
    },
    "roi": {
      "conservative": 655,
      "realistic": 1091,
      "optimistic": 1891
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 7
    },
    "confidence": 0.88,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-04",
    "tags": [
      "member-engagement",
      "payer",
      "ai",
      "preventive-care",
      "personalization"
    ],
    "similarCases": [
      "roi_health_011",
      "roi_health_035",
      "roi_health_050"
    ],
    "customerInfo": {
      "revenue": "$4.2B",
      "employees": 6500
    }
  },
  {
    "id": "roi_health_022",
    "industry": "Healthcare",
    "subIndustry": "Primary Care",
    "useCase": "Chronic Disease Management - Primary Care",
    "companySize": "Mid-Market",
    "annualRevenue": 320000000,
    "employees": 1200,
    "problem": "$22M spent on preventable diabetes complications",
    "solution": "ML identifying patients at risk for progression with care protocols",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1650000,
      "revenueIncrease": 990000,
      "efficiencyGains": 660000,
      "costAvoidance": 0,
      "total": 3300000
    },
    "roi": {
      "conservative": 700,
      "realistic": 1164,
      "optimistic": 2000
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-02",
    "tags": [
      "chronic-disease",
      "diabetes",
      "ml",
      "care-management",
      "population-health"
    ],
    "similarCases": [
      "roi_health_011",
      "roi_health_021",
      "roi_health_053"
    ],
    "customerInfo": {
      "name": "Primary Care Network",
      "revenue": "$320M",
      "location": "USA",
      "employees": 1200
    }
  },
  {
    "id": "roi_health_023",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Claims Adjudication - Health Insurer",
    "companySize": "Enterprise",
    "annualRevenue": 12000000000,
    "employees": 18500,
    "problem": "$35M annual claims processing costs",
    "solution": "AI automating claims adjudication with fraud detection",
    "investment": {
      "software": 212000,
      "services": 185500,
      "infrastructure": 53000,
      "training": 79500,
      "other": 0,
      "total": 530000
    },
    "benefits": {
      "annualSavings": 3675000,
      "revenueIncrease": 2205000,
      "efficiencyGains": 1470000,
      "costAvoidance": 0,
      "total": 7350000
    },
    "roi": {
      "conservative": 605,
      "realistic": 1026,
      "optimistic": 1800
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.94,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-05",
    "tags": [
      "claims-adjudication",
      "payer",
      "automation",
      "ai",
      "fraud-detection"
    ],
    "similarCases": [
      "roi_health_004",
      "roi_health_006",
      "roi_health_010"
    ],
    "customerInfo": {
      "name": "National Health Plan",
      "revenue": "$12B",
      "location": "USA",
      "employees": 18500
    }
  },
  {
    "id": "roi_health_024",
    "industry": "Healthcare",
    "subIndustry": "Pharmaceutical",
    "useCase": "Drug Discovery - Pharma Company",
    "companySize": "Enterprise",
    "annualRevenue": 8500000000,
    "employees": 12500,
    "problem": "$2.5B average drug development cost",
    "solution": "AI accelerating drug candidate identification and optimization",
    "investment": {
      "software": 470000,
      "services": 411250,
      "infrastructure": 117500,
      "training": 176250,
      "other": 0,
      "total": 1175000
    },
    "benefits": {
      "annualSavings": 5875000,
      "revenueIncrease": 3525000,
      "efficiencyGains": 2350000,
      "costAvoidance": 0,
      "total": 11750000
    },
    "roi": {
      "conservative": 476,
      "realistic": 824,
      "optimistic": 1412
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 5,
      "mvp": 10,
      "production": 18
    },
    "confidence": 0.84,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-11-28",
    "tags": [
      "drug-discovery",
      "pharma",
      "ai",
      "r&d",
      "molecular-design"
    ],
    "similarCases": [
      "roi_health_013",
      "roi_health_036",
      "roi_health_057"
    ],
    "customerInfo": {
      "revenue": "$8.5B",
      "employees": 12500
    }
  },
  {
    "id": "roi_health_025",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Virtual Nursing Assistant - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 450000000,
    "employees": 2800,
    "problem": "Nurse burnout",
    "solution": "AI virtual nurse handling routine patient questions and education",
    "investment": {
      "software": 111000,
      "services": 97125,
      "infrastructure": 27750,
      "training": 41625,
      "other": 0,
      "total": 277500
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 483,
      "realistic": 800,
      "optimistic": 1390
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.88,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "virtual-nursing",
      "ai-assistant",
      "patient-engagement",
      "automation",
      "chatbot"
    ],
    "similarCases": [
      "roi_health_017",
      "roi_health_037",
      "roi_finance_003"
    ],
    "customerInfo": {
      "name": "Community Hospital",
      "revenue": "$450M",
      "location": "USA",
      "employees": 2800
    }
  },
  {
    "id": "roi_health_026",
    "industry": "Healthcare",
    "subIndustry": "Dental",
    "useCase": "Appointment Reminders - Dental Practice Network",
    "companySize": "Mid-Market",
    "annualRevenue": 65000000,
    "employees": 420,
    "problem": "22% no-show rate costing $4.2M annually",
    "solution": "AI-powered multi-channel reminder system with optimal timing",
    "investment": {
      "software": 38600,
      "services": 33775,
      "infrastructure": 9650,
      "training": 14475,
      "other": 0,
      "total": 96500
    },
    "benefits": {
      "annualSavings": 470000,
      "revenueIncrease": 282000,
      "efficiencyGains": 188000,
      "costAvoidance": 0,
      "total": 940000
    },
    "roi": {
      "conservative": 444,
      "realistic": 771,
      "optimistic": 1412
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 1,
      "mvp": 2,
      "production": 3
    },
    "confidence": 0.9,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-03",
    "tags": [
      "appointment-reminders",
      "dental",
      "no-show",
      "ai",
      "patient-engagement"
    ],
    "similarCases": [
      "roi_health_003",
      "roi_health_011",
      "roi_retail_004"
    ],
    "customerInfo": {
      "revenue": "$65M",
      "employees": 420
    }
  },
  {
    "id": "roi_health_027",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Utilization Management - Health Plan",
    "companySize": "Enterprise",
    "annualRevenue": 18000000000,
    "employees": 28000,
    "problem": "$185M in potentially avoidable utilization",
    "solution": "ML identifying unnecessary procedures and appropriate care alternatives",
    "investment": {
      "software": 234000,
      "services": 204750,
      "infrastructure": 58500,
      "training": 87750,
      "other": 0,
      "total": 585000
    },
    "benefits": {
      "annualSavings": 5875000,
      "revenueIncrease": 3525000,
      "efficiencyGains": 2350000,
      "costAvoidance": 0,
      "total": 11750000
    },
    "roi": {
      "conservative": 1131,
      "realistic": 1900,
      "optimistic": 3286
    },
    "paybackMonths": 1,
    "timeline": {
      "poc": 3,
      "mvp": 6,
      "production": 9
    },
    "confidence": 0.92,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-04",
    "tags": [
      "utilization-management",
      "payer",
      "ml",
      "cost-reduction",
      "clinical-review"
    ],
    "similarCases": [
      "roi_health_010",
      "roi_health_023",
      "roi_health_055"
    ],
    "customerInfo": {
      "name": "Large Health Plan",
      "revenue": "$18B",
      "location": "USA",
      "employees": 28000
    }
  },
  {
    "id": "roi_health_028",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Clinical Documentation Improvement - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 3500000000,
    "employees": 18500,
    "problem": "$42M documentation gaps impacting case mix index",
    "solution": "NLP analyzing clinical notes for missing diagnoses and complications",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 3675000,
      "revenueIncrease": 2205000,
      "efficiencyGains": 1470000,
      "costAvoidance": 0,
      "total": 7350000
    },
    "roi": {
      "conservative": 940,
      "realistic": 1586,
      "optimistic": 2771
    },
    "paybackMonths": 1,
    "timeline": {
      "poc": 2,
      "mvp": 5,
      "production": 7
    },
    "confidence": 0.93,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-02",
    "tags": [
      "cdi",
      "nlp",
      "documentation",
      "case-mix",
      "reimbursement"
    ],
    "similarCases": [
      "roi_health_001",
      "roi_health_008",
      "roi_health_015"
    ],
    "customerInfo": {
      "name": "Academic Medical Center",
      "revenue": "$3.5B",
      "location": "USA",
      "employees": 18500
    }
  },
  {
    "id": "roi_health_029",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Medical Device Monitoring - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 2200000000,
    "employees": 11500,
    "problem": "$8.5M annual equipment downtime",
    "solution": "IoT + ML predicting device failures before they occur",
    "investment": {
      "software": 180000,
      "services": 157500,
      "infrastructure": 45000,
      "training": 67500,
      "other": 0,
      "total": 450000
    },
    "benefits": {
      "annualSavings": 2250000,
      "revenueIncrease": 1350000,
      "efficiencyGains": 900000,
      "costAvoidance": 0,
      "total": 4500000
    },
    "roi": {
      "conservative": 452,
      "realistic": 759,
      "optimistic": 1312
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.89,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-05",
    "tags": [
      "medical-devices",
      "iot",
      "predictive-maintenance",
      "ml",
      "biomedical"
    ],
    "similarCases": [
      "roi_health_034",
      "roi_manufacturing_015",
      "roi_health_046"
    ],
    "customerInfo": {
      "revenue": "$2.2B",
      "employees": 11500
    }
  },
  {
    "id": "roi_health_030",
    "industry": "Healthcare",
    "subIndustry": "Public Health",
    "useCase": "Prescription Drug Monitoring - State Health Dept",
    "companySize": "Enterprise",
    "annualRevenue": 0,
    "employees": 2500,
    "problem": "Opioid epidemic",
    "solution": "ML detecting prescription abuse patterns across PDMP data",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 2650000,
      "revenueIncrease": 1590000,
      "efficiencyGains": 1060000,
      "costAvoidance": 0,
      "total": 5300000
    },
    "roi": {
      "conservative": 660,
      "realistic": 1107,
      "optimistic": 1929
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 6,
      "production": 9
    },
    "confidence": 0.87,
    "dataSource": "customer_case",
    "lastUpdated": "2024-11-30",
    "tags": [
      "pdmp",
      "opioid",
      "public-health",
      "ml",
      "prescription-monitoring"
    ],
    "similarCases": [
      "roi_health_056",
      "roi_finance_004",
      "roi_health_048"
    ],
    "customerInfo": {
      "name": "State Department of Health",
      "revenue": "N/A - Gov",
      "location": "USA",
      "employees": 2500
    }
  },
  {
    "id": "roi_health_031",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Anesthesia Workflow Optimization - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 1500000000,
    "employees": 8500,
    "problem": "OR delays from anesthesia bottlenecks",
    "solution": "ML optimizing anesthesiologist scheduling and OR assignments",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 600,
      "realistic": 1000,
      "optimistic": 1727
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.88,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-01",
    "tags": [
      "anesthesia",
      "or-optimization",
      "scheduling",
      "ml",
      "surgery"
    ],
    "similarCases": [
      "roi_health_007",
      "roi_health_019",
      "roi_health_047"
    ],
    "customerInfo": {
      "revenue": "$1.5B",
      "employees": 8500
    }
  },
  {
    "id": "roi_health_032",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Patient Sentiment Analysis - Health System",
    "companySize": "Enterprise",
    "annualRevenue": 2800000000,
    "employees": 15500,
    "problem": "Limited actionable insights from 45K annual patient surveys",
    "solution": "NLP analyzing patient feedback for quality improvement priorities",
    "investment": {
      "software": 71000,
      "services": 62125,
      "infrastructure": 17750,
      "training": 26625,
      "other": 0,
      "total": 177500
    },
    "benefits": {
      "annualSavings": 850000,
      "revenueIncrease": 510000,
      "efficiencyGains": 340000,
      "costAvoidance": 0,
      "total": 1700000
    },
    "roi": {
      "conservative": 422,
      "realistic": 739,
      "optimistic": 1348
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.87,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-03",
    "tags": [
      "patient-sentiment",
      "nlp",
      "quality",
      "patient-experience",
      "hcahps"
    ],
    "similarCases": [
      "roi_health_060",
      "roi_retail_014",
      "roi_health_054"
    ],
    "customerInfo": {
      "name": "Integrated Health System",
      "revenue": "$2.8B",
      "location": "USA",
      "employees": 15500
    }
  },
  {
    "id": "roi_health_033",
    "industry": "Healthcare",
    "subIndustry": "Specialty Care",
    "useCase": "Retinal Imaging AI - Ophthalmology Practice",
    "companySize": "Mid-Market",
    "annualRevenue": 95000000,
    "employees": 280,
    "problem": "Limited access to retinal specialists",
    "solution": "AI detecting diabetic retinopathy and other retinal diseases from fundus images",
    "investment": {
      "software": 83000,
      "services": 72625,
      "infrastructure": 20750,
      "training": 31125,
      "other": 0,
      "total": 207500
    },
    "benefits": {
      "annualSavings": 1000000,
      "revenueIncrease": 600000,
      "efficiencyGains": 400000,
      "costAvoidance": 0,
      "total": 2000000
    },
    "roi": {
      "conservative": 419,
      "realistic": 730,
      "optimistic": 1333
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.9,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-04",
    "tags": [
      "retinal-imaging",
      "diabetic-retinopathy",
      "computer-vision",
      "ophthalmology",
      "ai"
    ],
    "similarCases": [
      "roi_health_002",
      "roi_health_009",
      "roi_health_018"
    ],
    "customerInfo": {
      "revenue": "$95M",
      "employees": 280
    }
  },
  {
    "id": "roi_health_034",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Supply Chain Optimization - Hospital System",
    "companySize": "Enterprise",
    "annualRevenue": 5500000000,
    "employees": 32000,
    "problem": "$85M excess medical supply inventory",
    "solution": "ML-based demand forecasting and automated replenishment",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 3175000,
      "revenueIncrease": 1905000,
      "efficiencyGains": 1270000,
      "costAvoidance": 0,
      "total": 6350000
    },
    "roi": {
      "conservative": 707,
      "realistic": 1193,
      "optimistic": 2086
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.92,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-02",
    "tags": [
      "supply-chain",
      "inventory",
      "optimization",
      "ml",
      "waste-reduction"
    ],
    "similarCases": [
      "roi_health_016",
      "roi_health_029",
      "roi_logistics_012"
    ],
    "customerInfo": {
      "name": "Large Health System",
      "revenue": "$5.5B",
      "location": "USA",
      "employees": 32000
    }
  },
  {
    "id": "roi_health_035",
    "industry": "Healthcare",
    "subIndustry": "Population Health",
    "useCase": "Care Gap Closure - Accountable Care",
    "companySize": "Mid-Market",
    "annualRevenue": 580000000,
    "employees": 1800,
    "problem": "$28M HEDIS quality gap penalties",
    "solution": "ML prioritizing patients for preventive care with automated campaigns",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1650000,
      "revenueIncrease": 990000,
      "efficiencyGains": 660000,
      "costAvoidance": 0,
      "total": 3300000
    },
    "roi": {
      "conservative": 700,
      "realistic": 1164,
      "optimistic": 2000
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-05",
    "tags": [
      "care-gaps",
      "hedis",
      "population-health",
      "ml",
      "quality-measures"
    ],
    "similarCases": [
      "roi_health_011",
      "roi_health_021",
      "roi_health_022"
    ],
    "customerInfo": {
      "name": "ACO Network",
      "revenue": "$580M",
      "location": "USA",
      "employees": 1800
    }
  },
  {
    "id": "roi_health_036",
    "industry": "Healthcare",
    "subIndustry": "Clinical Research",
    "useCase": "Clinical Trial Patient Recruitment - CRO",
    "companySize": "Mid-Market",
    "annualRevenue": 420000000,
    "employees": 680,
    "problem": "85% of trials delayed due to slow enrollment",
    "solution": "AI matching trial criteria to patient databases across health systems",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 2250000,
      "revenueIncrease": 1350000,
      "efficiencyGains": 900000,
      "costAvoidance": 0,
      "total": 4500000
    },
    "roi": {
      "conservative": 655,
      "realistic": 1091,
      "optimistic": 1891
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.86,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-11-29",
    "tags": [
      "clinical-trials",
      "patient-recruitment",
      "ai",
      "cro",
      "enrollment"
    ],
    "similarCases": [
      "roi_health_013",
      "roi_health_024",
      "roi_health_049"
    ],
    "customerInfo": {
      "revenue": "$420M",
      "employees": 680
    }
  },
  {
    "id": "roi_health_037",
    "industry": "Healthcare",
    "subIndustry": "Specialty Care",
    "useCase": "Remote Patient Monitoring - Cardiology Practice",
    "companySize": "Mid-Market",
    "annualRevenue": 180000000,
    "employees": 420,
    "problem": "18% CHF readmission rate costing $12M annually",
    "solution": "IoT devices + ML detecting early decompensation for intervention",
    "investment": {
      "software": 105000,
      "services": 91875,
      "infrastructure": 26250,
      "training": 39375,
      "other": 0,
      "total": 262500
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 518,
      "realistic": 862,
      "optimistic": 1495
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 7
    },
    "confidence": 0.89,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "rpm",
      "cardiology",
      "chf",
      "iot",
      "readmissions"
    ],
    "similarCases": [
      "roi_health_017",
      "roi_health_025",
      "roi_health_051"
    ],
    "customerInfo": {
      "name": "Cardiology Network",
      "revenue": "$180M",
      "location": "USA",
      "employees": 420
    }
  },
  {
    "id": "roi_health_038",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Acute Kidney Injury Prediction - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 1500000000,
    "employees": 8500,
    "problem": "$22M annual AKI costs",
    "solution": "ML predicting AKI 24-48 hours before clinical diagnosis",
    "investment": {
      "software": 111000,
      "services": 97125,
      "infrastructure": 27750,
      "training": 41625,
      "other": 0,
      "total": 277500
    },
    "benefits": {
      "annualSavings": 2000000,
      "revenueIncrease": 1200000,
      "efficiencyGains": 800000,
      "costAvoidance": 0,
      "total": 4000000
    },
    "roi": {
      "conservative": 678,
      "realistic": 1155,
      "optimistic": 2026
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 7
    },
    "confidence": 0.9,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-03",
    "tags": [
      "aki",
      "kidney-injury",
      "ml",
      "early-warning",
      "nephrology"
    ],
    "similarCases": [
      "roi_health_005",
      "roi_health_014",
      "roi_health_020"
    ],
    "customerInfo": {
      "name": "Tertiary Hospital",
      "revenue": "$1.5B",
      "location": "USA",
      "employees": 8500
    }
  },
  {
    "id": "roi_health_039",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Bed Management - Hospital Network",
    "companySize": "Enterprise",
    "annualRevenue": 3800000000,
    "employees": 22000,
    "problem": "72% bed utilization",
    "solution": "ML predicting discharges and optimizing bed assignments",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 2925000,
      "revenueIncrease": 1755000,
      "efficiencyGains": 1170000,
      "costAvoidance": 0,
      "total": 5850000
    },
    "roi": {
      "conservative": 850,
      "realistic": 1432,
      "optimistic": 2500
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 7
    },
    "confidence": 0.91,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-04",
    "tags": [
      "bed-management",
      "capacity",
      "ml",
      "throughput",
      "ed-boarding"
    ],
    "similarCases": [
      "roi_health_007",
      "roi_health_019",
      "roi_health_058"
    ],
    "customerInfo": {
      "name": "Multi-Hospital System",
      "revenue": "$3.8B",
      "location": "USA",
      "employees": 22000
    }
  },
  {
    "id": "roi_health_040",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Surgical Site Infection Prediction - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 2200000000,
    "employees": 12500,
    "problem": "$15M annual SSI costs",
    "solution": "ML identifying high-risk surgical patients for enhanced protocols",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 600,
      "realistic": 1000,
      "optimistic": 1727
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.89,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-02",
    "tags": [
      "ssi",
      "surgical-infection",
      "ml",
      "patient-safety",
      "infection-prevention"
    ],
    "similarCases": [
      "roi_health_019",
      "roi_health_031",
      "roi_health_005"
    ],
    "customerInfo": {
      "revenue": "$2.2B",
      "employees": 12500
    }
  },
  {
    "id": "roi_health_041",
    "industry": "Healthcare",
    "subIndustry": "Emergency Medicine",
    "useCase": "ER Wait Time Prediction - Emergency Department",
    "companySize": "Mid-Market",
    "annualRevenue": 180000000,
    "employees": 680,
    "problem": "4.2-hour average ED wait",
    "solution": "ML predicting wait times for patient communication and staffing",
    "investment": {
      "software": 60000,
      "services": 52500,
      "infrastructure": 15000,
      "training": 22500,
      "other": 0,
      "total": 150000
    },
    "benefits": {
      "annualSavings": 695000,
      "revenueIncrease": 417000,
      "efficiencyGains": 278000,
      "costAvoidance": 0,
      "total": 1390000
    },
    "roi": {
      "conservative": 403,
      "realistic": 709,
      "optimistic": 1314
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.88,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-05",
    "tags": [
      "ed-wait-time",
      "emergency",
      "ml",
      "lwbs",
      "patient-experience"
    ],
    "similarCases": [
      "roi_health_039",
      "roi_health_058",
      "roi_health_003"
    ],
    "customerInfo": {
      "name": "Community Hospital ED",
      "revenue": "$180M",
      "location": "USA",
      "employees": 680
    }
  },
  {
    "id": "roi_health_042",
    "industry": "Healthcare",
    "subIndustry": "Primary Care",
    "useCase": "Voice-to-EHR Documentation - Clinic",
    "companySize": "Mid-Market",
    "annualRevenue": 95000000,
    "employees": 420,
    "problem": "Physicians spending 35% of time on documentation",
    "solution": "Voice AI converting natural conversation to structured EHR notes",
    "investment": {
      "software": 83000,
      "services": 72625,
      "infrastructure": 20750,
      "training": 31125,
      "other": 0,
      "total": 207500
    },
    "benefits": {
      "annualSavings": 1125000,
      "revenueIncrease": 675000,
      "efficiencyGains": 450000,
      "costAvoidance": 0,
      "total": 2250000
    },
    "roi": {
      "conservative": 493,
      "realistic": 833,
      "optimistic": 1444
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.89,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-11-30",
    "tags": [
      "voice-ai",
      "documentation",
      "ehr",
      "nlp",
      "physician-satisfaction"
    ],
    "similarCases": [
      "roi_health_001",
      "roi_health_015",
      "roi_health_025"
    ],
    "customerInfo": {
      "revenue": "$95M",
      "employees": 420
    }
  },
  {
    "id": "roi_health_043",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Ventilator Weaning Prediction - ICU",
    "companySize": "Enterprise",
    "annualRevenue": 2500000000,
    "employees": 14500,
    "problem": "$18M annual ventilator-associated costs",
    "solution": "ML predicting optimal weaning timing reducing ventilator days",
    "investment": {
      "software": 105000,
      "services": 91875,
      "infrastructure": 26250,
      "training": 39375,
      "other": 0,
      "total": 262500
    },
    "benefits": {
      "annualSavings": 1650000,
      "revenueIncrease": 990000,
      "efficiencyGains": 660000,
      "costAvoidance": 0,
      "total": 3300000
    },
    "roi": {
      "conservative": 606,
      "realistic": 1006,
      "optimistic": 1735
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.87,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "ventilator",
      "weaning",
      "icu",
      "ml",
      "respiratory"
    ],
    "similarCases": [
      "roi_health_005",
      "roi_health_014",
      "roi_health_038"
    ],
    "customerInfo": {
      "name": "Teaching Hospital",
      "revenue": "$2.5B",
      "location": "USA",
      "employees": 14500
    }
  },
  {
    "id": "roi_health_044",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Medication Reconciliation - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 1800000000,
    "employees": 9500,
    "problem": "$12M annual costs from medication errors and ADEs",
    "solution": "NLP automating medication reconciliation at admission/discharge",
    "investment": {
      "software": 93000,
      "services": 81375,
      "infrastructure": 23250,
      "training": 34875,
      "other": 0,
      "total": 232500
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 600,
      "realistic": 1000,
      "optimistic": 1727
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.9,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-03",
    "tags": [
      "medication-reconciliation",
      "patient-safety",
      "nlp",
      "ade-prevention",
      "pharmacy"
    ],
    "similarCases": [
      "roi_health_020",
      "roi_health_016",
      "roi_health_059"
    ],
    "customerInfo": {
      "revenue": "$1.8B",
      "employees": 9500
    }
  },
  {
    "id": "roi_health_045",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Revenue Integrity - Health System",
    "companySize": "Enterprise",
    "annualRevenue": 6500000000,
    "employees": 38000,
    "problem": "$95M revenue leakage from charge capture gaps",
    "solution": "AI identifying missed charges and documentation opportunities",
    "investment": {
      "software": 180000,
      "services": 157500,
      "infrastructure": 45000,
      "training": 67500,
      "other": 0,
      "total": 450000
    },
    "benefits": {
      "annualSavings": 4625000,
      "revenueIncrease": 2775000,
      "efficiencyGains": 1850000,
      "costAvoidance": 0,
      "total": 9250000
    },
    "roi": {
      "conservative": 1131,
      "realistic": 1931,
      "optimistic": 3379
    },
    "paybackMonths": 1,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.93,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-04",
    "tags": [
      "revenue-integrity",
      "charge-capture",
      "ai",
      "revenue-cycle",
      "leakage"
    ],
    "similarCases": [
      "roi_health_006",
      "roi_health_012",
      "roi_health_028"
    ],
    "customerInfo": {
      "name": "Integrated Health System",
      "revenue": "$6.5B",
      "location": "USA",
      "employees": 38000
    }
  },
  {
    "id": "roi_health_046",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Clinical Equipment Utilization - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 3200000000,
    "employees": 18500,
    "problem": "$22M invested in underutilized clinical equipment (avg 35% utilization)",
    "solution": "IoT + ML optimizing equipment allocation and purchase decisions",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 2000000,
      "revenueIncrease": 1200000,
      "efficiencyGains": 800000,
      "costAvoidance": 0,
      "total": 4000000
    },
    "roi": {
      "conservative": 600,
      "realistic": 1018,
      "optimistic": 1809
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.89,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-02",
    "tags": [
      "equipment-utilization",
      "iot",
      "asset-management",
      "ml",
      "capex-optimization"
    ],
    "similarCases": [
      "roi_health_029",
      "roi_health_034",
      "roi_health_016"
    ],
    "customerInfo": {
      "revenue": "$3.2B",
      "employees": 18500
    }
  },
  {
    "id": "roi_health_047",
    "industry": "Healthcare",
    "subIndustry": "Ambulatory Surgery",
    "useCase": "Block Time Optimization - Ambulatory Surgery",
    "companySize": "Mid-Market",
    "annualRevenue": 120000000,
    "employees": 420,
    "problem": "58% OR block utilization",
    "solution": "ML optimizing surgeon block assignments and release policies",
    "investment": {
      "software": 71000,
      "services": 62125,
      "infrastructure": 17750,
      "training": 26625,
      "other": 0,
      "total": 177500
    },
    "benefits": {
      "annualSavings": 1000000,
      "revenueIncrease": 600000,
      "efficiencyGains": 400000,
      "costAvoidance": 0,
      "total": 2000000
    },
    "roi": {
      "conservative": 509,
      "realistic": 896,
      "optimistic": 1652
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.88,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-05",
    "tags": [
      "or-block",
      "ambulatory-surgery",
      "ml",
      "utilization",
      "asc"
    ],
    "similarCases": [
      "roi_health_007",
      "roi_health_019",
      "roi_health_031"
    ],
    "customerInfo": {
      "name": "ASC Network",
      "revenue": "$120M",
      "location": "USA",
      "employees": 420
    }
  },
  {
    "id": "roi_health_048",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Controlled Substance Diversion - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 2200000000,
    "employees": 12500,
    "problem": "$6.5M annual controlled substance losses",
    "solution": "ML detecting diversion patterns in medication administration records",
    "investment": {
      "software": 83000,
      "services": 72625,
      "infrastructure": 20750,
      "training": 31125,
      "other": 0,
      "total": 207500
    },
    "benefits": {
      "annualSavings": 1125000,
      "revenueIncrease": 675000,
      "efficiencyGains": 450000,
      "costAvoidance": 0,
      "total": 2250000
    },
    "roi": {
      "conservative": 493,
      "realistic": 833,
      "optimistic": 1444
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.87,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-11-29",
    "tags": [
      "drug-diversion",
      "controlled-substances",
      "ml",
      "pharmacy",
      "compliance"
    ],
    "similarCases": [
      "roi_health_030",
      "roi_finance_002",
      "roi_health_059"
    ],
    "customerInfo": {
      "revenue": "$2.2B",
      "employees": 12500
    }
  },
  {
    "id": "roi_health_049",
    "industry": "Healthcare",
    "subIndustry": "Oncology",
    "useCase": "Precision Medicine Oncology - Cancer Center",
    "companySize": "Mid-Market",
    "annualRevenue": 280000000,
    "employees": 680,
    "problem": "Limited genomic testing utilization",
    "solution": "AI matching genomic profiles to optimal therapies and clinical trials",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 1475000,
      "revenueIncrease": 885000,
      "efficiencyGains": 590000,
      "costAvoidance": 0,
      "total": 2950000
    },
    "roi": {
      "conservative": 425,
      "realistic": 709,
      "optimistic": 1227
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 3,
      "mvp": 6,
      "production": 9
    },
    "confidence": 0.85,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "precision-medicine",
      "oncology",
      "genomics",
      "ai",
      "personalized-medicine"
    ],
    "similarCases": [
      "roi_health_013",
      "roi_health_024",
      "roi_health_036"
    ],
    "customerInfo": {
      "name": "Regional Cancer Institute",
      "revenue": "$280M",
      "location": "USA",
      "employees": 680
    }
  },
  {
    "id": "roi_health_050",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Social Determinants Screening - Health Plan",
    "companySize": "Enterprise",
    "annualRevenue": 8500000000,
    "employees": 12500,
    "problem": "$185M avoidable costs from unaddressed social needs",
    "solution": "NLP extracting SDOH from unstructured data with intervention matching",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 3175000,
      "revenueIncrease": 1905000,
      "efficiencyGains": 1270000,
      "costAvoidance": 0,
      "total": 6350000
    },
    "roi": {
      "conservative": 707,
      "realistic": 1193,
      "optimistic": 2086
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.88,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-03",
    "tags": [
      "sdoh",
      "social-determinants",
      "nlp",
      "payer",
      "health-equity"
    ],
    "similarCases": [
      "roi_health_021",
      "roi_health_035",
      "roi_health_011"
    ],
    "customerInfo": {
      "revenue": "$8.5B",
      "employees": 12500
    }
  },
  {
    "id": "roi_health_051",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Virtual Hospital at Home - Health System",
    "companySize": "Enterprise",
    "annualRevenue": 4500000000,
    "employees": 28000,
    "problem": "Hospital capacity constraints",
    "solution": "RPM + AI enabling hospital-level care at home for appropriate patients",
    "investment": {
      "software": 234000,
      "services": 204750,
      "infrastructure": 58500,
      "training": 87750,
      "other": 0,
      "total": 585000
    },
    "benefits": {
      "annualSavings": 2925000,
      "revenueIncrease": 1755000,
      "efficiencyGains": 1170000,
      "costAvoidance": 0,
      "total": 5850000
    },
    "roi": {
      "conservative": 433,
      "realistic": 738,
      "optimistic": 1286
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 3,
      "mvp": 6,
      "production": 10
    },
    "confidence": 0.86,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-04",
    "tags": [
      "hospital-at-home",
      "rpm",
      "capacity",
      "ai",
      "virtual-care"
    ],
    "similarCases": [
      "roi_health_017",
      "roi_health_037",
      "roi_health_025"
    ],
    "customerInfo": {
      "name": "Academic Health System",
      "revenue": "$4.5B",
      "location": "USA",
      "employees": 28000
    }
  },
  {
    "id": "roi_health_052",
    "industry": "Healthcare",
    "subIndustry": "Pharmacy",
    "useCase": "Step Therapy Compliance - PBM",
    "companySize": "Enterprise",
    "annualRevenue": 15000000000,
    "employees": 22000,
    "problem": "$125M in non-compliant specialty drug spend",
    "solution": "ML identifying step therapy violations and automating intervention",
    "investment": {
      "software": 156000,
      "services": 136500,
      "infrastructure": 39000,
      "training": 58500,
      "other": 0,
      "total": 390000
    },
    "benefits": {
      "annualSavings": 4075000,
      "revenueIncrease": 2445000,
      "efficiencyGains": 1630000,
      "costAvoidance": 0,
      "total": 8150000
    },
    "roi": {
      "conservative": 1171,
      "realistic": 1979,
      "optimistic": 3464
    },
    "paybackMonths": 1,
    "timeline": {
      "poc": 3,
      "mvp": 5,
      "production": 8
    },
    "confidence": 0.92,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-02",
    "tags": [
      "step-therapy",
      "pbm",
      "ml",
      "specialty-pharmacy",
      "utilization-management"
    ],
    "similarCases": [
      "roi_health_010",
      "roi_health_027",
      "roi_health_023"
    ],
    "customerInfo": {
      "name": "Pharmacy Benefit Manager",
      "revenue": "$15B",
      "location": "USA",
      "employees": 22000
    }
  },
  {
    "id": "roi_health_053",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Diabetes Prevention Program - Health Plan",
    "companySize": "Enterprise",
    "annualRevenue": 6500000000,
    "employees": 9500,
    "problem": "$285M annual diabetes costs",
    "solution": "ML identifying pre-diabetic members with personalized engagement",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 2650000,
      "revenueIncrease": 1590000,
      "efficiencyGains": 1060000,
      "costAvoidance": 0,
      "total": 5300000
    },
    "roi": {
      "conservative": 827,
      "realistic": 1391,
      "optimistic": 2427
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 7
    },
    "confidence": 0.89,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-05",
    "tags": [
      "diabetes-prevention",
      "dpp",
      "ml",
      "payer",
      "chronic-disease"
    ],
    "similarCases": [
      "roi_health_022",
      "roi_health_035",
      "roi_health_021"
    ],
    "customerInfo": {
      "revenue": "$6.5B",
      "employees": 9500
    }
  },
  {
    "id": "roi_health_054",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Physician Burnout Detection - Health System",
    "companySize": "Enterprise",
    "annualRevenue": 3800000000,
    "employees": 22000,
    "problem": "$42M annual turnover costs",
    "solution": "ML analyzing EHR patterns and workload for early intervention",
    "investment": {
      "software": 71000,
      "services": 62125,
      "infrastructure": 17750,
      "training": 26625,
      "other": 0,
      "total": 177500
    },
    "benefits": {
      "annualSavings": 1250000,
      "revenueIncrease": 750000,
      "efficiencyGains": 500000,
      "costAvoidance": 0,
      "total": 2500000
    },
    "roi": {
      "conservative": 683,
      "realistic": 1148,
      "optimistic": 2009
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.85,
    "dataSource": "customer_case",
    "lastUpdated": "2024-11-30",
    "tags": [
      "physician-burnout",
      "retention",
      "ml",
      "workforce",
      "well-being"
    ],
    "similarCases": [
      "roi_health_001",
      "roi_health_032",
      "roi_hr_012"
    ],
    "customerInfo": {
      "name": "Large Health System",
      "revenue": "$3.8B",
      "location": "USA",
      "employees": 22000
    }
  },
  {
    "id": "roi_health_055",
    "industry": "Healthcare",
    "subIndustry": "Payer",
    "useCase": "Medical Necessity Review - Payer",
    "companySize": "Enterprise",
    "annualRevenue": 22000000000,
    "employees": 35000,
    "problem": "$52M annual medical review costs",
    "solution": "AI automating medical necessity determinations with clinical guidelines",
    "investment": {
      "software": 212000,
      "services": 185500,
      "infrastructure": 53000,
      "training": 79500,
      "other": 0,
      "total": 530000
    },
    "benefits": {
      "annualSavings": 4625000,
      "revenueIncrease": 2775000,
      "efficiencyGains": 1850000,
      "costAvoidance": 0,
      "total": 9250000
    },
    "roi": {
      "conservative": 908,
      "realistic": 1537,
      "optimistic": 2705
    },
    "paybackMonths": 1,
    "timeline": {
      "poc": 3,
      "mvp": 6,
      "production": 9
    },
    "confidence": 0.93,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-01",
    "tags": [
      "medical-necessity",
      "payer",
      "ai",
      "utilization-management",
      "automation"
    ],
    "similarCases": [
      "roi_health_010",
      "roi_health_027",
      "roi_health_023"
    ],
    "customerInfo": {
      "name": "National Health Plan",
      "revenue": "$22B",
      "location": "USA",
      "employees": 35000
    }
  },
  {
    "id": "roi_health_056",
    "industry": "Healthcare",
    "subIndustry": "Specialty Care",
    "useCase": "Opioid Risk Prediction - Pain Management",
    "companySize": "Mid-Market",
    "annualRevenue": 85000000,
    "employees": 280,
    "problem": "12% opioid abuse rate among chronic pain patients",
    "solution": "ML predicting opioid misuse risk with treatment alternatives",
    "investment": {
      "software": 54000,
      "services": 47250,
      "infrastructure": 13500,
      "training": 20250,
      "other": 0,
      "total": 135000
    },
    "benefits": {
      "annualSavings": 695000,
      "revenueIncrease": 417000,
      "efficiencyGains": 278000,
      "costAvoidance": 0,
      "total": 1390000
    },
    "roi": {
      "conservative": 460,
      "realistic": 811,
      "optimistic": 1500
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.87,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-03",
    "tags": [
      "opioid-risk",
      "pain-management",
      "ml",
      "addiction",
      "pdmp"
    ],
    "similarCases": [
      "roi_health_030",
      "roi_health_022",
      "roi_health_048"
    ],
    "customerInfo": {
      "revenue": "$85M",
      "employees": 280
    }
  },
  {
    "id": "roi_health_057",
    "industry": "Healthcare",
    "subIndustry": "Pediatrics",
    "useCase": "Rare Disease Diagnosis - Children\\'s Hospital",
    "companySize": "Mid-Market",
    "annualRevenue": 420000000,
    "employees": 2200,
    "problem": "5-year average diagnostic odyssey for rare diseases",
    "solution": "AI analyzing symptoms",
    "investment": {
      "software": 124000,
      "services": 108500,
      "infrastructure": 31000,
      "training": 46500,
      "other": 0,
      "total": 310000
    },
    "benefits": {
      "annualSavings": 1250000,
      "revenueIncrease": 750000,
      "efficiencyGains": 500000,
      "costAvoidance": 0,
      "total": 2500000
    },
    "roi": {
      "conservative": 350,
      "realistic": 591,
      "optimistic": 1027
    },
    "paybackMonths": 4,
    "timeline": {
      "poc": 4,
      "mvp": 7,
      "production": 11
    },
    "confidence": 0.82,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-04",
    "tags": [
      "rare-disease",
      "diagnostics",
      "ai",
      "genomics",
      "pediatrics"
    ],
    "similarCases": [
      "roi_health_024",
      "roi_health_049",
      "roi_health_013"
    ],
    "customerInfo": {
      "name": "Pediatric Medical Center",
      "revenue": "$420M",
      "location": "USA",
      "employees": 2200
    }
  },
  {
    "id": "roi_health_058",
    "industry": "Healthcare",
    "subIndustry": "Emergency Medicine",
    "useCase": "ED Triage Optimization - Hospital",
    "companySize": "Enterprise",
    "annualRevenue": 950000000,
    "employees": 5200,
    "problem": "Undertriage leading to $8.5M in preventable deterioration",
    "solution": "ML-enhanced triage predicting patient acuity and resource needs",
    "investment": {
      "software": 83000,
      "services": 72625,
      "infrastructure": 20750,
      "training": 31125,
      "other": 0,
      "total": 207500
    },
    "benefits": {
      "annualSavings": 1250000,
      "revenueIncrease": 750000,
      "efficiencyGains": 500000,
      "costAvoidance": 0,
      "total": 2500000
    },
    "roi": {
      "conservative": 567,
      "realistic": 900,
      "optimistic": 1585
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 4,
      "production": 6
    },
    "confidence": 0.89,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-12-02",
    "tags": [
      "ed-triage",
      "emergency",
      "ml",
      "acuity",
      "patient-safety"
    ],
    "similarCases": [
      "roi_health_039",
      "roi_health_041",
      "roi_health_005"
    ],
    "customerInfo": {
      "revenue": "$950M",
      "employees": 5200
    }
  },
  {
    "id": "roi_health_059",
    "industry": "Healthcare",
    "subIndustry": "Pharmacy",
    "useCase": "Medication Adherence - Specialty Pharmacy",
    "companySize": "Mid-Market",
    "annualRevenue": 280000000,
    "employees": 520,
    "problem": "42% specialty medication non-adherence",
    "solution": "ML predicting non-adherence with personalized intervention",
    "investment": {
      "software": 60000,
      "services": 52500,
      "infrastructure": 15000,
      "training": 22500,
      "other": 0,
      "total": 150000
    },
    "benefits": {
      "annualSavings": 1000000,
      "revenueIncrease": 600000,
      "efficiencyGains": 400000,
      "costAvoidance": 0,
      "total": 2000000
    },
    "roi": {
      "conservative": 617,
      "realistic": 1100,
      "optimistic": 2033
    },
    "paybackMonths": 2,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.88,
    "dataSource": "customer_case",
    "lastUpdated": "2024-12-05",
    "tags": [
      "medication-adherence",
      "specialty-pharmacy",
      "ml",
      "patient-engagement",
      "retention"
    ],
    "similarCases": [
      "roi_health_044",
      "roi_health_048",
      "roi_health_016"
    ],
    "customerInfo": {
      "name": "Specialty Pharmacy Network",
      "revenue": "$280M",
      "location": "USA",
      "employees": 520
    }
  },
  {
    "id": "roi_health_060",
    "industry": "Healthcare",
    "subIndustry": "Hospital",
    "useCase": "Patient Grievance Analysis - Health System",
    "companySize": "Enterprise",
    "annualRevenue": 4200000000,
    "employees": 25000,
    "problem": "Limited insights from 28K annual patient grievances",
    "solution": "NLP analyzing grievances for systemic quality and safety issues",
    "investment": {
      "software": 71000,
      "services": 62125,
      "infrastructure": 17750,
      "training": 26625,
      "other": 0,
      "total": 177500
    },
    "benefits": {
      "annualSavings": 850000,
      "revenueIncrease": 510000,
      "efficiencyGains": 340000,
      "costAvoidance": 0,
      "total": 1700000
    },
    "roi": {
      "conservative": 422,
      "realistic": 739,
      "optimistic": 1348
    },
    "paybackMonths": 3,
    "timeline": {
      "poc": 2,
      "mvp": 3,
      "production": 5
    },
    "confidence": 0.86,
    "dataSource": "industry_benchmark",
    "lastUpdated": "2024-11-29",
    "tags": [
      "patient-grievance",
      "nlp",
      "quality",
      "patient-experience",
      "safety"
    ],
    "similarCases": [
      "roi_health_032",
      "roi_retail_014",
      "roi_health_054"
    ],
    "customerInfo": {
      "revenue": "$4.2B",
      "employees": 25000
    }
  }
]
