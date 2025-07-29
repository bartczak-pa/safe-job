# PRD: Safe Job Platform

## 1. Product Overview

### 1.1 Document Title and Version
- PRD: Safe Job Platform
- Version: 2.0 (MVP-Focused Architecture)
- Last Updated: July 2025

### 1.2 Product Summary
Safe Job is a platform designed to connect legitimate hiring agencies with temporary candidates in the Netherlands, creating a secure environment that protects candidate rights while enabling efficient talent matching. The platform addresses critical issues in the temporary work sector including exploitation prevention, verification challenges, and human trafficking risks.

**MVP Focus**: The initial version prioritizes core job board functionality with essential features for candidates and employers, while deferring advanced features like AI review, complex matching algorithms, and subscription systems to post-MVP phases.

### 1.3 Development Context
- **Team Size**: Single full-stack developer with Claude Code assistance
- **Timeline**: Flexible development schedule with 8-week MVP target
- **Technical Experience**: Django/React foundation, learning DevOps/AWS
- **Infrastructure**: AWS Free Tier optimized for cost-effective deployment

#### 1.3.1 MVP Technical Architecture

The platform is built as a modular Django monolith with real-time capabilities, optimized for single-developer productivity and AWS Free Tier deployment.

| Component | Technology | MVP Implementation |
|-----------|------------|-------------------|
| **Backend Framework** | Django 5.2.4 + Django REST Framework | Core API layer with custom apps for each domain |
| **Database** | PostgreSQL 16 + PostGIS | Geospatial support for location-based job matching |
| **Real-time Layer** | Django Channels + Redis | WebSocket-based messaging and notifications |
| **Authentication** | Magic Link System | Passwordless authentication with secure token-based login |
| **Frontend** | React 19 (TypeScript) | Mobile-first responsive interface |
| **File Storage** | AWS S3 + CloudFront | Document storage with in-browser preview capability |
| **Caching** | Redis (ElastiCache) | Session storage and real-time message broker |
| **Email Service** | Resend | Magic link delivery and notifications |
| **Search** | Django ORM + PostGIS | Basic search with geolocation (Elasticsearch deferred) |
| **Deployment** | Docker + AWS ECS Fargate | Containerized deployment on AWS Free Tier |
| **Monitoring** | AWS CloudWatch | Basic metrics and logging |

#### 1.3.2 Django App Structure
```
safe_job/
├── core/                    # Shared utilities, base models
├── users/                   # User management, magic link auth
├── candidates/              # Candidate profiles, skills, preferences
├── employers/               # Employer profiles, verification workflow
├── jobs/                    # Job posting, admin approval system
├── applications/            # Job applications, basic matching
├── messaging/               # Real-time chat with Django Channels
├── documents/               # File upload, admin preview system
├── api/                     # DRF API endpoints and serializers
└── admin_custom/            # Custom admin interfaces for workflows
```

---

## 2. Goals

### 2.1 Business Goals
**MVP Phase:**
- Launch functional job board with core features within 8 weeks
- Validate product-market fit with initial users (10-20 employers, 50-100 candidates)
- Establish technical foundation for rapid feature expansion
- Minimize infrastructure costs using AWS Free Tier

**Post-MVP Growth:**
- Acquire **100+ agencies** with **20%** conversion to paid subscriptions
- Achieve **MRR of €2,100+** through subscription model
- Foster partnerships with NGOs and labor rights organizations for credibility and outreach
- Scale to become the leading platform for legitimate temporary work in the Netherlands

### 2.2 User Goals
- **Candidates:**
  - Find legitimate, safe job opportunities free from exploitation risks
  - Communicate securely with potential employers
- **Agencies:**
  - Access a pool of pre-verified candidates with relevant skills and qualifications
  - Demonstrate compliance with Dutch labor laws and industry standards
- **Platform:** Provide a safe marketplace that prevents human trafficking and exploitation

### 2.3 Non-Goals
- Creating a general-purpose job board for all types of employment
- Expanding beyond the Netherlands in initial phases
- Replacing existing verification systems like NEN 4400-1 certification
- Building an agency management system or full-featured ATS
- Offering payroll or financial services
- Targeting individual companies that do not employ temporary workers
- Implementing employer ratings and reviews in the MVP phase

---

## 3. MVP Scope & Implementation Plan

### 3.1 MVP Feature Prioritization

#### 3.1.1 Core Features (Phase 1 - MVP)
**Essential job board functionality for 8-week launch:**

| Feature | Priority | Implementation | Rationale |
|---------|----------|----------------|-----------|
| **User Registration & Profiles** | Critical | Magic link authentication, basic profiles | Foundation for all interactions |
| **Employer Verification** | Critical | Document upload with admin preview | Trust and safety requirement |
| **Job Posting System** | Critical | Structured forms with admin approval | Core business functionality |
| **Job Search & Discovery** | Critical | Location-based with PostGIS | Essential user experience |
| **Application System** | Critical | Basic apply workflow | Connects candidates to opportunities |
| **Real-time Messaging** | High | Django Channels implementation | User engagement and communication |
| **Admin Interface** | High | Django admin with custom views | Content moderation and management |
| **Document Preview** | High | PDF.js integration for admin review | Verification workflow support |

#### 3.1.2 Deferred Features (Post-MVP)
**Advanced features for future development phases:**

| Feature | Priority | Deferral Reason | Timeline |
|---------|----------|-----------------|----------|
| **AI Content Review** | Medium | Complex integration, external APIs | Phase 2 (Month 3-4) |
| **Advanced Matching Algorithm** | Medium | Algorithm development complexity | Phase 2 (Month 3-4) |
| **E2E Encryption** | Medium | Security implementation complexity | Phase 3 (Month 5-6) |
| **Multi-language Translation** | Medium | Translation API integration | Phase 3 (Month 5-6) |
| **Subscription/Payment System** | Low | Business model validation needed | Phase 4 (Month 6+) |
| **Couple Applications** | Low | Complex workflow requirements | Phase 4 (Month 6+) |
| **Advanced Analytics** | Low | Requires significant user data | Phase 4 (Month 6+) |

### 3.2 Implementation Roadmap

#### 3.2.1 Phase 1: Foundation (Weeks 1-3)
- **Project Setup**: Django apps, PostgreSQL + PostGIS, Docker
- **Authentication**: Magic link system with AWS SES
- **Core Models**: Users, Jobs, Applications with geospatial support
- **Basic Admin**: Django admin configuration

#### 3.2.2 Phase 2: Core Features (Weeks 4-6)
- **Job Management**: Posting workflow, admin approval, search
- **Application System**: Candidate applications, employer management
- **Real-time Messaging**: Django Channels, WebSocket integration
- **Document System**: Upload, preview, verification workflow

#### 3.2.3 Phase 3: Polish & Deploy (Weeks 7-8)
- **Frontend Integration**: React UI, responsive design
- **AWS Deployment**: ECS Fargate, RDS, S3 configuration
- **Testing & QA**: User acceptance testing, performance optimization
- **Documentation**: User guides, admin documentation

#### 3.2.4 Success Metrics
- **Technical**: Sub-200ms API response times, 99%+ uptime
- **Functional**: Complete user journeys (registration → job posting → application → messaging)
- **Business**: 10+ active employers, 50+ registered candidates, basic engagement metrics

---

## 4. User Personas

### 4.1 Key User Types

| User Type | Description |
| --------- | ----------- |
| Temporary Candidates | Individuals seeking short-term employment opportunities |
| Freelancers (ZZP'ers) | Self-employed individuals working as headhunters |
| Small Staffing Agencies | Agencies with 1-10 employees connecting candidates to jobs |
| Medium/Large Staffing Agencies | Established agencies with larger operations |
| Platform Administrators | Staff managing verification and platform operations |

### 3.2 Basic Persona Details

| Persona | Details |
| ------- | ------- |
| **Temporary Candidates** | Individuals seeking short-term or contract-based employment in the Netherlands, potentially vulnerable to exploitation |
| **Freelancers (ZZP'ers)** | Self-employed individuals who work as headhunters for staffing agencies and employers |
| **Small Staffing Agency Owners** | Small business owners who connect candidates with temporary positions but have limited resources for candidate sourcing |
| **Medium/Large Agency Recruiters** | Professional recruiters working for established staffing firms requiring efficient candidate matching |
| **Platform Administrators** | Staff responsible for verifying employer legitimacy and monitoring platform compliance |

### 3.3 Detailed Persona Profiles

#### 3.3.1 Temporary Candidate: Piotr Nowak (28, Polish Migrant Candidate)

**Background:**
- Moved to the Netherlands 8 months ago seeking better wages
- Has experience in warehouse and production line work
- Speaks basic Dutch (A1), good English (B1), native Polish
- Currently shares accommodation with 3 other workers
- Completed vocational education in logistics in Poland

**Goals:**
- Find stable employment with fair wages and treatment
- Secure accommodation that is clean and affordable
- Eventually bring his partner to the Netherlands
- Improve Dutch language skills for better job prospects
- Save money to eventually start his own business

**Pain Points:**
- Has experienced wage theft from previous informal employment
- Struggles with understanding Dutch employment contracts
- Relies on public transport which limits job options
- Previous agency charged excessive housing fees
- Feels isolated due to language barriers

**Behaviors:**
- Primarily uses smartphone for job searching (Android)
- Checks job listings daily, often during commute
- Prefers Polish language content when available
- Consults with fellow Polish workers about job opportunities
- Hesitant to report problems due to fear of losing work

#### 3.3.2 Temporary Candidates: Maria and João Silva (34 and 36, Brazilian Couple)

**Background:**
- Arrived in the Netherlands 3 months ago
- Maria has experience in food processing, João in construction
- Both speak intermediate English (B1), learning basic Dutch
- Currently staying in temporary accommodation
- Looking to work together at the same location if possible

**Goals:**
- Find jobs that allow them to work at the same location
- Secure stable housing suitable for a couple
- Build savings for eventual permanent residency application
- Develop skills that increase their employability
- Create a support network in their new country

**Pain Points:**
- Difficulty finding employers willing to hire couples
- Housing options often don't accommodate couples
- Limited understanding of Dutch labor rights
- Previous experience with unreliable job promises
- Struggle with documentation requirements

**Behaviors:**
- Share one laptop but both have smartphones
- Actively participate in Brazilian expat Facebook groups
- Prefer to apply to jobs together when possible
- João handles most communication due to slightly better English
- Very responsive to messages, often reply within hours

#### 3.3.3 Freelancer (ZZP'er): Saskia de Vries (42, Independent Recruiter)

**Background:**
- Former corporate recruiter with 15 years experience
- Started her own recruitment business 3 years ago
- Specializes in logistics and manufacturing placements
- Works with 5-7 small to medium companies regularly
- Native Dutch, fluent English, basic German

**Goals:**
- Expand client base while maintaining quality service
- Reduce administrative burden of candidate verification
- Build a reputation for ethical recruitment practices
- Establish long-term relationships with reliable employers
- Differentiate from larger agencies through personalized service

**Pain Points:**
- Limited resources for thorough candidate screening
- Difficulty competing with larger agencies' candidate pools
- Administrative overhead cuts into recruitment time
- Struggles with inconsistent client communication
- Concerns about liability when placing vulnerable workers

**Behaviors:**
- Works primarily from home office on laptop
- Very active on LinkedIn for candidate sourcing
- Prefers phone calls for important communications
- Highly organized, maintains detailed candidate records
- Values personal relationships with both clients and candidates

#### 3.3.4 Small Staffing Agency Owner: Dirk Bakker (51, Owner of WorkWell B.V.)

**Background:**
- Founded his agency 7 years ago after 20 years in operations management
- Employs 4 staff (2 recruiters, 1 admin, 1 account manager)
- Focuses on food production and agricultural sectors
- Places 80-100 temporary workers annually
- Native Dutch, business-level English

**Goals:**
- Grow business while maintaining compliance with regulations
- Reduce time spent on administrative tasks
- Build stronger relationships with reliable clients
- Differentiate from competitors through quality service
- Minimize worker turnover for client satisfaction

**Pain Points:**
- Manual verification processes are time-consuming
- Difficulty finding qualified candidates quickly
- Concerns about non-compliant competitors undercutting prices
- Limited budget for technology and marketing
- Struggles with seasonal demand fluctuations

**Behaviors:**
- Splits time between office desktop and meetings with clients
- Personally reviews all worker placements
- Prefers email for documentation but phone for negotiations
- Cautious about new technologies but recognizes their value
- Highly concerned with reputation and compliance

#### 3.3.5 Medium/Large Agency Recruiter: Fatima El-Mansour (36, Senior Recruiter at StaffNow)

**Background:**
- 8 years at current agency, which employs 50+ staff
- Manages a team of 3 junior recruiters
- Responsible for 200+ placements annually
- Specializes in warehouse and distribution roles
- Fluent in Dutch, English, Arabic, and French

**Goals:**
- Meet or exceed quarterly placement targets
- Reduce time-to-hire metrics
- Maintain high client satisfaction ratings
- Develop her team's capabilities
- Identify new client opportunities

**Pain Points:**
- Information silos between departments
- Inefficient candidate matching processes
- High volume of applications to screen
- Communication challenges with diverse candidate pool
- Pressure to fill positions quickly while ensuring quality

**Behaviors:**
- Power user of the company's ATS and CRM systems
- Works primarily from office but uses mobile when traveling
- Data-driven approach to recruitment
- Conducts video interviews for initial screening
- Collaborates closely with account management team

#### 3.3.6 Platform Administrator: Thomas Jansen (31, Compliance Specialist)

**Background:**
- Former labor inspector with Dutch government
- Degree in Law with focus on labor regulations
- 3 years experience in compliance roles
- Extensive knowledge of Dutch employment laws
- Native Dutch, fluent English, intermediate Polish

**Goals:**
- Ensure platform maintains highest compliance standards
- Develop efficient verification workflows
- Protect vulnerable workers from exploitation
- Build trust with regulatory authorities
- Contribute to platform's reputation for safety

**Pain Points:**
- Balancing thorough verification with processing speed
- Keeping up with changing regulations
- Identifying fraudulent documentation
- Managing escalated cases requiring investigation
- Communicating compliance requirements clearly to users

**Behaviors:**
- Methodical approach to verification processes
- Documents decisions thoroughly for audit purposes
- Consults regularly with legal team on edge cases
- Advocates for worker protection in platform development
- Uses dual-monitor setup for document comparison

#### 3.3.7 Temporary Candidate: Olena Kovalenko (33, Ukrainian Refugee)

**Background:**
- Arrived in the Netherlands 6 months ago under temporary protection status
- Former elementary school teacher in Ukraine
- Speaks Ukrainian (native), Russian (native), English (B2), no Dutch yet
- Currently staying in government-provided refugee housing
- Bachelor's degree in Education, looking to transition to new career

**Goals:**
- Find stable employment to support herself and send money to family in Ukraine
- Secure independent housing once financially stable
- Build a new career path in the Netherlands
- Integrate into Dutch society while maintaining Ukrainian connections
- Improve language skills for better opportunities

**Pain Points:**
- Uncertain legal status and work permit limitations
- Lack of recognition for educational qualifications
- Limited professional network in the Netherlands
- Psychological stress from displacement and war
- Difficulty navigating Dutch employment system

**Behaviors:**
- Active on Ukrainian diaspora Telegram groups
- Uses both smartphone and library computers for job searching
- Very responsive and punctual in communications
- Willing to take entry-level positions despite qualifications
- Eager to learn new skills and adapt to Dutch workplace culture

#### 3.3.8 NGO Partnership Manager: Aisha Osman (45, FairWork Foundation)

**Background:**
- 15 years experience in labor rights advocacy
- Works for NGO focused on migrant worker protection
- Master's degree in International Human Rights Law
- Regularly collaborates with government agencies on policy
- Fluent in Dutch, English, Turkish, and Arabic

**Goals:**
- Ensure vulnerable workers have access to safe employment opportunities
- Identify and address exploitation in the temporary work sector
- Build partnerships with ethical employment platforms
- Collect data on labor market conditions for advocacy
- Provide resources and support to migrant workers

**Pain Points:**
- Limited resources to help all workers needing assistance
- Difficulty reaching vulnerable workers before exploitation occurs
- Complex regulatory landscape across different sectors
- Balancing cooperation with businesses and advocacy goals
- Measuring impact of interventions effectively

**Behaviors:**
- Divides time between office work and field visits
- Maintains large network of contacts across sectors
- Evidence-based approach to program development
- Frequently speaks at conferences and policy forums
- Highly protective of worker privacy and confidentiality

### 3.4 Role-Based Access

| Role | Permissions & Capabilities |
| ---- | -------------------------- |
| **Unregistered Visitors** | Can browse job listings and view general platform information, but cannot apply for jobs or report employers |
| **Registered Workers** | Can create profiles, apply for jobs, message employers after application, and report issues |
| **Verified Freelancers** | Can post job listings on behalf of clients, search for candidates, and communicate with applicants |
| **Verified Agencies (Small)** | Can post job listings, search for candidates, message applicants, and manage basic account settings |
| **Verified Agencies (Medium/Large)** | Have all small agency privileges plus can create subaccounts for recruiters and access advanced matching features |
| **Administrators** | Can review and approve employer registrations, monitor job postings, handle reported issues, and manage the platform |

---

## 4. Functional Requirements

### 4.1 User Registration & Verification **(Priority: High)**
- Separate registration flows for workers and three types of employers (Freelancers, Small Agencies, Medium/Large Agencies)
- Document upload system for employer verification materials with secure storage
- Automated validation through verify-service (see 8.1.1); falls back to manual review if external services unavailable
- Manual review process for documents requiring human verification
- Verification status to indicate trusted employers

#### 4.1.1 Candidate Profile Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Automatically generated unique identifier | Auto-generated |
| Email | String | Primary contact email (used for magic link login) | Yes |
| OAuth Provider | Enum | Google, Facebook, Apple, None | No |
| OAuth ID | String | Provider-specific identification | No |
| First Name | String | Candidate's first name | Yes |
| Last Name | String | Candidate's last name | Yes |
| Phone Number | String | Contact phone number | Yes |
| Date of Birth | Date | Candidate's birth date (for age verification) | Yes |
| Nationality | String | Candidate's country of citizenship | Yes |
| Languages | List | Languages spoken with proficiency levels | Yes (at least one) |
| Skills | List | Selected skills from predefined categories | Yes (at least one) |
| Education | List | Educational background | No |
| Work History | List | Previous employment records | No |
| Availability | Enum | Immediate, 2 weeks, 1 month, etc. | Yes |
| Preferred Locations | List | Preferred work locations/regions | Yes |
| Housing Need | Boolean | Whether worker requires housing | Yes |
| Transport Need | Boolean | Whether worker requires transportation | Yes |
| Couple Status | Enum | Not a Couple, Pending Link, Linked as Couple | No |
| Partner ID | Foreign Key | Reference to partner's profile if couple | Required if couple |
| Couple ID | String | Unique identifier for the couple relationship | Generated if couple |
| Couple Since | Date | When the couple relationship was established in system | Generated if couple |
| CV Document | File | Uploaded resume/CV | No |
| Profile Picture | Image | Worker's photo | No |
| Profile Completion | Number | Percentage of profile completion | Auto-calculated |
| Account Status | Enum | Active, Inactive, Suspended | System-managed |
| Created Date | Timestamp | When the account was created | Auto-generated |
| Last Updated | Timestamp | When the profile was last modified | Auto-updated |

#### 4.1.2 Employer Account Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Automatically generated unique identifier | Auto-generated |
| Account Type | Enum | Freelancer, Small Agency, Medium/Large Agency | Yes |
| Company Name | String | Legal business name | Yes |
| KvK Number | String | Chamber of Commerce registration number | Yes |
| VAT Number | String | Tax/VAT identification number | Yes |
| Company Address | Object | Structured address information | Yes |
| Primary Contact | Object | Name, email, phone of primary contact person | Yes |
| Contact Email | String | Email used for magic link login | Yes |
| Website | String | Company website URL | No |
| Founded Year | Number | Year the company was established | No |
| Industry Sectors | List | Main sectors the company operates in | Yes |
| NEN Certification | Object | Certification details with expiration date | Required for Medium/Large |
| Insurance Policy | Object | Liability insurance information | Required for agencies |
| G-Account | String | G-account details for tax purposes | Required for Medium/Large |
| Verification Status | Enum | Pending, Approved, Rejected, Additional Info Required | System-managed |
| Verification Documents | List | Uploaded verification documents with status | Yes (type-dependent) |
| Subscription Tier | Enum | Free, Tier 1, Tier 2, Tier 3 | System-managed |
| Subscription Expiry | Date | When current subscription expires | System-managed |
| Job Credits | Number | Available job posting credits | System-managed |
| Subaccounts | List | References to recruiter subaccounts | No |
| Account Status | Enum | Active, Suspended, Restricted | System-managed |
| Created Date | Timestamp | When the account was created | Auto-generated |
| Last Verified | Timestamp | When verification was last completed | System-managed |

### 4.2 Tiered Employer Verification **(Priority: Critical)**

| Employer Type | Required Documents |
| ------------- | ------------------ |
| **Freelancer** | KvK extract, VAT number, ID proof |
| **Small Agency** | KvK extract, VAT number, liability insurance, optional NEN certificate |
| **Medium/Large Agency** | KvK extract, VAT number, NEN certification, insurance policy, G-account |

### 4.3 Job Posting System **(Priority: High)**
- Structured form for creating comprehensive job listings
- Manual review process by platform administrators
- Static preview with commenting functionality
- Publishing controls with expiration dates

#### 4.3.1 Job Listing Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Automatically generated unique identifier | Auto-generated |
| Employer | Foreign Key | Reference to the employer account | Yes |
| Title | String | Job position title | Yes |
| Description | Text | Detailed job description | Yes |
| Start Date | Date | Expected job start date | Yes |
| Salary | Object | Base compensation amount with rate type (hourly or weekly) | Yes |
| Additional Pay | String | Description of overtime, night shift, or other bonus pay | No |
| Location | String | Physical work location address | Yes |
| Gemeente | String | Municipality/district | Yes |
| Client | String | End client for whom the work is performed | No |
| Housing Provided | Boolean | Whether accommodation is provided | Yes |
| Housing Cost | Number | Weekly/monthly cost for provided housing | Required if housing provided |
| Transport Provided | Boolean | Whether transportation to work is provided | Yes |
| Transport Cost | Number | Weekly/monthly cost for provided transport | Required if transport provided |
| Suitable for Couples | Boolean | Whether the position is suitable for couples to work together | Yes |
| Must Be Couple | Boolean | Whether the employer only wants to hire couples | No (default: false) |
| Couple Skill Overlap | Enum | "either" (one partner must have each skill) or "both" (all partners must have all skills) | No (default: "either") |
| Required Languages | List | Languages needed for the position | Yes |
| Images | URLs | Photos of workplace, accommodation, etc. | Yes |

#### 4.3.2 Job Posting Workflow & States

| State | Description | Transitions | Actions |
| ----- | ----------- | ----------- | ------- |
| Draft | Initial state when creating a job listing | To Pending Review (when submitted) | Create, Edit, Delete, Preview |
| Pending Review | Job submitted for admin approval | To Approved or Rejected | Comment, Preview |
| Approved | Job verified and publicly visible | To Expired (automatic) or Archived (manual) | Renew, Archive |
| Rejected | Job not approved due to issues | To Draft (after editing) | Edit, Delete, Preview |
| Expired | Job past its valid date range | To Draft (for renewal) | Renew, Archive |
| Archived | Job manually removed from visibility | To Draft (for reactivation) | Restore |

#### 4.3.3 Job Version Control

| Feature | Description |
| ------- | ----------- |
| Version History | Each job edit maintains a sequential version number and full content snapshot |
| Change Tracking | Major edits after approval require re-review by administrators |
| Audit Trail | Complete history of who made changes and when |
| Restoration | Ability to restore previous versions if needed |

#### 4.3.4 Admin Review & Commenting System

| Feature | Description |
| ------- | ----------- |
| Review Queue | Admins access a prioritized queue of jobs pending review |
| Commenting Thread | Two-way communication between admins and employers on specific job aspects |
| Section-Specific Comments | Comments can be attached to specific sections of the job listing |
| Notification System | Both parties receive alerts for new comments or status changes |
| Review Checklist | Standardized compliance checks for admin verification |

#### 4.3.5 Job Credit Management

| Feature | Description |
| ------- | ----------- |
| Credit Allocation | Job credits assigned based on subscription tier |
| Credit Consumption | One credit is deducted upon job approval |
| Credit Refund | Credits returned if job is rejected or deleted before publication |
| Credit Ledger | Full transaction history of credit allocation and usage |
| Credit Alerts | Notifications when credits are running low |

> Note: If a previously approved job is archived or withdrawn, the consumed credit is not refunded.

#### 4.3.6 Multi-Language Job Postings

| Feature | Description |
| ------- | ----------- |
| Language Variants | Job details can be entered in multiple platform-supported languages |
| Default Language | Primary language version required; others optional |
| Translation Indicators | Clear visual indicators of which languages are available |
| Language-Specific Search | Jobs searchable in the user's preferred language |
| Automatic Translation Tags | Option to mark listing as auto-translated vs. human-verified |

#### 4.3.6.1 Machine-Translation Quality Control

| Component | Implementation Details |
| --------- | ---------------------- |
| **1. Translation pipeline** | • Source segment → Deepl API (primary) → post-processor → QA rules → store as *draft* translation.<br>• Fallback to Google Translate only if Deepl returns 4xx/5xx > 3× in 30 s. |
| **2. Automatic QA (runs in <1 s per listing)** | | Rule | Check | Action |<br>|------|-------|--------|<br>| Length ratio | 0.6 ≤ len(target)/len(source) ≤ 1.4 | Flag "length_mismatch" |<br>| Placeholder integrity | `{VAR}` or `%s` preserved | Flag "placeholder_lost" |<br>| Forbidden terms | Regex list (e.g. "gratis huisvesting" mistranslated as "free exploitation") | Flag "forbidden_term" |<br>| Capitalisation | Job titles keep original capital letters | Auto-fix |<br>| Key nouns | Must match taxonomy list; fuzzy-match score < 0.8 → flag "term_low_conf" | |
| **3. Confidence score** | `C = 100 – Σ(rule_penalties)` (rule_penalties: minor = 5, major = 20).<br>• C ≥ 90 → auto-publish, mark "MT-verified".<br>• 70 ≤ C < 90 → queue for *Rapid Human Glance* (crowd-in-context, 2 min SLA).<br>• C < 70 → *Full Human Review* (in-house linguist, 24 h SLA). |
| **4. Human review process** | a. Reviewer sees side-by-side source + MT + terminology hints.<br>b. Accept / edit / reject + reason.<br>c. Edits added to Translation Memory (TM) and Glossary. |
| **5. User-visible indicators** | • Badge on listing card:<br>&nbsp;&nbsp;– "Verified translation" (Auto or Human)<br>&nbsp;&nbsp;– "Machine translation (beta)" if awaiting review.<br>• Hover tooltip shows language pair, confidence score, last review date. |
| **6. Employer workflow** | • Employer can "Request Pro Translation" (paid, 6-hour SLA) → ticket goes to LSP.<br>• Employer notified when translation drops below 70 due to glossary update; may edit directly or request review. |
| **7. Metrics & KPIs (reported monthly)** | • MT auto-publish rate ≥ 60%.<br>• Post-publish user complaint rate < 0.5%.<br>• Average human-review turnaround: Rapid ≤ 15 min, Full ≤ 12 h.<br>• Glossary hit-rate improvement ≥ 2% MoM. |
| **8. Monitoring & rollback** | • All published MT versions kept for 30 days; one-click rollback in admin UI.<br>• Real-time alert if complaint rate > 2% in any language for 24 h. |

#### 4.3.7 Job Preview Functionality

| Feature | Description |
| ------- | ----------- |
| Static Preview URL | Shareable URL showing how the job will appear when published |
| Worker View Simulation | Preview displays job as it would appear to workers |
| Mobile Preview | View how job will appear on different device sizes |
| Validation Feedback | Highlights missing or problematic fields |
| Skills Match Simulation | Preview estimated match scores with example candidates |

#### 4.3.8 Integration with Skills & Matching

| Feature | Description |
| ------- | ----------- |
| Skill Requirements | Required and preferred skills with minimum proficiency levels |
| Skill Weighting | Ability to assign importance to different skills (1-10 scale) |
| Skill Clusters | Quick selection of common skill groups by job type |
| Match Threshold | Minimum match score for worker notifications |
| Matching Events | Job approval triggers matching algorithm for candidate notifications |

### 4.4 Skills-Based Matching **(Priority: Medium)**
- Predefined skill selection for workers
- Certificate and language proficiency tracking
- Optional work history recording
- Matching algorithm to connect workers with relevant opportunities
- Couples matching for partners applying together

#### 4.4.1 Couples Application System **(Priority: Medium)**

| Feature | Description |
| ------- | ----------- |
| **Couple Profile Linking** | Workers can link their profiles as a couple, creating a connection between accounts |
| **Self-Disconnection** | Either partner can disconnect the couple relationship at any time |
| **Joint Applications** | Ability to apply as a couple to jobs marked as "suitable for couples" |
| **Individual Skills** | Each partner maintains their individual skills profile while being matched as a unit |
| **Combined Skill Set** | Employers can view the combined skill set of both partners when evaluating couple applications |
| **Couple-Specific Housing** | Jobs can specify if they offer accommodation suitable for couples |
| **Couple Search Filter** | Employers can specifically search for couples when their positions are suitable |
| **Couple Messaging** | Messages about applications are sent to both partners simultaneously |
| **De-coupling Process** | Formal process to separate linked profiles if partners no longer wish to apply together |
| **Partial Acceptance** | System handles scenarios where employers may want to hire only one person from a couple |

#### 4.4.2 Job Application Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Automatically generated unique identifier | Auto-generated |
| Job ID | Foreign Key | Reference to the job listing | Auto-populated |
| Worker ID | Foreign Key | Reference to the worker profile | Auto-populated |
| Is Couple Application | Boolean | Whether this is a couple applying together | Auto-populated |
| Couple ID | String | Unique identifier linking two profiles as a couple | Required if couple |
| Partner Application ID | Foreign Key | Reference to partner's application for the same job | Required if couple |
| Application Date | Timestamp | When the application was submitted | Auto-generated |
| Status | Enum | Pending, Viewed, In Review, Interview, Offered, Accepted, Rejected, Withdrawn | System-managed |
| Couple Status | Enum | Both Pending, Both Accepted, Both Rejected, Split Decision | Required if couple |
| Status Last Updated | Timestamp | When the status was last changed | Auto-updated |
| Cover Note | Text | Optional message from worker to employer | No |
| Employer Notes | Text | Private notes for employer reference | No (employer only) |
| Interview Date | Timestamp | Scheduled interview date/time if applicable | No |
| Interview Location | String | Physical address or meeting point for in-person interviews | Conditional |
| Interview Type | Enum | in_person, phone_call, video_call | No |
| Interview Platform | String | Video call platform (Zoom, Teams, Meet) or phone number | Conditional |
| Interview Meeting Link | String | Video call URL or dial-in information | Conditional |
| Interview Duration | Number | Expected interview duration in minutes (default: 30) | No |
| Joint Interview | Boolean | Whether interview is for both partners together | Required if couple |
| Interview Status | Enum | proposed, confirmed, rescheduled, completed, cancelled, no_show | System-managed |
| Interview Proposed Times | JSON Array | List of available time slots offered by employer | No |
| Interview Confirmation | Timestamp | When candidate confirmed the interview time | No |
| Interview Feedback | Text | Post-interview notes from employer | No |
| Interview Rating | Number | Employer rating of candidate (1-5 scale) | No |
| Response Time | Number | Time taken for employer to respond (in hours) | Auto-calculated |
| Match Score | Number | Algorithm-calculated compatibility percentage | Auto-calculated |
| Combined Match Score | Number | Combined compatibility score for couples | Required if couple |
| Skills Match | Object | Breakdown of matching skills | Auto-calculated |
| Language Match | Object | Breakdown of matching language requirements | Auto-calculated |
| Location Match | Boolean | Whether worker's location preferences match job location | Auto-calculated |
| Is Archived | Boolean | Whether application has been archived by either party | Default: False |

#### 4.4.3 Couple Matching Logic

| Process Step | Description | Implementation Details |
| ------------ | ----------- | ---------------------- |
| **Couple Profile Aggregation** | Creation of a virtual combined profile from two linked worker profiles | - Union of skills from both partners<br>- Union of language proficiencies<br>- Intersection of location preferences<br>- Earliest available start date between partners |
| **Job Eligibility Determination** | Logic to determine if a couple can be matched to a job | - All jobs marked `suitable_for_couples = true`<br>- Jobs with `must_be_couple = true` only match to couples<br>- Regular jobs (`suitable_for_couples = false`) only match to individual workers |
| **Skill Requirements Evaluation** | How couple skills are matched against job requirements | - `couple_skill_overlap = "either"`: At least one partner must have each required skill<br>- `couple_skill_overlap = "both"`: Both partners must have all required skills<br>- Default: `"either"` unless job specifically requires both partners to have same skills |
| **Match Score Calculation** | Formula for calculating couple match percentage | - Individual match scores calculated for each partner<br>- Combined skill score based on `couple_skill_overlap` setting<br>- Language score uses best proficiency level between partners for each required language<br>- Location and availability scores use most restrictive partner values<br>- Final score weighted same as individual workers for consistent ranking<br>- **Default weight vector**: Skills 50% ⋅ Language 20% ⋅ Availability 15% ⋅ Location 15% (sum = 100). Values configurable by admin feature flag `match.weight.override`. |
| **Application Handling** | How couple applications are processed | - Single application record with reference to both worker profiles<br>- Both partners must confirm application<br>- Employers see combined profile card with expandable individual details<br>- Interview scheduling includes both partners by default<br>- Option for employers to make split decision (hire one partner) |
| **Notification Logic** | How couples are notified about matches | - Both partners receive notifications simultaneously<br>- Match percentage shown is the combined score<br>- Notifications indicate job is suitable for couples<br>- Both partners can view application status in their dashboards |

The couple matching system ensures that partners seeking work together are matched to appropriate opportunities while giving employers the flexibility to specify exactly how couple skills should be evaluated for their specific positions. This approach balances the needs of couples who want to work together with employers' requirements for specific skill combinations.

#### 4.4.4 Couple Application Workflow

To ensure both partners explicitly consent to job applications while maintaining an efficient matching process, the platform implements a specialized application workflow for couples.

| Component | Description | Implementation Details |
| --------- | ----------- | ---------------------- |
| **Extended Application States** | Additional pre-submission states specific to couple applications | - **DraftSuggested**: The platform has suggested the job to the couple; no action taken yet<br>- **AwaitingPartner**: One partner has pressed "Apply as a couple", waiting for the other partner<br>- **Submitted**: Both partners have confirmed, application is now visible to the employer<br>- Standard states follow after submission (Viewed, In Review, etc.) |
| **Application Rules** | Key rules governing the couple application process | - Applications are only visible to employers after reaching the Submitted state<br>- AwaitingPartner applications timeout after N hours and are auto-canceled<br>- Either partner may explicitly cancel the application before submission<br>- Both partners are notified of all state changes |
| **Schema Extensions** | Data structure modifications to support couple application flow | Additional fields in the JobApplication table:<br>- **status**: Enum with new states DraftSuggested and AwaitingPartner<br>- **confirmed_by_partner_a**: Boolean<br>- **confirmed_by_partner_b**: Boolean |
| **Notification Logic** | How the system handles notifications for couple matches | - Both partners receive identical match notifications simultaneously<br>- Notification includes combined match score and "Apply as a couple" CTA<br>- When one partner confirms, the other receives an urgent notification<br>- Employers are only notified after both partners confirm |
| **API Workflow** | Backend process triggered when applying as a couple | 1. System creates or updates the application record<br>2. Sets the confirming partner's flag<br>3. Recalculates state (AwaitingPartner or Submitted)<br>4. Sends appropriate notifications based on new state<br>5. Only notifies employer after full submission |
| **UI/UX Elements** | Interface components specific to couple applications | **Worker Dashboard**:<br>- Dedicated "Couple Applications" tab<br>- Status chips showing DraftSuggested (grey), AwaitingPartner (orange), Submitted (green)<br><br>**Employer Dashboard**:<br>- Applications only visible after both partners confirm<br>- "Couple" indicator ribbon on application cards<br>- Interface for split-hire decisions when appropriate |
| **Matching Engine Integration** | How the matching algorithm handles couples | - Engine emits results with typing: `{matching_type: "individual" | "couple", worker_ids: [...]}`<br>- For couples, creates a single draft application with both worker IDs<br>- For individuals, creates standard single-applicant drafts |
| **Implementation Considerations** | Key technical tasks for implementation | - SQL migrations for new statuses and flags<br>- Updated application creation and transition unit tests<br>- Integration tests for partner acceptance/decline scenarios<br>- Updated localization strings for new notifications<br>- Worker FAQ updates to explain the couple application process |

This workflow ensures that automated matching can continue to provide immediate job suggestions while maintaining the requirement that both partners must explicitly confirm before an employer sees the application. The state machine approach provides clear visibility into the application's status for all parties and handles edge cases like timeouts and cancellations.

### 4.5 Communication System **(Priority: High)**
- Secure in-platform messaging between applicants and employers
- Notification system for new messages, application updates, and account alerts
- Comment-sharing feature for job posting review and editing

#### 4.5.1 Messaging Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Automatically generated unique identifier | Auto-generated |
| Conversation ID | String | Unique identifier for the conversation thread | Auto-generated |
| Related Job ID | Foreign Key | Reference to job listing if conversation is job-related | Auto-populated |
| Related Application ID | Foreign Key | Reference to application if conversation is application-related | Auto-populated |
| Sender ID | Foreign Key | User who sent the message | Auto-populated |
| Receiver ID | Foreign Key | User who receives the message | Auto-populated |
| Message Content | Text | The actual message text | Yes |
| Attachments | List | Files or images attached to the message | No |
| Sent Time | Timestamp | When the message was sent | Auto-generated |
| Delivered Time | Timestamp | When the message was delivered to recipient | Auto-updated |
| Read Time | Timestamp | When the message was read by recipient | Auto-updated |
| Is Read | Boolean | Whether the message has been read | Default: False |
| Is System Message | Boolean | Whether the message was generated by the system | Default: False |
| Is Flagged | Boolean | Whether the message has been flagged for review | Default: False |
| Report Reason | Enum | Reason if message was reported | No |
| Is Deleted | Boolean | Soft delete indicator | Default: False |

#### 4.5.2 Notification Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Automatically generated unique identifier | Auto-generated |
| User ID | Foreign Key | User who receives the notification | Auto-populated |
| Type | Enum | Message, Application Update, Verification, System Alert | Auto-populated |
| Related ID | Foreign Key | Reference to related entity (message, application, etc.) | Auto-populated |
| Content | Text | Notification text | Yes |
| Created Time | Timestamp | When the notification was generated | Auto-generated |
| Is Read | Boolean | Whether the notification has been viewed | Default: False |
| Read Time | Timestamp | When the notification was viewed | Auto-updated |
| Delivery Channel | Enum | In-app, Email, SMS | Auto-populated |
| Delivery Status | Enum | Pending, Sent, Failed | Auto-updated |

#### 4.5.3 Conversation Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | UUID | Unique identifier for the conversation | Auto-generated |
| Created At | Timestamp | When the conversation was initiated | Auto-generated |
| Updated At | Timestamp | When the conversation was last updated | Auto-updated |
| Related Job ID | Foreign Key | Reference to job listing if job-related | Nullable |
| Related Application ID | Foreign Key | Reference to application if application-related | Nullable |
| Last Message At | Timestamp | When the last message was sent | Auto-updated |
| Is Archived | Boolean | Whether the conversation is archived | Default: False |

#### 4.5.4 Conversation Participant Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the participant relationship | Auto-generated |
| Conversation ID | Foreign Key | Reference to the conversation | Yes |
| User ID | Foreign Key | Reference to the user | Yes |
| Role | Enum | "worker", "employer", "admin" | Yes |
| Last Read At | Timestamp | When the user last read the conversation | Nullable |
| Is Archived | Boolean | Whether the conversation is archived for this participant | Default: False |
| Joined At | Timestamp | When the user joined the conversation | Auto-generated |
| Left At | Timestamp | When the user left the conversation | Nullable |

#### 4.5.5 Message Flagging & Moderation

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the flag | Auto-generated |
| Message ID | Foreign Key | Reference to the flagged message | Yes |
| Flagged By | Foreign Key | User who flagged the message | Yes |
| Reason | Enum | "Inappropriate", "Spam", "Harassment", "Exploitation", "Other" | Yes |
| Details | Text | Additional details provided by the flagger | No |
| Status | Enum | "Pending", "Reviewed", "Actioned", "Dismissed" | Default: Pending |
| Reviewed By | Foreign Key | Admin who reviewed the flag | Nullable |
| Review Time | Timestamp | When the flag was reviewed | Nullable |
| Action Taken | Enum | "None", "Warning", "Message Removed", "User Suspended" | Nullable |
| Notes | Text | Admin notes about the review | No |

#### 4.5.6 Real-Time Communication Architecture

| Component | Description |
| --------- | ----------- |
| WebSocket Gateway | Handles real-time message delivery and status updates |
| Encryption Layer | Signal-style Double-Ratchet implementation for end-to-end message security |
| Redis Pub/Sub | Manages message broadcasting to online users |
| Message Queue | Processes offline notifications and email digests |
| Presence System | Tracks user online/offline status and typing indicators |
| Read Receipt Service | Manages message delivery and read status tracking |

#### 4.5.7 Security & Privacy Controls

| Feature | Description |
| ------- | ----------- |
| Message Encryption | See 4.5.7.1 for algorithms, key storage and rotation |
| Access Controls | Row-level security ensuring only conversation participants can access messages |
| Rate Limiting | Prevention of message flooding or spam |
| Attachment Scanning | Virus and malware detection for uploaded files |
| Data Retention | See 4.5.7.2 for defaults & options |
| Audit Logging | Complete history of message access and administrative actions |

#### 4.5.7.1 End-to-End Encryption Details

| Component | Implementation Details |
| --------- | ---------------------- |
| **1. Cryptographic primitives** | • Asymmetric keys X25519 (Curve25519) for ECDH key exchange<br>• Digital signatures Ed25519 to authenticate pre-keys and identify users<br>• Symmetric cipher AES-256-GCM (authenticated encryption with AEAD)<br>• Hash / KDF HKDF-SHA-256<br>• All primitives provided by libsodium (NaCl) v1.0.19+ |
| **2. Protocol – Signal-style Double-Ratchet** | a. Initial session setup uses X3DH (Extended Triple Diffie-Hellman) with:<br>&nbsp;&nbsp;– Identity key (IK) – long-term, generated on first login<br>&nbsp;&nbsp;– Signed pre-key (SPK) – rotates every 30 days or after 1,000 uses<br>&nbsp;&nbsp;– One-time pre-keys (OTK) – batch of 100 uploaded; replenished when <20 remain<br>b. After handshake, each message uses Double-Ratchet (DH ratchet + symmetric-key ratchet) to achieve forward secrecy and post-compromise security.<br>c. Group chats (future scope) use Sender Keys as per Signal's group algorithm. |
| **3. Key generation & storage** | • All keypairs generated client-side (browser/React Native) using WebCrypto → libsodium-wasm.<br>• Private IK & SPK are stored locally in IndexedDB/Keychain encrypted with a key derived from the user's session key (`PBKDF2( session_token, salt, 250k )`).<br>• Optional end-to-end backup: users may encrypt their key vault with a passphrase and store it in the cloud (zero-knowledge to server).<br>• Servers hold ONLY public keys; no private material is ever transmitted unencrypted. |
| **4. Message payload format** | ```<br>{<br>  version: 1,<br>  header: {<br>    dh_pub: <32 B>,<br>    prev_symmetric_key_hash: <32 B>,<br>    msg_index: uint32,<br>    iv: <12 B><br>  },<br>  ciphertext: <variable>,<br>  auth_tag: <16 B><br>}<br>```<br>• Total overhead per message: 104 bytes (headers + GCM tag). |
| **5. Attachment encryption** | • File encrypted client-side with a random 256-bit AES-GCM key + 96-bit IV.<br>• Key & IV sent as an extra E2E message.<br>• Encrypted file uploaded to object storage (S3/Backblaze); URL is meaningless without key. |
| **6. Forward secrecy & key expiration** | • Symmetric ratchet key replaced after every message.<br>• DH ratchet executed whenever a party sends a message after receiving one.<br>• Old symmetric keys are wiped from memory immediately after use.<br>• Signed pre-key automatically rotates every 30 days; user is prompted to refresh if offline longer. |
| **7. Offline & multi-device support** | • Each device has its own IK/SPK/OTK set registered with the server.<br>• Messages are fan-out encrypted once per recipient device (like Signal "multi-device fan-out").<br>• Device list signed by the user's IK; updated on add/remove. |
| **8. Key distribution & directory service** | • REST endpoint `GET /keys/{user_id}` returns:<br>&nbsp;&nbsp;{ identity_key, signed_pre_key, signature, one_time_keys[n] }<br>• Directory responses signed by the platform's server key to prevent tampering.<br>• Public key pinning done via SHA-256 digest inside JWT issued at login. |
| **9. Compliance & audits** | • Annual third-party cryptographic audit (cure53 or NCC Group).<br>• Automated test-suite runs test vectors against libsodium primitives.<br>• Key-usage metrics exposed via Prometheus without leaking identities (counts only).<br>• GDPR Article 32 technical-organisational measures (TOMs) documented; zero-knowledge architecture explained in privacy policy. |
| **10. Failure modes & fallbacks** | • If a recipient device has no OTKs left, sender falls back to an "asymmetric-only fallback key" and triggers push to regenerate keys.<br>• If E2E fails (e.g., legacy browser), message send is blocked with actionable error; no silent downgrade to plain-text is ever allowed. |

#### 4.5.7.2 Message & Attachment Retention Policy

| Component | Implementation Details |
| --------- | ---------------------- |
| **1. Default retention tiers (applied per conversation)** | | Data type | Live period | Soft-delete grace | Hard-delete (purge) | Notes |<br>|-----------|------------|------------------|---------------------|-------|<br>| Text messages | 36 months | 30 days | 37 months | Meets NL labour-law advice for employment comms |<br>| Attachments (≤10 MB) | 18 months | 30 days | 19 months | Virus-scanned copies only |<br>| Message flags & moderation notes | 60 months | — | 60 months | Evidence window for legal disputes |<br>| E2E key-exchange metadata (public keys, device IDs) | 12 months since last use | — | 13 months | Needed for session repair |<br>| Delivery/read receipts & presence pings | 90 days | — | 90 days | Analytics only | |
| **2. User-configurable retention presets (per account)** | • "Standard" → defaults above<br>• "Short" → 12 m messages / 6 m attachments (complies with GDPR-min)<br>• "Long" → 60 m messages / 36 m attachments (enterprise record-keeping)<br>• "Custom" → Employer can set 6-60 m range for each category; workers inherit employer's setting once they engage in a conversation tied to that employer. |
| **3. Right-to-erasure & legal hold** | • Workers may request deletion of personal messages → system moves convo to "pending erase"; 30-day window for employer to place **Legal Hold**.<br>• If hold applied, data retained up to 7 years or until hold released.<br>• If no hold, purge job runs next cycle. |
| **4. Purge mechanics** | • Nightly cron scans for `expires_at < NOW()`, enqueues delete tasks.<br>• Deletion cascade: ciphertext rows → attachment blobs → search index docs → cache keys.<br>• Hash of message ID + deletion timestamp stored 30 days to prevent resurrection by replica lag. |
| **5. Admin & audit** | • Retention preset visible in Employer "Compliance" tab.<br>• Audit trail records every preset change and legal hold action (who, when, reason).<br>• Monthly Prometheus metric `messages_purged_total` exported for capacity planning. |
| **6. Compliance mapping** | • GDPR Art. 5(1)(e) – storage limitation (configurable range).<br>• Dutch "Wet op de Loonbelasting" evidence retention = 7 y; moderation logs stored 5 y fall within.<br>• ISO 27001 A.8.3.2 – disposal of media (purge job produces deletion receipts kept 12 m). |

#### 4.5.8 Notification Delivery System

| Feature | Description |
| ------- | ----------- |
| Delivery Channels | In-app, email, and optional SMS notifications |
| Batching Logic | Intelligent grouping of notifications to prevent overwhelming users |
| Frequency Controls | User-configurable notification frequency (immediate, digest, muted) |
| Priority Levels | Critical notifications bypass user preferences for urgent matters |
| Critical Escalation | Priority-override notification type for serious allegations requiring immediate attention |
| Delivery Confirmation | Tracking of notification delivery and interaction |
| Template System | Customizable notification templates with localization support |

#### 4.5.9 Enhanced Privacy Controls

| Feature | Description |
| ------- | ----------- |
| Conversation Expiry | User-configurable automatic message expiry (30 days to never) |
| Message Recall | Ability to delete sent messages within a time window (up to 1 hour) |
| Selective History Deletion | Users can delete specific conversation segments while preserving others |
| Conversation Export | Option to download conversation history in compliance with GDPR |
| Read Receipt Control | Granular control over sending/receiving read receipts |
| Profile Privacy Tiers | Control what data is visible to different user categories (public/applied/matched) |
| Incognito Applications | Option to apply to jobs without revealing profile details until mutual interest is established |
| Personal Data Review | Dashboard showing all stored personal data with deletion options |
| Marketing Preferences | Granular opt-in/opt-out controls for different types of communications |
| Privacy Analytics | Anonymous usage data contribution controls with clear explanation of benefits |
| Data Processing Records | Transparent logging of all data processing activities accessible to users |
| Verification Without Storage | Option to verify documents without permanent storage (view-only verification) |
| Third-Party Data Sharing | Explicit consent management for any sharing with external partners |
| Cross-Device Privacy | Consistent privacy settings synchronized across all devices |
| Privacy Setting Export | Option to export privacy configuration to apply to new accounts |
| Regulatory Compliance | Adjustable privacy settings based on jurisdiction and applicable laws |
| Privacy Impact Assessments | Regular reviews of privacy impact with published results |
| Right to Be Forgotten | One-click initiation of complete account deletion process |
| Account Hibernation | Temporarily freeze account activity without deletion |
| Children's Privacy Protection | Age verification and special protections for users under 18 |
| Biometric Data Protection | Special handling of any biometric authentication data with enhanced security |
| Location Data Minimization | Precise location used only when explicitly necessary with clear user control |

### 4.6 Subaccount Management **(Priority: Medium)**
- Primary account management for agency owners or managers
- Subaccount creation for individual recruiters
- Permission settings for different account levels
- Activity tracking across all accounts

#### 4.6.1 Subaccount Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | UUID | Unique identifier for the user account | Auto-generated |
| Employer ID | Foreign Key | Reference to the employer account | Yes |
| Email | String | Primary contact email (used for login) | Yes |
| Role | Enum | 'main', 'recruiter' | Yes |
| Status | Enum | 'active', 'invited', 'suspended', 'deleted' | Yes |
| Display Name | String | User's display name within the platform | Yes |
| Invited By | Foreign Key | Reference to the user who sent the invitation | Auto-populated |
| Invitation Accepted At | Timestamp | When the invitation was accepted | Nullable |
| Last Active At | Timestamp | When the user was last active | Auto-updated |
| Created Date | Timestamp | When the account was created | Auto-generated |
| Modified Date | Timestamp | When the account was last modified | Auto-updated |

#### 4.6.2 Role-Based Access Control Matrix

| Capability | Main Account | Recruiter |
| ---------- | ------------ | --------- |
| Create/modify subaccounts | ✓ | ✗ |
| Post job listings | ✓ | ✓ |
| Archive job listings | ✓ | Only own |
| View credit ledger & billing | ✓ | ✗ |
| Purchase additional credits | ✓ | ✗ |
| Edit employer profile | ✓ | ✗ |
| View applications | ✓ | Only own jobs |
| Manage subscription | ✓ | ✗ |
| View performance analytics | ✓ | Own only |

#### 4.6.3 Invitation Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | UUID | Unique identifier for the invitation token | Auto-generated |
| Employer ID | Foreign Key | Reference to the employer account | Auto-populated |
| Email | String | Invitee's email address | Yes |
| Role | Enum | 'main', 'recruiter' | Yes |
| Expires At | Timestamp | When the invitation expires (48 hours) | Auto-generated |
| Accepted At | Timestamp | When the invitation was accepted | Nullable |
| Invited By | Foreign Key | Reference to the user who sent the invitation | Auto-populated |
| Created Date | Timestamp | When the invitation was created | Auto-generated |

#### 4.6.4 Subaccount Invitation Flow

| Step | Description | Actor |
| ---- | ----------- | ----- |
| 1 | Main account holder accesses "Team" section and selects "Invite Team Member" | Main Account |
| 2 | Form collects email, role, and optional personalized message | Main Account |
| 3 | System generates secure invitation token and sends email to invitee | System |
| 4 | Invitee clicks link in email and is directed to account creation page | Invitee |
| 5 | Form pre-fills email, collects display name and authentication preferences | Invitee |
| 6 | Upon completion, account is activated with specified role and employer association | System |
| 7 | Notification sent to Main Account confirming account creation | System |

#### 4.6.5 Subaccount Management Features

| Feature | Description |
| ------- | ----------- |
| Role Management | Ability to assign main or recruiter role to team members |
| Account Suspension | Temporarily disable access while preserving account history |
| Activity Tracking | Dashboard showing login history and key actions by subaccounts |
| Performance Analytics | Metrics on job postings, application response rates, and hires by recruiter |
| Bulk Invitation | Ability to invite multiple team members simultaneously via CSV upload |
| Audit Logging | Complete history of role changes, suspensions, and other administrative actions |
| Auto-inheritance | Subaccounts automatically inherit employer verification status and subscription limits |
| Main Account Protection | System ensures at least one active main account exists at all times |

#### 4.6.6 Security & Compliance

| Feature | Description |
| ------- | ----------- |
| Row-Level Security | Data access filtered by employer_id to prevent cross-organization visibility |
| Role Enforcement | Server-side validation of permissions for all actions |
| Audit Trail | All role changes and account management actions logged with timestamps and actor |
| Suspension Cascade | When employer account is suspended, all subaccounts inherit suspension |
| Invitation Expiry | Invitation tokens expire after 48 hours for security |
| Re-invitation | Sending a new invitation invalidates any previous outstanding invitations |

### 4.7 Reporting Mechanism **(Priority: High)**
- Anonymous reporting system for workers to flag potential exploitation
- Review process for reported issues
- Escalation path for serious allegations
- Feedback loop to agencies for minor issues

#### 4.7.1 Report Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | UUID | Unique identifier for the report | Auto-generated |
| Reporter ID | Foreign Key | Reference to the worker who filed the report (null if anonymous) | Nullable |
| Target Employer ID | Foreign Key | Reference to the employer being reported | Yes |
| Target Job ID | Foreign Key | Reference to the specific job listing (if applicable) | Nullable |
| Type | Enum | "exploitation", "unsafe_housing", "unpaid_wages", "harassment", "other" | Yes |
| Description | Text | Detailed explanation of the issue | Yes |
| Attachment URL | Text | Link to uploaded evidence (photo, document) | Nullable |
| Severity | Enum | "low", "medium", "high", "critical" | Default: medium |
| Status | Enum | "open", "in_review", "needs_info", "resolved", "escalated" | Default: open |
| Created At | Timestamp | When the report was submitted | Auto-generated |
| Updated At | Timestamp | When the report was last modified | Auto-updated |

#### 4.7.2 Report Action Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the action | Auto-generated |
| Report ID | Foreign Key | Reference to the associated report | Yes |
| Action By | Foreign Key | Reference to the admin who took the action | Yes |
| Action | Enum | "status_change", "comment", "feedback_sent", "escalated" | Yes |
| Detail | Text | Description of the action taken | Yes |
| Created At | Timestamp | When the action was taken | Auto-generated |

#### 4.7.3 Employer Feedback Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the feedback | Auto-generated |
| Report ID | Foreign Key | Reference to the associated report | Yes |
| Employer ID | Foreign Key | Reference to the employer receiving feedback | Yes |
| Feedback Body | Text | Content of the feedback message | Yes |
| Sent At | Timestamp | When the feedback was sent | Auto-generated |
| Read At | Timestamp | When the feedback was viewed by the employer | Nullable |
| Response | Text | Optional employer response to the feedback | Nullable |
| Response At | Timestamp | When the employer responded | Nullable |

#### 4.7.4 Reporting Workflow

| Stage | Description | Actions Available | Next Stages |
| ----- | ----------- | ----------------- | ----------- |
| Submit | Worker files report through form | Attach evidence, choose anonymity | Open |
| Open | New report awaiting initial review | Assign to admin, set severity | In Review |
| In Review | Admin actively investigating | Request more info, add comments | Needs Info, Resolved, Escalated |
| Needs Info | Awaiting additional information | Send questions to reporter | In Review, Resolved, Escalated |
| Resolved | Issue addressed satisfactorily | Send feedback to employer, close report | (Terminal state) |
| Escalated | Serious issue requiring external action | See 4.7.8 for detailed escalation path | (Terminal state) |

#### 4.7.5 Reporting User Interface

| Interface | Description | Key Features |
| --------- | ----------- | ------------ |
| Report Button | Accessible from job listings and messages | Prominent placement, clear call-to-action |
| Report Form | Modal dialog for submitting reports | Type selection, description field, file upload, anonymity toggle |
| Confirmation Screen | Shown after successful submission | Reference number, explanation of next steps |
| Admin Queue | List of reports for administrators | Sortable by severity, age, status; filterable by type |
| Report Detail | Complete view of a single report | Timeline of actions, comment thread, action buttons |
| Employer Feedback | Interface for employers to view feedback | List of feedback items with resolution advice |

#### 4.7.6 Security & Privacy Controls

| Control | Description |
| ------- | ----------- |
| Anonymity Protection | Reporter identity never revealed to employers |
| Row-Level Security | Reports only visible to admins and (limited view) to target employers |
| Evidence Storage | Attachments scanned for malware and stored securely |
| Audit Trail | Complete history of all actions taken on reports |
| GDPR Compliance | Data retention policies and right-to-erasure support |
| Rate Limiting | Prevention of report flooding from single sources |

#### 4.7.7 Notification & Escalation System

| Feature | Description |
| ------- | ----------- |
| Admin Alerts | High-severity reports trigger immediate notifications |
| Status Updates | Reporter receives updates when report status changes (if not anonymous) |
| Employer Notifications | Feedback delivery with required acknowledgment |
| External Escalation | API integration with partner organizations for serious cases |
| Automatic Flagging | System identifies patterns of repeated reports against same employer |
| Compliance Tracking | Metrics on employer response rates and resolution times |

#### 4.7.8 Escalation Workflow for Serious Allegations

The platform implements a structured, time-sensitive escalation process for serious allegations to ensure appropriate and timely engagement with external authorities.

| Component | Description |
| --------- | ----------- |
| **Scope - What Triggers Escalation** | - Report type = exploitation, unsafe_housing, unpaid_wages, harassment, trafficking, or "other" + severity = critical<br>- Two medium-severity reports about the same employer within 30 days<br>- Any report that includes credible evidence of human-trafficking or physical violence |
| **Triage Timeline** | - T + 0 min: System labels report "critical" → real-time Slack / PagerDuty alert to Duty Admin<br>- T + 30 min: Duty Admin acknowledges in platform ("accept incident") – SLA enforced<br>- T + 2 h: Admin completes initial verification (phone/email with reporter if possible)<br>- T + 4 h: If verified "likely valid", incident escalated to Compliance Lead |
| **Escalation Levels & External Contacts** | **Level 1 (Info-only) – misdemeanour labour violations**<br>- Notify Inspectie SZW (Dutch Labour Inspectorate) via secure webform; attach report PDF<br><br>**Level 2 (Urgent) – wage theft & housing violations causing immediate harm**<br>- Phone contact with Inspectie SZW duty officer; ticket ID recorded<br>- Email FairWork Foundation (NGO partner) encrypted copy<br><br>**Level 3 (Critical) – human-trafficking, physical abuse, threat to life**<br>- 112 / local police emergency call; incident number stored<br>- Within 24 h file Form K "melding mensenhandel" to Politie AVIM<br>- Alert CoMensha (National Co-ordination Centre for Trafficking) via secure portal |
| **Data Package Sent Externally** | - Anonymised reporter ID (unless consent given to share)<br>- Employer record incl. KvK, VAT, contact data, job ID(s)<br>- Evidence files: photos, chat logs, contract scans – virus-checked & water-marked<br>- Internal investigation notes & timestamps |
| **Permissions & Privacy** | - Only Compliance Lead & senior admins can export Level 2/3 bundles (role: "escalation_admin")<br>- All exports logged in report_escalation_log (report_id, user_id, authority, timestamp)<br>- Reporter identity shared only with authorities that provide legal privilege (Labour Inspectorate, Police) and only if reporter opts-in |
| **Post-escalation Actions** | - Employer account automatically set to "suspended_pending_investigation"<br>- All live jobs hidden; applicants notified: "Listing temporarily unavailable"<br>- Platform counsel reviews within 48 h whether to terminate the employer<br>- Weekly incident review meeting—status updated, next actions assigned |
| **Communication Templates** | - "Escalation Notice" email to authority with summary & secure-link download (expires 7 days)<br>- "Reporter Safety Guide" email/SMS explaining next steps & helplines<br>- "Employer Suspension" notice with appeal instructions |
| **Metrics & Audit** | - KPI: mean-time-to-escalate (MTE) ≤ 4 h, closure within 30 days<br>- Quarterly anonymised escalation report shared with NGO partners<br>- Annual penetration test of secure-bundle export flow |

### 4.8 Subscription Management **(Priority: High)**
- Tiered subscription offerings based on agency size and needs
- Payment processing integration
- Additional job pack purchasing
- Account status tracking and renewal reminders

#### 4.8.1 Subscription Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | UUID | Unique identifier for the subscription | Auto-generated |
| Employer ID | Foreign Key | Reference to the employer account | Yes |
| Payment Provider ID | String | External reference to payment provider (e.g., Stripe) | Yes |
| Subscription ID | String | External reference to subscription in payment system | Yes |
| Tier | Enum | 'free', 'tier1', 'tier2', 'tier3' | Yes |
| Status | Enum | 'active', 'past_due', 'cancelling', 'cancelled' | Yes |
| Current Period Start | Timestamp | Start date of current billing period | Yes |
| Current Period End | Timestamp | End date of current billing period | Yes |
| Next Tier | Enum | 'free', 'tier1', 'tier2', 'tier3' | Nullable |
| Grace Until | Timestamp | End date of grace period for past due accounts | Nullable |
| Created At | Timestamp | When the subscription was created | Auto-generated |
| Updated At | Timestamp | When the subscription was last modified | Auto-updated |

#### 4.8.2 Job Credit Ledger Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the ledger entry | Auto-generated |
| Employer ID | Foreign Key | Reference to the employer account | Yes |
| Delta | Integer | Change in credit balance (positive = add, negative = use) | Yes |
| Reason | Enum | 'initial_grant', 'credit_pack', 'job_approved', 'refund', 'expire' | Yes |
| Reference ID | String | External reference (job ID or payment ID) | Nullable |
| Created At | Timestamp | When the ledger entry was created | Auto-generated |

#### 4.8.3 Credit Request Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the credit request | Auto-generated |
| Employer ID | Foreign Key | Reference to the employer account | Yes |
| Job ID | Foreign Key | Reference to the job needing credits | Yes |
| Requested By | Foreign Key | Reference to the recruiter who created the request | Yes |
| Credits Needed | Integer | Number of credits requested | Yes |
| Status | Enum | 'pending', 'approved', 'denied', 'fulfilled' | Yes |
| Created At | Timestamp | When the request was created | Auto-generated |
| Updated At | Timestamp | When the request status was last changed | Auto-updated |

#### 4.8.4 Subscription Tiers

| Tier | Monthly Price | Job Credits | Features |
| ---- | ------------- | ----------- | -------- |
| Free | €0 | 1 | Basic job posting, no subaccounts |
| Tier 1 | €49 | 5 | All basic features, 2 subaccounts |
| Tier 2 | €99 | 15 | Advanced features, 5 subaccounts |
| Tier 3 | €199 | 40 | Premium features, unlimited subaccounts |

#### 4.8.5 Credit Pack Options

| Pack Size | Price | Value |
| --------- | ----- | ----- |
| Small | €39 | 3 credits |
| Medium | €79 | 7 credits |
| Large | €149 | 15 credits |
| Enterprise | €299 | 35 credits |

#### 4.8.6 Subscription Status Flow

| Status | Description | Available Actions | Next Possible States | Triggers |
| ------ | ----------- | ----------------- | ------------------- | -------- |
| Active | Subscription in good standing | Post jobs, manage account | Past Due (payment fails) | Payment failure |
| Past Due | Payment failed but in grace period | Limited posting, update payment | Active (payment succeeds), Cancelling (grace expires) | Active: Payment succeeds<br>Cancelling: After third failed retry (Day 14 in dunning schedule) |
| Cancelling | Grace period expired, scheduled for cancellation | Update payment | Active (payment succeeds), Cancelled (at period end) | Active: Payment succeeds<br>Cancelled: Day 30 if still unpaid |
| Cancelled | Subscription terminated | Purchase new subscription | Active (new subscription) | New subscription purchase |

#### 4.8.7 Credit Request Workflow

| Step | Description | Actor |
| ---- | ----------- | ----- |
| 1 | Recruiter submits job for review with insufficient credits | Recruiter |
| 2 | System creates credit request and sets job to "Awaiting Credits" | System |
| 3 | Main account holder receives notification of pending request | System |
| 4 | Main account holder reviews request in billing dashboard | Main Account |
| 5 | Main account holder approves (allocates existing credits or purchases new pack) | Main Account |
| 6 | System updates job status to "Pending Review" and notifies recruiter | System |

#### 4.8.8 Notification Events

| Event | Recipients | Channels | Timing |
| ----- | ---------- | -------- | ------ |
| Subscription Renewal | Main account | Email, In-app | 7 days before, 1 day before |
| Payment Failed | Main account | Email, In-app | Day 0, Day 3, Day 7, Day 14 (see dunning schedule) |
| Low Credits | Main account | Email, In-app | When credits ≤ 3 |
| Credit Request | Main account | Email, In-app | Immediately when created |
| Request Approved | Recruiter | Email, In-app | Immediately when approved |
| Request Denied | Recruiter | Email, In-app | Immediately when denied |
| Subscription Cancelled | Main account | Email, In-app | Immediately when cancelled |
| Refund Issued | Main account | Email, In-app | Immediately when refund is processed |
| Payment Method Expiring | Main account | Email, In-app | 30 days before expiration, 7 days before |

#### 4.8.9 Billing Interface Components

| Component | Description | User Access |
| --------- | ----------- | ----------- |
| Subscription Overview | Current tier, renewal date, credit balance | Main account |
| Plan Selection | Compare and change subscription tiers | Main account |
| Credit Purchase | Buy additional credit packs | Main account |
| Invoice History | View and download past invoices | Main account |
| Credit Requests | Review and action pending credit requests | Main account |
| Credit Usage | Analytics on credit consumption by recruiters | Main account |
| Payment Methods | Manage cards and SEPA direct debit details | Main account |

#### 4.8.10 Payment Processing & Billing Details

The platform implements a comprehensive payment processing system using Stripe to handle subscriptions, one-time purchases, and recurring billing.

| Category | Details |
| -------- | ------- |
| **Provider & Compliance** | - Stripe (Standard or Connect) – PCI-DSS Level 1, PSD2/SCA ready<br>- Webhooks: invoice.payment_succeeded, invoice.payment_failed, customer.subscription.*, charge.refunded<br>- All card data handled by Stripe Elements; platform never stores PAN |
| **Accepted Payment Methods** | - Credit/debit cards (Visa, Mastercard, AmEx)<br>- SEPA Direct Debit (NL/DE) – supports recurring payments<br>- iDEAL (one-off, used for credit packs)<br>- Apple Pay / Google Pay (surfaced by Stripe automatically)<br>- Bank transfer (manual) only for Enterprise ≥ Tier 3 – processed by finance team within 2 business days |
| **Initial Checkout Flow** | 1. Employer selects tier → POST /billing/checkout<br>2. Backend creates Stripe Customer, Subscription (trial = 0 days), and PaymentIntent<br>3. Stripe Checkout returns session_url; front-end redirects<br>4. Webhook confirms payment_succeeded → platform<br>&nbsp;&nbsp;a. Sets subscription.status = active<br>&nbsp;&nbsp;b. Credits allocated<br>&nbsp;&nbsp;c. Invoice PDF stored & emailed |
| **Recurring Billing & Dunning** | - Auto-renew every 30 days (monthly plans) or 365 days (annual)<br>- If renewal charge fails:<br>&nbsp;&nbsp;1. Day 0: Email + in-app banner "Payment failed – update method"<br>&nbsp;&nbsp;2. Day 3: Retry charge (1)<br>&nbsp;&nbsp;3. Day 7: Retry charge (2) + disable NEW job posting<br>&nbsp;&nbsp;4. Day 14: Retry charge (3) + status = cancelling, grace until period_end<br>&nbsp;&nbsp;5. Day 30: If unpaid, subscription cancelled, all live jobs archived |
| **Mid-cycle Changes** | - Upgrade = immediate: Creates new Subscription with proration_behavior = create_prorations; extra charge collected right away<br>- Downgrade scheduled for next billing cycle; current credits remain |
| **Credit-pack Purchases** | - One-off Stripe PaymentIntent<br>- Credits attached to employer ledger only after payment_succeeded<br>- Credits expire 12 months after purchase; non-refundable except where legally required |
| **Refund Policy** | - Subscription: 14-day "no-questions" full refund for first-time buyers (EU consumer law)<br>- After 14 days: Prorated refund of unused days if platform terminates account; no refund for voluntary cancellation<br>- Credit packs: Non-refundable after charge succeeds unless purchase error demonstrably on platform side<br>- Approved-job credit is non-refundable (see 4.3.5); rejected or deleted-before-approval jobs auto-credit back |
| **Additional Data Structures** | **PaymentMethod**<br>- id, employer_id, stripe_pm_id, type, last4, exp_month/year, brand, created_at<br><br>**Invoice**<br>- id, employer_id, stripe_invoice_id, amount_gross, amount_tax, currency, pdf_url, status, created_at<br><br>**Refund**<br>- id, employer_id, stripe_refund_id, invoice_id, amount, reason, processed_at |
| **Admin Console** | - List active subscriptions with next-renewal date & current dunning step<br>- One-click "Grant free month", "Issue custom refund"<br>- CSV export of all invoices / refunds |
| **Security & Audit** | - Signed webhook secrets rotated quarterly<br>- All billing-related table changes logged in billing_audit_log (user_id, action, metadata, ip, ts) |

### 4.9 Multi-Language Support **(Priority: Medium)**
- Interface available in Dutch, Polish English initially
- Support for additional languages in future phases
- Translation of all details on the platform

#### 4.9.1 Localization Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| Key | String | Unique identifier for the translation string | Yes |
| Locale | String | Language code (e.g., 'nl', 'pl', 'en') | Yes |
| Value | Text | Translated content | Yes |
| Context | String | Description for translators | No |
| Last Updated | Timestamp | When the translation was last modified | Auto-updated |

#### 4.9.2 Translatable Content Types

| Content Type | Storage Method | Translation Approach |
| ------------ | -------------- | ------------------- |
| UI Elements | JSON/YAML Files | Key-based lookup |
| Job Listings | Database Tables | Parallel records per locale |
| Skills & Certifications | Database Tables | Parallel records per locale |
| Emails & Notifications | Template Files | Separate templates per locale |
| Legal Documents | Markdown Files | Separate files per locale |
| Error Messages | JSON/YAML Files | Key-based lookup |

#### 4.9.3 Multi-Language Job Listing Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| Job ID | Foreign Key | Reference to the main job record | Yes |
| Locale | String | Language code (e.g., 'nl', 'pl', 'en') | Yes |
| Title | String | Job title in specific language | Yes |
| Description | Text | Job description in specific language | Yes |
| Requirements | Text | Job requirements in specific language | No |
| Additional Info | Text | Additional information in specific language | No |
| Is Primary | Boolean | Whether this is the primary language version | One per job must be true |
| Is Machine Translated | Boolean | Whether the content was machine translated | Default: False |

#### 4.9.4 Language Selection & Fallback Logic

| Priority | Method | Description |
| -------- | ------ | ----------- |
| 1 | Explicit Selection | User manually selects language from UI |
| 2 | User Profile | Saved preference in user profile |
| 3 | Browser Detection | Based on Accept-Language HTTP header |
| 4 | Geolocation | Based on IP address location |
| 5 | Default | English as platform default |

#### 4.9.5 Translation Workflow

| Stage | Description | Responsible |
| ----- | ----------- | ----------- |
| Extraction | Identify translatable strings from codebase | Automated |
| Translation | Convert strings to target languages | Translators |
| Automated QA | Confidence scoring and quality verification (see 4.3.6.1) | Automated |
| Review | Verify accuracy and context | Native speakers |
| Integration | Import translations into application | Automated |
| Testing | Verify display and functionality | QA |
| Deployment | Release new translations to production | DevOps |

#### 4.9.6 Language-Specific Components

| Component | Description | Implementation |
| --------- | ----------- | -------------- |
| Date Formatting | Display dates according to locale conventions | Intl.DateTimeFormat API |
| Number Formatting | Display numbers according to locale conventions | Intl.NumberFormat API |
| Currency Display | Format currency values appropriately | Locale-specific templates |
| Text Direction | Support for RTL languages in future | dir attribute and CSS |
| Pluralization | Handle grammatical number differences | ICU Message Format |
| Collation | Proper alphabetical sorting | Locale-aware sorting functions |

#### 4.9.7 Translation Management System

| Feature | Description |
| ------- | ----------- |
| Web Interface | Browser-based translation editor for non-technical users |
| Missing Translation Alerts | Notification system for untranslated strings |
| Version Control | History of translation changes |
| Export/Import | Standard format exchange (XLIFF, PO) |
| Translation Memory | Reuse of previously translated segments |
| Glossary | Consistent terminology across translations |
| Machine Translation | AI-assisted initial translation with human review |

### 4.10 Mobile Responsiveness **(Priority: High)**
- Full platform functionality on mobile devices
- Optimized document upload process for mobile users
- Responsive design for all screen sizes

#### 4.10.1 Mobile Design Principles

| Principle | Description | Implementation |
| --------- | ----------- | -------------- |
| Mobile-First | Design for smallest screens first, then enhance for larger screens | CSS with min-width breakpoints starting at 360px |
| Fluid Layouts | Flexible content that adapts to different screen sizes | CSS Grid/Flexbox with relative units |
| Touch-Optimized | Interface elements sized for finger interaction | Minimum 44×44px tap targets |
| Performance | Fast loading and smooth interaction on mobile networks (see 8.3.1) | Optimized assets, lazy loading, minimal JS |
| Accessibility | Usable by all, regardless of device or ability (see 8.3.2) | WCAG 2.1 AA compliance, logical tab order |
| Offline Support | Core functionality available with intermittent connectivity - see 4.10.6 for scope | Service worker for form saving |

#### 4.10.2 Responsive Breakpoints

| Breakpoint | Target Devices | Layout Adjustments |
| ---------- | -------------- | ------------------ |
| ≤360px | Small smartphones | Single column, stacked elements |
| 361-767px | Standard smartphones | Single column, some horizontal elements |
| 768-1023px | Tablets, large smartphones | Two column layouts where appropriate |
| ≥1024px | Desktops, large tablets | Multi-column layouts, side panels |

#### 4.10.3 Mobile-Specific Features

| Feature | Description | Benefit |
| ------- | ----------- | ------- |
| Camera Integration | Direct photo capture for documents and profile pictures | Simplified upload process |
| Touch Gestures | Swipe, pinch, and tap interactions | Natural mobile interaction patterns |
| Offline Form Saving | Automatic saving of form progress | Prevents data loss with poor connectivity |
| Optimized Keyboards | Appropriate keyboard types for different input fields | Faster and more accurate data entry |
| Push Notifications | Mobile alerts for important events | Timely updates without checking app |
| Location Services | Optional GPS integration for job search | Easier location-based filtering |

#### 4.10.4 Component Adaptations

| Component | Mobile Adaptation | Desktop Version |
| --------- | ----------------- | -------------- |
| Navigation | Bottom navigation bar or hamburger menu | Horizontal top navigation |
| Tables | Card-based vertical layout | Traditional tabular format |
| Forms | Single-section progressive disclosure | Multi-section visible forms |
| Modals | Full-screen slide-overs | Centered dialog boxes |
| Job Listings | Vertical stack with essential information | Grid with more visible details |
| Filters | Collapsible bottom sheet | Persistent sidebar |

#### 4.10.5 Mobile Performance Targets

| Metric | Target | Measurement |
| ------ | ------ | ----------- |
| Page Load Time | <3 seconds on 3G | Lighthouse Performance Score |
| Time to Interactive | <5 seconds on 3G | Lighthouse TTI Metric |
| Bundle Size | <350KB gzipped (initial load) | Webpack Bundle Analyzer |
| Memory Usage | <100MB on low-end devices | Chrome DevTools Memory Profile |
| Battery Impact | Minimal background processing | DevTools Performance Monitor |
| Offline Capability | Core browsing and form saving | Lighthouse PWA Score ≥90 |

#### 4.10.6 Offline Capability Matrix

| Component | Implementation Details |
| --------- | ---------------------- |
| **1. Technical foundation** | • Progressive-Web-App (PWA) installable on iOS / Android / desktop.<br>• Service-Worker (workbox v6) with two runtime caches:<br>&nbsp;&nbsp;– `static-v{n}` immutable JS/CSS/fonts (Cache-First)<br>&nbsp;&nbsp;– `api‐queue` failed POST/PUT requests stored in IndexedDB via Background-Sync API.<br>• IndexedDB (Dexie) used for structured local data. |
| **2. What works without connectivity** | | Feature | Offline Behaviour | Max Time Cached |<br>|---------|------------------|-----------------|<br>| Browse recently viewed job cards | Read-only from local cache | 7 days |<br>| Job search results | Last 10 search queries cached; stale warning after 24 h | 24 h |<br>| Job application form | Can be completed & submitted; submission queued | 48 h |<br>| Couple-application second-partner confirmation | Confirmation queued; partner sees "pending sync" badge | 48 h |<br>| In-app messaging | Compose & queue messages; cannot fetch new messages | 48 h |<br>| Document upload | JPEG/PDF up to 5 MB stored in Blob store; auto-sync on reconnect | 48 h |<br>| Profile edits | Changes cached & merged on sync | 48 h |<br>| Admin actions | Not supported offline (restricted to desktop) | N/A | |
| **3. Out-of-scope (online-only)** | • Live search filters with remote facets<br>• Real-time presence / typing indicators<br>• Payment checkout (Stripe) – user is prompted to reconnect<br>• Video interview links |
| **4. Sync & conflict resolution** | • FIFO replay of queued requests when `navigator.onLine == true` OR user taps "Sync Now".<br>• Each queued request carries `updated_at` timestamp; server applies last-write-wins by default.<br>• For messaging, server rejects duplicate `client_msg_id` (UUID v4) to avoid double sends.<br>• If a record was modified server-side while offline, client receives 409 → shows "Resolve Conflict" modal (keep mine / accept server / merge manually). |
| **5. Storage limits & eviction** | • Global quota capped at 50 MB per origin (browser-managed).<br>• LRU eviction: attachments → search results → job cards → forms.<br>• User warned at 90% quota and prompted to clear cache. |
| **6. Security considerations** | • Service-Worker scopes to "/app/" path, not root, to prevent takeover of marketing pages.<br>• IndexedDB rows encrypted with AES-GCM using session-derived key (same KDF as 4.5.7.1).<br>• Background-Sync tag names randomised to avoid leaking user IDs. |
| **7. QA / acceptance criteria** | • Enable airplane-mode → complete job application → disable airplane-mode → status === "Pending".<br>• Inject 409 conflict via stub API → user sees merge modal.<br>• Fill profile form offline for >48 h → expect "stale draft – please review" banner before sync. |

#### 4.10.7 Testing Methodology

| Test Type | Description | Tools |
| --------- | ----------- | ----- |
| Device Testing | Physical testing on representative devices | iOS/Android test devices |
| Emulation Testing | Browser-based device simulation | Chrome DevTools, BrowserStack |
| Automated Visual Testing | Screenshot comparison across viewports | Percy, Applitools |
| Performance Testing | Load time and interaction metrics | Lighthouse, WebPageTest |
| Usability Testing | Real user testing on mobile devices | UserTesting.com, in-person sessions |
| Accessibility Testing | Screen reader and keyboard navigation | Axe, manual testing |

### 4.11 Skills and Certifications Management **(Priority: High)**
- Structured taxonomy-based system for capturing worker qualifications and job requirements
- Predetermined skill and certification options to enable precise matching

#### 4.11.1 Skills and Certifications Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the skill/certification | Auto-generated |
| Type | Enum | "Skill" or "Certificate" | Yes |
| Category | String | Top-level grouping (e.g., "Logistics", "Safety", "Construction") | Yes |
| Code | String | Unique, stable reference code | Yes |
| Translations | Object | Key-value pairs with language code and translated name/description | Yes (minimum EN) |
| Synonyms | Array | Alternative terms/common variations | No |
| Icon | String | Reference to visual icon | No |
| Renewal_Period | Number | Months until certification expires (if applicable) | No |
| Status | Enum | Active, Deprecated, Pending Review | Default: Active |
| Created_Date | Timestamp | When the skill/certification was added | Auto-generated |
| Last_Updated | Timestamp | When the record was last modified | Auto-updated |

#### 4.11.2 Worker-Skill Relationship Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the relationship | Auto-generated |
| Worker_ID | Foreign Key | Reference to worker profile | Auto-populated |
| Skill_ID | Foreign Key | Reference to skill/certification | Yes |
| Level | Enum | Proficiency level: Basic, Intermediate, Expert | Required for Skills |
| Self_Declared | Boolean | Whether worker has self-declared this skill/certification | Default: True |
| Created_Date | Timestamp | When relationship was created | Auto-generated |
| Last_Updated | Timestamp | When relationship was last modified | Auto-updated |

#### 4.11.3 Job-Skill Requirement Data Structure

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the requirement | Auto-generated |
| Job_Listing_ID | Foreign Key | Reference to job listing | Auto-populated |
| Skill_ID | Foreign Key | Reference to skill/certification | Yes |
| Minimum_Level | Enum | Required proficiency: Any, Intermediate, Expert | Required for Skills |
| Is_Required | Boolean | Whether this is mandatory vs. preferred | Yes |
| Weight | Number | Importance in matching algorithm (1-10) | Default: 5 |
| Created_Date | Timestamp | When requirement was created | Auto-generated |
| Last_Updated | Timestamp | When requirement was last modified | Auto-updated |

#### 4.11.4 Key Features

- **Structured Taxonomy:** Predefined list of 200+ skills and certifications organized by category to ensure consistent data and effective matching
- **Multi-Language Support:** All skills and certifications maintained in all platform-supported languages
- **Certificate Tracking:** Expiration dates monitored with automatic notifications for workers approaching renewal deadlines
- **Skill Selection Interface:** User-friendly dropdown and search functionality for workers to select applicable skills
- **Suggestion System:** Both workers and employers can suggest new skills/certifications for admin review and addition to the taxonomy
- **Matching Algorithm Integration:** Skills and certifications weighted in job match calculations based on employer requirements
- **Batch Operations:** Employers can quickly select common skill clusters for specific job types
- **Version Control:** System maintains history of taxonomy changes to ensure continued matching accuracy

#### 4.11.5 Administrative Controls

- **Taxonomy Management:** Platform administrators can add, edit, deprecate, and merge skills/certifications
- **Audit Trail:** All changes to the taxonomy are logged with timestamps and admin identification
- **Analytics Dashboard:** Insights into most requested and available skills to guide platform development
- **Bulk Import/Export:** Capabilities to update the taxonomy at scale when industry standards change
- **Translation Management:** Interface for managing translations of skill/certification names and descriptions across all supported languages
- **Skill Suggestion Review:** Workflow for reviewing and approving/rejecting new skill suggestions from employers and workers

#### 4.11.6 Skill Suggestion System

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| ID | Number | Unique identifier for the suggestion | Auto-generated |
| Suggested_By_ID | Foreign Key | User who suggested the skill | Auto-populated |
| Suggested_By_Type | Enum | "Worker", "Employer", "Admin" | Auto-populated |
| Name | String | Proposed name for the skill/certification | Yes |
| Type | Enum | "Skill" or "Certificate" | Yes |
| Category | String | Suggested category | Yes |
| Description | Text | Explanation of the skill/certification | Yes |
| Renewal_Period | Number | Months until certification expires (if applicable) | No |
| Justification | Text | Why this skill should be added | Yes |
| Status | Enum | "Pending", "Approved", "Rejected", "Duplicate" | Default: Pending |
| Admin_Notes | Text | Internal notes for admins | No |
| Reviewed_By | Foreign Key | Admin who processed the suggestion | Auto-populated when reviewed |
| Review_Date | Timestamp | When the suggestion was reviewed | Auto-updated when reviewed |
| Created_Date | Timestamp | When the suggestion was submitted | Auto-generated |

#### 4.11.7 Skills and Certifications Catalog

The platform will be pre-populated with the following skill and certification taxonomy. This catalog will be maintained and expanded over time based on industry needs and user suggestions.

<details>
<summary><strong>LOGISTICS & WAREHOUSE (Skills 1-25 | Certificates 26-40)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 1 | Skill | Manual order-picking (hand scanner) | Logistics & Warehouse |
| 2 | Skill | Voice-picking (pick-by-voice) | Logistics & Warehouse |
| 3 | Skill | Palletising & depalletising | Logistics & Warehouse |
| 4 | Skill | Cross-docking operations | Logistics & Warehouse |
| 5 | Skill | Reverse-logistics processing (returns) | Logistics & Warehouse |
| 6 | Skill | Cycle-count & inventory reconciliation | Logistics & Warehouse |
| 7 | Skill | Loading & unloading containers | Logistics & Warehouse |
| 8 | Skill | Load-securing with straps & anti-slip mats | Logistics & Warehouse |
| 9 | Skill | Stretch-wrap machine operation | Logistics & Warehouse |
| 10 | Skill | Dangerous-goods labelling (ADR LQ) | Logistics & Warehouse |
| 11 | Skill | Cold-store handling (-25 °C) | Logistics & Warehouse |
| 12 | Skill | Clean-room material flow (ISO 7) | Logistics & Warehouse |
| 13 | Skill | Kitting & light assembly in warehouse | Logistics & Warehouse |
| 14 | Skill | WMS: SAP WM user | Logistics & Warehouse |
| 15 | Skill | WMS: Manhattan SCALE user | Logistics & Warehouse |
| 16 | Skill | Barcode/RF-scanner configuration | Logistics & Warehouse |
| 17 | Skill | Kanban replenishment | Logistics & Warehouse |
| 18 | Skill | LEAN 5S in warehouse | Logistics & Warehouse |
| 19 | Skill | Root-cause analysis (logistics) | Logistics & Warehouse |
| 20 | Skill | Parcel sortation machine operation | Logistics & Warehouse |
| 21 | Skill | Package-profile measurement (DIM weight) | Logistics & Warehouse |
| 22 | Skill | Parcel-manifest generation | Logistics & Warehouse |
| 23 | Skill | Returns quality grading (A/B/C) | Logistics & Warehouse |
| 24 | Skill | Customs document prep (export NL->EU) | Logistics & Warehouse |
| 25 | Skill | Basic Dutch logistics terminology (A2) | Logistics & Warehouse |
| 26 | Certificate | Fork-lift truck licence (heftruck) | Logistics & Warehouse |
| 27 | Certificate | Reach-truck licence | Logistics & Warehouse |
| 28 | Certificate | Electric pallet truck (EPT) card | Logistics & Warehouse |
| 29 | Certificate | Combi-truck (narrow-aisle) licence | Logistics & Warehouse |
| 30 | Certificate | Order-picker truck licence (high-level) | Logistics & Warehouse |
| 31 | Certificate | Overhead crane operator (bovenloopkraan) | Logistics & Warehouse |
| 32 | Certificate | Telescopic handler (telehandler) | Logistics & Warehouse |
| 33 | Certificate | ADR awareness certificate (warehouse) | Logistics & Warehouse |
| 34 | Certificate | Safe loading of containers (CTU Code) | Logistics & Warehouse |
| 35 | Certificate | Dangerous-goods adviser assistant | Logistics & Warehouse |
| 36 | Certificate | SOG Fork-lift (petro/chem) | Logistics & Warehouse |
| 37 | Certificate | SOG Telehandler | Logistics & Warehouse |
| 38 | Certificate | Cherry-picker / MEWP (hoogwerker) IPAF 3A | Logistics & Warehouse |
| 39 | Certificate | Boom-lift / MEWP IPAF 3B | Logistics & Warehouse |
| 40 | Certificate | Over-dimension load escort licence | Logistics & Warehouse |

</details>

<details>
<summary><strong>HEAVY EQUIPMENT & DRIVING (Skills 41-55 | Certificates 56-70)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 41 | Skill | Basic vehicle checks (pre-trip inspection) | Heavy Equipment & Driving |
| 42 | Skill | Hook-lift container operation | Heavy Equipment & Driving |
| 43 | Skill | Tail-lift operation (liftgate) | Heavy Equipment & Driving |
| 44 | Skill | Curtain-sider handling | Heavy Equipment & Driving |
| 45 | Skill | Refrigerated truck temperature logs | Heavy Equipment & Driving |
| 46 | Skill | Digital tachograph download & analysis | Heavy Equipment & Driving |
| 47 | Skill | Defensive driving (urban) | Heavy Equipment & Driving |
| 48 | Skill | Load-planning & axle-weight calculation | Heavy Equipment & Driving |
| 49 | Skill | Basic vehicle troubleshooting (fuses, lamps) | Heavy Equipment & Driving |
| 50 | Skill | Forklift battery swapping & watering | Heavy Equipment & Driving |
| 51 | Skill | Yard-shunter operations | Heavy Equipment & Driving |
| 52 | Skill | Tugger-train operation (factory) | Heavy Equipment & Driving |
| 53 | Skill | Push-back tractor (airport) operation | Heavy Equipment & Driving |
| 54 | Skill | GSE knowledge (belt-loader, GPU) | Heavy Equipment & Driving |
| 55 | Skill | Maritime Ro-Ro loading | Heavy Equipment & Driving |
| 56 | Certificate | Driving licence B (passenger) | Heavy Equipment & Driving |
| 57 | Certificate | Driving licence BE (trailer ≤3.5 t) | Heavy Equipment & Driving |
| 58 | Certificate | Driving licence C (rigid truck) | Heavy Equipment & Driving |
| 59 | Certificate | Driving licence CE (articulated) | Heavy Equipment & Driving |
| 60 | Certificate | Code 95 CPC (Driver CPC NL) | Heavy Equipment & Driving |
| 61 | Certificate | ADR class 1-9 tank & bulk | Heavy Equipment & Driving |
| 62 | Certificate | Truck-mounted crane (autolaadkraan) | Heavy Equipment & Driving |
| 63 | Certificate | Slinger/Hoist (VVL-H) | Heavy Equipment & Driving |
| 64 | Certificate | Port tug driver card (straddle carrier) | Heavy Equipment & Driving |
| 65 | Certificate | Air-side security pass (Schiphol) | Heavy Equipment & Driving |
| 66 | Certificate | TAPA TSR awareness | Heavy Equipment & Driving |
| 67 | Certificate | STCW Basic Safety (deckhand) | Heavy Equipment & Driving |
| 68 | Certificate | Inland shipping boatman licence | Heavy Equipment & Driving |
| 69 | Certificate | Chauffeur Pass (taxi) | Heavy Equipment & Driving |
| 70 | Certificate | Snow-plough operator licence | Heavy Equipment & Driving |

</details>

<details>
<summary><strong>SAFETY & COMPLIANCE (Skills 71-85 | Certificates 86-105)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 71 | Skill | Risk inventory & evaluation (RI&E) support | Safety & Compliance |
| 72 | Skill | Toolbox-meeting facilitation | Safety & Compliance |
| 73 | Skill | Accident reporting & root-cause logging | Safety & Compliance |
| 74 | Skill | PPE fit-test administration | Safety & Compliance |
| 75 | Skill | Lockout-tagout (LOTO) execution | Safety & Compliance |
| 76 | Skill | Spill-kit deployment | Safety & Compliance |
| 77 | Skill | Hot-work permit process | Safety & Compliance |
| 78 | Skill | Confined-space entry watch | Safety & Compliance |
| 79 | Skill | Work-at-height rescue plan drafting | Safety & Compliance |
| 80 | Skill | First-aid documentation (EHBO log) | Safety & Compliance |
| 81 | Skill | Fire-watch duties (hot zones) | Safety & Compliance |
| 82 | Skill | Safety-data-sheet (SDS) lookup | Safety & Compliance |
| 83 | Skill | Chemical compatibility segregation | Safety & Compliance |
| 84 | Skill | Incident trend analysis (TRIR, LTIR) | Safety & Compliance |
| 85 | Skill | ISO 45001 internal auditing | Safety & Compliance |
| 86 | Certificate | VCA Basis (B-VCA) | Safety & Compliance |
| 87 | Certificate | VCA VOL (supervisors) | Safety & Compliance |
| 88 | Certificate | VIL-VCU (staffing) | Safety & Compliance |
| 89 | Certificate | BHV (Bedrijfshulpverlening) | Safety & Compliance |
| 90 | Certificate | EHBO First-Aid (Orange Cross) | Safety & Compliance |
| 91 | Certificate | NEN 3140 VOP (low-voltage) | Safety & Compliance |
| 92 | Certificate | NEN 3140 VP | Safety & Compliance |
| 93 | Certificate | Hot-work permit authoriser | Safety & Compliance |
| 94 | Certificate | Confined-space SOG | Safety & Compliance |
| 95 | Certificate | Gas-measuring SOG (gasmeten) | Safety & Compliance |
| 96 | Certificate | Work-at-Height SOG | Safety & Compliance |
| 97 | Certificate | Independent breathing apparatus SOG | Safety & Compliance |
| 98 | Certificate | Fire-marshal diploma | Safety & Compliance |
| 99 | Certificate | ISO 45001 Lead Auditor | Safety & Compliance |
| 100 | Certificate | HACCP Food-safety level 2 | Safety & Compliance |
| 101 | Certificate | BRCGS Warehouse & Distribution awareness | Safety & Compliance |
| 102 | Certificate | ATEX basic safety (EX 001) | Safety & Compliance |
| 103 | Certificate | Asbestos awareness (Type 0) | Safety & Compliance |
| 104 | Certificate | DGSA (Dangerous Goods Safety Adviser) | Safety & Compliance |
| 105 | Certificate | Security awareness (ISPS) | Safety & Compliance |

</details>

<details>
<summary><strong>MANUFACTURING & PRODUCTION (Skills 106-125 | Certificates 126-135)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 106 | Skill | Assembly line setup & change-over (SMED) | Manufacturing & Production |
| 107 | Skill | Pick-&-place robot teaching (Fanuc) | Manufacturing & Production |
| 108 | Skill | KUKA HMI operation | Manufacturing & Production |
| 109 | Skill | CNC lathe basic program (G-code) | Manufacturing & Production |
| 110 | Skill | CNC milling setup (Heidenhain) | Manufacturing & Production |
| 111 | Skill | TIG welding stainless (141) | Manufacturing & Production |
| 112 | Skill | MIG/MAG welding (135/136) | Manufacturing & Production |
| 113 | Skill | Spot-welding operation | Manufacturing & Production |
| 114 | Skill | Metal grinding & deburring | Manufacturing & Production |
| 115 | Skill | Powder-coating line operation | Manufacturing & Production |
| 116 | Skill | Plastic injection moulding (Demag) | Manufacturing & Production |
| 117 | Skill | Blow-moulding machine operation | Manufacturing & Production |
| 118 | Skill | 3D printer operation (FDM) | Manufacturing & Production |
| 119 | Skill | SMT pick-and-place feeder load | Manufacturing & Production |
| 120 | Skill | PCB re-work & soldering (IPC A-610) | Manufacturing & Production |
| 121 | Skill | Basic hydraulics troubleshooting | Manufacturing & Production |
| 122 | Skill | Pneumatics circuit reading | Manufacturing & Production |
| 123 | Skill | Programmable-logic controller (Siemens S7) basics | Manufacturing & Production |
| 124 | Skill | OEE monitoring & downtime logging | Manufacturing & Production |
| 125 | Skill | Kaizen continuous-improvement participation | Manufacturing & Production |
| 126 | Certificate | Welding diploma NIL level 1 | Manufacturing & Production |
| 127 | Certificate | Welding diploma NIL level 2 | Manufacturing & Production |
| 128 | Certificate | TIG 141 stainless up to 4 mm | Manufacturing & Production |
| 129 | Certificate | IPC A-610 Certified IPC Specialist | Manufacturing & Production |
| 130 | Certificate | CNC operator diploma (B-metaal) | Manufacturing & Production |
| 131 | Certificate | Lean Six-Sigma Yellow Belt | Manufacturing & Production |
| 132 | Certificate | Forklift + Overhead crane 2-in-1 (metaal) | Manufacturing & Production |
| 133 | Certificate | NDO visual inspector level 2 | Manufacturing & Production |
| 134 | Certificate | ATEX maintenance mechanic level 1 | Manufacturing & Production |
| 135 | Certificate | SOG Flange connections (Flensmonteur) | Manufacturing & Production |

</details>

<details>
<summary><strong>CONSTRUCTION & TECHNICAL TRADES (Skills 136-155 | Certificates 156-165)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 136 | Skill | Brick-laying (half-brick bond) | Construction & Technical Trades |
| 137 | Skill | Timber framing & joist setting | Construction & Technical Trades |
| 138 | Skill | Dry-wall installation (metal stud) | Construction & Technical Trades |
| 139 | Skill | Suspended-ceiling grid install | Construction & Technical Trades |
| 140 | Skill | Tiling (floor & wall) | Construction & Technical Trades |
| 141 | Skill | Roof membrane welding (EPDM) | Construction & Technical Trades |
| 142 | Skill | Basic plumbing (PVC & copper) | Construction & Technical Trades |
| 143 | Skill | HVAC duct assembly | Construction & Technical Trades |
| 144 | Skill | Electrical conduit bending | Construction & Technical Trades |
| 145 | Skill | Low-voltage wiring termination | Construction & Technical Trades |
| 146 | Skill | Solar-panel mounting (roof) | Construction & Technical Trades |
| 147 | Skill | Scaffolding erection level 1 | Construction & Technical Trades |
| 148 | Skill | Laser-level measurement & layout | Construction & Technical Trades |
| 149 | Skill | Concrete finishing & power-trowel | Construction & Technical Trades |
| 150 | Skill | Rebar tying & placement | Construction & Technical Trades |
| 151 | Skill | Mini-excavator operation | Construction & Technical Trades |
| 152 | Skill | Telehandler material lift (construction) | Construction & Technical Trades |
| 153 | Skill | Site toolbox translation (EN-PL-NL) | Construction & Technical Trades |
| 154 | Skill | Reading Blauwe Krokodil (NL safety cards) | Construction & Technical Trades |
| 155 | Skill | Basic AutoCAD drawing edits | Construction & Technical Trades |
| 156 | Certificate | Scaffolding Basic assembler DNV | Construction & Technical Trades |
| 157 | Certificate | Scaffolding Advanced / Foreman | Construction & Technical Trades |
| 158 | Certificate | SCC 018 (high-risk worker) | Construction & Technical Trades |
| 159 | Certificate | SOG Working at height with fall arrest | Construction & Technical Trades |
| 160 | Certificate | Mini-excavator operator card (W4-04) | Construction & Technical Trades |
| 161 | Certificate | Concrete pump operator licence | Construction & Technical Trades |
| 162 | Certificate | NEN 1010 Electrical installer helper | Construction & Technical Trades |
| 163 | Certificate | Solar PV installer training (SEI) | Construction & Technical Trades |
| 164 | Certificate | Asbestos removal DAV 1 | Construction & Technical Trades |
| 165 | Certificate | Gas-heating installer (CO-certificaat) | Construction & Technical Trades |

</details>

<details>
<summary><strong>FOOD, HOSPITALITY & CLEANING (Skills 166-180 | Certificates 181-185)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 166 | Skill | HACCP food-prep line work | Food, Hospitality & Cleaning |
| 167 | Skill | Butchery: deboning poultry | Food, Hospitality & Cleaning |
| 168 | Skill | Bakery oven operation | Food, Hospitality & Cleaning |
| 169 | Skill | Barista (espresso calibration) | Food, Hospitality & Cleaning |
| 170 | Skill | Cocktail mixing (IBA spec) | Food, Hospitality & Cleaning |
| 171 | Skill | Front-of-house POS operation (Lightspeed) | Food, Hospitality & Cleaning |
| 172 | Skill | Housekeeping room-turn-around (18 min) | Food, Hospitality & Cleaning |
| 173 | Skill | Industrial dish-washer operation | Food, Hospitality & Cleaning |
| 174 | Skill | Deep-cleaning with scrubber-dryer | Food, Hospitality & Cleaning |
| 175 | Skill | Linen inventory & rolling | Food, Hospitality & Cleaning |
| 176 | Skill | Event banqueting setup | Food, Hospitality & Cleaning |
| 177 | Skill | Cold-chain food packing (MAP) | Food, Hospitality & Cleaning |
| 178 | Skill | Allergen control & labelling | Food, Hospitality & Cleaning |
| 179 | Skill | Basic Dutch hospitality phrases (A2) | Food, Hospitality & Cleaning |
| 180 | Skill | Waste segregation (organic, DGR) | Food, Hospitality & Cleaning |
| 181 | Certificate | HACCP Level 3 Supervisor | Food, Hospitality & Cleaning |
| 182 | Certificate | SVH Social Hygiene (Drank- en Horecawet) | Food, Hospitality & Cleaning |
| 183 | Certificate | Fork-lift + HACCP combo (food warehouses) | Food, Hospitality & Cleaning |
| 184 | Certificate | Cleaning operator SVS diploma | Food, Hospitality & Cleaning |
| 185 | Certificate | Barista Foundation SCA | Food, Hospitality & Cleaning |

</details>

<details>
<summary><strong>OFFICE, IT & SUPPORT (Skills 186-195 | Certificates 196-200)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 186 | Skill | MS Excel: Pivot & V-LOOKUP | Office, IT & Support |
| 187 | Skill | MS Power BI basic dashboard | Office, IT & Support |
| 188 | Skill | ERP: Exact Online order entry | Office, IT & Support |
| 189 | Skill | Basic HTML email template edits | Office, IT & Support |
| 190 | Skill | Zendesk ticket triage | Office, IT & Support |
| 191 | Skill | Jira Agile board updating | Office, IT & Support |
| 192 | Skill | Customer-service Dutch B1 phone support | Office, IT & Support |
| 193 | Skill | Sage HR onboarding workflow | Office, IT & Support |
| 194 | Skill | Freight cost reconciliation (xls) | Office, IT & Support |
| 195 | Skill | Basic data-privacy (AVG/GDPR) handling | Office, IT & Support |
| 196 | Certificate | ECDL/ICDL Base Certificate | Office, IT & Support |
| 197 | Certificate | MOS Excel Associate | Office, IT & Support |
| 198 | Certificate | Basic GDPR awareness (IAPP) | Office, IT & Support |
| 199 | Certificate | Lean Office Yellow Belt | Office, IT & Support |
| 200 | Certificate | First-time-manager diploma (NCOI) | Office, IT & Support |

</details>

<details>
<summary><strong>AGRICULTURE & HORTICULTURE (Skills 201-220 | Certificates 221-230)</strong></summary>

| ID | Type | Name | Category |
|----|------|------|----------|
| 201 | Skill | Tractor operation (field work) | Agriculture & Horticulture |
| 202 | Skill | Greenhouse climate control monitoring | Agriculture & Horticulture |
| 203 | Skill | Hydroponic system maintenance | Agriculture & Horticulture |
| 204 | Skill | Pruning fruit trees & vines | Agriculture & Horticulture |
| 205 | Skill | Harvesting & grading vegetables | Agriculture & Horticulture |
| 206 | Skill | Seeding & transplanting automation | Agriculture & Horticulture |
| 207 | Skill | Integrated pest management scouting | Agriculture & Horticulture |
| 208 | Skill | Fertigation scheduling | Agriculture & Horticulture |
| 209 | Skill | Milking parlour operation | Agriculture & Horticulture |
| 210 | Skill | Calf rearing & husbandry | Agriculture & Horticulture |
| 211 | Skill | Artificial insemination assistance (cattle) | Agriculture & Horticulture |
| 212 | Skill | Hoof trimming basics | Agriculture & Horticulture |
| 213 | Skill | Egg grading & packing | Agriculture & Horticulture |
| 214 | Skill | Poultry shed climate monitoring | Agriculture & Horticulture |
| 215 | Skill | Operate self-propelled sprayer | Agriculture & Horticulture |
| 216 | Skill | Orchard forklift / bin trailer handling | Agriculture & Horticulture |
| 217 | Skill | Silage making & bunker covering | Agriculture & Horticulture |
| 218 | Skill | Chainsaw operation & tree felling | Agriculture & Horticulture |
| 219 | Skill | Drone scouting of crop health | Agriculture & Horticulture |
| 220 | Skill | Basic soil sampling & analysis | Agriculture & Horticulture |
| 221 | Certificate | T Licence (Tractor driving licence) | Agriculture & Horticulture |
| 222 | Certificate | Dutch "Spuitlicentie" (Spraying licence) | Agriculture & Horticulture |
| 223 | Certificate | Bewijs van vakbekwaamheid gewasbescherming | Agriculture & Horticulture |
| 224 | Certificate | VVA/Safe chainsaw operator EU Level 1 | Agriculture & Horticulture |
| 225 | Certificate | Milking hygiene certificate (Q-Fever) | Agriculture & Horticulture |
| 226 | Certificate | HACCP Fresh Produce Handling | Agriculture & Horticulture |
| 227 | Certificate | Animal welfare transport certificate | Agriculture & Horticulture |
| 228 | Certificate | Drone pilot A1/A3 for agriculture | Agriculture & Horticulture |
| 229 | Certificate | Forklift certificate – orchard narrow-aisle | Agriculture & Horticulture |
| 230 | Certificate | First responder livestock emergencies | Agriculture & Horticulture |
| 231 | Skill | Greenhouse crop scouting (tomato, cucumber, pepper) | Agriculture & Horticulture |
| 232 | Skill | Tomato pruning & clipping (indeterminate) | Agriculture & Horticulture |
| 233 | Skill | Cucumber leaf picking & truss pruning | Agriculture & Horticulture |
| 234 | Skill | Harvesting & grading tomatoes | Agriculture & Horticulture |
| 235 | Skill | Harvesting & bunching cut flowers | Agriculture & Horticulture |
| 236 | Skill | Packing & sleeving cut flowers | Agriculture & Horticulture |
| 237 | Skill | Grafting vegetable seedlings | Agriculture & Horticulture |
| 238 | Skill | Climate screen operation (energy/shade) | Agriculture & Horticulture |
| 239 | Skill | CO₂ dosing system monitoring | Agriculture & Horticulture |
| 240 | Skill | Automated irrigation / ebb-flow tables | Agriculture & Horticulture |
| 241 | Skill | Beneficial insect release (biocontrol) | Agriculture & Horticulture |
| 242 | Skill | pH & EC testing of nutrient solutions | Agriculture & Horticulture |
| 243 | Skill | UV disinfection unit maintenance | Agriculture & Horticulture |
| 244 | Skill | Priva / Hoogendoorn climate software use | Agriculture & Horticulture |
| 245 | Skill | AGV trolley operation in greenhouse rows | Agriculture & Horticulture |
| 246 | Certificate | Phytosanitary inspection basics | Agriculture & Horticulture |
| 247 | Certificate | MPS-ABC sustainability handling | Agriculture & Horticulture |
| 248 | Certificate | Greenhouse electric forklift licence | Agriculture & Horticulture |
| 249 | Certificate | Greenhouse pesticide application licence | Agriculture & Horticulture |
| 250 | Certificate | Working-at-height – greenhouse scissor lift | Agriculture & Horticulture |

</details>

### 4.12 Worker Onboarding & Profile Completion **(Priority: High)**
- Streamlined multi-step onboarding process for workers
- Profile completion tracking with weighted scoring
- Document upload and management
- Guided completion through contextual suggestions

#### 4.12.1 Onboarding Workflow

| Step | Content | Description | Required Fields |
| ---- | ------- | ----------- | -------------- |
| 1 | Personal & Contact Details | Basic identity and contact information | First name, Last name, Email, Phone, Date of birth, Nationality |
| 2 | Core Employability | Skills, languages, and availability information | Languages (min 1), Skills (min 1), Availability, Preferred locations |
| 3 | Document Upload | CV and optional certification documents | None (all optional) |
| 4 | Additional Preferences | Housing, transport, couple status, security | Housing need, Transport need |
| 5 | Confirmation | Summary and next steps | None (review only) |

#### 4.12.2 Profile Completion Scoring

| Section | Weight | Criteria to Earn Full Points |
| ------- | ------ | ---------------------------- |
| Core Identity | 20% | All mandatory fields filled (name, phone, date of birth) |
| Languages | 15% | ≥ 1 language with ≥ B1 proficiency |
| Skills | 30% | ≥ 5 skills selected |
| Availability & Location | 15% | Availability set + ≥ 1 preferred location |
| Photo & CV | 10% | Profile photo + uploaded CV |
| Extras (Housing/Transport) | 10% | Both questions answered |
| Two-Factor Authentication | 5% | 2FA enabled |

#### 4.12.3 Onboarding Task System

| Feature | Description |
| ------- | ----------- |
| Task Queue | Personalized queue of profile completion tasks for each worker |
| Task Types | Missing photo, Add skills, Add language, Upload CV, etc. |
| Contextual Nudges | Dashboard suggestions based on profile gaps |
| Completion Milestones | Celebrations at key completion thresholds (50%, 80%, 100%) |
| Email Reminders | Automated follow-up for incomplete profiles |

#### 4.12.4 CV Management

| Feature | Description |
| ------- | ----------- |
| Supported Document | CV (optional) |
| Upload Methods | File selection, Mobile camera, Drag & drop |
| Storage | Secure cloud storage with worker-specific paths |
| Privacy Controls | Workers can delete uploaded CV at any time (GDPR compliance) |
| CV Parsing | Optional extraction of skills and work history from uploaded CVs |

#### 4.12.5 Mobile Optimization

| Feature | Description |
| ------- | ----------- |
| Responsive Design | All onboarding screens fully functional on mobile devices |
| Camera Integration | Direct photo/document capture on mobile |
| Progress Saving | Automatic saving of entered information |
| Offline Support | Partial form completion even with intermittent connectivity |
| Touch Optimization | Large tap targets and mobile-friendly input controls |

### 4.13 Employer Onboarding & Verification **(Priority: Critical)**
- Tiered verification process based on employer type
- Document upload and review workflow
- Subscription management and payment
- Sub-account creation for larger agencies

#### 4.13.1 Employer Type-Based Onboarding

| Employer Type | Description | Verification Requirements |
| ------------- | ----------- | ------------------------- |
| Freelancer | Self-employed individual working as a headhunter | KvK extract, VAT number, ID proof |
| Small Agency | Agency with 1-10 employees | KvK extract, VAT number, liability insurance, optional NEN certificate |
| Medium/Large Agency | Established agency with larger operations | KvK extract, VAT number, NEN certification, insurance policy, G-account |

#### 4.13.2 Employer Onboarding Workflow

| Step | Content | Required For | Key Fields/Actions |
| ---- | ------- | ------------ | ------------------ |
| 1 | Company Basics | ALL | Legal company name, trade name, KvK number, VAT number, industry sectors |
| 2 | Contact & Billing | ALL | Primary contact person, phone, billing email, address |
| 3 | Verification Documents | ALL | Document upload based on employer type requirements |
| 4 | Subscription & Payment | Paid Tiers | Select subscription tier, payment method, confirm price |
| 5 | Sub-accounts | Medium/Large | Invite recruiter emails, set roles/permissions |
| 6 | Confirmation | ALL | Summary, estimated review time, next steps |

#### 4.13.3 Account States & Verification

| State | Description | Available Actions | Transition Triggers |
| ----- | ----------- | ----------------- | ------------------ |
| Draft | Initial account creation, incomplete | Edit profile, Upload documents | Submit for verification |
| Pending Verification | Documents submitted, awaiting admin review | View status, Respond to queries | Admin approval or rejection |
| Approved | Verified employer with platform access | Post jobs, Manage account | Subscription expiry, Document expiry |
| Suspended | Account temporarily deactivated | Update documents, Contact support | Failed re-verification, Compliance issues |
| Expired | Subscription ended | Renew subscription | Payment of new subscription |

#### 4.13.4 Admin Review Process

| Feature | Description |
| ------- | ----------- |
| Review Queue | Prioritized list of employers pending verification |
| Document Viewer | Secure interface to view uploaded verification documents |
| Verification Checklist | Type-specific compliance requirements |
| Communication Channel | Direct messaging with employer for additional information |
| Approval Actions | Credit allocation, welcome email, account activation |
| Rejection Actions | Reason selection, guidance notes, notification |
| Pending Manual Review Queue | Special queue for employers where automated verification (KvK/VAT) was deferred due to external service unavailability; includes error details and manual override options |

#### 4.13.5 Subscription & Credits Management

| Feature | Description |
| ------- | ----------- |
| Tier Selection | Free tier or paid subscription options during onboarding |
| Payment Integration | Secure processing of credit card or SEPA payments |
| Credit Allocation | Automatic job credit grant based on selected tier |
| Subscription Lifecycle | Auto-renewal, expiration handling, tier changes |
| Invoice Generation | Automated creation and delivery of payment receipts |
| Credit Tracking | Ledger of all credit transactions and usage |

#### 4.13.6 Re-verification Process

| Feature | Description |
| ------- | ----------- |
| Document Expiry Tracking | Monitor verification document validity periods |
| Renewal Notifications | Automatic alerts before document expiration |
| Simplified Re-upload | Streamlined process for updating expired documents |
| Compliance Checks | Annual review of verification status |
| Grace Period | Limited functionality during re-verification window |
| Status History | Complete audit trail of verification activities |

---

## 5. User Experience

### 5.1 Entry Points & First-Time User Flow

| Entry Point | Description |
| ----------- | ----------- |
| **Homepage** | Information about platform purpose, benefits, and registration options |
| **Public Job Listings** | Unregistered visitors can browse available jobs but must register to apply |
| **Worker Registration** | Simplified flow collecting essential personal information, skills, and optional CV upload |
| **Employer Registration** | Type selection followed by appropriate verification requirements |
| **Verification Dashboard** | Clear status indicators showing document review progress |
| **Onboarding Tutorial** | Guided introduction to platform features based on user type |
| **Job Search/Posting** | Immediate access to core functionality after verification |

### 5.2 Core Experience

| Experience | Description | Key Features |
| ---------- | ----------- | ------------ |
| **Worker Profile Creation** | Users enter personal details, select skills from predefined lists, and upload optional documents | Form auto-saves progress and provides clear validation feedback |
| **Employer Verification** | Employers select their type and see a checklist of required documents to upload | Each document has clear explanations and examples of acceptable formats |
| **Job Posting** | Employers use a structured form to create comprehensive, compliant job listings | Manual review by platform administrators ensures compliance before publication |
| **Job Application** | Workers browse listings and apply with a single click | Profile information is automatically included; application status is clearly visible on the dashboard |
| **Communication** | After application, both parties can message securely through the platform | Notifications alert users to new messages or status changes |

### 5.3 Advanced Features & Edge Cases

| Feature | Description |
| ------- | ----------- |
| **Re-verification Process** | Annual reminder system for expired documents |
| **Account Suspension** | Process for temporarily restricting accounts with expired verification |
| **Dispute Resolution** | System for handling disagreements between workers and agencies |
| **Bulk Job Posting** | For larger agencies needing to post multiple positions simultaneously |
| **Data Export** | Allowing users to download their personal information and activity history |
| **Account Deletion** | Process for completely removing user data upon request (GDPR compliance) |
| **Failed Verification** | Guidance and support for employers who fail the verification process |

### 5.4 UI/UX Highlights

| UI/UX Element | Description |
| ------------- | ----------- |
| **Document Upload Interface** | Simple drag-and-drop functionality with clear progress indicators |
| **Verification Status Indicators** | Visual indicators of verification level for employers |
| **Job Card Design** | Clean, scannable job listings with key information highlighted |
| **Messaging Interface** | Threaded conversations with clear context indicators |
| **Mobile-Optimized Forms** | Responsive design adapting to different screen sizes |
| **Notification Center** | Centralized hub for all platform alerts and updates |
| **Language Toggle** | Easily accessible control for switching between supported languages |
| **Clear Call-to-Actions** | Prominent buttons for primary actions based on user role |
| **Progress Indicators** | Visual feedback for multi-step processes |

#### 5.3.7 Real-time Communication

The platform leverages Django Channels for real-time messaging functionality:

- WebSocket connections for instant message delivery
- User presence detection (online/offline status)
- Message delivery confirmations and read receipts
- End-to-end encryption for sensitive communications
- Fallback to polling for environments where WebSockets are blocked

Implementation is based on Django Channels consumers that handle WebSocket connections, with Redis as the backing store for pub/sub operations.

---

## 6. Narrative

Maria is a temporary worker who recently moved to the Netherlands and needs a job quickly but is concerned about potential exploitation after hearing stories from friends. She discovers Safe Job and browses job listings as an unregistered visitor. Impressed by the verification status of employer profiles, she decides to register. After creating her profile and selecting her skills, she applies to several positions and uses the secure messaging system to ask questions about working conditions. The straightforward application process and employer verification give Maria confidence that she's finding safe employment, while the agencies benefit from accessing a motivated candidate who matches their requirements without the typical administrative burden and verification concerns.

---

## 7. Success Metrics

### 7.1 User-Centric Metrics
- Number of worker registrations and completed profiles
- Conversion rate from unregistered visitors to registered workers
- Job application rate per worker
- Time-to-first-application for new workers
- Worker retention rate and platform return frequency
- Employer satisfaction with candidate quality (via surveys)
- Worker satisfaction with job opportunities and platform safety (via surveys)
- Response rate and time for in-platform messages

### 7.2 Business Metrics
- Conversion rate from free to paid subscription tiers
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Churn rate for paying agencies
- Average revenue per agency
- Upsell rate for additional job packs

### 7.3 Technical Metrics
- Document verification completion rate
- Average time for manual verification processes
- Platform uptime and performance metrics
- Mobile vs. desktop usage patterns
- Error rates during registration and verification processes
- API integration performance with KvK and VAT validation systems
- Machine translation auto-publish rate
- Machine translation user complaint rate

---

## 8. Technical Considerations

### 8.1 Integration Points
- KvK API or datasets for business registration verification
- EU VAT Check for tax number validation
- ID verification services (Onfido, Sumsub, or Veriff)
- Payment processor for subscription management
- Email and notification delivery services
- Cloud storage for secure document handling
- Analytics platforms for performance monitoring

#### 8.1.1 External Business-Registry Verification Service

The platform implements a dedicated verification microservice to handle KvK and VAT validation, ensuring reliable integration with external business registries while maintaining system resilience.

| Component | Description |
| --------- | ----------- |
| **KvK Handelsregister API** | - REST / JSON API with OAuth 2 client-credentials flow<br>- Base URL: https://api.kvk.nl/api/v2/<br>- Used to validate company registration details |
| **VIES VAT Check API (EU)** | - SOAP endpoint at https://ec.europa.eu/taxation_customs/.../checkVatService<br>- No authentication but strict rate-limit (max ~100 req/h/IP)<br>- Validates VAT numbers across EU member states |
| **Verification Django App** | - Separate Django app that decouples failures from core application<br>- Exposes both REST & Django admin interfaces<br>- Key endpoints: POST /verify/kvk and POST /verify/vat<br>- Uses Redis for idempotency/response caching with 7-day TTL |
| **Call Flow** | 1. Front-end submits company data → Django API<br>2. Django publishes company.verify.request event to RabbitMQ/SQS<br>3. Celery worker consumes event, calls KvK &/or VIES<br>4. Worker emits one of three response events:<br>&nbsp;&nbsp;&nbsp;- company.verify.pass (payload includes matched fields)<br>&nbsp;&nbsp;&nbsp;- company.verify.fail (includes reasons array)<br>&nbsp;&nbsp;&nbsp;- company.verify.defer (external service unavailable)<br>5. Core updates verification_status and notifies front-end |
| **Retry & Fallback Logic** | - Automatic retries: 3 attempts with exponential back-off (1m, 5m, 30m)<br>- Circuit-breaker: if external ping fails × 5 within 10 min, open for 30 min<br>- defer status places employer in "Pending Manual Review" queue<br>- Admin UI shows API error code & last response for manual decision |
| **Partial Onboarding Rules** | - If KvK passes but VAT API down: allow continuation with banner "awaiting VAT validation"<br>- If both APIs down: proceed with document upload for full manual review<br>- Block job publication until complete verification |
| **Monitoring & Alerts** | - Prometheus metrics: kvk_response_time, vat_error_rate, verify_circuit_open<br>- Alertmanager triggers pager duty on error_rate > 20% for 5m |
| **Security & Compliance** | - KvK OAuth secrets stored in Vault with quarterly rotation<br>- VAT SOAP calls tunneled through HTTPS proxy with IP allow-listing<br>- API responses stored encrypted at rest; redacted after 90 days |
| **Re-verification Process** | - Nightly job re-checks active employers with:<br>&nbsp;&nbsp;&nbsp;- subscription renewal in < 30 days<br>&nbsp;&nbsp;&nbsp;- verification older than 11 months<br>- Uses same event flow; employer sees "Verification expiring" banner if fail/defer |

#### 8.1.2 Identity-Document Verification Service

The platform outsources worker ID validation to *Onfido* (primary) with *Sumsub* as secondary provider.

| Component | Description |
|-----------|-------------|
| **Providers** | • Onfido API v3 (REST/JSON over HTTPS) – OAuth 2 client-credentials.<br>• Sumsub "/resources/applicants" API – JWT auth with HMAC secret.
| **identity-check-service** | Separate container similar to `verify-service`; exposes HTTP and gRPC endpoints:<br>• `POST /verify/id` – enqueue check.<br>• `GET /verify/id/:token` – polling status (admin only). |
| **Provider selection** | `mode=auto` (default): Onfido first; on HTTP 5xx, timeout > 15 s, or rate-limit error → switch to Sumsub. Employer/Admin may force provider via header `X-Verify-Provider`. |
| **Call flow** | 1. Core emits `user.id.verify.request` (payload: applicant_id, presigned_upload_url).<br>2. identity-check-service uploads images/docs to chosen provider, initiates check.<br>3. Polls provider webhook events → emits:<br>&nbsp;&nbsp;• `user.id.verify.pass` (JSON result, liveness_score).<br>&nbsp;&nbsp;• `user.id.verify.fail` (reason codes array).<br>&nbsp;&nbsp;• `user.id.verify.defer` (provider unreachable, requires manual review).<br>4. Core updates `identity_status` and notifies front-end. |
| **Retry & fallback logic** | • Automatic retries 3× with back-off 30 s, 2 min, 10 min.<br>• Circuit breaker: 5 consecutive provider errors → open (15 min).<br>• If both providers down, job is marked *deferred* and placed in "Pending Manual Review". |
| **SLAs** | • 90% of successful checks complete ≤ 3 min; p99 ≤ 10 min.<br>• Defer threshold: if verification not finished in 15 min -> notify user "manual review in progress". |
| **Timeout / cancellation** | Applicant session expires 30 min after last media upload; stale sessions cleaned hourly. |
| **Monitoring & alerts** | Prometheus metrics: `id_check_duration_seconds`, `provider_error_rate`, `circuit_state`. PagerDuty P2 if error_rate > 20% 5 m. |
| **Security & compliance** | Video/ID images encrypted at rest (S3 SSE-KMS). Provider webhooks validated via HMAC. Delete media from provider CDN after 7 days via provider API. |
| **Manual review queue** | Admin UI shows applicant selfie + doc, provider insights; decision buttons *approve / reject / request reshoot*. SLA 4 h. |
| **Re-verification** | Triggered automatically if ID document expiry < 30 days or selfie older than 24 months. |

#### 8.1.3 External Service Rate-Limit Reference *(for load-/perf-test calibration)*

| Service / API | Published hard limit | Platform safety ceiling (used in perf tests) | Enforcement & back-off |
|---------------|----------------------|---------------------------------------------|------------------------|
| **KvK Handelsregister** | 600 requests / h / API-key | 300 req/h | identity-check-service token-bucket 5 r/m; 429 opens CB 10 m |
| **VIES VAT SOAP** | ~100 requests / h / IP (EC site) | 60 req/h | Retry-after header not present; exponential back-off 60 → 300 s |
| **Onfido** | 120 API calls / min / token | 60 calls/min | Burst queue drops to Sumsub when utilisation > 70 % |
| **Sumsub** | 10 req/s, 600 req/min | 300 req/min | HMAC signature signed-expires; 429 triggers retry in 5 s |
| **Stripe REST** | 100 req/s globally, 25 req/s per endpoint | 50 req/s global | stripe-client auto-handles 429 with jitter 0.5–2 s |
| **Stripe Webhooks** | 10 events/s per endpoint | 5 events/s | Webhook handler ack within 200 ms, queue extras |
| **SendGrid Email** | 600 req/minute | 400 req/min | Bulk/batch API used; 202 ack validated |
| **SMS (MessageBird)** | 25 req/s per access key | 10 req/s | SMS flood protection aligns with notification batching |
| **WebSocket Gateway (ours)** | 5 000 concurrent conns / node; 1 000 msgs/s cluster | Perf tests at 500 msgs/s steady, 2 000 msg/s 60-s burst | NACK on write backlog > 5 k |

*Note* – Each client wrapper exports Prometheus metric `<service>_rate_limit_utilisation`; alert at > 80 % for 5 m.

### 8.2 Data Storage & Privacy
- GDPR-compliant secure document storage using AWS or Azure
- Encryption for all personal identification documents
- Regular data purging for non-essential information
- Clear data retention policies communicated to users
- Data minimization approach, collecting only necessary information
- Secure access controls for administrative verification processes
- Compliance with Dutch privacy regulations

#### 8.2.1 Personal-Data Retention Matrix *(GDPR Art. 5 (1)(e) – storage-limitation)*

| Data category | Live period (max) | Soft-delete grace | Hard purge | Legal basis / notes |
|--------------|------------------|------------------|------------|---------------------|
| Worker identity documents (passport, residence permit, selfie video) | 13 months after last successful verification **or** account deletion (whichever is sooner) | 30 days | 14 months | Required for annual re-verification; longer retention would contravene storage-limitation principle |
| Employer verification documents (KvK extract, VAT cert, NEN, insurance PDFs) | Validity period of document **+ 6 months** (cap 60 months) | 30 days | Validity + 7 months | Needed for compliance audits & potential labour-inspection follow-ups |
| CVs & optional worker attachments | While account is *Active* | 30 days after user deletes CV **or** account closed | 31 days | Data kept solely for matching; user-initiated deletion respected quickly |
| Application & messaging metadata (IDs, timestamps, status) | 36 months | 30 days | 37 months | Covers typical labour-law dispute window in NL |
| Verification bundles exported for authorities (PDF/ZIP) | 7 years | — | 7 years + 1 month | Dutch tax & inspection record-keeping requirements |
| Billing & invoicing records (Stripe invoice PDFs, payment-method last4, IBAN) | 7 fiscal years | — | 7 years + 1 month | "Wet op de Rijksbelastingen" fiscal retention duty |
| System audit & access logs containing user IDs / IP addresses | 13 months | — | 14 months | Aligns with Dutch DPA guidance on log retention |
| Encrypted disaster-recovery backups | Rolling 35 days | — | Overwritten | Full-volume encrypted snapshots auto-prune on schedule |

*Purge process* – Nightly job `pd_prune` enqueues deletion tasks for records where `expires_at < now()`. Cascade order: encrypted blob ➝ DB row ➝ search-index doc ➝ cache. SHA-256 tombstone is held 30 days (replay-attack guard) then removed.

*Right-to-erasure* – If a data subject triggers GDPR Art. 17 request, `expires_at` is set to *now + 7 days* (allows administrator conflict check); job runs next cycle unless blocked by active legal hold.

#### 8.2.2 Data Deletion & Anonymisation Workflow (GDPR Art. 17)

When a data subject triggers the **Right to Erasure**, the platform performs a two-phase process:
1. **Soft-lock (T0)** – Immediately marks the account `pending_erase`, blocks log-in, sets `expires_at = NOW()+7 days`, and alerts compliance admins (allows fraud, payment-dispute or legal-hold review).
2. **Purge/Anonymise (T+7d)** – Unless a *legal-hold* flag has been set, an asynchronous job carries out the actions in the table below; final status `erased` logged in `privacy_event_log`.

| Data object | Action | Fields removed / transformed | Rationale |
|-------------|--------|--------------------------------|-----------|
| **Worker profile row** | *Redaction* | email, phone, first/last name, DOB, nationality, picture, CV URL → NULL; `account_status = deleted`; keep numeric surrogate key | Keeps referential integrity for history tables |
| **Employer account** | *Anonymisation* | contact name/email/phone → NULL; company name + KvK kept (legal obligation); VAT retained; `verification_status = erased` | Fiscal & labour-law require company traceability |
| **Job applications** | *Pseudonymise foreign keys* | `worker_id` replaced with static uuid `0000-anon-worker`; cover note, free-text answers wiped; keep status, timestamps, match scores | Allows analytics & audit without personal data |
| **Conversation messages** | *Deletion* | ciphertext + attachment blobs physically removed; message row kept with `sender_id = 0000-anon-worker`, `content_hash` retained for dedup | No lawful basis to keep content after erasure |
| **Conversation headers** | *Conditional* | If all participants erased → header deleted; else keep header with anonymised member list | Preserves other party's conversation list |
| **Audit & security logs** | *Hash & truncate* | `user_id` → SHA256(salt+id), IP → /24 subnet, UA string kept | Security-interest in pattern analysis while removing direct identifiers |
| **Payment & billing** | *Retention* | No deletion; GDPR Art. 17(3)(b) exemption. Flag rows `personal_data_redacted=true`; personal contact fields already nulled in employer record | Dutch tax law 7-yr retention supersedes erasure |
| **Reports & moderation actions** | *Pseudonymise* | `reporter_id` → `0000-anon-worker`; narrative text kept (public-interest in safety); attached evidence wiped unless legal-hold | Maintains incident integrity |
| **Analytics aggregates** | *No change* | Aggregates are non-personal by design (<- k-anonymity) | Already anonymous |

*Legal hold override* – Setting flag `legal_hold=true` on an account halts purge until cleared. Attempt to erase while hold active returns `409 Conflict – pending legal process`.

*Transparency* – A signed JSON receipt (hashes of deleted records + timestamps) is available to the requester for 30 days via one-time download link.

*Implementation notes*
• All irreversible operations executed in a single DB transaction per shard to avoid orphan records.
• House-keeping jobs publish `pd.purge.done` event so cache/inverted-index stores can invalidate entries.
• CI contains an integration test that provisions a user, initiates erasure, and asserts **zero PII** remains after job completes (checked via `information_schema` + S3 list).

#### 8.2.3 Backup & Disaster-Recovery Objectives

| Objective | Target | Scope & Details |
|-----------|--------|-----------------|
| **RPO (Recovery Point Objective)** | ≤ **1 minute** for core Postgres DB | Continuous WAL streaming to hot standby in second AZ; loss limited to buffered WAL ≤ 60 s.
| | ≤ **15 minutes** for S3 object storage (documents, attachments) | Versioning + `replication_time_control`; cross-AZ replication < 15 min.
| | ≤ **60 minutes** for search/index & analytics clusters | Hourly incremental snapshots.
| **RTO (Recovery Time Objective)** | **15 minutes** to full read/write on primary API & DB | Terraform plan spins up standby RDS, apps via blue/green; DNS TTL 30 s.
| | **30 minutes** for messaging/WebSocket layer | Helm chart redeploy on spare nodes; queues replay from persisted Redis AOF.
| | **60 minutes** for analytics & batch jobs | Elastic cluster restore from snapshot.
| **Storage classes & retention** | DB snapshots: daily full (retention 35 days) – stored in S3 Glacier Instant Retrieval; 7-day copies in cross-region (eu-west-1).<br>Object storage: S3 Standard → Intelligent-Tiering after 30 days; versioning enabled.<br>Attachments over 50 MB move to Glacier Deep Archive after 12 months. |
| **Encryption** | All backup artifacts encrypted at rest with KMS CMK; cross-region copies re-encrypted with target-region CMK. |
| **Verification & drills** | • **Automated:** nightly checksum verify of previous snapshot; weekly `pg_restore --list` dry-run.<br>• **Manual:** Quarterly restore drill to staging; must achieve RTO ≤ targets.<br>• **Compliance:** Annual external audit includes random sample restore. |
| **Monitoring & alerts** | Prometheus exporter `backup_job_last_success_timestamp`; PagerDuty P1 if > 26 h since last successful snapshot or checksum mismatch. |

This subsection anchors the numerical RPO/RTO figures referenced in 8.3.3 and documents storage classes, encryption, retention, and test cadence in one place.

### 8.3 Scalability & Deployment
- Cloud-based infrastructure allowing for elastic scaling
- CDN implementation for static content delivery
- Database optimization for search and matching functions
- Caching strategies for frequently accessed data
- Asynchronous processing for document verification tasks
- Queue-based architecture for handling verification requests
- Load balancing for peak usage periods

#### 8.3.1 Platform-Wide Performance Targets

| Component | Implementation Details |
| --------- | ---------------------- |
| **1. API "North-Star" metrics** | • p95 latency ≤ 200 ms for authenticated JSON REST/gRPC hits (cold cache ≤ 400 ms)<br>• p99 latency ≤ 500 ms during peak (defined as 200 req/s sustained)<br>• Error rate (5xx) < 0.1% over any 1-hour window |
| **2. Critical user flows (server + client combined)** | | Flow | Metric | Target | Notes |<br>|------|--------|--------|-------|<br>| Worker dashboard load | First Contentful Paint | ≤ 1.8 s on desktop LTE | Lighthouse Desktop, 85th percentile |<br>| Employer "Post job" step→step | UI transition time | ≤ 150 ms | Measured with Web-Vitals |<br>| Job approval → candidate notification | End-to-end delay | ≤ 5 s | Includes match-engine run |<br>| Message send (E2E encrypted) | Delivery latency | ≤ 250 ms p95 | Sender→receiver round-trip |<br>| Report submission | Server ACK | ≤ 300 ms p95 | After evidence upload completes |<br>| Payment checkout session | Stripe redirect time | ≤ 800 ms p95 | Excludes external bank auth | |
| **3. Background processing SLAs** | • Document scan & virus check ≤ 8 s p95<br>• KvK / VAT verification response ≤ 3 s p95 (falls back per 8.1.1)<br>• Nightly re-verification batch < 45 min for 10 k employers |
| **4. Database/query constraints** | • Single SQL query: execution time ≤ 50 ms p95 (index policy enforced by CI linter)<br>• Connection pool saturation < 70% of max under peak load<br>• Long-running analytical queries executed on read-replica only |
| **5. Concurrency & load capacity (MVP)** | • Sustained 1,000 concurrent logged-in users<br>• Burst 500 messages/s over WebSocket gateway<br>• 20 jobs/s entering match-engine without queue backlog > 100 jobs |
| **6. Monitoring & alerts (Prometheus + Grafana)** | | Metric | Alert Threshold | Page / Slack |<br>|--------|-----------------|--------------|<br>| api_http_request_duration_seconds_p95 > 0.25 s for 5 m | Slack-#ops |<br>| websocket_send_latency_ms_p95 > 300 ms for 3 m | PagerDuty P2 |<br>| db_query_time_p95 > 80 ms for 10 m | Slack-#db |<br>| queue_depth_match_engine > 100 for 2 m | Slack-#ops |<br>| uptime < 99.5% rolling 30 d | Monthly KPI review | |
| **7. Load- & stress-test plan** | • k6 scripts cover auth, job search, match, message, payment.<br>• Weekly CI job runs 15-minute load at 2× expected peak; must pass latency SLAs.<br>• Quarterly stress test to 5× peak; document bottlenecks & scale plan. |
| **8. Front-end performance budgets (desktop)** | • JS bundle ≤ 300 kB gzipped (initial)<br>• CSS ≤ 100 kB gzipped<br>• Third-party scripts ≤ 2, blocking none<br>• CLS ≤ 0.1, TBT ≤ 200 ms (95th percentile) |

#### 8.3.2 Accessibility & Inclusive-Design Compliance

| Component | Implementation Details |
| --------- | ---------------------- |
| **1. Conformance scope** | • Public worker & employer UIs (web + PWA).<br>• Admin console and internal dashboards.<br>• All HTML e-mails and PDF downloads generated by the platform.<br>• Third-party widgets (Stripe Checkout, file previews) must meet or exceed embedded-content rules (§508 1194.22(o)). |
| **2. Technical success criteria (all must meet WCAG 2.1 AA)** | a. Perceivable<br>&nbsp;&nbsp;– 4.5:1 minimum colour-contrast for text/icons; 3:1 for larger ≥ 18 pt/14 pt bold.<br>&nbsp;&nbsp;– Provide visible focus indicator ≥ 2 px outline, colour ratio ≥ 3:1 vs surrounding.<br>&nbsp;&nbsp;– All non-text content carries descriptive alt, aria-label or aria-labelledby.<br>&nbsp;&nbsp;– Captions or transcript for all video help clips; live audio (future) uses real-time caption proxy.<br>b. Operable<br>&nbsp;&nbsp;– Keyboard-only navigation for every interactive element; no "keyboard traps".<br>&nbsp;&nbsp;– Page titles, headings and landmarks follow logical hierarchy (H1 → H6, &lt;nav&gt;/&lt;main&gt;/&lt;aside&gt;).<br>&nbsp;&nbsp;– Scroll-blocking modals: focus is trapped inside and returned on close.<br>&nbsp;&nbsp;– Animations respect reduced-motion OS setting; default duration ≤ 200 ms.<br>c. Understandable<br>&nbsp;&nbsp;– Form fields use programmatic labels + aria-describedby for helper text/errors.<br>&nbsp;&nbsp;– Real-time inline validation announced via aria-live="polite".<br>&nbsp;&nbsp;– Consistent navigation structure across pages; role="navigation" regions labelled ("Main menu", "Footer links").<br>d. Robust<br>&nbsp;&nbsp;– Front-end components use semantic HTML wherever possible; custom elements expose role/state/value.<br>&nbsp;&nbsp;– ARIA 1.2 patterns adhered to for tabs, accordions, autocompletes.<br>&nbsp;&nbsp;– PDFs tagged (PDF/UA-1) with logical reading order and bookmarks. |
| **3. Component-specific check-list** | | Area | Key Requirements | Implementation notes |<br>|------|-----------------|-------------------------|<br>| Navigation (header/bottom-nav) | Skip-to-content link, aria-current="page" | Hidden until focus, shown on Tab-0 |<br>| Job-listing cards | alt text for images, semantic buttons (&lt;button&gt;) | Combined aria-label summarises title, employer, location |<br>| Forms & wizards | Logical Tab order, fieldset/legend for radio/checkbox groups | Error summary at top + inline; both linked via aria-describedby |<br>| Data tables (admin) | &lt;th scope="col/row"&gt;, caption, sticky header | Keyboard sortable columns with aria-sort |<br>| Drag-and-drop (skill chips) | Up/Down arrows reorder; aria-dropeffect removed post-HTML5 | Live region announces position change |<br>| Charts (analytics) | High-contrast palette, keyboard focus rings | Underlying datagrid alternative hidden with visually-hidden class |<br>| Messaging thread | role="log" with aria-live="polite" so screen readers get new messages | Timestamp formatted in user locale |<br>| PDF invoices | Tagged headings, table headers, language set (/Lang(NL-NL)) | Stripe webhook PDF passes through tagger micro-service | |
| **4. Design-system tokens** | • Acceptable colour palette documented in Figma + exported as CSS vars (`--c-text`, `--c-bg-alt` …).<br>• Any new colour combination must show automated pass in Contrast Figma plugin.<br>• Component library CI denies merge if *.stories.tsx fails axe-core tests. |
| **5. QA & automated testing** | • Unit: jest-axe for every React component (threshold: no serious/critical violations).<br>• Integration: Cypress + axe check on every route (CI).<br>• Manual: NVDA (Windows), VoiceOver (macOS/iOS) smoke test each sprint; JAWS once per release.<br>• PDF/UA validation via PAC 3 CLI.<br>• Lighthouse accessibility score ≥ 95 on reference pages; any dip blocks release.<br>• Annual external audit by certified accessibility partner; report shared publicly. |
| **6. Documentation & governance** | • CONTRIBUTING.md: "Accessibility acceptance criteria" section with code examples.<br>• Design-review checklist includes a11y sign-off line item; PR template links to it.<br>• Regression labels (`a11y-bug`) automatically added by eslint-plugin-jsx-a11y rule failures. |
| **7. KPIs & monitoring** | | Metric | Target | Tool |<br>|--------|--------|------|<br>| axe critical violations in production | 0 | Sentry + axe-linter |<br>| Support tickets flagged "accessibility" | < 2% of total | Zendesk tag analytics |<br>| External audit re-certification | 100% pass | Yearly audit | |

#### 8.3.3 Quality-Assurance & Test Strategy

| Component | Implementation Details |
| --------- | ---------------------- |
| **1. Test-pyramid & scope** | • **Unit (fast, deterministic)** Pure functions, React components, DB triggers.<br>• **Service / API (contract + integration)** gRPC + REST endpoints, DB, cache.<br>• **End-to-End (E2E)** Critical user journeys through Cypress on Chrome + Playwright on Firefox/Safari.<br>• **Non-functional** Performance, security, accessibility, i18n, backup/restore.<br>• **Regression dataset** Redacted fixtures (~5 MB) representing 50 jobs, 120 workers, 3 employers, 10 reports. |
| **2. Toolchain** | | Layer | Tools | Frequency | Target KPI |<br>|-------|-------|-----------|-----------|<br>| Unit | vitest / jest, react-testing-library, sqlc-test | On every PR | ≥ 90% statement coverage |<br>| Contract | pact-js / pact-go for consumer–provider | Daily pipeline | 100% "green" pact verify |<br>| API e2e | Supertest (node) + db-container | PR + nightly | ≤ 0.1% flaky tests |<br>| UI e2e | Cypress Cloud parallel (Chrome), Playwright (Firefox/Safari) | PR smoke + nightly full | Critical path pass rate 100% |<br>| Perf | k6 + Locust; Lighthouse CI | Weekly & before release | Meets 8.3.1 SLAs |<br>| Security | Snyk, trivy, semgrep, OWASP ZAP active scan | On every merge to main | 0 high-sev vulns in main |<br>| a11y | axe-linter (unit) + pa11y-ci on staging | PR + nightly | axe "serious/critical" = 0 |<br>| i18n | i18next-parser verify, pseudo-loc tests | Nightly | Missing key ratio < 0.5% |<br>| Backup / DR | pg_dump + object-store restore dry-run | Weekly | Restore ≤ 15 min | |
| **3. CI/CD flow (GitHub Actions)** | 1. **lint-and-unit** → vet, eslint, jest, vitest.<br>2. **build-docker** → multi-arch images; trivy scan.<br>3. **contract-verify** → Pact broker—fail pipeline if any contract breaks.<br>4. **integ-api** → spin up compose stack, run Supertest suite.<br>5. **ui-smoke** → Cypress subset (≈30 s).<br>6. **deploy-preview** → Netlify build of front-end, fly.io for API (PR only).<br>7. **full-ui-e2e (parallel)** → Cypress + Playwright on preview env.<br>8. **perf-budget** → Lighthouse CI, k6 smoke (1 min).<br>9. **security-gate** → ZAP baseline, semgrep.<br>10. **merge-to-main** triggers staging deploy + full nightly suite.<br>11. Manual "Release" action kicks off canary 10% traffic → 24 h → prod. |
| **4. Environments & data** | • **Local dev** – docker-compose + seeded data (`make db-seed`).<br>• **CI ephemeral** – containers, reset per job.<br>• **Staging** – mirrors prod infra (≥1 node/az), anonymised nightly DB copy.<br>• **Canary** – prod traffic mirrored; auto-rollback if error rate > 0.5%.<br>• **Prod** – immutable images, blue/green deploy, 15-min db WAL retention. |
| **5. Release criteria** | • All pipelines green.<br>• p95 latency & error rates within SLA on canary.<br>• DB migrations idempotent in staging + prod shadow table.<br>• Security scan: 0 high / 0 critical vulnerabilities open.<br>• a11y smoke passes.<br>• PO signs off "Go/No-Go" checklist in Jira. |
| **6. Defect management & triage** | • Bugs logged in Jira with severity matrix (blocker < 4 h, critical < 1 d, major < 3 d, minor < 1 sprint).<br>• Sentry for runtime errors → Slack #alerts.<br>• Post-mortems required for any P1 production incident; action items added to backlog within 48 h. |
| **7. Observability in prod** | • **Metrics**: Prometheus + Grafana dashboards (latency, RPS, error %, queue depth).<br>• **Tracing**: OpenTelemetry → Jaeger; 100% sampled on `/apply` & `/verify`.<br>• **Logging**: JSON structured, Loki retention 30 d (prod), 7 d (staging).<br>• **Synthetic checks**: k6 uptime script every 60 s from 3 regions; alert at > 90th pctl latency SLA breach.<br>• **Real user monitoring**: Frontend web-vitals to PostHog; aggregated in Grafana. |
| **8. People & process** | • "Definition of Done" includes test coverage, a11y, i18n, security checks.<br>• Rotating **QA champion** each sprint: runs exploratory test charter, accessibility smoke, cross-browser sanity.<br>• Quarterly chaos-engineering game day (DB failover, queue black-hole, S3 read-only) with blameless review.<br>• Annual external pentest + WCAG audit; remediation tickets triaged as P1-P3. |

### 8.4 Potential Challenges
- Manual verification creating bottlenecks during high-volume periods
- Balancing thorough verification with user experience expectations
- Maintaining data security while enabling necessary access for verification
- Keeping pace with evolving regulations for employment agencies
- Language barriers affecting user understanding of requirements
- Fraudulent attempts to bypass verification systems
- Integration reliability with third-party verification services
- Limited development resources with single-person development team

---

## 9. MVP Implementation Strategy & AWS Deployment

### 9.1 Development Approach
- **Team**: Single full-stack developer with Claude Code assistance
- **Timeline**: 8-week MVP target with flexible schedule
- **Architecture**: Django monolith with modular apps for future scaling
- **Infrastructure**: AWS Free Tier optimized for cost-effective deployment

### 9.2 AWS Free Tier Architecture

#### 9.2.1 Infrastructure Components
| Service | Tier | Capacity | Cost After Free Tier |
|---------|------|----------|---------------------|
| **ECS Fargate** | 1 year free | Always Free: 1 vCPU | ~$10/month |
| **RDS PostgreSQL** | 1 year free | db.t3.micro, 20GB | ~$15/month |
| **ElastiCache Redis** | 1 year free | cache.t3.micro | ~$12/month |
| **S3 Storage** | Always free | 5GB | ~$2-5/month |
| **CloudFront CDN** | 1 year free | 50GB transfer | ~$2/month |
| **Route 53** | Always free | 1 hosted zone | $0.50/month |
| **Resend Email** | External service | 3,000 emails/month free | $20/month for 50k emails |

**Total Monthly Cost Post-Free Tier: ~$40-45** (email costs separate based on usage)

#### 9.2.2 Deployment Strategy
```
Internet → Route 53 → CloudFront → ALB → ECS Fargate Tasks
                                             ↓
PostgreSQL RDS ← Django Apps → Redis ElastiCache
                     ↓
                  S3 Storage
```

#### 9.2.3 Container Architecture
- **Single Container**: Django + Channels + Static files
- **Multi-stage Docker**: Optimized for size and security
- **Health Checks**: ALB integration with Django health endpoints
- **Auto-scaling**: Start with 1 task, scale based on CPU/memory

### 9.3 Development Milestones (Revised)

#### 9.3.1 MVP Timeline (8 Weeks)
**Week 1-2: Foundation**
- Django 5.2.4 project setup with PostGIS
- Magic link authentication system
- Basic user models and admin
- Docker containerization

**Week 3-4: Core Features**
- Job posting and approval workflow
- Document upload and preview system
- Basic search with geolocation
- Application management

**Week 5-6: Real-time Features**
- Django Channels setup
- WebSocket messaging system
- Notification system
- Admin workflow tools

**Week 7-8: Deployment & Polish**
- AWS infrastructure setup
- Frontend integration
- Performance optimization
- User acceptance testing

#### 9.3.2 Post-MVP Phases
**Phase 2 (Month 3-4): Advanced Features**
- AI content review integration
- Advanced matching algorithms
- Enhanced security features

**Phase 3 (Month 5-6): Business Features**
- Subscription and payment system
- Multi-language support
- Advanced analytics

**Phase 4 (Month 6+): Scale Features**
- Couple applications
- Advanced reporting
- Third-party integrations

### 9.4 Risk Mitigation Strategy

#### 9.4.1 Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Django Channels Complexity** | Medium | High | Start simple, iterate gradually |
| **PostGIS Learning Curve** | High | Medium | Use Django GIS contrib, good documentation |
| **AWS Free Tier Limits** | Low | Medium | Monitor usage, plan upgrade path |
| **Single Developer Bottleneck** | High | High | Claude assistance, modular development |

#### 9.4.2 Success Criteria
**Technical Metrics:**
- API response time < 200ms (p95)
- 99%+ uptime during business hours
- Mobile-responsive interface on all devices

**Functional Metrics:**
- Complete user journeys work end-to-end
- Admin can approve jobs and verify employers
- Real-time messaging functions properly

**Business Metrics:**
- 10+ verified employers using the platform
- 50+ registered candidates with complete profiles
- 20+ successful job applications processed

---

## 10. User Stories

### 10.1. Browse job listings as visitor
- **ID**: US-001
- **Description**: As an unregistered visitor, I want to browse job listings to explore opportunities before deciding to register.
- **Acceptance criteria**:
  - Job listings are visible to visitors without requiring login
  - Basic search and filtering options are available
  - Visitors can see employer verification status
  - "Apply" buttons redirect to registration/login page
  - Limited job details are shown, with complete information available after registration
  - Clear call-to-action for registration is displayed throughout the browsing experience

### 10.2. Register as a worker
- **ID**: US-002
- **Description**: As a temporary worker, I want to register on the platform so I can find safe job opportunities.
- **Acceptance criteria**:
  - Registration form collects essential personal information
  - Option to upload a CV that pre-fills form fields
  - Skills, certificates, and language proficiencies can be selected from predefined lists
  - Optional work history section is available
  - Account creation confirmation is sent via email
  - Privacy policy and terms are clearly presented for acceptance

### 10.3. Register as an employer
- **ID**: US-003
- **Description**: As an employment agency, I want to register on the platform by selecting my agency type and providing required verification documents.
- **Acceptance criteria**:
  - User can select from four employer types: Freelancer, Small Agency, Medium/Large Agency, Corporate HR
  - Required document list is dynamically displayed based on selected type
  - Secure document upload system accepts common file formats
  - Verification status dashboard shows progress and pending items
  - Email notifications are sent when verification status changes
  - Account features are limited until verification is complete

### 10.4. Complete worker onboarding process
- **ID**: US-004
- **Priority**: High
- **Complexity**: 10 story points
- **User Type**: New candidates
- **Description**: As a new worker, I want to complete a guided onboarding process so that I can quickly set up my comprehensive profile and understand how to use the platform safely and effectively.
- **Acceptance criteria**:
  - Onboarding begins immediately after email verification with welcome tutorial
  - Progress indicator displays completion status across 6 key steps: Welcome → CV Upload → Skills → Experience → Preferences → Completion
  - CV upload functionality automatically extracts and pre-fills profile fields (name, experience, skills) to reduce manual entry
  - Skills selection interface provides searchable taxonomy with suggestions based on uploaded CV content
  - Work history section allows optional entry of previous employers with role descriptions
  - Language proficiency self-assessment with standardized levels (A1-C2 for European languages)
  - Location and transportation preferences capture commuting constraints and job radius
  - Safety tutorial covers platform features for reporting issues and recognizing legitimate employers
  - Onboarding completion unlocks full job search, application, and messaging features
  - Skip options available for optional sections while encouraging full completion through progress incentives
- **Definition of Done**:
  - Onboarding completion rate exceeds 75% for new worker registrations
  - Average completion time under 12 minutes for full onboarding process
  - CV parsing accurately extracts data from PDF and DOC formats with 85% accuracy
  - Analytics tracking implemented for step-by-step conversion optimization

### 10.5. Complete employer verification onboarding
- **ID**: US-005
- **Priority**: High
- **Complexity**: 15 story points
- **User Type**: New employers
- **Description**: As a new employer, I want to complete a comprehensive verification onboarding process so that I can establish business legitimacy, demonstrate compliance, and begin posting jobs with platform trust indicators.
- **Acceptance criteria**:
  - Onboarding process clearly explains verification benefits including candidate trust, platform priority, and compliance demonstration
  - Document upload guidance provides specific examples and format requirements for each business type
  - KvK (Chamber of Commerce) number entry includes real-time validation through official Dutch API integration
  - Business information form captures legal entity details, registration address, and primary contact verification
  - Compliance questionnaire covers Dutch labor law requirements including ABU/SBBU certification status
  - Photo identification upload required for business owner or authorized representative
  - Additional documentation requirements vary by employer type (freelancer license, agency permits, corporate registration)
  - Real-time status tracking shows verification progress with estimated review timeframes
  - Admin review process includes structured feedback for incomplete or rejected submissions
  - Successful verification unlocks job posting capabilities and displays verification badge on all job listings
  - Verification renewal reminders sent 30 days before document expiration dates
- **Definition of Done**:
  - Verification completion rate exceeds 60% for eligible business registrations
  - Average admin review time under 48 hours for complete applications
  - KvK API integration maintains 99%+ uptime with proper error handling and fallbacks
  - Admin verification interface streamlined for efficient processing with bulk action capabilities

### 10.6. Verify employer documentation
- **ID**: US-004
- **Description**: As a platform administrator, I want to review uploaded verification documents to ensure employer legitimacy.
- **Acceptance criteria**:
  - Admin dashboard displays pending verification requests in order of submission
  - Documents can be viewed securely within the platform
  - Validation checklist is provided for each document type
  - Admin can approve, reject, or request additional information
  - Notes and feedback can be recorded for each verification decision
  - Automatic notifications are sent to employers about verification status changes

### 10.5. Post a job listing
- **ID**: US-005
- **Description**: As a verified employer, I want to create a detailed job listing to attract qualified candidates.
- **Acceptance criteria**:
  - Structured form captures all necessary job details
  - Static preview shows exactly how the listing will appear to candidates
  - Commenting feature allows for platform admin feedback on potential issues
  - Job listings are only published after manual admin review and approval
  - Listings include clear expiration dates with renewal options
  - Status indicators show if a job is pending review, approved, or rejected

### 10.6. Review job listings
- **ID**: US-006
- **Description**: As a platform administrator, I want to review job listings before they are published to ensure compliance and safety.
- **Acceptance criteria**:
  - Admin dashboard shows queue of pending job listings requiring review
  - Review interface displays all job details and employer information
  - Admin can approve, reject, or request changes with comments
  - Employers receive notifications about the status of their job listings
  - Approved listings are automatically published to the platform
  - Review history is maintained for auditing purposes

### 10.7. Search and apply for jobs
- **ID**: US-007
- **Description**: As a registered worker, I want to search for jobs that match my skills and apply with minimal effort.
- **Acceptance criteria**:
  - Search functionality includes filters for location, job type, and required skills
  - Job listings display verification status of the employer
  - Application process uses profile information without requiring re-entry
  - Confirmation is provided after successful application
  - Application history is accessible from user dashboard
  - Job listings clearly indicate application deadlines and status

### 10.8. Communicate with candidates
- **ID**: US-008
- **Description**: As an employer, I want to message candidates who have applied to my job listings to discuss details and arrange interviews.
- **Acceptance criteria**:
  - Messaging is only enabled after a candidate has applied to a job
  - Conversation thread maintains history of all communications
  - Notifications alert users to new messages
  - Attachments can be shared securely within the messaging system
  - Both parties can see when messages have been read
  - Reporting functionality is available if inappropriate content is shared

### 10.9. Create agency subaccounts
- **ID**: US-009
- **Description**: As a medium/large agency admin, I want to create subaccounts for my recruiters while maintaining centralized billing.
- **Acceptance criteria**:
  - Primary account can create, modify, and deactivate subaccounts
  - Permission levels can be set for each subaccount
  - Billing remains centralized with the primary account
  - Activity from all subaccounts is viewable by the admin
  - Subaccount users receive their own login credentials
  - Usage counts toward the primary account's subscription limits

### 10.10. Report suspicious activity
- **ID**: US-010
- **Description**: As a registered worker, I want to report potential exploitation or suspicious behavior to platform administrators.
- **Acceptance criteria**:
  - Reporting function is easily accessible from job listings and messages
  - Options to categorize the type of suspicious activity
  - Anonymous reporting is possible
  - Receipt confirmation is provided after submission
  - Follow-up mechanism allows admins to request more information
  - Status updates are provided on report investigation

### 10.11. Manage subscription tier
- **ID**: US-011
- **Description**: As an employer, I want to select and modify my subscription tier based on my hiring needs.
- **Acceptance criteria**:
  - Clear presentation of available subscription options
  - Secure payment processing for subscription fees
  - Option to upgrade, downgrade, or cancel subscription
  - Usage statistics show current consumption relative to limits
  - Additional job packs can be purchased when nearing limits
  - Billing history is available for accounting purposes

### 10.12. Authenticate securely
- **ID**: US-012
- **Description**: As a platform user, I want to securely access my account without managing passwords and optionally enable additional security measures.
- **Acceptance criteria**:
  - Magic link authentication via email for all users
  - OAuth options (Google, Facebook, Apple) for worker accounts
  - Optional two-factor authentication (2FA) available for all user types
  - 2FA setup through authenticator apps or SMS verification
  - Secure token generation with appropriate expiration
  - Session timeout occurs after period of inactivity
  - Magic links expire after one use or 15 minutes
  - Account activity log shows recent logins and actions
  - Easy re-authentication process when sessions expire

### 10.13. Provide platform feedback
- **ID**: US-013
- **Description**: As a user, I want to provide feedback on the platform to help improve its functionality and address issues.
- **Acceptance criteria**:
  - Feedback form is accessible from all main pages
  - Users can categorize their feedback (bug, suggestion, complaint)
  - Screenshots can be attached to illustrate issues
  - Confirmation is provided when feedback is submitted
  - Option to be contacted about the feedback is available
  - Critical issues are flagged for immediate review

### 10.14. Generate compliance reports
- **ID**: US-014
- **Description**: As an agency, I want to generate reports demonstrating my compliance with platform standards to share with clients.
- **Acceptance criteria**:
  - Report template includes verification status and history
  - PDF format is available for download
  - Agency logo can be included in the report
  - Verification timestamps are clearly displayed
  - Report is digitally signed by the platform for authenticity
  - Sharing options include direct link or download

### 10.15. Update worker profile
- **ID**: US-015
- **Description**: As a worker, I want to update my profile information to ensure it remains current and accurately reflects my skills and availability.
- **Acceptance criteria**:
  - Profile editing interface is intuitive and accessible
  - Changes are saved automatically or with a clear save option
  - History of profile changes is maintained
  - Email notifications confirm significant profile updates
  - Profile completeness indicator encourages providing all relevant information
  - Option to temporarily mark profile as "not available for work"

### 10.16. View and manage applications
- **ID**: US-016
- **Description**: As a worker, I want to view and manage my job applications to track their status and organize my job search.
- **Acceptance criteria**:
  - Dashboard shows all submitted applications with status indicators
  - Applications can be sorted by date, status, or employer
  - Option to withdraw applications that are still under consideration
  - Archive feature for past applications
  - Notification settings for application status updates
  - Quick access to communication history for each application

### 10.17. Set notification preferences
- **ID**: US-017
- **Description**: As a platform user, I want to customize my notification preferences to control how and when I receive alerts.
- **Acceptance criteria**:
  - Separate settings for email, SMS, and in-app notifications
  - Granular control over notification types (applications, messages, etc.)
  - Option to set quiet hours when no notifications are sent
  - Test notification feature to confirm settings
  - Easy one-click unsubscribe from email notifications
  - Summary notification option for batching multiple alerts

### 10.18. View platform analytics
- **ID**: US-018
- **Description**: As an agency with a paid subscription, I want to access analytics about my job postings and candidate interactions to optimize my recruitment efforts.
- **Acceptance criteria**:
  - Dashboard displays key metrics like views, applications, and response rates
  - Data visualization shows trends over time
  - Filtering options to analyze performance by job type, location, etc.
  - Export functionality for reports in common formats
  - Comparison metrics against platform averages
  - Actionable insights highlighted based on data patterns

### 10.19. Create and save job templates
- **ID**: US-019
- **Description**: As an employer who regularly posts similar jobs, I want to create and save job templates to streamline the posting process.
- **Acceptance criteria**:
  - Interface for creating reusable job templates
  - Option to save any job posting as a template
  - Template management section for editing and deleting templates
  - Quick-post feature using templates with minimal editing required
  - Templates include all job details including required skills and qualifications
  - Option to share templates with subaccounts

### 10.20. Manage platform analytics
- **ID**: US-020
- **Description**: As a platform administrator, I want to access comprehensive analytics about platform usage to guide decision-making and improvements.
- **Acceptance criteria**:
  - Dashboard showing key metrics like registrations, job postings, and application rates
  - Filtering capabilities by date range, user type, and geographic region
  - Trend analysis for important metrics over time
  - Ability to export reports in common formats (CSV, PDF)
  - User engagement metrics including session duration and feature usage
  - Conversion funnels for key user journeys
  - Alert system for metrics falling outside expected ranges
  - Regular automated reports sent to key stakeholders
  - Data visualization for complex metrics and relationships
  - Access controls to limit sensitive data to authorized administrators

### 10.21. Apply as a couple
- **ID**: US-021
- **Description**: As a worker in a relationship, I want to link my profile with my partner's and apply to jobs together, so we can find work opportunities that accommodate us as a couple.
- **Acceptance criteria**:
  - Workers can send couple-linking invitations to other registered workers
  - Both parties must confirm the relationship to establish a couple link
  - Linked couples appear as a unit when applying to suitable jobs
  - Couples can view and apply to jobs specifically marked as "suitable for couples"
  - Each partner maintains individual profile information and skills
  - Employers can see both individual profiles and a combined view
  - Either partner can disconnect the couple relationship at any time
  - Couple status is clearly indicated on profiles and applications
  - Partners receive notifications about each other's application status changes
  - Process exists to unlink profiles if the relationship ends
  - System handles scenarios where only one partner is accepted for a position

### 10.22. Post jobs suitable for couples
- **ID**: US-022
- **Description**: As an employer, I want to indicate when jobs are suitable for couples and view couple applications, so I can hire partners who wish to work together.
- **Acceptance criteria**:
  - Option to mark jobs as "suitable for couples" during job creation
  - Ability to specify if couple-appropriate housing is provided
  - Search filter to specifically find couples when needed
  - View combined skills and qualifications of couple applicants
  - Schedule joint interviews with both partners
  - Make hiring decisions for couples as a unit or individually
  - Communicate with both partners simultaneously through the messaging system
  - Reporting on couple vs. individual application statistics

### 10.23. Add skills to profile
- **ID**: US-023
- **Description**: As a worker, I want to add my skills to my profile so that I can be matched with appropriate job opportunities.
- **Acceptance criteria**:
  - Workers can select skills from a predefined, categorized list during profile creation and updates
  - Skills can be rated by proficiency level (Basic, Intermediate, Expert)
  - Workers can easily search for skills using keywords
  - Related skills are suggested based on existing selections
  - User interface shows skills grouped by category for easy browsing
  - Workers can remove skills that are no longer relevant
  - Profile completion indicator reflects skills information
  - Skills are self-declared without requiring document verification
  - Minimum of 5 skills recommended for optimal matching

### 10.24. Specify required skills for job postings
- **ID**: US-024
- **Description**: As an employer, I want to specify required and preferred skills for job postings so I can attract candidates with suitable qualifications.
- **Acceptance criteria**:
  - Employers can select skills/certifications from the same predefined list used by workers
  - Each skill can be marked as "required" or "preferred"
  - Minimum proficiency levels can be specified for skills
  - Skills section is mandatory when creating a job posting
  - Common skill clusters can be quickly selected based on job type
  - Job preview shows how skills requirements will appear to candidates
  - Employers can modify skill requirements when editing job postings
  - Skills requirements factor into the job matching algorithm
  - User interface shows skills grouped by category for easy browsing
  - Required and preferred skills are clearly differentiated in the job listing

### 10.25. Suggest new skills or certifications
- **ID**: US-025
- **Description**: As a platform user (worker or employer), I want to suggest new skills or certifications that aren't currently available in the system, so the platform can stay current with industry needs.
- **Acceptance criteria**:
  - Users can submit suggestions when they cannot find a needed skill
  - Suggestion form captures name, type (skill/certification), category, and justification
  - Users receive confirmation when their suggestion is submitted
  - Users are notified when their suggestion is approved or rejected
  - Approved skills become immediately available for selection
  - If a suggestion is rejected, users receive a brief explanation
  - Similar existing skills are shown to prevent duplicate suggestions
  - Suggestions are tracked by user type (worker vs. employer) for analytics

### 10.26. Manage skills and certifications taxonomy
- **ID**: US-026
- **Description**: As a platform administrator, I want to manage the skills and certifications taxonomy, so the platform maintains an accurate and current database of qualifications.
- **Acceptance criteria**:
  - Admins can view all user-submitted skill/certification suggestions
  - Interface for reviewing, approving, editing, or rejecting suggestions
  - Ability to add new skills/certifications directly to the system
  - Tools to edit, merge, or deprecate existing skills/certifications
  - Bulk import/export functionality for updating multiple records
  - Translation management for all supported languages
  - Analytics showing most frequently selected and searched skills
  - Dashboard showing skills with highest demand-supply gaps
  - Audit trail of all changes to the taxonomy
  - Version control system to track taxonomy changes over time

### 10.27. Create and manage job listings
- **ID**: US-027
- **Description**: As an employer, I want to create, edit, and manage job listings through a structured workflow to efficiently find qualified candidates.
- **Acceptance criteria**:
  - Multi-step form guides employers through all required information
  - Ability to save drafts at any point during creation
  - Clear validation feedback for missing or incorrect information
  - Option to duplicate existing job listings to create similar ones
  - Dashboard showing all my listings with status indicators
  - Filtering and sorting options for my job listings
  - Job preview showing exactly how the listing will appear to workers
  - Automatic expiration date calculation with manual override
  - Job listing performance metrics (views, applications, matches)
  - Batch operations for managing multiple job listings

### 10.28. Submit job listings for review
- **ID**: US-028
- **Description**: As an employer, I want to submit completed job listings for review and receive timely feedback so I can publish compliant job opportunities.
- **Acceptance criteria**:
  - Clear submission button once all required fields are complete
  - Confirmation of submission with estimated review timeframe
  - Job credit usage is clearly explained before submission
  - Notifications when job status changes (approved/rejected)
  - Ability to view admin comments on rejected listings
  - Clear instructions on what needs to be fixed for rejected listings
  - Option to withdraw a listing from review before approval
  - Email notifications for review status changes
  - Job credits are returned if a listing is rejected

### 10.29. Review job listings as administrator
- **ID**: US-029
- **Description**: As a platform administrator, I want to review submitted job listings to ensure they meet platform standards and protect worker safety.
- **Acceptance criteria**:
  - Prioritized queue of pending job reviews
  - Clear display of employer verification status alongside job details
  - Structured review checklist for consistent evaluation
  - Ability to add section-specific comments for employers
  - Option to approve, reject, or request changes
  - Comparison view for edited jobs showing what has changed
  - Tools to filter and sort the review queue by various criteria
  - Performance metrics on review turnaround time
  - Ability to flag suspicious patterns for further investigation
  - Historical view of previously reviewed jobs by employer

### 10.30. Track job posting version history
- **ID**: US-030
- **Description**: As an employer or administrator, I want to track version history of job listings to maintain accountability and restore previous versions if needed.
- **Acceptance criteria**:
  - Each edit to a job listing creates a new version with timestamp
  - Clear indication of who made each change (employer or admin)
  - Side-by-side comparison of different versions
  - Ability to restore a previous version if needed
  - Major edits of published jobs require re-approval
  - Minor edits to published jobs (e.g., typo fixes) don't require re-approval
  - Complete audit trail of all changes preserved
  - Version history accessible to both employers and admins
  - Notification when significant changes require re-review
  - System automatically determines if changes require re-review

### 10.31. Manage job posting credits
- **ID**: US-031
- **Description**: As an employer, I want to manage my job posting credits effectively to optimize my recruitment budget.
- **Acceptance criteria**:
  - Clear display of available job credits on dashboard
  - Detailed ledger showing credit usage history
  - Automatic credit allocation based on subscription tier
  - Credits only consumed when jobs are approved
  - Credits returned for rejected listings
  - Ability to purchase additional credits as needed
  - Notifications when credits are running low
  - Option to prioritize usage of expiring credits
  - Credits have clear expiration dates if applicable
  - Analytics on credit usage efficiency (applications per credit)

### 10.32. Create multi-language job postings
- **ID**: US-032
- **Description**: As an employer, I want to create job listings in multiple languages to reach a diverse candidate pool.
- **Acceptance criteria**:
  - Interface to add the same job listing in multiple supported languages
  - Primary language version is required; additional languages are optional
  - Language tabs clearly indicate which translations are available
  - Consistent formatting across all language versions
  - Workers see the job in their preferred language when available
  - Clear indication when a job is available in a worker's preferred language
  - Language preference influences matching algorithm
  - Option to use machine translation with human review
  - Ability to edit individual language versions separately
  - Preview feature shows how the job appears in each language

### 10.33. Complete worker onboarding process
- **ID**: US-033
- **Description**: As a worker, I want a guided step-by-step onboarding process that helps me create a complete profile to maximize my job opportunities.
- **Acceptance criteria**:
  - Multi-step wizard guides workers through logical progression of information gathering
  - Progress indicator shows current step and overall completion status
  - Ability to save progress and continue later without losing information
  - Clear indication of which fields are required vs. optional
  - Help text and tooltips explain why certain information improves matching
  - Mobile-friendly interface works on all device sizes
  - Form validation provides immediate feedback on errors
  - Automatic saving on field completion to prevent data loss
  - Option to skip optional steps and return later
  - Languages automatically detected from browser settings

### 10.34. Track and improve profile completion
- **ID**: US-034
- **Description**: As a worker, I want to understand how complete my profile is and what I can do to improve it, so I can maximize my chances of finding suitable work.
- **Acceptance criteria**:
  - Visual profile completion indicator showing percentage complete
  - Breakdown of completion score by category
  - Personalized recommendations for profile improvements
  - "Quick win" suggestions that can be completed in under 2 minutes
  - Gamification elements that celebrate completion milestones
  - Clear explanation of how profile completion affects job matching
  - Dashboard tile showing profile strength compared to other candidates
  - Email notifications for prolonged incomplete profiles
  - Ability to dismiss specific completion suggestions
  - Weekly progress summary for active profile improvement

### 10.35. Upload and manage CV
- **ID**: US-035
- **Description**: As a worker, I want to upload and manage my CV to provide employers with additional information about my experience.
- **Acceptance criteria**:
  - Simple upload interface for CV and profile photo
  - Mobile camera integration for document capture
  - Preview functionality for uploaded CV
  - Ability to replace or delete CV
  - Clear indication of recommended file formats and sizes
  - Automatic extraction of relevant data from uploaded CV
  - Secure storage with privacy controls
  - Processing status indicator
  - Option to hide CV from specific employers

### 10.36. Establish couple relationship
- **ID**: US-036
- **Description**: As a worker in a relationship, I want to link my profile with my partner's early in the onboarding process so we can search for jobs as a couple.
- **Acceptance criteria**:
  - Option during onboarding to indicate couple status
  - Partner invitation by email address
  - Notification to partner about couple linking request
  - Confirmation required from both parties
  - Clear indication of couple status on profiles
  - Either partner can initiate an unlink
  - Dashboard shows partner's profile completion status
  - Automatic filtering of job matches suitable for couples
  - Combined skill set view for couple profiles
  - Privacy controls for what information is shared between profiles

### 10.37. Set up optional two-factor authentication
- **ID**: US-037
- **Description**: As a worker, I want the option to enable two-factor authentication during onboarding to secure my account.
- **Acceptance criteria**:
  - Clear explanation of 2FA benefits during onboarding
  - Option to enable 2FA as part of profile setup
  - Multiple 2FA method choices (authenticator app, SMS)
  - Step-by-step guidance for setting up chosen 2FA method
  - Verification process to confirm 2FA is working
  - Recovery codes provided and explained
  - Option to skip 2FA setup and enable later
  - Profile completion score boost for enabling 2FA
  - Ability to change or disable 2FA later
  - Mobile-friendly QR code scanning for authenticator apps

### 10.38. Create multilingual worker profiles
- **ID**: US-038
- **Description**: As a worker who speaks multiple languages, I want to indicate my language proficiencies and preferences to improve matching with appropriate jobs.
- **Acceptance criteria**:
  - Language selection with standardized proficiency levels (A1-C2)
  - Ability to add multiple languages with different proficiency levels
  - Indication of native/primary language
  - Platform interface automatically displayed in preferred language when available
  - Language proficiency verification through basic assessment (optional)
  - Language preferences factor into job matching algorithm
  - Clear explanation of how language skills affect job opportunities
  - Common industry-specific language skills suggestions
  - Option to indicate willingness to work in language still being learned
  - Integration with skills taxonomy for language-specific skills

### 10.39. Register as an employer
- **ID**: US-039
- **Description**: As an employment agency or freelancer, I want to register on the platform by selecting my agency type and providing basic information.
- **Acceptance criteria**:
  - Magic link email authentication for secure account creation
  - Clear explanation of the three employer types with selection
  - Ability to save progress and return to complete registration
  - Real-time validation of input fields (e.g., KvK number format)
  - Mobile-responsive registration process
  - Clear indication of required vs. optional fields
  - Explanation of the verification process and timeline
  - Terms of service and privacy policy acceptance
  - Confirmation email with next steps after initial registration
  - Option to contact support during registration process

### 10.40. Complete employer verification process
- **ID**: US-040
- **Description**: As an employer, I want to submit the required verification documents based on my company type to gain full access to the platform.
- **Acceptance criteria**:
  - Dynamic document checklist based on selected employer type
  - Clear explanation of document requirements with examples
  - Multiple upload methods including mobile camera capture
  - Document preview before submission
  - Progress tracking for multi-document requirements
  - Secure storage of sensitive business documents
  - Status updates throughout the verification process
  - Notification when documents are received and under review
  - Direct communication channel for verification queries
  - Estimated time to completion after document submission

### 10.41. Review employer verification as administrator
- **ID**: US-041
- **Description**: As a platform administrator, I want to review employer verification documents efficiently to ensure only legitimate agencies gain platform access.
- **Acceptance criteria**:
  - Prioritized queue of pending verifications
  - Document viewer with zoom and download capabilities
  - Type-specific verification checklist
  - Quick approve/reject actions with reason selection
  - Ability to request specific additional documents
  - Direct messaging with employer for clarification
  - Audit trail of all verification actions
  - Batch approve/reject for related documents
  - Automatic email notifications when actions are taken
  - Performance metrics for verification turnaround time

### 10.42. Select and manage subscription tier
- **ID**: US-042
- **Description**: As a verified employer, I want to select a subscription tier that matches my hiring needs and manage my subscription over time.
- **Acceptance criteria**:
  - Clear presentation of available subscription options with pricing
  - Comparison chart of features across different tiers
  - Secure payment processing integration
  - Immediate credit allocation upon successful payment
  - Automatic recurring billing with pre-renewal notifications
  - Ability to upgrade/downgrade subscription
  - Invoice generation and access to billing history
  - Credit usage statistics and forecasting
  - Notification when credits are running low
  - Option to purchase additional job credits

### 10.43. Create and manage recruiter sub-accounts
- **ID**: US-043
- **Description**: As a medium/large agency administrator, I want to create and manage sub-accounts for my recruiters while maintaining centralized billing and oversight.
- **Acceptance criteria**:
  - Ability to invite recruiters via email to create sub-accounts
  - Role and permission assignment for each sub-account
  - Centralized job credit allocation and tracking
  - Master view of all sub-account activities
  - Individual login credentials for each recruiter
  - Ability to activate/deactivate sub-accounts
  - Notification when sub-accounts take significant actions
  - Usage reporting by sub-account
  - Transfer of ownership for job listings between sub-accounts
  - Bulk invite option for adding multiple recruiters

### 10.44. Complete annual re-verification process
- **ID**: US-044
- **Description**: As an employer, I want to complete my annual re-verification efficiently to maintain uninterrupted platform access.
- **Acceptance criteria**:
  - Advance notification before document expiration
  - Clear indication of which documents need renewal
  - Simplified re-upload process for expired documents
  - Pre-filled forms with existing information
  - Status dashboard showing verification progress
  - Grace period with limited functionality during re-verification
  - Immediate restoration of full access upon approval
  - Email confirmation of successful re-verification
  - Calendar integration for expiry reminders
  - Explanation of compliance requirements driving re-verification

### 10.45. Manage conversation threads
- **ID**: US-045
- **Description**: As a platform user, I want to view and manage all my conversations in one place to efficiently communicate with employers/workers.
- **Acceptance criteria**:
  - Unified inbox showing all conversations sorted by most recent activity
  - Visual indicators for unread messages
  - Ability to archive conversations to declutter the inbox
  - Search functionality to find specific conversations or messages
  - Conversation grouping by related job or application
  - Preview of the most recent message in each conversation
  - Batch actions for managing multiple conversations
  - Filters to view only active, archived, or flagged conversations
  - Mobile-optimized interface for on-the-go communication
  - Offline support with message queuing when connectivity is lost

### 10.46. Send and receive attachments
- **ID**: US-046
- **Description**: As a platform user, I want to send and receive file attachments in messages to share important documents related to job applications.
- **Acceptance criteria**:
  - Support for common file formats (PDF, DOC, JPG, PNG)
  - File size limits clearly communicated (max 10MB per file)
  - Preview functionality for supported file types
  - Virus/malware scanning of all uploaded files
  - Progress indicator during upload
  - Ability to download attachments
  - Thumbnail generation for images and PDFs
  - Multiple file selection for batch uploads
  - Drag-and-drop support on desktop browsers
  - Mobile camera integration for direct photo sharing
  - File type restrictions to prevent executable files

### 10.47. Configure notification preferences
- **ID**: US-047
- **Description**: As a platform user, I want to configure how and when I receive notifications about messages and application updates.
- **Acceptance criteria**:
  - Separate settings for in-app, email, and SMS notifications
  - Ability to set quiet hours when no notifications are sent
  - Options for immediate, batched, or digest notification delivery
  - Channel-specific settings (e.g., critical updates by email, all messages in-app)
  - Easy one-click unsubscribe from email notifications
  - Preview of what each notification type looks like
  - Test notification feature to confirm settings
  - Default settings that balance user experience and engagement
  - Settings accessible from both profile page and notification center
  - Changes take effect immediately without requiring page refresh

### 10.48. Moderate flagged messages
- **ID**: US-048
- **Description**: As a platform administrator, I want to review and moderate flagged messages to maintain a safe communication environment.
- **Acceptance criteria**:
  - Queue of flagged messages sorted by severity and timestamp
  - Complete conversation context available when reviewing flags
  - Quick actions to dismiss flag or take action against violators
  - Standardized violation categories with recommended actions
  - Communication templates for notifying users of moderation decisions
  - Ability to temporarily or permanently restrict messaging privileges
  - Audit trail of all moderation actions taken
  - Analytics on common violation types and resolution times
  - Escalation path for serious violations requiring legal attention
  - Batch processing for similar violation types
  - Automated detection of potential violations before user reports

### 10.49. Use real-time messaging features
- **ID**: US-049
- **Description**: As a platform user, I want to use real-time messaging features to have efficient conversations about job opportunities.
- **Acceptance criteria**:
  - Messages appear instantly when both users are online
  - Typing indicators show when the other party is composing a message
  - Read receipts confirm when messages have been seen
  - Online/offline status indicators for conversation participants
  - Unread message count displayed on the inbox and application icon
  - New message notifications appear without requiring page refresh
  - Smooth scrolling and loading of message history
  - Emoji support for expressing tone in messages
  - Quote/reply functionality to reference specific messages
  - Graceful handling of poor connectivity with automatic retry
  - Optimized performance on both desktop and mobile devices

### 10.50. Invite team member subaccount
- **ID**: US-050
- **Description**: As a main account holder, I want to invite team members to create subaccounts so they can post jobs and manage applications under our agency.
- **Acceptance criteria**:
  - Simple form to enter email address and select role (main or recruiter)
  - Option to add personalized message to invitation
  - Email sent to invitee with secure magic link
  - Clear explanation of roles and permissions in the invitation
  - Ability to track pending invitations
  - Option to resend or cancel invitations
  - Notification when invitation is accepted
  - Automatic expiration of unused invitations after 48 hours
  - Bulk invitation option for adding multiple team members at once
  - Invitation history in audit log

### 10.51. Accept team member invitation
- **ID**: US-051
- **Description**: As an invited team member, I want to easily accept my invitation and set up my account to start working under the agency.
- **Acceptance criteria**:
  - Single-click access from invitation email
  - Pre-filled email field on registration form
  - Clear explanation of the role and permissions being granted
  - Simple form to set display name and authentication preferences
  - Option to decline invitation
  - Immediate access to appropriate features upon completion
  - Welcome tutorial explaining key functions based on assigned role
  - Notification to inviting user upon acceptance
  - Graceful handling of expired invitations with clear messaging
  - Mobile-optimized registration process

### 10.52. Manage team member permissions
- **ID**: US-052
- **Description**: As a main account holder, I want to manage roles and permissions for my team members to maintain appropriate access controls.
- **Acceptance criteria**:
  - List view of all subaccounts with current roles and status
  - Ability to promote recruiters to main account holders and vice versa
  - Option to temporarily suspend accounts without deletion
  - Reactivation of suspended accounts with original permissions
  - Permanent deletion option with confirmation safeguard
  - Prevention of deleting the last main account
  - Clear explanation of permission changes when modifying roles
  - Audit trail of all permission changes
  - Batch operations for managing multiple accounts
  - Notification to affected users when their permissions change

### 10.53. View team performance analytics
- **ID**: US-053
- **Description**: As a main account holder, I want to view performance metrics for my team members to evaluate their effectiveness and optimize our hiring processes.
- **Acceptance criteria**:
  - Dashboard showing key metrics per team member
  - Statistics on jobs posted, applications received, and response times
  - Comparison view across team members
  - Filterable by date ranges and job categories
  - Exportable reports in CSV format
  - Visual indicators for high and low performance
  - Trend analysis showing improvement or decline over time
  - Privacy controls ensuring recruiters only see their own performance
  - Integration with job credit usage tracking
  - Weekly automated summary reports via email

### 10.54. Submit exploitation report
- **ID**: US-054
- **Description**: As a worker, I want to report potential exploitation or misconduct so that unsafe practices can be addressed and I can be protected.
- **Acceptance criteria**:
  - Reporting option accessible from job listings and message threads
  - Clear categories of reportable issues
  - Option to remain anonymous
  - Ability to upload evidence (photos, documents)
  - Simple, non-intimidating form with clear language
  - Confirmation screen with reference number
  - Explanation of what happens next
  - Option to provide contact information for follow-up
  - Mobile-friendly reporting process
  - Support for multiple languages

### 10.55. Review and manage worker reports
- **ID**: US-055
- **Description**: As a platform administrator, I want to review, prioritize, and resolve worker reports efficiently to maintain platform safety and compliance.
- **Acceptance criteria**:
  - Queue of reports sortable by severity, age, and status
  - Detailed view of each report with full context
  - Ability to add internal comments and notes
  - Status update workflow with audit trail
  - Option to request more information from reporter (if not anonymous)
  - Tools to send structured feedback to employers
  - Escalation path for serious violations
  - Batch actions for similar reports
  - Export functionality for external follow-up
  - Analytics dashboard showing report trends

### 10.56. Receive compliance feedback
- **ID**: US-056
- **Description**: As an employer, I want to receive constructive feedback about reported issues so I can address them and improve my practices.
- **Acceptance criteria**:
  - Notification when feedback is available
  - Dashboard showing all feedback items
  - Clear explanation of the issue without revealing reporter identity
  - Recommended actions for resolution
  - Ability to respond to feedback
  - Mark issues as addressed or in progress
  - Resources for compliance improvement
  - History of past feedback and resolutions
  - Export functionality for internal record-keeping
  - Integration with verification status (repeated issues may affect status)

### 10.57. View reporting analytics
- **ID**: US-057
- **Description**: As a platform administrator, I want to analyze reporting patterns to identify systemic issues and improve platform safety.
- **Acceptance criteria**:
  - Dashboard showing report volume over time
  - Breakdown by report type, severity, and resolution
  - Employer risk scoring based on report history
  - Geographic heat map of report origins
  - Average time to resolution metrics
  - Identification of repeat offenders
  - Correlation analysis with other platform metrics
  - Export functionality for external analysis
  - Scheduled report generation
  - Trend alerts for unusual patterns

### 10.58. Upgrade to a paid subscription tier
- **ID**: US-058
- **Description**: As a main account holder, I want to upgrade my subscription to access more features and job credits.
- **Acceptance criteria**:
  - Clear comparison of available tiers and features
  - Transparent pricing information
  - Secure payment processing integration
  - Immediate access to new tier benefits upon payment
  - Prorated billing for mid-cycle upgrades
  - Email confirmation of subscription change
  - Updated invoice reflecting the change
  - Automatic credit allocation based on new tier
  - Option to schedule downgrade for future billing cycle
  - Ability to cancel automatic renewal

### 10.59. Purchase additional job credits
- **ID**: US-059
- **Description**: As a main account holder, I want to purchase additional job credits when my allocation is running low.
- **Acceptance criteria**:
  - Multiple credit pack options with clear pricing
  - One-click purchase for existing payment methods
  - Secure checkout for new payment methods
  - Immediate credit allocation upon successful payment
  - Email receipt and confirmation
  - Transaction history in billing dashboard
  - Bulk discount for larger credit packs
  - Credits added to existing balance
  - Clear expiration policy for purchased credits
  - Option to set up automatic purchases when balance is low

### 10.60. Manage subscription billing and invoices
- **ID**: US-060
- **Description**: As a main account holder, I want to manage my billing information and access invoices for accounting purposes.
- **Acceptance criteria**:
  - View current subscription details and renewal date
  - Update payment method securely
  - Access complete invoice history
  - Download invoices in PDF format
  - Filter invoices by date range
  - View detailed breakdown of charges
  - Receive invoice notifications via email
  - Add/update billing information (address, VAT number)
  - Export billing history in CSV format
  - Access payment failure notifications and resolution options

### 10.61. Request job credits as recruiter
- **ID**: US-061
- **Description**: As a recruiter, I want to request additional job credits when I need to post a job but the account has insufficient credits.
- **Acceptance criteria**:
  - Clear notification when attempting to submit a job with insufficient credits
  - Simple form to submit credit request to main account
  - Ability to provide justification for the request
  - Job saved in "Awaiting Credits" status
  - Notification when request is approved or denied
  - Job automatically moves to "Pending Review" when credits are allocated
  - Ability to withdraw request if job is no longer needed
  - Status indicator showing pending credit requests
  - Notification of estimated wait time based on past request handling
  - Option to edit job while awaiting credits

### 10.62. Manage credit requests
- **ID**: US-062
- **Description**: As a main account holder, I want to review and action credit requests from recruiters to control job posting costs.
- **Acceptance criteria**:
  - Dashboard showing all pending credit requests
  - Details of job and recruiter for each request
  - Option to approve request using existing credits
  - Direct flow to purchase credits if balance is insufficient
  - Ability to deny requests with explanation
  - Batch approval for multiple requests
  - Notification to recruiters when request is actioned
  - History of past credit requests and actions
  - Analytics on credit usage patterns by recruiter
  - Option to set credit allocation limits per recruiter

### 10.63. Create multi-language job listings
- **ID**: US-063
- **Description**: As an employer, I want to create job listings in multiple languages to reach a diverse candidate pool.
- **Acceptance criteria**:
  - Interface to add job details in multiple languages (Dutch, Polish, English)
  - Language tabs for switching between translations during creation
  - Ability to mark a language version as primary
  - Option to copy content from one language to another as starting point
  - Visual indicator for incomplete translations
  - Preview of how the listing appears in each language
  - Validation of required fields across all languages
  - Support for language-specific formatting (dates, numbers)
  - Machine translation suggestion option with clear marking
  - Job appears in search results for all completed languages

### 10.64. Set language preferences
- **ID**: US-064
- **Description**: As a platform user, I want to set my preferred language to view the platform in my native language.
- **Acceptance criteria**:
  - Language selector accessible from all pages
  - Persistent language preference saved to user profile
  - Immediate application of language change without page reload
  - Browser language detection on first visit
  - Clear visual indication of current language
  - All system messages and notifications in selected language
  - Fallback to English for untranslated content with notification
  - Option to help translate missing content
  - Language preference applied across devices
  - Language-specific formatting of dates, numbers, and currencies

### 10.65. Manage platform translations
- **ID**: US-065
- **Description**: As a platform administrator, I want to manage and update translations to ensure all content is available in supported languages.
- **Acceptance criteria**:
  - Dashboard showing translation completion percentage by language
  - Interface for adding/editing translations without coding
  - Ability to import/export translation files in standard formats
  - Version control for tracking translation changes
  - Workflow for reviewing and approving contributed translations
  - Alerts for missing translations in critical areas
  - Batch translation tools for similar content
  - Translation memory to ensure consistency
  - Analytics on language usage across the platform
  - Ability to add new supported languages

### 10.66. View job listings in preferred language
- **ID**: US-066
- **Description**: As a worker, I want to view job listings in my preferred language to better understand the opportunities.
- **Acceptance criteria**:
  - Job listings automatically displayed in user's preferred language when available
  - Clear indication when a listing is not available in preferred language
  - One-click toggle to view available alternative languages
  - Search functionality works across all language versions
  - Consistent terminology across translated job listings
  - Machine-translated content clearly marked as such
  - Option to report translation issues
  - Skills and certifications displayed in user's language regardless of job listing language
  - Location and company information standardized across languages
  - Salary and benefits information formatted according to locale conventions

### 10.67. Use platform on mobile devices
- **ID**: US-067
- **Description**: As a user, I want to access all platform features on my mobile device so I can use the service anywhere.
- **Acceptance criteria**:
  - All critical workflows function on smartphones and tablets
  - Content properly sized and readable without zooming
  - Forms usable with touch input and on-screen keyboards
  - No horizontal scrolling on standard screen sizes
  - Navigation adapted for one-handed mobile use
  - Page load times under 3 seconds on 3G connections
  - Smooth scrolling and transitions on mid-range devices
  - Proper handling of orientation changes
  - Touch targets large enough for accurate tapping
  - Appropriate spacing between interactive elements

### 10.68. Upload documents using mobile camera
- **ID**: US-068
- **Description**: As a mobile user, I want to upload documents and photos directly using my device's camera.
- **Acceptance criteria**:
  - Direct camera access from document upload fields
  - Option to choose between camera and file upload
  - Preview of captured image before submission
  - Ability to retake photo if quality is poor
  - Automatic image optimization for faster uploads
  - Progress indicator during upload
  - Graceful handling of upload interruptions
  - Support for both front and rear cameras
  - Clear guidance on optimal photo conditions
  - Confirmation when upload is successful

### 10.69. Complete forms with intermittent connectivity
- **ID**: US-069
- **Description**: As a mobile user, I want to complete forms even with unstable internet connection without losing my progress.
- **Acceptance criteria**:
  - Automatic saving of form progress as fields are completed
  - Local storage of form data until submission is possible
  - Visual indicator of offline status
  - Ability to continue form completion while offline
  - Automatic submission when connectivity is restored
  - Notification when submission succeeds after reconnection
  - Protection against duplicate submissions
  - Clear error messages for validation issues
  - Option to manually save progress at any point
  - Resumable file uploads for large documents

### 10.70. Navigate platform efficiently on mobile
- **ID**: US-070
- **Description**: As a mobile user, I want an intuitive navigation system optimized for small screens.
- **Acceptance criteria**:
  - Bottom navigation bar for primary actions
  - Hamburger menu for secondary functions
  - Persistent access to messaging and notifications
  - One-tap access to job application status
  - Context-aware back button behavior
  - Breadcrumbs for complex workflows
  - Recently viewed items accessible from home screen
  - Search accessible from all screens
  - Quick filters for job listings without opening full filter panel
  - Gesture support for common actions (swipe, pull-to-refresh)

### 10.71. Export worker profile data
- **ID**: US-071
- **Description**: As a worker, I want to export my profile data in a portable format to use on other platforms or for my personal records.
- **Acceptance criteria**:
  - Option to download all profile data in JSON and PDF formats
  - Export includes skills, experience, certifications, and language proficiency
  - Personal documents can be included or excluded from export
  - Exported data is formatted for human readability
  - Option to include application history and messaging history
  - Clear explanation of what data will be included in export
  - Confirmation email when large export packages are ready
  - GDPR-compliant data portability implementation
  - Rate limiting to prevent system abuse
  - Export history log showing previous download dates

### 10.72. Schedule bulk interviews
- **ID**: US-072
- **Description**: As an employer, I want to schedule interview time slots for multiple candidates efficiently.
- **Acceptance criteria**:
  - Calendar interface for blocking interview time slots
  - Ability to set interview duration, location and type (in-person/video/phone)
  - Batch invite option for multiple candidates
  - Automated notifications to selected candidates
  - Candidate self-scheduling from available time slots
  - Calendar integration with popular providers (Google, Outlook)
  - Automatic reminder notifications before interviews
  - Rescheduling workflow with minimum disruption
  - Special handling for couple interviews ensuring both partners are invited
  - Status tracking of accepted, pending, and declined interviews

### 10.73. Provide and view employer testimonials
- **ID**: US-073
- **Description**: As a verified employer with a good track record, I want to showcase testimonials from workers who had positive experiences working with my agency.
- **Acceptance criteria**:
  - Workers can submit testimonials after completing assignments
  - Employers can approve testimonials before they are published
  - Testimonials display on employer profiles with worker first name only
  - Moderation system prevents inappropriate content
  - Workers can withdraw their testimonials at any time
  - Star rating system for quantitative feedback
  - Special badges for employers with multiple positive testimonials
  - Testimonial analytics for employers to track feedback trends
  - Option for employers to respond to testimonials
  - System to detect and prevent fake testimonials



---

## 11. Future Roadmap & Expansion Opportunities

This section outlines potential future enhancements to consider after the successful implementation of the core platform.

### 11.1. Geographic Expansion
- Expansion beyond the Netherlands to other EU countries
- Country-specific compliance and verification frameworks
- Multi-country job postings with localized requirements
- Cross-border worker mobility support

### 11.2. Enhanced Verification & Trust Features
- Digital identity verification using eID solutions
- Blockchain-based credential verification system
- Real-time document validation with government databases
- AI-assisted fraud detection for suspicious applications
- Trust scoring system based on platform history and external data

### 11.3. Advanced Matching Technologies
- AI-powered skill inference from job and work histories
- Predictive matching based on success patterns
- Personality and work style compatibility matching
- Video skill demonstrations for practical verification
- Adaptive matching that improves with feedback loops

### 11.4. Value-Added Services
- Basic training and skill development modules
- Transportation coordination between housing and workplaces
- Financial services (early wage access, remittance services)
- Legal advisory services for workers and employers
- Health and safety compliance training

### 11.5. Platform Integrations
- ATS (Applicant Tracking System) integrations for large agencies
- Housing provider partnerships and direct booking
- Public transportation API integration for commute planning
- Integration with government labor market databases
- Training provider certification integration

### 11.6. Community Features
- Worker community forums for advice and support
- Employer best practice sharing platform
- Mentorship programs between experienced and new workers
- Industry-specific networking events and announcements
- Resource library for employment rights and regulations

### 11.7. Advanced Analytics & Reporting
- Labor market trend analysis and forecasting
- Skills gap identification by region
- Demographic analysis of workforce mobility
- Seasonal employment pattern recognition
- Compliance and safety trend reporting

### 11.8. Mobile App Development
- Native mobile applications for iOS and Android
- Offline-first architecture for rural areas with poor connectivity
- Advanced push notification system for time-sensitive opportunities
- Geolocation-based job alerts and recommendations
- Biometric authentication for enhanced security

### 11.9. Monetization Expansion
- Premium worker features (enhanced visibility, priority matching)
- Advanced employer analytics and benchmarking
- Featured job listings with enhanced visibility
- Specialized recruitment services for hard-to-fill positions
- API access for third-party developers

### 11.10. Impact Measurement
- Social impact metrics tracking and reporting
- Exploitation prevention effectiveness measurements
- Worker economic mobility tracking (anonymized)
- Industry transformation metrics
- Public policy advocacy supported by platform data

---

## 12. Acronym Glossary (non-technical reader aid)

| Acronym | Meaning | Context in PRD |
|---------|---------|----------------|
| API | Application Programming Interface | External integrations (KvK, VIES, Stripe) |
| CB | Circuit Breaker | Resilience pattern in external-service calls |
| CI/CD | Continuous Integration / Continuous Deployment | Build & deploy pipeline |
| DR | Disaster Recovery | Backup & restore objectives (8.2.3) |
| E2E | End-to-End (test) | QA strategy (8.3.3) |
| GDPR | General Data Protection Regulation (EU) | Data privacy & erasure sections |
| KMS | Key Management Service (AWS) | Encryption for backups & objects |
| KPI | Key Performance Indicator | Monitoring targets throughout document |
| KvK | Kamer van Koophandel (NL Chamber of Commerce) | Employer verification (8.1.1) |
| MTE | Mean Time to Escalate | Reporting escalation KPI (4.7.8) |
| PII | Personally Identifiable Information | Data retention & deletion policies |
| PWA | Progressive Web App | Mobile/offline capabilities (4.10) |
| RDS | Relational Database Service (AWS) | Primary Postgres hosting |
| RPO | Recovery Point Objective | Backup objectives (8.2.3) |
| RPS | Requests Per Second | Performance/load metrics (8.3.1) |
| RTO | Recovery Time Objective | Disaster-recovery goals (8.2.3) |
| SLA | Service Level Agreement / Objective | Performance & availability targets |
| SQS | Simple Queue Service (AWS) | Async messaging between services |
| WAL | Write-Ahead Log | Database continuous backup stream |
| WebSocket | Full-duplex web comms protocol | Real-time messaging architecture |

(Add more as the document evolves.)

### 8.1 Key API Contracts (abridged)
#### 8.1.1 Registration
```http
POST /api/v1/candidates
POST /api/v1/employers
POST /api/v1/auth/magic-link
```

#### 8.1.2 Job Listing
```http
GET  /api/v1/jobs?search=&filters
POST /api/v1/jobs
PATCH /api/v1/jobs/{id}
```

#### 8.1.3 Messaging
```http
# Regular HTTP endpoints
POST /api/v1/conversations
GET /api/v1/conversations
GET /api/v1/conversations/{id}/messages

# WebSocket connection (Django Channels)
wss://api.safe-job.nl/ws/conversations/{id}/?token={jwt}
{"type":"MESSAGE_SEND","conversation_id":"…","text":"…"}
```

#### 8.1.6 Admin Interface Endpoints

Django's built-in admin interface will be extended with custom views:

```http
# Standard Django admin interface
GET /admin/
# Custom admin endpoints
GET /admin/verification/employers/pending/
POST /admin/verification/employer/{id}/approve/
POST /admin/verification/employer/{id}/reject/
GET /admin/reports/
```

#### 8.2.4 Data Subject Rights Infrastructure
The platform architecture includes dedicated APIs for handling data subject rights using Django's permissions system:

| Right | Endpoint | Implementation |
|-------|----------|----------------|
| Access | `/api/v1/privacy/data-export` | Full profile JSON/PDF export using Django REST Framework renderers |
| Rectification | `/api/v1/users/profile` | Self-service profile editing with Django forms validation |
| Erasure | `/api/v1/privacy/account-deletion` | Cascading soft-delete with hard delete after retention |
| Restriction | `/api/v1/privacy/processing-restriction` | Account status flagging using Django model signals |
| Portability | `/api/v1/privacy/data-portability` | Structured data export in machine-readable format |
| Object | `/api/v1/privacy/processing-objection` | Processing pause with administrative review |

<!-- End of PRD -->
