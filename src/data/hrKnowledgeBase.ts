interface HRDocument {
  id: string;
  title: string;
  category: 'benefits' | 'policies' | 'handbook' | 'onboarding';
  content: string;
  summary: string;
  tags: string[];
  lastUpdated: string;
  isDefault: boolean;
  googleDriveUrl?: string;
  fileType?: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'md';
}

export const hrKnowledgeBase: HRDocument[] = [
  {
    id: 'hdhp-ppo-comparison',
    title: 'HDHP vs PPO Medical Plan Comparison',
    category: 'benefits',
    content: `HDHP (High Deductible Health Plan) vs PPO Medical Plan Comparison Guide

Overview:
IONOS offers two medical plan options to meet diverse employee needs. This guide compares the key features, costs, and benefits of each plan to help you make an informed decision during open enrollment.

HDHP (High Deductible Health Plan) Features:
- Monthly Premium: $150/month for individual coverage, $400/month for family
- Annual Deductible: $2,000 individual / $4,000 family
- HSA Eligibility: Yes - Employer contributes $500/year to your HSA
- Preventive Care: Covered at 100% with no deductible
- After Deductible: 80/20 coinsurance (plan pays 80%, you pay 20%)
- Out-of-Pocket Maximum: $5,000 individual / $10,000 family
- Tax Benefits: HSA contributions are pre-tax, reducing taxable income

PPO (Preferred Provider Organization) Features:
- Monthly Premium: $300/month for individual coverage, $650/month for family
- Annual Deductible: $500 individual / $1,000 family
- HSA Eligibility: No
- Preventive Care: Covered at 100% with no deductible
- Copays: $25 primary care, $50 specialist, $15 generic drugs
- After Deductible: 90/10 coinsurance (plan pays 90%, you pay 10%)
- Out-of-Pocket Maximum: $3,000 individual / $6,000 family

Who Should Choose HDHP:
- Healthy individuals who rarely need medical care
- Those who want to save on monthly premiums
- Employees interested in building tax-advantaged HSA savings
- People comfortable managing higher upfront costs

Who Should Choose PPO:
- Individuals with ongoing medical needs or chronic conditions
- Families with young children
- Those who prefer predictable copays
- Employees who want lower out-of-pocket costs per visit

Enrollment Process:
Both plans can be selected during the annual open enrollment period in November. New employees can enroll within 30 days of hire. Changes outside these windows require a qualifying life event (marriage, birth, loss of other coverage).

For questions, contact the HR Benefits team at benefits@ionos.com or schedule a consultation through the HR portal.`,
    summary: 'Comprehensive comparison of IONOS HDHP and PPO medical plans including premiums, deductibles, HSA eligibility, and coverage details',
    tags: ['medical', 'insurance', 'HDHP', 'PPO', 'HSA', 'health benefits', 'premiums', 'deductible', 'open enrollment'],
    lastUpdated: '2024-01-15',
    isDefault: true,
    googleDriveUrl: 'https://drive.google.com/file/d/SAMPLE_FILE_ID_1/view',
    fileType: 'pdf'
  },
  {
    id: 'pto-policy',
    title: 'Paid Time Off (PTO) Policy',
    category: 'policies',
    content: `IONOS Paid Time Off (PTO) Policy

Effective Date: January 1, 2024

Overview:
IONOS provides generous paid time off to all full-time employees to support work-life balance, rest, and personal responsibilities.

PTO Accrual Schedule:
- 0-2 years of service: 15 days (120 hours) per year
- 3-5 years of service: 20 days (160 hours) per year
- 6+ years of service: 25 days (200 hours) per year

Accrual Method:
PTO accrues on a per-paycheck basis. For example, employees with 15 days annual PTO accrue 4.62 hours per pay period (bi-weekly payroll).

PTO Usage:
- PTO can be used for vacation, personal appointments, illness, or any other purpose
- Requests should be submitted at least 2 weeks in advance for planned time off
- Emergency/sick time can be used immediately with manager notification
- Minimum increment: 2 hours
- Maximum consecutive days without VP approval: 15 days

PTO Request Process:
1. Log into the HR portal (hr.ionos.com)
2. Navigate to Time Off > Request PTO
3. Select dates and enter reason
4. Submit for manager approval
5. Manager will approve/deny within 2 business days

Blackout Periods:
PTO requests may be restricted during:
- Year-end holidays (December 20-31) - limited to 20% of team
- Major product launches (communicated 60 days in advance)
- Peak business periods (Q4 for sales teams)

PTO Carryover:
- Maximum carryover: 40 hours per year
- Excess PTO above 40 hours is forfeited on December 31
- Carryover PTO must be used by March 31 of the following year

PTO Payout:
- Unused PTO is paid out upon termination for any reason
- Payout is calculated at base salary rate at time of separation
- Carryover PTO from previous year is included in payout

Additional Leave:
Beyond PTO, IONOS provides separate banks for:
- Sick Leave: 5 days per year (does not count against PTO)
- Bereavement Leave: 3-5 days depending on relationship
- Jury Duty: Fully paid time off
- Parental Leave: 12 weeks paid leave for primary caregiver

Unused PTO Concerns:
Managers are expected to ensure employees take adequate time off. If an employee has not used PTO for 6+ months, managers should have a wellness conversation.

Questions:
Contact the HR team at hr@ionos.com or call ext. 5000.`,
    summary: 'Complete guide to IONOS PTO policy including accrual rates, request process, carryover rules, and payout information',
    tags: ['PTO', 'vacation', 'time off', 'sick leave', 'accrual', 'carryover', 'policy', 'benefits'],
    lastUpdated: '2024-01-10',
    isDefault: true,
    googleDriveUrl: 'https://drive.google.com/file/d/SAMPLE_FILE_ID_2/view',
    fileType: 'pdf'
  },
  {
    id: 'new-hire-checklist',
    title: 'New Hire Onboarding Checklist',
    category: 'onboarding',
    content: `IONOS New Hire Onboarding Checklist

Welcome to IONOS! This checklist will guide you through your first 30 days.

Before Your Start Date:
□ Complete background check and I-9 verification
□ Review and sign offer letter and employment agreement
□ Submit benefits enrollment forms (if applicable)
□ Provide emergency contact information
□ Upload profile photo for company directory

Day 1:
□ Arrive at 9:00 AM, check in at reception
□ Meet with HR for orientation (9:00-10:30 AM)
□ Receive employee badge and access credentials
□ IT setup: laptop, email, system access (10:30 AM-12:00 PM)
□ Lunch with your team (12:00-1:00 PM)
□ Meet with your manager for welcome discussion (1:00-2:00 PM)
□ Office tour and introductions (2:00-3:00 PM)
□ Review role expectations and 90-day goals (3:00-4:00 PM)
□ Set up workspace and install necessary software (4:00-5:00 PM)

Week 1:
□ Complete required compliance training modules (Sexual Harassment, Security, Ethics)
□ Schedule 1:1 meetings with key stakeholders
□ Review team processes, tools, and documentation
□ Join relevant Slack channels and distribution lists
□ Attend team meeting and introduce yourself
□ Complete benefits enrollment (if not done pre-start)
□ Review employee handbook and sign acknowledgment

Week 2:
□ Shadow team members to learn workflows
□ Begin working on starter projects assigned by manager
□ Schedule coffee chats with 5 colleagues outside your immediate team
□ Familiarize yourself with company goals and OKRs
□ Set up recurring 1:1 with your manager

Week 3:
□ Take ownership of first real project or responsibility
□ Provide feedback on onboarding experience to HR
□ Join employee resource groups (optional)
□ Complete product training (if applicable)

Week 4:
□ 30-day check-in meeting with manager
□ Review progress on 90-day goals
□ Identify areas where you need additional support
□ Confirm benefits enrollment is complete

30-60-90 Day Goals:
Your manager will work with you to set specific goals for:
- 30 days: Learn systems, processes, and team dynamics
- 60 days: Contribute independently to projects
- 90 days: Full productivity and ownership of responsibilities

Resources:
- Employee Handbook: hr.ionos.com/handbook
- IT Support: it@ionos.com or ext. 4357
- HR Questions: hr@ionos.com or ext. 5000
- Benefits Support: benefits@ionos.com

Welcome to the team! We're excited to have you here.`,
    summary: 'Step-by-step onboarding checklist for new IONOS employees covering first day, first week, and first 30 days',
    tags: ['onboarding', 'new hire', 'first day', 'checklist', 'orientation', 'training', '90-day plan'],
    lastUpdated: '2024-01-05',
    isDefault: true,
    googleDriveUrl: 'https://drive.google.com/file/d/SAMPLE_FILE_ID_3/view',
    fileType: 'pdf'
  }
];
