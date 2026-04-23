#!/usr/bin/env python3
"""
Migration script to convert old ROI case structure to new structure
"""

import re
import json

def estimate_revenue(revenue_str):
    """Estimate revenue from string like '$2B+', '$250M'"""
    if not revenue_str:
        return 0

    match = re.search(r'\$?([\d.]+)([BMK])?', revenue_str, re.IGNORECASE)
    if not match:
        return 0

    value = float(match.group(1))
    unit = match.group(2).upper() if match.group(2) else ''

    if unit == 'B':
        return int(value * 1_000_000_000)
    if unit == 'M':
        return int(value * 1_000_000)
    if unit == 'K':
        return int(value * 1_000)
    return int(value)

def estimate_employees(company_size, revenue):
    """Estimate employees based on company size and revenue"""
    if company_size == 'Enterprise':
        if revenue > 5_000_000_000:
            return 50000
        if revenue > 1_000_000_000:
            return 10000
        return 5000
    if company_size == 'Mid-Market':
        if revenue > 500_000_000:
            return 2000
        if revenue > 100_000_000:
            return 500
        return 200
    # SMB
    if revenue > 10_000_000:
        return 100
    return 50

def convert_timeline(timeline_str):
    """Convert timeline string to months"""
    if not timeline_str:
        return 0

    match = re.search(r'(\d+)\s*(week|month)', timeline_str, re.IGNORECASE)
    if not match:
        return 0

    value = int(match.group(1))
    unit = match.group(2).lower()

    if unit == 'week':
        return (value + 3) // 4  # Round up weeks to months
    return value

def find_value(text, key, start_pos=0):
    """Find a value for a key in the text"""
    pattern = rf'{key}:\s*([^,\n}}]+)'
    match = re.search(pattern, text[start_pos:])
    if match:
        value = match.group(1).strip()
        # Remove quotes if present
        value = value.strip('"\'')
        return value, start_pos + match.end()
    return None, start_pos

def extract_cases_from_file(filepath):
    """Extract case objects from TypeScript file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all case objects (they start with { after array opening)
    cases = []
    pos = 0

    while True:
        # Find next case start
        start = content.find('{', pos)
        if start == -1:
            break

        # Find matching closing brace
        brace_count = 1
        i = start + 1
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1

        if brace_count == 0:
            case_text = content[start:i]
            # Check if this looks like a case object (has 'id' field)
            if 'id:' in case_text:
                cases.append(case_text)
            pos = i
        else:
            break

    return cases

def parse_case(case_text):
    """Parse a single case from text"""
    case = {}

    # Extract simple fields
    for key in ['id', 'title', 'industry', 'segment', 'companySize', 'problem', 'solution', 'dataSource', 'lastUpdated']:
        val, _ = find_value(case_text, key)
        if val:
            case[key] = val.strip("'\"")

    # Extract numbers
    for key in ['paybackMonths', 'confidence']:
        val, _ = find_value(case_text, key)
        if val:
            try:
                case[key] = float(val)
            except:
                pass

    # Extract investment
    inv_match = re.search(r'investment:\s*{([^}]+)}', case_text, re.DOTALL)
    if inv_match:
        inv_text = inv_match.group(1)
        min_val, _ = find_value(inv_text, 'min')
        max_val, _ = find_value(inv_text, 'max')
        if min_val and max_val:
            case['investment'] = {
                'min': int(min_val),
                'max': int(max_val)
            }

            # Extract breakdown
            breakdown_match = re.search(r'breakdown:\s*{([^}]+)}', inv_text)
            if breakdown_match:
                bd = {}
                for field in ['software', 'services', 'training', 'infrastructure']:
                    val, _ = find_value(breakdown_match.group(1), field)
                    if val:
                        bd[field] = int(val)
                case['investment']['breakdown'] = bd

    # Extract annualBenefit
    ben_match = re.search(r'annualBenefit:\s*{([^}]+)}', case_text, re.DOTALL)
    if ben_match:
        ben_text = ben_match.group(1)
        min_val, _ = find_value(ben_text, 'min')
        max_val, _ = find_value(ben_text, 'max')
        if min_val and max_val:
            case['annualBenefit'] = {
                'min': int(min_val),
                'max': int(max_val)
            }

            # Extract breakdown
            breakdown_match = re.search(r'breakdown:\s*{([^}]+)}', ben_text)
            if breakdown_match:
                bd = {}
                for field in ['costSavings', 'revenueIncrease', 'efficiencyGains']:
                    val, _ = find_value(breakdown_match.group(1), field)
                    if val:
                        bd[field] = int(val)
                case['annualBenefit']['breakdown'] = bd

    # Extract ROI
    roi_match = re.search(r'roi:\s*{([^}]+)}', case_text)
    if roi_match:
        roi = {}
        for field in ['conservative', 'realistic', 'optimistic']:
            val, _ = find_value(roi_match.group(1), field)
            if val:
                roi[field] = int(val)
        case['roi'] = roi

    # Extract tags array
    tags_match = re.search(r'tags:\s*\[([^\]]+)\]', case_text)
    if tags_match:
        tags_text = tags_match.group(1)
        tags = [t.strip().strip("'\"") for t in tags_text.split(',')]
        case['tags'] = tags

    # Extract similarCases array
    sim_match = re.search(r'similarCases:\s*\[([^\]]+)\]', case_text)
    if sim_match:
        sim_text = sim_match.group(1)
        similar = [t.strip().strip("'\"") for t in sim_text.split(',')]
        case['similarCases'] = similar

    # Extract customerInfo
    cust_match = re.search(r'customerInfo:\s*{([^}]+)}', case_text)
    if cust_match:
        cust = {}
        for field in ['name', 'revenue', 'location', 'testimonial']:
            val, _ = find_value(cust_match.group(1), field)
            if val:
                cust[field] = val.strip("'\"")
        emp_val, _ = find_value(cust_match.group(1), 'employees')
        if emp_val:
            cust['employees'] = int(emp_val)
        case['customerInfo'] = cust

    # Extract timeline
    time_match = re.search(r'timeline:\s*{([^}]+)}', case_text)
    if time_match:
        timeline = {}
        for field in ['poc', 'mvp', 'production']:
            val, _ = find_value(time_match.group(1), field)
            if val:
                timeline[field] = val.strip("'\"")
        case['timeline'] = timeline

    return case

def migrate_case(old_case):
    """Convert old case to new structure"""
    # Calculate investment total
    inv_total = round((old_case.get('investment', {}).get('min', 150000) +
                      old_case.get('investment', {}).get('max', 300000)) / 2)

    # Distribute investment
    inv_bd = old_case.get('investment', {}).get('breakdown', {'software': 40, 'services': 35, 'training': 15, 'infrastructure': 10})
    investment = {
        'software': round(inv_total * inv_bd.get('software', 40) / 100),
        'services': round(inv_total * inv_bd.get('services', 35) / 100),
        'infrastructure': round(inv_total * inv_bd.get('infrastructure', 10) / 100),
        'training': round(inv_total * inv_bd.get('training', 15) / 100),
        'other': 0,
        'total': inv_total
    }
    investment['other'] = inv_total - sum([investment['software'], investment['services'],
                                           investment['infrastructure'], investment['training']])

    # Calculate benefits
    ben_total = round((old_case.get('annualBenefit', {}).get('min', 500000) +
                      old_case.get('annualBenefit', {}).get('max', 1000000)) / 2)

    # Distribute benefits
    ben_bd = old_case.get('annualBenefit', {}).get('breakdown', {'costSavings': 50, 'revenueIncrease': 30, 'efficiencyGains': 20})
    benefits = {
        'annualSavings': round(ben_total * ben_bd.get('costSavings', 50) / 100),
        'revenueIncrease': round(ben_total * ben_bd.get('revenueIncrease', 30) / 100),
        'efficiencyGains': round(ben_total * ben_bd.get('efficiencyGains', 20) / 100),
        'costAvoidance': 0,
        'total': ben_total
    }
    benefits['costAvoidance'] = ben_total - sum([benefits['annualSavings'],
                                                  benefits['revenueIncrease'],
                                                  benefits['efficiencyGains']])

    # Estimate revenue and employees
    revenue = old_case.get('customerInfo', {}).get('revenue')
    annual_revenue = estimate_revenue(revenue) if revenue else (
        1_000_000_000 if old_case['companySize'] == 'Enterprise' else
        100_000_000 if old_case['companySize'] == 'Mid-Market' else
        10_000_000
    )

    employees = old_case.get('customerInfo', {}).get('employees') or estimate_employees(
        old_case['companySize'], annual_revenue
    )

    # Convert timeline
    timeline_obj = old_case.get('timeline', {})
    timeline = {
        'poc': convert_timeline(timeline_obj.get('poc', '')),
        'mvp': convert_timeline(timeline_obj.get('mvp', '')),
        'production': convert_timeline(timeline_obj.get('production', ''))
    }

    # Build new case
    new_case = {
        'id': old_case['id'],
        'industry': old_case['industry'],
        'subIndustry': old_case.get('segment', 'General'),
        'useCase': old_case['title'],
        'companySize': old_case['companySize'],
        'annualRevenue': annual_revenue,
        'employees': employees,
        'problem': old_case['problem'],
        'solution': old_case['solution'],
        'investment': investment,
        'benefits': benefits,
        'roi': old_case['roi'],
        'paybackMonths': int(old_case.get('paybackMonths', 0)),
        'timeline': timeline,
        'confidence': old_case.get('confidence', 0.85),
        'dataSource': old_case.get('dataSource', 'Industry Benchmark'),
        'lastUpdated': old_case.get('lastUpdated', '2025-01-15'),
        'tags': old_case.get('tags', []),
        'similarCases': old_case.get('similarCases', [])
    }

    # Add customerInfo if exists
    if 'customerInfo' in old_case:
        new_case['customerInfo'] = old_case['customerInfo']

    return new_case

def generate_typescript_file(cases, array_name, title):
    """Generate TypeScript file with migrated cases"""
    output = f'''/**
 * ROI Oracle - {title} Cases
 * {len(cases)} casos basados en benchmarks de McKinsey, Gartner, Forrester
 *
 * MIGRATED: Converted from old structure to new ROICase type
 */

import {{ ROICase }} from './types'

export const {array_name}: ROICase[] = {json.dumps(cases, indent=2)}
'''
    return output

# Main execution
files = [
    ('src/data/roi_oracle/roiOracleRetail.ts.old', 'src/data/roi_oracle/roiOracleRetail.ts', 'retailROICases', 'Retail & E-Commerce'),
    ('src/data/roi_oracle/roiOracleFinance.ts.old', 'src/data/roi_oracle/roiOracleFinance.ts', 'financeROICases', 'Financial Services'),
    ('src/data/roi_oracle/roiOracleHealthcare.ts.old', 'src/data/roi_oracle/roiOracleHealthcare.ts', 'healthcareROICases', 'Healthcare')
]

print('🔄 Starting ROI Cases Migration...\n')

for input_file, output_file, array_name, title in files:
    print(f'Migrating: {input_file}')

    try:
        # Extract cases
        case_texts = extract_cases_from_file(input_file)
        print(f'  Found {len(case_texts)} case objects')

        # Parse and migrate
        old_cases = [parse_case(ct) for ct in case_texts]
        new_cases = [migrate_case(oc) for oc in old_cases if 'id' in oc]
        print(f'  Migrated {len(new_cases)} cases')

        # Generate output
        output_content = generate_typescript_file(new_cases, array_name, title)

        # Write file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(output_content)

        print(f'  ✅ Written to: {output_file}\n')

    except Exception as e:
        print(f'  ❌ Error: {e}\n')

print('✅ Migration complete!')
print('\nNext steps:')
print('1. Review the generated files')
print('2. Uncomment the imports in src/data/roi_oracle/index.ts')
print('3. Run npm run type-check to verify')
