interface HRDocument {
  id: string;
  title: string;
  category: 'benefits' | 'policies' | 'handbook' | 'onboarding';
  content: string;
  summary: string;
  tags: string[];
  lastUpdated: string;
  isDefault: boolean;
}

export const hrKnowledgeBase: HRDocument[] = [
  // BENEFITS DOCUMENTS (5)
  {
    id: 'ben_001',
    title: 'HDHP vs PPO Medical Plan Comparison',
    category: 'benefits',
    content: `[PLACEHOLDER: Insert HDHP vs PPO comparison content here]

This document will contain detailed information about:
- Premium cost differences between HDHP and PPO plans
- Deductible amounts and out-of-pocket maximums
- HSA eligibility and contribution limits
- Network coverage and provider flexibility
- Prescription drug coverage differences
- Best use cases for each plan type
- Annual cost scenarios for different health situations`,
    summary: 'Compare HDHP and PPO medical plans including premiums, deductibles, HSA eligibility, and coverage details',
    tags: ['health insurance', 'medical', 'HDHP', 'PPO', 'HSA', 'benefits enrollment'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'ben_002',
    title: 'HSA Setup and Contribution Guide',
    category: 'benefits',
    content: `[PLACEHOLDER: Insert HSA setup guide content here]

This document will contain:
- Step-by-step HSA account setup instructions
- Annual contribution limits (individual and family)
- Employer contribution matching details
- Eligible medical expenses list
- Tax advantages and savings strategies
- Investment options for HSA funds
- Rollover rules and long-term planning`,
    summary: 'Complete guide to setting up and managing your Health Savings Account including contributions and eligible expenses',
    tags: ['HSA', 'health savings', 'tax advantages', 'medical expenses', 'HDHP'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'ben_003',
    title: 'FSA Enrollment Guide',
    category: 'benefits',
    content: `[PLACEHOLDER: Insert FSA enrollment guide content here]

This document will contain:
- Flexible Spending Account enrollment process
- Annual contribution limits and election amounts
- Eligible medical and dependent care expenses
- Use-it-or-lose-it rules and grace periods
- Claims submission process and deadlines
- FSA debit card usage guidelines
- Differences between medical FSA and dependent care FSA`,
    summary: 'Guide to enrolling in Flexible Spending Accounts including contribution limits, eligible expenses, and deadlines',
    tags: ['FSA', 'flexible spending', 'dependent care', 'medical expenses', 'enrollment'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'ben_004',
    title: 'Dental and Vision Benefits Overview',
    category: 'benefits',
    content: `[PLACEHOLDER: Insert dental and vision benefits content here]

This document will contain:
- Dental plan coverage levels (preventive, basic, major)
- Network dentist and out-of-network coverage
- Annual maximum benefits and waiting periods
- Vision plan coverage for exams, lenses, frames, contacts
- Frequency limits for vision services
- Provider network information
- Orthodontic coverage details`,
    summary: 'Overview of dental and vision insurance coverage including network providers and benefit limits',
    tags: ['dental insurance', 'vision insurance', 'preventive care', 'orthodontics', 'eye exams'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'ben_005',
    title: '401k Retirement Plan Guide',
    category: 'benefits',
    content: `[PLACEHOLDER: Insert 401k retirement plan content here]

This document will contain:
- 401k enrollment eligibility requirements
- Company matching contribution formula
- Vesting schedule for employer contributions
- Investment fund options and risk profiles
- Contribution limits (employee and employer)
- Loan and hardship withdrawal provisions
- Roth 401k option details
- Rollover procedures for previous employer plans`,
    summary: 'Complete guide to company 401k plan including matching, vesting, investment options, and contribution limits',
    tags: ['401k', 'retirement', 'matching', 'vesting', 'investments', 'Roth'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },

  // COMPANY POLICIES (6)
  {
    id: 'pol_001',
    title: 'Paid Time Off (PTO) Policy',
    category: 'policies',
    content: `[PLACEHOLDER: Insert PTO policy content here]

This document will contain:
- PTO accrual rates by years of service
- Annual PTO allotment and carryover limits
- Request and approval process
- Blackout dates and busy season restrictions
- Minimum and maximum PTO usage increments
- PTO payout policy upon termination
- Coordination with holidays and sick leave`,
    summary: 'Company paid time off policy including accrual rates, carryover rules, and request procedures',
    tags: ['PTO', 'vacation', 'time off', 'accrual', 'carryover', 'leave'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'pol_002',
    title: 'Sick Leave Policy',
    category: 'policies',
    content: `[PLACEHOLDER: Insert sick leave policy content here]

This document will contain:
- Sick leave hours available annually
- Accrual or lump sum allocation method
- Documentation requirements for extended absences
- FMLA eligibility and coordination
- Return to work procedures
- Sick leave vs PTO usage guidelines
- Carryover and payout provisions`,
    summary: 'Sick leave policy detailing available hours, documentation requirements, and FMLA coordination',
    tags: ['sick leave', 'FMLA', 'medical leave', 'documentation', 'absence'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'pol_003',
    title: 'Bereavement Leave Policy',
    category: 'policies',
    content: `[PLACEHOLDER: Insert bereavement leave content here]

This document will contain:
- Eligible family relationships (immediate and extended)
- Days allowed for different relationships
- Documentation requirements
- Extended leave options for special circumstances
- Travel time considerations
- Process for requesting bereavement leave
- Coordination with PTO for additional days`,
    summary: 'Bereavement leave policy including eligible relationships, days allowed, and request process',
    tags: ['bereavement', 'family leave', 'death', 'absence', 'compassionate leave'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'pol_004',
    title: 'Remote Work Policy',
    category: 'policies',
    content: `[PLACEHOLDER: Insert remote work policy content here]

This document will contain:
- Remote work eligibility criteria
- Application and approval process
- Equipment and technology requirements
- Home office setup guidelines and reimbursements
- Availability and communication expectations
- Performance metrics for remote workers
- Security and confidentiality requirements
- In-office attendance requirements (hybrid schedules)`,
    summary: 'Remote work policy covering eligibility, expectations, equipment, and hybrid work arrangements',
    tags: ['remote work', 'work from home', 'hybrid', 'telecommuting', 'home office'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'pol_005',
    title: 'Code of Conduct',
    category: 'policies',
    content: `[PLACEHOLDER: Insert code of conduct content here]

This document will contain:
- Professional behavior expectations
- Ethical standards and integrity requirements
- Conflicts of interest disclosure and management
- Gifts and entertainment guidelines
- Social media and public communication policies
- Dress code and professional appearance
- Alcohol and substance abuse policy
- Consequences for policy violations`,
    summary: 'Company code of conduct outlining professional behavior, ethical standards, and policy expectations',
    tags: ['code of conduct', 'ethics', 'professional behavior', 'integrity', 'conflicts of interest'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'pol_006',
    title: 'Harassment and Discrimination Policy',
    category: 'policies',
    content: `[PLACEHOLDER: Insert harassment and discrimination policy content here]

This document will contain:
- Definitions of harassment and discrimination
- Protected classes and equal opportunity statement
- Examples of prohibited conduct
- Reporting procedures and confidentiality
- Investigation process and timelines
- Non-retaliation policy
- Consequences for policy violations
- Resources and support available to employees`,
    summary: 'Harassment and discrimination policy including definitions, reporting procedures, and investigation process',
    tags: ['harassment', 'discrimination', 'equal opportunity', 'reporting', 'protected classes'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },

  // EMPLOYEE HANDBOOK (5)
  {
    id: 'hb_001',
    title: 'Performance Review Process',
    category: 'handbook',
    content: `[PLACEHOLDER: Insert performance review process content here]

This document will contain:
- Annual review cycle timeline
- Performance evaluation criteria and competencies
- Self-assessment requirements
- Manager feedback and rating system
- Goal setting and development planning
- Performance improvement plan procedures
- Connection to compensation and promotions
- Mid-year check-in expectations`,
    summary: 'Performance review process including evaluation criteria, timeline, and development planning',
    tags: ['performance review', 'evaluation', 'goals', 'feedback', 'development'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'hb_002',
    title: 'Promotion and Career Development',
    category: 'handbook',
    content: `[PLACEHOLDER: Insert promotion and career development content here]

This document will contain:
- Career ladder and level definitions
- Promotion eligibility criteria
- Application and nomination process
- Skills and competency requirements by level
- Training and development opportunities
- Tuition reimbursement program
- Mentorship and coaching programs
- Internal job posting procedures`,
    summary: 'Career advancement pathways including promotion criteria, development opportunities, and training programs',
    tags: ['promotion', 'career development', 'training', 'advancement', 'tuition reimbursement'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'hb_003',
    title: 'Disciplinary Actions and Termination',
    category: 'handbook',
    content: `[PLACEHOLDER: Insert disciplinary actions content here]

This document will contain:
- Progressive discipline policy steps
- Verbal and written warning procedures
- Performance improvement plan (PIP) process
- Grounds for immediate termination
- At-will employment statement
- Exit interview process
- Final paycheck and benefits continuation
- Return of company property requirements`,
    summary: 'Disciplinary procedures and termination policies including progressive discipline and exit process',
    tags: ['discipline', 'termination', 'PIP', 'warnings', 'at-will employment', 'exit'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'hb_004',
    title: 'Confidentiality and Data Security',
    category: 'handbook',
    content: `[PLACEHOLDER: Insert confidentiality and data security content here]

This document will contain:
- Non-disclosure agreement (NDA) requirements
- Classification of confidential information
- Data handling and storage procedures
- Password and access control policies
- Device security requirements (laptop encryption, etc.)
- Bring Your Own Device (BYOD) policy
- Incident reporting procedures
- Consequences of confidentiality breaches`,
    summary: 'Confidentiality and data security policies including NDA requirements and data handling procedures',
    tags: ['confidentiality', 'NDA', 'data security', 'privacy', 'information security'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'hb_005',
    title: 'Time Tracking and Attendance',
    category: 'handbook',
    content: `[PLACEHOLDER: Insert time tracking and attendance content here]

This document will contain:
- Time clock procedures and requirements
- Core business hours and flex time policies
- Tardiness and absence reporting procedures
- Overtime authorization and compensation
- Meal and rest break requirements
- Time correction procedures
- Attendance tracking and consequences
- Exempt vs non-exempt employee time requirements`,
    summary: 'Time tracking and attendance policies including procedures, overtime rules, and break requirements',
    tags: ['time tracking', 'attendance', 'overtime', 'tardiness', 'breaks', 'punctuality'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },

  // ONBOARDING RESOURCES (4)
  {
    id: 'onb_001',
    title: 'New Hire Checklist',
    category: 'onboarding',
    content: `[PLACEHOLDER: Insert new hire checklist content here]

This document will contain:
- Pre-first-day requirements (I-9, tax forms, direct deposit)
- First day schedule and arrival instructions
- Week one orientation activities
- Required training completion deadlines
- Benefits enrollment timeline (30 days)
- Equipment and technology setup tasks
- Key contacts and resources
- 30-60-90 day milestone expectations`,
    summary: 'Complete new hire checklist covering first day tasks, required forms, and onboarding timeline',
    tags: ['new hire', 'onboarding', 'first day', 'checklist', 'orientation', 'benefits enrollment'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'onb_002',
    title: 'First Week Guide',
    category: 'onboarding',
    content: `[PLACEHOLDER: Insert first week guide content here]

This document will contain:
- Daily schedule for first week
- Orientation sessions and training modules
- Team introduction meetings
- Manager one-on-ones and expectations setting
- Facility tour and building access
- Key systems and tools training
- Buddy/mentor assignment
- First project or task assignments`,
    summary: 'First week guide including orientation schedule, team introductions, and initial training',
    tags: ['first week', 'orientation', 'training', 'onboarding', 'new employee'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'onb_003',
    title: 'Benefits Enrollment Timeline',
    category: 'onboarding',
    content: `[PLACEHOLDER: Insert benefits enrollment timeline content here]

This document will contain:
- 30-day enrollment window details
- Medical, dental, vision enrollment deadlines
- HSA/FSA election deadlines
- 401k enrollment timing and auto-enrollment details
- Life and disability insurance options
- Beneficiary designation requirements
- Coverage effective dates
- Enrollment confirmation and ID card timeline`,
    summary: 'Benefits enrollment timeline with deadlines and effective dates for all benefit programs',
    tags: ['benefits enrollment', 'deadlines', 'medical', 'dental', '401k', 'new hire'],
    lastUpdated: '2024-01-15',
    isDefault: true
  },
  {
    id: 'onb_004',
    title: 'Technology Setup Guide',
    category: 'onboarding',
    content: `[PLACEHOLDER: Insert technology setup guide content here]

This document will contain:
- Email account setup and access
- VPN installation and configuration
- Required software and licenses
- Collaboration tools (Slack, Teams, etc.)
- Intranet and HR system access
- Password requirements and security protocols
- IT support contact information
- Mobile device setup and policies`,
    summary: 'Technology setup guide covering email, VPN, software, and system access for new employees',
    tags: ['technology', 'IT setup', 'email', 'VPN', 'software', 'systems access'],
    lastUpdated: '2024-01-15',
    isDefault: true
  }
];
