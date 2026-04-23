#!/usr/bin/env node
/**
 * Migration script to convert old ROI case structure to new structure
 *
 * Old structure:
 * - title, segment, investment.min/max, annualBenefit.min/max
 *
 * New structure:
 * - useCase, subIndustry, investment.total, benefits, annualRevenue, employees
 */

const fs = require('fs');
const path = require('path');

// Helper to estimate annualRevenue from string like "$2B+", "$250M"
function estimateRevenue(revenueStr) {
  if (!revenueStr) return 0;

  const match = revenueStr.match(/\$?([\d.]+)([BMK])?/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase();

  if (unit === 'B') return value * 1000000000;
  if (unit === 'M') return value * 1000000;
  if (unit === 'K') return value * 1000;
  return value;
}

// Helper to estimate employees based on company size and revenue
function estimateEmployees(companySize, revenue) {
  if (companySize === 'Enterprise') {
    if (revenue > 5000000000) return 50000;
    if (revenue > 1000000000) return 10000;
    return 5000;
  }
  if (companySize === 'Mid-Market') {
    if (revenue > 500000000) return 2000;
    if (revenue > 100000000) return 500;
    return 200;
  }
  // SMB
  if (revenue > 10000000) return 100;
  return 50;
}

// Helper to convert timeline strings to numbers (months)
function convertTimeline(timelineStr) {
  if (!timelineStr) return 0;

  const match = timelineStr.match(/(\d+)\s*(week|month)/i);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === 'week') return Math.ceil(value / 4); // Convert weeks to months
  return value;
}

// Convert old case to new structure
function migrateCase(oldCase) {
  // Calculate investment total from min/max average
  const investmentTotal = Math.round((oldCase.investment.min + oldCase.investment.max) / 2);

  // Distribute investment based on breakdown percentages
  const invBreakdown = oldCase.investment.breakdown;
  const investment = {
    software: Math.round(investmentTotal * (invBreakdown.software / 100)),
    services: Math.round(investmentTotal * (invBreakdown.services / 100)),
    infrastructure: Math.round(investmentTotal * (invBreakdown.infrastructure / 100)),
    training: Math.round(investmentTotal * (invBreakdown.training / 100)),
    other: 0,
    total: 0
  };
  investment.other = investmentTotal - (investment.software + investment.services + investment.infrastructure + investment.training);
  investment.total = investmentTotal;

  // Calculate benefits from annualBenefit min/max average
  const benefitTotal = Math.round((oldCase.annualBenefit.min + oldCase.annualBenefit.max) / 2);

  // Distribute benefits based on breakdown percentages
  const benBreakdown = oldCase.annualBenefit.breakdown;
  const benefits = {
    annualSavings: Math.round(benefitTotal * (benBreakdown.costSavings / 100)),
    revenueIncrease: Math.round(benefitTotal * (benBreakdown.revenueIncrease / 100)),
    efficiencyGains: Math.round(benefitTotal * (benBreakdown.efficiencyGains / 100)),
    costAvoidance: 0,
    total: 0
  };
  benefits.costAvoidance = benefitTotal - (benefits.annualSavings + benefits.revenueIncrease + benefits.efficiencyGains);
  benefits.total = benefitTotal;

  // Estimate annualRevenue and employees
  const annualRevenue = oldCase.customerInfo?.revenue
    ? estimateRevenue(oldCase.customerInfo.revenue)
    : (oldCase.companySize === 'Enterprise' ? 1000000000 : oldCase.companySize === 'Mid-Market' ? 100000000 : 10000000);

  const employees = oldCase.customerInfo?.employees
    ? oldCase.customerInfo.employees
    : estimateEmployees(oldCase.companySize, annualRevenue);

  // Convert timeline
  const timeline = typeof oldCase.timeline === 'object' ? {
    poc: convertTimeline(oldCase.timeline.poc),
    mvp: convertTimeline(oldCase.timeline.mvp),
    production: convertTimeline(oldCase.timeline.production)
  } : { poc: 1, mvp: 3, production: 6 };

  // Build new case
  const newCase = {
    id: oldCase.id,
    industry: oldCase.industry,
    subIndustry: oldCase.segment || 'General',
    useCase: oldCase.title,
    companySize: oldCase.companySize,
    annualRevenue: annualRevenue,
    employees: employees,

    problem: oldCase.problem,
    solution: oldCase.solution,

    investment: investment,
    benefits: benefits,

    roi: oldCase.roi,
    paybackMonths: oldCase.paybackMonths,
    timeline: timeline,

    confidence: oldCase.confidence,
    dataSource: oldCase.dataSource || 'Industry Benchmark',
    lastUpdated: oldCase.lastUpdated || '2025-01-15',

    tags: oldCase.tags || [],

    customerInfo: oldCase.customerInfo ? {
      name: oldCase.customerInfo.name,
      location: oldCase.customerInfo.location,
      testimonial: oldCase.customerInfo.testimonial,
      revenue: oldCase.customerInfo.revenue,
      employees: oldCase.customerInfo.employees
    } : undefined,

    similarCases: oldCase.similarCases || []
  };

  return newCase;
}

// Process a file
function migrateFile(inputPath, outputPath) {
  console.log(`\nMigrating: ${inputPath}`);

  // Read the old file
  const content = fs.readFileSync(inputPath, 'utf8');

  // Extract the array name and cases
  const arrayNameMatch = content.match(/export const (\w+):/);
  const arrayName = arrayNameMatch ? arrayNameMatch[1] : 'cases';

  // Use eval to parse the file (safe since we control the input)
  const oldModule = { exports: {} };
  try {
    // Create a sandboxed evaluation
    const wrappedContent = content
      .replace(/import.*from.*['"].*['"]/g, '') // Remove imports
      .replace(/export /g, ''); // Remove exports

    eval(wrappedContent + `; oldModule.exports.${arrayName} = ${arrayName};`);
  } catch (error) {
    console.error(`Error parsing file: ${error.message}`);
    return;
  }

  const oldCases = oldModule.exports[arrayName];
  if (!oldCases || !Array.isArray(oldCases)) {
    console.error('Could not extract cases array');
    return;
  }

  console.log(`Found ${oldCases.length} cases to migrate`);

  // Migrate all cases
  const newCases = oldCases.map(migrateCase);

  // Generate new file content
  const fileHeader = `/**
 * ROI Oracle - ${arrayName.replace('ROICases', '').replace(/([A-Z])/g, ' $1').trim()} Cases
 * ${oldCases.length} casos basados en benchmarks de McKinsey, Gartner, Forrester
 *
 * MIGRATED: Converted from old structure to new ROICase type
 */

import { ROICase } from './types'

export const ${arrayName}: ROICase[] = `;

  const casesJson = JSON.stringify(newCases, null, 2);
  const newContent = fileHeader + casesJson;

  // Write new file
  fs.writeFileSync(outputPath, newContent, 'utf8');
  console.log(`✅ Migrated ${newCases.length} cases to: ${outputPath}`);
}

// Main execution
const files = [
  {
    input: path.join(__dirname, 'src/data/roi_oracle/roiOracleRetail.ts.old'),
    output: path.join(__dirname, 'src/data/roi_oracle/roiOracleRetail.ts')
  },
  {
    input: path.join(__dirname, 'src/data/roi_oracle/roiOracleFinance.ts.old'),
    output: path.join(__dirname, 'src/data/roi_oracle/roiOracleFinance.ts')
  },
  {
    input: path.join(__dirname, 'src/data/roi_oracle/roiOracleHealthcare.ts.old'),
    output: path.join(__dirname, 'src/data/roi_oracle/roiOracleHealthcare.ts')
  }
];

console.log('🔄 Starting ROI Cases Migration...\n');

files.forEach(file => {
  if (fs.existsSync(file.input)) {
    migrateFile(file.input, file.output);
  } else {
    console.log(`⚠️  File not found: ${file.input}`);
  }
});

console.log('\n✅ Migration complete!');
console.log('\nNext steps:');
console.log('1. Review the generated files');
console.log('2. Uncomment the imports in src/data/roi_oracle/index.ts');
console.log('3. Run npm run type-check to verify');
