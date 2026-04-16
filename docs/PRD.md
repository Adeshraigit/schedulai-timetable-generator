# SchedulAI — Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Draft  

---

## 1. Executive Summary

SchedulAI is an AI-powered timetable generation system designed to automate the creation of conflict-free academic schedules for educational institutions. The platform replaces manual, error-prone scheduling processes with an intelligent system that ensures optimal allocation of professors, rooms, and time slots while respecting all institutional constraints.

### 1.1 Vision Statement

To become the leading intelligent scheduling platform that transforms how educational institutions manage their academic timetables, reducing administrative overhead by 80% and eliminating scheduling conflicts entirely.

### 1.2 Mission

Empower academic administrators with a powerful yet intuitive tool that generates optimal, conflict-free timetables in minutes rather than days.

---

## 2. Project Scope

### 2.1 Goals

| Goal | Success Metric |
|------|----------------|
| Eliminate scheduling conflicts | 0% professor/room double-bookings |
| Reduce scheduling time | From days to under 5 minutes |
| Improve resource utilization | 85%+ room utilization rate |
| User satisfaction | 4.5+ star rating from administrators |

### 2.2 In Scope (v1.0)

- **Data Management:** CRUD operations for professors, subjects, rooms, and time slots
- **Availability Management:** Professor availability tracking per time slot
- **Automated Scheduling:** Constraint-based timetable generation
- **Conflict Detection:** Real-time validation and conflict highlighting
- **Visual Timetable:** Interactive grid-based schedule view
- **Export Functionality:** PDF and CSV export options

### 2.3 Out of Scope (v1.0)

- Real-time collaborative editing
- Mobile native applications
- AI-powered optimization suggestions
- Leave management and substitute assignment
- Multi-institution SaaS deployment
- Student-facing features
- Integration with external LMS systems

---

## 3. Target Users

### 3.1 Primary Users

#### Academic Administrator / HOD
**Demographics:** Age 35-55, moderate technical proficiency  
**Goals:**
- Generate conflict-free timetables quickly
- Minimize manual adjustments
- Ensure fair distribution of teaching loads

**Pain Points:**
- Current manual process takes 2-3 days
- Frequent conflicts require constant rescheduling
- Difficulty balancing professor preferences with constraints

**Usage Frequency:** Daily during scheduling periods, weekly for monitoring

#### Professor
**Demographics:** Age 28-60, varying technical proficiency  
**Goals:**
- Submit availability accurately
- View personal teaching schedule
- Request schedule changes

**Pain Points:**
- Unclear communication about schedule changes
- Conflicts with personal commitments
- Last-minute schedule modifications

**Usage Frequency:** Weekly for schedule viewing, periodic for availability updates

### 3.2 Secondary Users

#### IT Administrator
- System configuration and maintenance
- User management
- Integration setup

#### Department Coordinator
- Department-level schedule oversight
- Room allocation coordination
- Cross-department conflict resolution

---

## 4. Core Functionalities

### 4.1 User Management

| Feature | Description | Priority |
|---------|-------------|----------|
| User Registration | Self-registration with email verification | P1 |
| Role-Based Access | Admin, HOD, Professor roles with distinct permissions | P1 |
| Profile Management | Edit personal information and preferences | P2 |
| Authentication | Secure login with session management | P1 |
| Password Recovery | Email-based password reset | P2 |

### 4.2 Data Input System

#### 4.2.1 Professor Management
- Add/Edit/Delete professor profiles
- Assign subjects to professors
- Set weekly teaching hour limits
- Bulk import via CSV

#### 4.2.2 Subject Management
- Create subjects with codes and names
- Assign department affiliations
- Set required hours per week
- Specify room type requirements (classroom/lab)

#### 4.2.3 Room Management
- Define rooms with capacity and type
- Set room availability schedules
- Mark rooms for specific purposes
- Handle room maintenance blocks

#### 4.2.4 Time Slot Configuration
- Define institutional time slot structure
- Set working days (Mon-Sat configurable)
- Configure break periods
- Handle special timing exceptions

### 4.3 Availability Management

| Feature | Description |
|---------|-------------|
| Availability Grid | Visual interface for marking available slots |
| Preference Levels | Preferred, Available, Unavailable options |
| Recurring Patterns | Set weekly recurring availability |
| Conflict Alerts | Warn when availability conflicts with assignments |

### 4.4 Algorithmic Scheduling Engine

#### 4.4.1 Algorithm Overview

The scheduling engine uses a **Constraint Satisfaction Problem (CSP)** approach with:

1. **Hard Constraints (Must Satisfy)**
   - No professor double-booking
   - No room double-booking
   - Professor must be available in assigned slot
   - Room capacity must meet requirement
   - Subject must match room type

2. **Soft Constraints (Optimization Goals)**
   - Minimize gaps between classes for professors
   - Prefer professor's preferred time slots
   - Distribute classes evenly across days
   - Avoid back-to-back classes for professors

#### 4.4.2 Algorithm Flow

```
1. INPUT: Teaching assignments, availability, rooms, slots
2. PREPROCESS: 
   - Sort assignments by constraint difficulty (most constrained first)
   - Build constraint graph
3. SOLVE:
   - For each assignment:
     - Find valid slot (professor free, room free, available)
     - If no valid slot: backtrack
     - Apply soft constraint scoring
     - Select highest-scoring valid slot
4. VALIDATE: Check all hard constraints satisfied
5. OUTPUT: Complete timetable or conflict report
```

#### 4.4.3 Performance Requirements

| Metric | Target |
|--------|--------|
| Generation Time | < 30 seconds for 50 professors |
| Scalability | Up to 200 professors, 100 rooms |
| Success Rate | 95%+ successful generation |
| Conflict Detection | Real-time (< 100ms) |

### 4.5 Timetable Visualization

#### 4.5.1 Grid View
- Days as columns, time slots as rows
- Color-coded by subject/department
- Click to view details
- Conflict highlighting (red border)

#### 4.5.2 List View
- Chronological list of all classes
- Filterable by professor, room, subject
- Sortable columns
- Quick search functionality

#### 4.5.3 Calendar View
- Monthly/weekly calendar format
- Drag-and-drop rescheduling (manual override)
- iCal export compatibility

### 4.6 Validation & Conflict Management

| Validation Type | Description | Action |
|-----------------|-------------|--------|
| Professor Conflict | Same professor in multiple slots | Block + Alert |
| Room Conflict | Same room in multiple bookings | Block + Alert |
| Capacity Violation | Class size exceeds room capacity | Warning |
| Availability Violation | Professor unavailable | Block + Alert |
| Hour Limit Exceeded | Weekly hours exceed limit | Warning |

---

## 5. Customization Options

### 5.1 Institutional Settings

- Working days configuration
- Time slot duration (30/45/60 min)
- Break period definitions
- Academic term dates
- Department structure

### 5.2 Scheduling Preferences

- Priority weighting for soft constraints
- Maximum consecutive classes
- Minimum gap between classes
- Room preference matching
- Distribution algorithms (balanced/front-loaded)

### 5.3 Display Customization

- Color schemes by department/subject
- Time format (12h/24h)
- Week start day
- Compact/detailed view modes
- Custom column visibility

---

## 6. Integration Points

### 6.1 Current Integrations (v1.0)

| System | Integration Type | Purpose |
|--------|------------------|---------|
| Email (SMTP) | API | Notifications and alerts |
| PDF Generator | Library | Schedule exports |
| CSV Parser | Library | Bulk data import |

### 6.2 Planned Integrations (v2.0+)

| System | Integration Type | Purpose |
|--------|------------------|---------|
| Google Calendar | OAuth + API | Two-way sync |
| Microsoft Outlook | OAuth + API | Two-way sync |
| Learning Management Systems | API | Course data sync |
| Student Information Systems | API | Student enrollment data |
| HR Systems | API | Professor data sync |

### 6.3 API Specifications

- RESTful API architecture
- JSON request/response format
- JWT-based authentication
- Rate limiting: 100 requests/minute
- Webhook support for events

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle |
| Authentication | Supabase Auth |
| Deployment | Vercel |
| File Storage | Vercel Blob |

### 7.2 Database Schema

```
professors
├── id (PK)
├── name
├── email
├── department_id (FK)
└── max_hours_per_week

subjects
├── id (PK)
├── name
├── code
├── department_id (FK)
├── hours_per_week
└── room_type

rooms
├── id (PK)
├── name
├── type (classroom | lab)
└── capacity

time_slots
├── id (PK)
├── day (mon-sat)
├── start_time
└── end_time

professor_availability
├── id (PK)
├── professor_id (FK)
├── time_slot_id (FK)
└── status (preferred | available | unavailable)

teaching_assignments
├── id (PK)
├── professor_id (FK)
├── subject_id (FK)
└── hours_per_week

timetables
├── id (PK)
├── name
├── created_at
├── created_by (FK)
└── status (draft | published)

timetable_entries
├── id (PK)
├── timetable_id (FK)
├── subject_id (FK)
├── professor_id (FK)
├── room_id (FK)
└── time_slot_id (FK)
```

### 7.3 Key Constraints

- `UNIQUE(professor_id, time_slot_id)` per timetable
- `UNIQUE(room_id, time_slot_id)` per timetable
- Cascade delete on timetable deletion

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Requirement |
|--------|-------------|
| Page Load Time | < 2 seconds |
| API Response Time | < 500ms (95th percentile) |
| Concurrent Users | 100+ simultaneous |
| Uptime | 99.5% availability |

### 8.2 Security

- HTTPS encryption for all traffic
- Password hashing with bcrypt
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens
- Rate limiting on authentication endpoints
- Session timeout after 24 hours of inactivity

### 8.3 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios > 4.5:1
- Focus indicators on all interactive elements

### 8.4 Scalability

- Horizontal scaling via Vercel
- Database connection pooling
- CDN for static assets
- Lazy loading for large datasets

---

## 9. User Interface Requirements

### 9.1 Design Principles

1. **Clarity:** Information hierarchy clear at a glance
2. **Efficiency:** Minimize clicks for common tasks
3. **Feedback:** Immediate visual feedback for all actions
4. **Consistency:** Uniform patterns across all views
5. **Accessibility:** Inclusive design for all users

### 9.2 Key Screens

| Screen | Purpose | Priority |
|--------|---------|----------|
| Dashboard | Overview and quick actions | P1 |
| Professor List | Manage professors | P1 |
| Subject List | Manage subjects | P1 |
| Room List | Manage rooms | P1 |
| Availability Grid | Set professor availability | P1 |
| Generate Timetable | Trigger and configure generation | P1 |
| Timetable View | View and interact with schedule | P1 |
| Settings | System configuration | P2 |
| Reports | Analytics and exports | P2 |

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Project setup and infrastructure
- Database schema and migrations
- Authentication system
- Basic UI shell and navigation

### Phase 2: Data Layer (Weeks 3-4)
- Professor CRUD
- Subject CRUD
- Room CRUD
- Time slot configuration
- Availability management

### Phase 3: Scheduling Engine (Weeks 5-6)
- Core scheduling algorithm
- Constraint validation
- Conflict detection
- Generation API

### Phase 4: Visualization (Weeks 7-8)
- Timetable grid view
- Filtering and search
- Detail views
- Conflict highlighting

### Phase 5: Polish & Launch (Weeks 9-10)
- Export functionality
- Email notifications
- Performance optimization
- User acceptance testing
- Documentation
- Production deployment

---

## 11. Success Metrics

### 11.1 Key Performance Indicators (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Timetable Generation Success Rate | > 95% | Successful generations / attempts |
| Average Generation Time | < 30 seconds | API response time |
| User Adoption Rate | > 80% | Active users / registered users |
| Conflict Rate | 0% | Post-generation conflicts found |
| User Satisfaction | > 4.5/5 | NPS survey |

### 11.2 Analytics Tracking

- User engagement (session duration, feature usage)
- Generation statistics (time, success rate, iterations)
- Error rates and types
- Feature adoption rates

---

## 12. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Algorithm fails to find solution | Medium | High | Implement partial solutions with manual completion option |
| Performance degradation at scale | Medium | Medium | Load testing, caching, query optimization |
| User adoption resistance | Medium | High | Training materials, intuitive UX, gradual rollout |
| Data migration complexity | Low | High | Robust import tools, validation, rollback capability |
| Security vulnerabilities | Low | Critical | Security audit, penetration testing, regular updates |

---

## 13. Appendix

### 13.1 Glossary

| Term | Definition |
|------|------------|
| Time Slot | A specific period on a specific day (e.g., Monday 9:00-10:00) |
| Teaching Assignment | A professor-subject pairing with required weekly hours |
| Hard Constraint | A rule that must never be violated |
| Soft Constraint | A preference that should be satisfied when possible |
| Conflict | Two incompatible assignments in the same time slot |

### 13.2 References

- Constraint Satisfaction Problem (CSP) Theory
- Academic Timetabling Research Papers
- University Scheduling Best Practices

### 13.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | SchedulAI Team | Initial release |

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | ____________ | ____________ | ____________ |
| Tech Lead | ____________ | ____________ | ____________ |
| Design Lead | ____________ | ____________ | ____________ |
