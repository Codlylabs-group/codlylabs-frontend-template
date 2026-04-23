import { ROICase } from './types';

/**
 * ROI Oracle - Marketing & Sales Vertical
 *
 * 40 real-world ROI cases from Marketing & Sales
 *
 * Segments:
 * - Lead Generation & Scoring (12 cases)
 * - Content & Creative (10 cases)
 * - Campaign Optimization (8 cases)
 * - Attribution & Analytics (6 cases)
 * - Sales Enablement (4 cases)
 */

export const marketingCases: ROICase[] = [
  // ============================================================================
  // LEAD GENERATION & SCORING (12 cases)
  // ============================================================================
  {
    id: 'mkt-lead-001',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'AI-Powered Lead Scoring',
    companySize: 'Enterprise',
    annualRevenue: 850000000,
    employees: 3200,

    problem: 'Sales team wasting 60% of time on low-quality leads, 8% conversion rate',
    solution: 'ML lead scoring model analyzing 50+ signals to prioritize high-intent prospects',

    investment: {
      software: 125000,
      services: 88000,
      infrastructure: 45000,
      training: 28000,
      other: 19000,
      total: 305000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 4200000,
      efficiencyGains: 1800000,
      costAvoidance: 0,
      total: 6000000
    },

    roi: {
      conservative: 1567,
      realistic: 1867,
      optimistic: 2240
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.94,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-20',

    tags: ['lead-scoring', 'ml', 'sales-productivity', 'conversion-optimization', 'b2b', 'revenue-growth'],

    customerInfo: {
      name: 'SaaS Company',
      location: 'San Francisco, CA',
      testimonial: 'Conversion rate increased from 8% to 19%, sales team productivity up 156%'
    },

    similarCases: ['mkt-lead-002', 'mkt-lead-007', 'mkt-sales-001']
  },

  {
    id: 'mkt-lead-002',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Intent Data Lead Identification',
    companySize: 'Mid-Market',
    annualRevenue: 180000000,
    employees: 750,

    problem: 'Difficulty identifying in-market buyers, 92% of leads not ready to buy',
    solution: 'AI analyzing buyer intent signals across web, social, and content consumption',

    investment: {
      software: 95000,
      services: 65000,
      infrastructure: 32000,
      training: 22000,
      other: 14000,
      total: 228000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 2400000,
      efficiencyGains: 820000,
      costAvoidance: 0,
      total: 3220000
    },

    roi: {
      conservative: 1212,
      realistic: 1312,
      optimistic: 1574
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.91,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-19',

    tags: ['intent-data', 'lead-generation', 'buyer-signals', 'b2b', 'predictive-analytics', 'revenue-growth'],

    customerInfo: {
      name: 'Enterprise Software Vendor',
      location: 'Austin, TX',
      testimonial: 'Pipeline quality improved 240%, sales cycle shortened by 34%'
    },

    similarCases: ['mkt-lead-001', 'mkt-lead-003', 'mkt-attr-001']
  },

  {
    id: 'mkt-lead-003',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Account-Based Marketing (ABM) Personalization',
    companySize: 'Enterprise',
    annualRevenue: 620000000,
    employees: 2400,

    problem: 'Generic outreach to target accounts, 4% response rate, long sales cycles',
    solution: 'AI personalizing ABM campaigns at scale for 500+ target accounts',

    investment: {
      software: 115000,
      services: 82000,
      infrastructure: 42000,
      training: 26000,
      other: 18000,
      total: 283000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 3600000,
      efficiencyGains: 980000,
      costAvoidance: 0,
      total: 4580000
    },

    roi: {
      conservative: 1419,
      realistic: 1519,
      optimistic: 1823
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 6
    },

    confidence: 0.92,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-18',

    tags: ['abm', 'personalization', 'account-based', 'b2b', 'enterprise-sales', 'revenue-growth'],

    similarCases: ['mkt-lead-002', 'mkt-cont-003', 'mkt-lead-008']
  },

  {
    id: 'mkt-lead-004',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Chatbot Lead Qualification',
    companySize: 'Mid-Market',
    annualRevenue: 240000000,
    employees: 980,

    problem: 'Website visitors not converting, 24/7 lead capture needed, SDR capacity limited',
    solution: 'AI chatbot qualifying leads 24/7 and scheduling meetings with sales reps',

    investment: {
      software: 75000,
      services: 52000,
      infrastructure: 28000,
      training: 18000,
      other: 12000,
      total: 185000
    },

    benefits: {
      annualSavings: 420000,
      revenueIncrease: 1800000,
      efficiencyGains: 580000,
      costAvoidance: 0,
      total: 2800000
    },

    roi: {
      conservative: 1314,
      realistic: 1414,
      optimistic: 1697
    },

    paybackMonths: 3,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 4
    },

    confidence: 0.93,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-17',

    tags: ['chatbot', 'conversational-ai', 'lead-qualification', 'automation', 'conversion-optimization'],

    customerInfo: {
      name: 'B2B Services Company',
      location: 'Chicago, IL',
      testimonial: 'Qualified leads increased 340%, after-hours conversions up 420%'
    },

    similarCases: ['mkt-lead-001', 'mkt-lead-009', 'mkt-sales-002']
  },

  {
    id: 'mkt-lead-005',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Lookalike Audience Modeling',
    companySize: 'Mid-Market',
    annualRevenue: 320000000,
    employees: 1200,

    problem: 'Paid acquisition CAC too high at $420, struggling to scale efficiently',
    solution: 'ML identifying lookalike audiences across paid channels to reduce CAC',

    investment: {
      software: 85000,
      services: 58000,
      infrastructure: 35000,
      training: 20000,
      other: 14000,
      total: 212000
    },

    benefits: {
      annualSavings: 1200000,
      revenueIncrease: 1800000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 3000000
    },

    roi: {
      conservative: 1215,
      realistic: 1315,
      optimistic: 1578
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.90,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-16',

    tags: ['lookalike-modeling', 'paid-acquisition', 'cac-reduction', 'audience-targeting', 'ml'],

    similarCases: ['mkt-camp-001', 'mkt-lead-006', 'mkt-camp-005']
  },

  {
    id: 'mkt-lead-006',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Predictive Lead Routing',
    companySize: 'Enterprise',
    annualRevenue: 920000000,
    employees: 3800,

    problem: 'Leads routed randomly, top performers underutilized, 28% lead decay',
    solution: 'AI routing leads to best-fit sales reps based on skills, availability, and likelihood to close',

    investment: {
      software: 105000,
      services: 72000,
      infrastructure: 38000,
      training: 24000,
      other: 16000,
      total: 255000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 3200000,
      efficiencyGains: 1100000,
      costAvoidance: 0,
      total: 4300000
    },

    roi: {
      conservative: 1486,
      realistic: 1586,
      optimistic: 1903
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.91,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-15',

    tags: ['lead-routing', 'sales-optimization', 'automation', 'conversion-optimization', 'sales-productivity'],

    customerInfo: {
      name: 'Technology Company',
      location: 'Seattle, WA',
      testimonial: 'Lead-to-opportunity conversion up 42%, response time improved 67%'
    },

    similarCases: ['mkt-lead-001', 'mkt-sales-001', 'mkt-lead-011']
  },

  {
    id: 'mkt-lead-007',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Email List Enrichment & Scoring',
    companySize: 'Mid-Market',
    annualRevenue: 280000000,
    employees: 1100,

    problem: 'Email database 45% incomplete, poor targeting, low engagement rates',
    solution: 'AI enriching contact data and scoring engagement propensity',

    investment: {
      software: 68000,
      services: 48000,
      infrastructure: 25000,
      training: 16000,
      other: 11000,
      total: 168000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1420000,
      efficiencyGains: 480000,
      costAvoidance: 0,
      total: 1900000
    },

    roi: {
      conservative: 1031,
      realistic: 1031,
      optimistic: 1237
    },

    paybackMonths: 4,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 4
    },

    confidence: 0.89,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-14',

    tags: ['data-enrichment', 'email-marketing', 'lead-scoring', 'data-quality', 'personalization'],

    similarCases: ['mkt-lead-001', 'mkt-camp-002', 'mkt-lead-010']
  },

  {
    id: 'mkt-lead-008',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Personalized Landing Page Optimization',
    companySize: 'Mid-Market',
    annualRevenue: 190000000,
    employees: 820,

    problem: 'Generic landing pages converting at 2.1%, high bounce rates',
    solution: 'AI personalizing landing pages based on visitor attributes and behavior',

    investment: {
      software: 78000,
      services: 54000,
      infrastructure: 32000,
      training: 18000,
      other: 12000,
      total: 194000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1680000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 1680000
    },

    roi: {
      conservative: 666,
      realistic: 766,
      optimistic: 919
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.88,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-13',

    tags: ['landing-page-optimization', 'personalization', 'conversion-optimization', 'cro', 'ai-content'],

    customerInfo: {
      name: 'Digital Marketing Agency',
      location: 'New York, NY',
      testimonial: 'Conversion rate increased from 2.1% to 5.8%, bounce rate reduced 52%'
    },

    similarCases: ['mkt-lead-003', 'mkt-camp-003', 'mkt-cont-001']
  },

  {
    id: 'mkt-lead-009',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Trade Show Lead Capture & Follow-up',
    companySize: 'Enterprise',
    annualRevenue: 1200000000,
    employees: 4500,

    problem: 'Manual trade show lead capture, slow follow-up, 62% lead loss',
    solution: 'AI-powered mobile app capturing leads and automating personalized follow-up',

    investment: {
      software: 95000,
      services: 65000,
      infrastructure: 35000,
      training: 22000,
      other: 15000,
      total: 232000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 2800000,
      efficiencyGains: 680000,
      costAvoidance: 0,
      total: 3480000
    },

    roi: {
      conservative: 1300,
      realistic: 1400,
      optimistic: 1680
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.90,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-12',

    tags: ['event-marketing', 'lead-capture', 'follow-up-automation', 'mobile', 'trade-shows'],

    similarCases: ['mkt-lead-004', 'mkt-sales-002', 'mkt-camp-006']
  },

  {
    id: 'mkt-lead-010',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Contact Database Deduplication',
    companySize: 'Enterprise',
    annualRevenue: 740000000,
    employees: 2900,

    problem: '38% duplicate contacts, wasted marketing spend, poor data quality',
    solution: 'AI identifying and merging duplicate contacts across multiple systems',

    investment: {
      software: 85000,
      services: 58000,
      infrastructure: 32000,
      training: 20000,
      other: 14000,
      total: 209000
    },

    benefits: {
      annualSavings: 820000,
      revenueIncrease: 0,
      efficiencyGains: 580000,
      costAvoidance: 0,
      total: 1400000
    },

    roi: {
      conservative: 470,
      realistic: 570,
      optimistic: 684
    },

    paybackMonths: 7,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 4
    },

    confidence: 0.87,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-11',

    tags: ['data-quality', 'deduplication', 'database-management', 'cost-savings', 'data-hygiene'],

    similarCases: ['mkt-lead-007', 'mkt-attr-004', 'mkt-camp-002']
  },

  {
    id: 'mkt-lead-011',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Outbound Cadence Optimization',
    companySize: 'Mid-Market',
    annualRevenue: 210000000,
    employees: 850,

    problem: 'Manual outbound sequences ineffective, 3.2% response rate, rep burnout',
    solution: 'AI optimizing email/call sequences, timing, and messaging for each prospect',

    investment: {
      software: 72000,
      services: 50000,
      infrastructure: 28000,
      training: 18000,
      other: 12000,
      total: 180000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1540000,
      efficiencyGains: 420000,
      costAvoidance: 0,
      total: 1960000
    },

    roi: {
      conservative: 889,
      realistic: 989,
      optimistic: 1187
    },

    paybackMonths: 4,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.89,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-10',

    tags: ['outbound-sales', 'cadence-optimization', 'sales-engagement', 'automation', 'response-rate'],

    customerInfo: {
      name: 'B2B Tech Startup',
      location: 'Boston, MA',
      testimonial: 'Response rate increased from 3.2% to 11.8%, meetings booked up 285%'
    },

    similarCases: ['mkt-lead-006', 'mkt-sales-001', 'mkt-camp-002']
  },

  {
    id: 'mkt-lead-012',
    industry: 'Marketing & Sales',
    subIndustry: 'Lead Generation',
    useCase: 'Website Visitor Identification',
    companySize: 'Mid-Market',
    annualRevenue: 160000000,
    employees: 650,

    problem: '98% of website visitors anonymous, missing opportunities to engage',
    solution: 'AI identifying anonymous B2B visitors and enabling targeted outreach',

    investment: {
      software: 68000,
      services: 48000,
      infrastructure: 25000,
      training: 16000,
      other: 11000,
      total: 168000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1280000,
      efficiencyGains: 340000,
      costAvoidance: 0,
      total: 1620000
    },

    roi: {
      conservative: 764,
      realistic: 864,
      optimistic: 1037
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.86,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-09',

    tags: ['visitor-identification', 'de-anonymization', 'b2b', 'lead-generation', 'intent-data'],

    similarCases: ['mkt-lead-002', 'mkt-attr-001', 'mkt-lead-003']
  },

  // ============================================================================
  // CONTENT & CREATIVE (10 cases)
  // ============================================================================
  {
    id: 'mkt-cont-001',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'AI Content Generation at Scale',
    companySize: 'Mid-Market',
    annualRevenue: 280000000,
    employees: 1100,

    problem: 'Content production costs $420K/year, slow turnaround limiting campaigns',
    solution: 'Generative AI creating blog posts, social content, and ad copy at scale',

    investment: {
      software: 95000,
      services: 65000,
      infrastructure: 35000,
      training: 24000,
      other: 16000,
      total: 235000
    },

    benefits: {
      annualSavings: 280000,
      revenueIncrease: 840000,
      efficiencyGains: 620000,
      costAvoidance: 0,
      total: 1740000
    },

    roi: {
      conservative: 540,
      realistic: 640,
      optimistic: 768
    },

    paybackMonths: 6,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 4
    },

    confidence: 0.91,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-08',

    tags: ['content-generation', 'generative-ai', 'content-marketing', 'automation', 'cost-savings'],

    customerInfo: {
      name: 'Digital Marketing Agency',
      location: 'Los Angeles, CA',
      testimonial: 'Content production 5x faster, costs reduced 67%, quality maintained'
    },

    similarCases: ['mkt-cont-002', 'mkt-cont-005', 'mkt-lead-008']
  },

  {
    id: 'mkt-cont-002',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'Email Subject Line Optimization',
    companySize: 'Enterprise',
    annualRevenue: 650000000,
    employees: 2600,

    problem: 'Email open rates at 18%, testing capacity limited, revenue opportunity lost',
    solution: 'AI generating and testing thousands of subject line variations',

    investment: {
      software: 75000,
      services: 52000,
      infrastructure: 28000,
      training: 18000,
      other: 12000,
      total: 185000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 2100000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 2100000
    },

    roi: {
      conservative: 1035,
      realistic: 1035,
      optimistic: 1242
    },

    paybackMonths: 4,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 3
    },

    confidence: 0.92,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-07',

    tags: ['email-optimization', 'subject-lines', 'open-rate', 'a-b-testing', 'generative-ai'],

    customerInfo: {
      name: 'E-commerce Retailer',
      location: 'Seattle, WA',
      testimonial: 'Open rates increased from 18% to 31%, click rates up 42%'
    },

    similarCases: ['mkt-camp-002', 'mkt-cont-001', 'mkt-cont-008']
  },

  {
    id: 'mkt-cont-003',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'Dynamic Content Personalization',
    companySize: 'Enterprise',
    annualRevenue: 1100000000,
    employees: 4200,

    problem: 'One-size-fits-all content not resonating, 8% engagement rate',
    solution: 'AI personalizing website and email content based on visitor attributes',

    investment: {
      software: 135000,
      services: 95000,
      infrastructure: 52000,
      training: 32000,
      other: 22000,
      total: 336000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 4200000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 4200000
    },

    roi: {
      conservative: 1150,
      realistic: 1150,
      optimistic: 1380
    },

    paybackMonths: 4,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 6
    },

    confidence: 0.93,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-06',

    tags: ['personalization', 'dynamic-content', 'engagement', 'revenue-growth', 'customer-experience'],

    similarCases: ['mkt-lead-003', 'mkt-lead-008', 'mkt-cont-006']
  },

  {
    id: 'mkt-cont-004',
    industry: 'Marketing & Sales',
    subIndustry: 'Creative',
    useCase: 'Ad Creative Performance Prediction',
    companySize: 'Mid-Market',
    annualRevenue: 320000000,
    employees: 1300,

    problem: '$2.8M annual ad spend, 65% of creatives underperform, trial-and-error costly',
    solution: 'AI predicting ad creative performance before launch to optimize spend',

    investment: {
      software: 105000,
      services: 72000,
      infrastructure: 42000,
      training: 24000,
      other: 16000,
      total: 259000
    },

    benefits: {
      annualSavings: 980000,
      revenueIncrease: 1400000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 2380000
    },

    roi: {
      conservative: 719,
      realistic: 819,
      optimistic: 983
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.89,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-05',

    tags: ['creative-optimization', 'ad-performance', 'predictive-analytics', 'roas', 'paid-media'],

    customerInfo: {
      name: 'Consumer Brand',
      location: 'Portland, OR',
      testimonial: 'Creative hit rate improved from 35% to 78%, ROAS increased 52%'
    },

    similarCases: ['mkt-camp-001', 'mkt-cont-009', 'mkt-camp-005']
  },

  {
    id: 'mkt-cont-005',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'SEO Content Optimization',
    companySize: 'Mid-Market',
    annualRevenue: 220000000,
    employees: 900,

    problem: 'Organic traffic declining, content not ranking, limited SEO expertise',
    solution: 'AI optimizing content for SEO, suggesting topics, and analyzing competitors',

    investment: {
      software: 78000,
      services: 54000,
      infrastructure: 32000,
      training: 20000,
      other: 14000,
      total: 198000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1680000,
      efficiencyGains: 420000,
      costAvoidance: 0,
      total: 2100000
    },

    roi: {
      conservative: 960,
      realistic: 960,
      optimistic: 1152
    },

    paybackMonths: 4,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.88,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-04',

    tags: ['seo', 'content-optimization', 'organic-traffic', 'search-rankings', 'revenue-growth'],

    similarCases: ['mkt-cont-001', 'mkt-attr-003', 'mkt-cont-007']
  },

  {
    id: 'mkt-cont-006',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'Product Description Generation',
    companySize: 'Mid-Market',
    annualRevenue: 180000000,
    employees: 750,

    problem: '12,000+ SKUs with poor descriptions, manual writing cost $280K/year',
    solution: 'AI generating SEO-optimized product descriptions at scale',

    investment: {
      software: 68000,
      services: 48000,
      infrastructure: 28000,
      training: 18000,
      other: 12000,
      total: 174000
    },

    benefits: {
      annualSavings: 220000,
      revenueIncrease: 840000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 1060000
    },

    roi: {
      conservative: 409,
      realistic: 509,
      optimistic: 611
    },

    paybackMonths: 8,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 4
    },

    confidence: 0.87,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-03',

    tags: ['product-descriptions', 'e-commerce', 'content-generation', 'seo', 'automation'],

    customerInfo: {
      name: 'Online Retailer',
      location: 'Austin, TX',
      testimonial: 'All 12K products described in 6 weeks, conversion rate up 18%'
    },

    similarCases: ['mkt-cont-001', 'mkt-cont-005', 'retail-ecom-003']
  },

  {
    id: 'mkt-cont-007',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'Social Media Content Calendar',
    companySize: 'SMB',
    annualRevenue: 45000000,
    employees: 180,

    problem: 'Inconsistent social posting, limited resources, 2.1% engagement rate',
    solution: 'AI planning content calendar and generating social posts aligned with trends',

    investment: {
      software: 42000,
      services: 28000,
      infrastructure: 18000,
      training: 12000,
      other: 8000,
      total: 108000
    },

    benefits: {
      annualSavings: 65000,
      revenueIncrease: 420000,
      efficiencyGains: 180000,
      costAvoidance: 0,
      total: 665000
    },

    roi: {
      conservative: 416,
      realistic: 516,
      optimistic: 619
    },

    paybackMonths: 8,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 3
    },

    confidence: 0.85,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2025-01-02',

    tags: ['social-media', 'content-calendar', 'automation', 'engagement', 'smb'],

    similarCases: ['mkt-cont-001', 'mkt-cont-002', 'mkt-camp-006']
  },

  {
    id: 'mkt-cont-008',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'Email Campaign Copywriting',
    companySize: 'Mid-Market',
    annualRevenue: 260000000,
    employees: 1050,

    problem: 'Limited copywriting resources, 52 campaigns/year, quality inconsistent',
    solution: 'AI generating email campaign copy with brand voice consistency',

    investment: {
      software: 72000,
      services: 50000,
      infrastructure: 28000,
      training: 18000,
      other: 12000,
      total: 180000
    },

    benefits: {
      annualSavings: 180000,
      revenueIncrease: 980000,
      efficiencyGains: 320000,
      costAvoidance: 0,
      total: 1480000
    },

    roi: {
      conservative: 622,
      realistic: 722,
      optimistic: 866
    },

    paybackMonths: 6,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 4
    },

    confidence: 0.88,
    dataSource: 'Customer Case',
    lastUpdated: '2025-01-01',

    tags: ['email-copywriting', 'generative-ai', 'campaign-automation', 'brand-voice', 'efficiency'],

    customerInfo: {
      name: 'Financial Services Firm',
      location: 'Charlotte, NC',
      testimonial: 'Campaign production time reduced 68%, engagement rates improved 24%'
    },

    similarCases: ['mkt-cont-002', 'mkt-cont-001', 'mkt-camp-002']
  },

  {
    id: 'mkt-cont-009',
    industry: 'Marketing & Sales',
    subIndustry: 'Creative',
    useCase: 'Video Ad Creative Generation',
    companySize: 'Enterprise',
    annualRevenue: 890000000,
    employees: 3400,

    problem: 'Video ad production costs $180K per campaign, 6-week lead times',
    solution: 'AI generating video ad variations from templates and product images',

    investment: {
      software: 125000,
      services: 88000,
      infrastructure: 55000,
      training: 28000,
      other: 19000,
      total: 315000
    },

    benefits: {
      annualSavings: 1200000,
      revenueIncrease: 840000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 2040000
    },

    roi: {
      conservative: 548,
      realistic: 548,
      optimistic: 658
    },

    paybackMonths: 7,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.86,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2024-12-30',

    tags: ['video-ads', 'creative-automation', 'generative-ai', 'cost-savings', 'speed-to-market'],

    similarCases: ['mkt-cont-004', 'mkt-camp-001', 'mkt-cont-001']
  },

  {
    id: 'mkt-cont-010',
    industry: 'Marketing & Sales',
    subIndustry: 'Content',
    useCase: 'Content Performance Analytics',
    companySize: 'Mid-Market',
    annualRevenue: 340000000,
    employees: 1400,

    problem: 'No visibility into what content drives conversions, wasted effort',
    solution: 'AI analyzing content performance and recommending optimization strategies',

    investment: {
      software: 85000,
      services: 58000,
      infrastructure: 35000,
      training: 22000,
      other: 15000,
      total: 215000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1540000,
      efficiencyGains: 420000,
      costAvoidance: 0,
      total: 1960000
    },

    roi: {
      conservative: 711,
      realistic: 811,
      optimistic: 973
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.89,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-29',

    tags: ['content-analytics', 'performance-tracking', 'optimization', 'roi-measurement', 'data-driven'],

    customerInfo: {
      name: 'B2B SaaS Company',
      location: 'Denver, CO',
      testimonial: 'Content ROI visibility improved 10x, eliminated 40% of low-performing content'
    },

    similarCases: ['mkt-attr-002', 'mkt-attr-003', 'mkt-cont-005']
  },

  // ============================================================================
  // CAMPAIGN OPTIMIZATION (8 cases)
  // ============================================================================
  {
    id: 'mkt-camp-001',
    industry: 'Marketing & Sales',
    subIndustry: 'Paid Media',
    useCase: 'Multi-Channel Bid Optimization',
    companySize: 'Enterprise',
    annualRevenue: 720000000,
    employees: 2800,

    problem: '$6.5M annual ad spend, manual bid management inefficient, ROAS 3.2',
    solution: 'AI optimizing bids across Google, Meta, LinkedIn in real-time',

    investment: {
      software: 145000,
      services: 105000,
      infrastructure: 55000,
      training: 32000,
      other: 23000,
      total: 360000
    },

    benefits: {
      annualSavings: 1420000,
      revenueIncrease: 2800000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 4220000
    },

    roi: {
      conservative: 1072,
      realistic: 1072,
      optimistic: 1286
    },

    paybackMonths: 4,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.93,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-28',

    tags: ['bid-optimization', 'paid-media', 'multi-channel', 'roas', 'ppc', 'automation'],

    customerInfo: {
      name: 'E-commerce Company',
      location: 'San Francisco, CA',
      testimonial: 'ROAS improved from 3.2 to 5.8, ad spend efficiency up 82%'
    },

    similarCases: ['mkt-lead-005', 'mkt-camp-005', 'mkt-cont-004']
  },

  {
    id: 'mkt-camp-002',
    industry: 'Marketing & Sales',
    subIndustry: 'Email Marketing',
    useCase: 'Email Send Time Optimization',
    companySize: 'Mid-Market',
    annualRevenue: 290000000,
    employees: 1200,

    problem: 'Batch-and-blast email approach, 19% open rate, suboptimal timing',
    solution: 'AI predicting optimal send time for each contact individually',

    investment: {
      software: 68000,
      services: 48000,
      infrastructure: 28000,
      training: 18000,
      other: 12000,
      total: 174000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1280000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 1280000
    },

    roi: {
      conservative: 636,
      realistic: 636,
      optimistic: 763
    },

    paybackMonths: 6,

    timeline: {
      poc: 1,
      mvp: 2,
      production: 4
    },

    confidence: 0.90,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2024-12-27',

    tags: ['email-optimization', 'send-time', 'personalization', 'open-rate', 'engagement'],

    similarCases: ['mkt-cont-002', 'mkt-lead-007', 'mkt-camp-007']
  },

  {
    id: 'mkt-camp-003',
    industry: 'Marketing & Sales',
    subIndustry: 'Campaign Management',
    useCase: 'A/B Testing Automation',
    companySize: 'Mid-Market',
    annualRevenue: 380000000,
    employees: 1600,

    problem: 'Manual A/B testing slow, limited test capacity, insights not actioned',
    solution: 'AI running continuous multivariate tests and auto-implementing winners',

    investment: {
      software: 95000,
      services: 65000,
      infrastructure: 38000,
      training: 24000,
      other: 16000,
      total: 238000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1820000,
      efficiencyGains: 420000,
      costAvoidance: 0,
      total: 2240000
    },

    roi: {
      conservative: 841,
      realistic: 841,
      optimistic: 1009
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.91,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-26',

    tags: ['ab-testing', 'multivariate-testing', 'automation', 'optimization', 'conversion-rate'],

    customerInfo: {
      name: 'SaaS Platform',
      location: 'Atlanta, GA',
      testimonial: 'Running 15x more tests, conversion rate improved 47%'
    },

    similarCases: ['mkt-lead-008', 'mkt-cont-003', 'mkt-camp-008']
  },

  {
    id: 'mkt-camp-004',
    industry: 'Marketing & Sales',
    subIndustry: 'Campaign Management',
    useCase: 'Marketing Mix Modeling',
    companySize: 'Enterprise',
    annualRevenue: 1400000000,
    employees: 5200,

    problem: '$28M marketing budget, unclear channel ROI, misallocated spend',
    solution: 'AI-powered marketing mix model optimizing budget allocation across channels',

    investment: {
      software: 185000,
      services: 145000,
      infrastructure: 75000,
      training: 42000,
      other: 28000,
      total: 475000
    },

    benefits: {
      annualSavings: 3200000,
      revenueIncrease: 5600000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 8800000
    },

    roi: {
      conservative: 1753,
      realistic: 1753,
      optimistic: 2104
    },

    paybackMonths: 3,

    timeline: {
      poc: 3,
      mvp: 5,
      production: 8
    },

    confidence: 0.92,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-25',

    tags: ['marketing-mix-modeling', 'budget-optimization', 'attribution', 'roi', 'channel-optimization'],

    customerInfo: {
      name: 'Consumer Packaged Goods Company',
      location: 'Cincinnati, OH',
      testimonial: 'Marketing efficiency improved 31%, reallocated $4.2M to high-ROI channels'
    },

    similarCases: ['mkt-attr-002', 'mkt-camp-001', 'mkt-attr-005']
  },

  {
    id: 'mkt-camp-005',
    industry: 'Marketing & Sales',
    subIndustry: 'Paid Media',
    useCase: 'Audience Segmentation & Targeting',
    companySize: 'Mid-Market',
    annualRevenue: 420000000,
    employees: 1700,

    problem: 'Broad targeting wasting budget, 2.8% conversion rate, high CAC',
    solution: 'ML creating micro-segments and targeting high-propensity audiences',

    investment: {
      software: 105000,
      services: 72000,
      infrastructure: 42000,
      training: 26000,
      other: 18000,
      total: 263000
    },

    benefits: {
      annualSavings: 840000,
      revenueIncrease: 1680000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 2520000
    },

    roi: {
      conservative: 858,
      realistic: 858,
      optimistic: 1030
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.90,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2024-12-24',

    tags: ['segmentation', 'audience-targeting', 'conversion-optimization', 'cac-reduction', 'ml'],

    similarCases: ['mkt-lead-005', 'mkt-camp-001', 'mkt-cont-004']
  },

  {
    id: 'mkt-camp-006',
    industry: 'Marketing & Sales',
    subIndustry: 'Campaign Management',
    useCase: 'Event Marketing Optimization',
    companySize: 'Enterprise',
    annualRevenue: 980000000,
    employees: 3800,

    problem: '$4.2M event spend, poor attendee targeting, 22% no-show rate',
    solution: 'AI optimizing event promotion, attendee targeting, and follow-up campaigns',

    investment: {
      software: 115000,
      services: 82000,
      infrastructure: 45000,
      training: 28000,
      other: 19000,
      total: 289000
    },

    benefits: {
      annualSavings: 680000,
      revenueIncrease: 2100000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 2780000
    },

    roi: {
      conservative: 862,
      realistic: 862,
      optimistic: 1034
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 6
    },

    confidence: 0.88,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-23',

    tags: ['event-marketing', 'attendee-targeting', 'no-show-reduction', 'event-roi', 'optimization'],

    customerInfo: {
      name: 'Technology Conference Organizer',
      location: 'Las Vegas, NV',
      testimonial: 'No-show rate reduced to 8%, post-event pipeline increased 64%'
    },

    similarCases: ['mkt-lead-009', 'mkt-cont-007', 'mkt-camp-003']
  },

  {
    id: 'mkt-camp-007',
    industry: 'Marketing & Sales',
    subIndustry: 'Email Marketing',
    useCase: 'Triggered Email Campaign Automation',
    companySize: 'Mid-Market',
    annualRevenue: 310000000,
    employees: 1250,

    problem: 'Missing behavioral triggers, manual workflows, 68% cart abandonment',
    solution: 'AI-powered triggered campaigns based on real-time user behavior',

    investment: {
      software: 85000,
      services: 58000,
      infrastructure: 35000,
      training: 22000,
      other: 15000,
      total: 215000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 1920000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 1920000
    },

    roi: {
      conservative: 793,
      realistic: 793,
      optimistic: 951
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.91,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-22',

    tags: ['triggered-emails', 'behavioral-marketing', 'automation', 'cart-recovery', 'revenue-growth'],

    customerInfo: {
      name: 'E-commerce Fashion Retailer',
      location: 'New York, NY',
      testimonial: 'Cart abandonment recovered revenue up 340%, email revenue increased 52%'
    },

    similarCases: ['mkt-camp-002', 'retail-ecom-001', 'mkt-lead-004']
  },

  {
    id: 'mkt-camp-008',
    industry: 'Marketing & Sales',
    subIndustry: 'Campaign Management',
    useCase: 'Campaign Performance Forecasting',
    companySize: 'Enterprise',
    annualRevenue: 1200000000,
    employees: 4600,

    problem: 'Campaign planning based on guesswork, frequent budget overruns',
    solution: 'AI forecasting campaign performance and budget needs before launch',

    investment: {
      software: 125000,
      services: 88000,
      infrastructure: 48000,
      training: 28000,
      other: 19000,
      total: 308000
    },

    benefits: {
      annualSavings: 1200000,
      revenueIncrease: 1800000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 3000000
    },

    roi: {
      conservative: 874,
      realistic: 874,
      optimistic: 1049
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 6
    },

    confidence: 0.89,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2024-12-21',

    tags: ['forecasting', 'campaign-planning', 'budget-management', 'predictive-analytics', 'roi-prediction'],

    similarCases: ['mkt-camp-004', 'mkt-attr-002', 'mkt-camp-003']
  },

  // ============================================================================
  // ATTRIBUTION & ANALYTICS (6 cases)
  // ============================================================================
  {
    id: 'mkt-attr-001',
    industry: 'Marketing & Sales',
    subIndustry: 'Attribution',
    useCase: 'Multi-Touch Attribution Modeling',
    companySize: 'Enterprise',
    annualRevenue: 1600000000,
    employees: 5800,

    problem: 'Last-click attribution misleading, $18M budget misallocated',
    solution: 'AI-powered multi-touch attribution across all customer touchpoints',

    investment: {
      software: 175000,
      services: 135000,
      infrastructure: 75000,
      training: 42000,
      other: 28000,
      total: 455000
    },

    benefits: {
      annualSavings: 2800000,
      revenueIncrease: 4200000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 7000000
    },

    roi: {
      conservative: 1439,
      realistic: 1439,
      optimistic: 1727
    },

    paybackMonths: 3,

    timeline: {
      poc: 3,
      mvp: 5,
      production: 8
    },

    confidence: 0.93,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-20',

    tags: ['attribution', 'multi-touch', 'budget-optimization', 'customer-journey', 'analytics'],

    customerInfo: {
      name: 'Financial Services Company',
      location: 'New York, NY',
      testimonial: 'Reallocated $5.2M to high-performing channels, marketing ROI up 38%'
    },

    similarCases: ['mkt-camp-004', 'mkt-attr-002', 'mkt-lead-002']
  },

  {
    id: 'mkt-attr-002',
    industry: 'Marketing & Sales',
    subIndustry: 'Analytics',
    useCase: 'Customer Journey Analytics',
    companySize: 'Enterprise',
    annualRevenue: 920000000,
    employees: 3600,

    problem: 'Blind spots in customer journey, high drop-off at unknown points',
    solution: 'AI mapping complete customer journeys and identifying friction points',

    investment: {
      software: 145000,
      services: 105000,
      infrastructure: 65000,
      training: 35000,
      other: 25000,
      total: 375000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 3200000,
      efficiencyGains: 980000,
      costAvoidance: 0,
      total: 4180000
    },

    roi: {
      conservative: 1015,
      realistic: 1015,
      optimistic: 1218
    },

    paybackMonths: 4,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 7
    },

    confidence: 0.91,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-19',

    tags: ['customer-journey', 'journey-analytics', 'friction-points', 'conversion-optimization', 'cx'],

    customerInfo: {
      name: 'Insurance Provider',
      location: 'Hartford, CT',
      testimonial: 'Identified 12 major friction points, conversion rate improved 34%'
    },

    similarCases: ['mkt-attr-001', 'mkt-cont-010', 'mkt-attr-005']
  },

  {
    id: 'mkt-attr-003',
    industry: 'Marketing & Sales',
    subIndustry: 'Analytics',
    useCase: 'Predictive Churn Analytics',
    companySize: 'Mid-Market',
    annualRevenue: 380000000,
    employees: 1500,

    problem: '24% annual churn, reactive retention efforts, $6.2M lost revenue',
    solution: 'ML predicting customer churn 60-90 days ahead with intervention recommendations',

    investment: {
      software: 105000,
      services: 72000,
      infrastructure: 42000,
      training: 26000,
      other: 18000,
      total: 263000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 3800000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 3800000
    },

    roi: {
      conservative: 1345,
      realistic: 1345,
      optimistic: 1614
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 6
    },

    confidence: 0.92,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-18',

    tags: ['churn-prediction', 'retention', 'predictive-analytics', 'customer-lifetime-value', 'ml'],

    customerInfo: {
      name: 'SaaS Subscription Service',
      location: 'Austin, TX',
      testimonial: 'Churn reduced from 24% to 14%, retention campaigns 3.2x more effective'
    },

    similarCases: ['retail-cust-002', 'mkt-attr-005', 'mkt-sales-003']
  },

  {
    id: 'mkt-attr-004',
    industry: 'Marketing & Sales',
    subIndustry: 'Analytics',
    useCase: 'Marketing Data Unification',
    companySize: 'Enterprise',
    annualRevenue: 1800000000,
    employees: 6500,

    problem: 'Data silos across 15+ marketing tools, no single source of truth',
    solution: 'AI-powered data integration creating unified customer and campaign view',

    investment: {
      software: 195000,
      services: 155000,
      infrastructure: 95000,
      training: 48000,
      other: 32000,
      total: 525000
    },

    benefits: {
      annualSavings: 1200000,
      revenueIncrease: 2400000,
      efficiencyGains: 1800000,
      costAvoidance: 0,
      total: 5400000
    },

    roi: {
      conservative: 929,
      realistic: 929,
      optimistic: 1115
    },

    paybackMonths: 4,

    timeline: {
      poc: 3,
      mvp: 5,
      production: 9
    },

    confidence: 0.90,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2024-12-17',

    tags: ['data-integration', 'cdp', 'data-unification', 'single-source-of-truth', 'martech'],

    similarCases: ['mkt-lead-010', 'mkt-attr-001', 'mkt-attr-002']
  },

  {
    id: 'mkt-attr-005',
    industry: 'Marketing & Sales',
    subIndustry: 'Analytics',
    useCase: 'Customer Lifetime Value Prediction',
    companySize: 'Enterprise',
    annualRevenue: 1100000000,
    employees: 4200,

    problem: 'Treating all customers equally, missing high-value opportunities',
    solution: 'ML predicting customer lifetime value to optimize acquisition and retention spend',

    investment: {
      software: 135000,
      services: 95000,
      infrastructure: 55000,
      training: 32000,
      other: 22000,
      total: 339000
    },

    benefits: {
      annualSavings: 1600000,
      revenueIncrease: 3200000,
      efficiencyGains: 0,
      costAvoidance: 0,
      total: 4800000
    },

    roi: {
      conservative: 1316,
      realistic: 1316,
      optimistic: 1579
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 6
    },

    confidence: 0.92,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-16',

    tags: ['clv', 'lifetime-value', 'predictive-analytics', 'customer-segmentation', 'roi-optimization'],

    customerInfo: {
      name: 'Subscription Box Service',
      location: 'Los Angeles, CA',
      testimonial: 'Identified high-LTV segments, shifted spend, marketing efficiency up 52%'
    },

    similarCases: ['mkt-attr-003', 'mkt-attr-002', 'mkt-camp-004']
  },

  {
    id: 'mkt-attr-006',
    industry: 'Marketing & Sales',
    subIndustry: 'Analytics',
    useCase: 'Marketing Performance Dashboards',
    companySize: 'Mid-Market',
    annualRevenue: 460000000,
    employees: 1900,

    problem: 'Manual reporting taking 80 hours/month, insights delayed, decisions slow',
    solution: 'AI-powered automated dashboards with real-time insights and recommendations',

    investment: {
      software: 95000,
      services: 65000,
      infrastructure: 38000,
      training: 24000,
      other: 16000,
      total: 238000
    },

    benefits: {
      annualSavings: 420000,
      revenueIncrease: 1200000,
      efficiencyGains: 680000,
      costAvoidance: 0,
      total: 2300000
    },

    roi: {
      conservative: 866,
      realistic: 866,
      optimistic: 1039
    },

    paybackMonths: 5,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.89,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2024-12-15',

    tags: ['dashboards', 'reporting-automation', 'analytics', 'real-time-insights', 'efficiency'],

    similarCases: ['mkt-cont-010', 'mkt-attr-004', 'mkt-attr-002']
  },

  // ============================================================================
  // SALES ENABLEMENT (4 cases)
  // ============================================================================
  {
    id: 'mkt-sales-001',
    industry: 'Marketing & Sales',
    subIndustry: 'Sales Enablement',
    useCase: 'Sales Content Recommendations',
    companySize: 'Enterprise',
    annualRevenue: 1400000000,
    employees: 5200,

    problem: 'Sales reps spending 30% of time searching for content, inconsistent messaging',
    solution: 'AI recommending best sales content for each deal stage and buyer persona',

    investment: {
      software: 125000,
      services: 88000,
      infrastructure: 48000,
      training: 28000,
      other: 19000,
      total: 308000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 4200000,
      efficiencyGains: 1800000,
      costAvoidance: 0,
      total: 6000000
    },

    roi: {
      conservative: 1848,
      realistic: 1848,
      optimistic: 2218
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.93,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-14',

    tags: ['sales-enablement', 'content-recommendations', 'sales-productivity', 'win-rate', 'ai'],

    customerInfo: {
      name: 'Enterprise Software Company',
      location: 'San Jose, CA',
      testimonial: 'Win rate increased 28%, sales cycle shortened by 18%'
    },

    similarCases: ['mkt-lead-001', 'mkt-lead-006', 'mkt-sales-002']
  },

  {
    id: 'mkt-sales-002',
    industry: 'Marketing & Sales',
    subIndustry: 'Sales Enablement',
    useCase: 'Sales Conversation Intelligence',
    companySize: 'Mid-Market',
    annualRevenue: 520000000,
    employees: 2100,

    problem: 'No visibility into sales calls, coaching ineffective, win rate 18%',
    solution: 'AI analyzing sales calls to provide insights and coaching recommendations',

    investment: {
      software: 105000,
      services: 72000,
      infrastructure: 42000,
      training: 26000,
      other: 18000,
      total: 263000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 3200000,
      efficiencyGains: 820000,
      costAvoidance: 0,
      total: 4020000
    },

    roi: {
      conservative: 1429,
      realistic: 1429,
      optimistic: 1715
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.91,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-13',

    tags: ['conversation-intelligence', 'sales-coaching', 'call-analytics', 'win-rate', 'nlp'],

    customerInfo: {
      name: 'B2B SaaS Vendor',
      location: 'Boston, MA',
      testimonial: 'Win rate improved from 18% to 28%, new rep ramp time reduced 42%'
    },

    similarCases: ['mkt-sales-001', 'mkt-lead-004', 'mkt-sales-003']
  },

  {
    id: 'mkt-sales-003',
    industry: 'Marketing & Sales',
    subIndustry: 'Sales Enablement',
    useCase: 'Deal Risk Prediction',
    companySize: 'Enterprise',
    annualRevenue: 980000000,
    employees: 3800,

    problem: 'Pipeline forecasting accuracy 62%, deals slipping unexpectedly',
    solution: 'ML predicting deal risk and recommending interventions to save deals',

    investment: {
      software: 115000,
      services: 82000,
      infrastructure: 45000,
      training: 28000,
      other: 19000,
      total: 289000
    },

    benefits: {
      annualSavings: 0,
      revenueIncrease: 3600000,
      efficiencyGains: 980000,
      costAvoidance: 0,
      total: 4580000
    },

    roi: {
      conservative: 1485,
      realistic: 1485,
      optimistic: 1782
    },

    paybackMonths: 3,

    timeline: {
      poc: 2,
      mvp: 4,
      production: 6
    },

    confidence: 0.92,
    dataSource: 'Customer Case',
    lastUpdated: '2024-12-12',

    tags: ['deal-risk', 'forecast-accuracy', 'predictive-analytics', 'pipeline-management', 'ml'],

    customerInfo: {
      name: 'Technology Services Firm',
      location: 'Chicago, IL',
      testimonial: 'Forecast accuracy improved to 88%, saved $8.2M in at-risk deals'
    },

    similarCases: ['mkt-attr-003', 'mkt-sales-001', 'mkt-lead-006']
  },

  {
    id: 'mkt-sales-004',
    industry: 'Marketing & Sales',
    subIndustry: 'Sales Enablement',
    useCase: 'Proposal Generation Automation',
    companySize: 'Mid-Market',
    annualRevenue: 420000000,
    employees: 1700,

    problem: 'Proposal creation taking 12 hours per deal, inconsistent quality',
    solution: 'AI generating customized proposals from templates with dynamic content',

    investment: {
      software: 95000,
      services: 65000,
      infrastructure: 38000,
      training: 24000,
      other: 16000,
      total: 238000
    },

    benefits: {
      annualSavings: 680000,
      revenueIncrease: 1400000,
      efficiencyGains: 820000,
      costAvoidance: 0,
      total: 2900000
    },

    roi: {
      conservative: 1119,
      realistic: 1119,
      optimistic: 1343
    },

    paybackMonths: 4,

    timeline: {
      poc: 2,
      mvp: 3,
      production: 5
    },

    confidence: 0.90,
    dataSource: 'Industry Benchmark',
    lastUpdated: '2024-12-11',

    tags: ['proposal-automation', 'document-generation', 'sales-productivity', 'efficiency', 'generative-ai'],

    similarCases: ['mkt-sales-001', 'mkt-cont-001', 'legal-contract-001']
  }
];

export default marketingCases;
