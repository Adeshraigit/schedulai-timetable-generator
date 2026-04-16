# SchedulAI - AI-Powered Timetable Generator

SchedulAI is an intelligent, constraint-based timetable generation system built with Next.js and Supabase. It automates academic scheduling for universities while respecting complex constraints like professor availability, room capacities, student group conflicts, and customizable scheduling preferences.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Authentication Setup](#authentication-setup)
  - [Running Locally](#running-locally)
- [Architecture](#architecture)
  - [Database Schema](#database-schema)
  - [Timetable Generation Algorithm](#timetable-generation-algorithm)
  - [RBAC & Permissions](#rbac--permissions)
- [API Routes](#api-routes)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Creating a Timetable](#creating-a-timetable)
  - [Managing Data](#managing-data)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Features

### Core Functionality
- **AI-Powered Scheduling**: Uses a genetic algorithm and optional Groq optimization to generate timetables
- **Constraint Management**: Hard and soft constraints for complete scheduling control
- **Multi-Role Support**: Admin, HOD, Professor, and Coordinator roles with specific permissions
- **Real-Time Validation**: Instant conflict detection and validation
- **Batch Generation**: Generate multiple timetable variations and compare
- **Export Capabilities**: Export schedules to multiple formats

### Constraint Types
- **Hard Constraints** (must be satisfied):
  - No professor can teach two courses simultaneously
  - No room double-booking
  - Student group time conflicts prevention
  - Room capacity constraints

- **Soft Constraints** (optimization goals):
  - Minimize professor workload imbalance
  - Prefer morning slots for certain courses
  - Minimize gaps in professor schedules
  - Balance room utilization

### RBAC Features
- **Admin**: Full system access, user management, system configuration
- **HOD (Head of Department)**: Department management, professor assignment, course oversight
- **Professor**: View personal schedule, request modifications
- **Coordinator**: Data entry, timetable coordination, report generation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Data Access**: Supabase client (server/admin + browser clients)
- **Algorithm**: Custom Genetic Algorithm implementation
- **UI Components**: shadcn/ui

## Project Structure

```
schedulai/
├── app/
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── callback/route.ts
│   │   └── error/page.tsx
│   ├── api/                     # API routes
│   │   ├── departments/route.ts
│   │   ├── courses/route.ts
│   │   ├── professors/route.ts
│   │   ├── rooms/route.ts
│   │   ├── student-groups/route.ts
│   │   └── timetables/
│   │       ├── route.ts
│   │       ├── [id]/route.ts
│   │       └── [id]/generate/route.ts
│   ├── dashboard/               # Dashboard pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── timetables/page.tsx
│   │   ├── timetables/[id]/page.tsx
│   │   ├── generate/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── professors/page.tsx
│   │   └── rooms/page.tsx
│   ├── layout.tsx
│   └── page.tsx                 # Landing page
├── components/
│   ├── dashboard/               # Dashboard components
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── landing/                 # Landing page sections
├── lib/
│   ├── auth/
│   │   ├── rbac.ts             # Role-based access control
│   │   ├── context.tsx         # Auth context provider
│   │   └── index.ts
│   ├── supabase/
│   │   ├── client.ts           # Supabase client
│   │   ├── server.ts           # Supabase server client
│   │   ├── middleware.ts       # Session middleware
│   │   └── types.ts            # TypeScript types
│   ├── timetable/
│   │   ├── types.ts            # Timetable data types
│   │   ├── constraints.ts      # Constraint validation
│   │   ├── generator.ts        # Genetic algorithm
│   │   └── index.ts
│   └── utils.ts
├── scripts/
│   ├── 001_create_tables.sql   # Database schema
│   ├── 002_enable_rls.sql      # Row Level Security policies
│   ├── 003_profile_trigger.sql # Auto-create profiles
│   └── 004_seed_data.sql       # Sample data
├── docs/
│   └── PRD.md                  # Product Requirements Document
├── middleware.ts               # Session middleware
├── .env                        # Environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier available at supabase.com)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd schedulai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Groq AI optimization for timetable generation
GROQ_API_KEY=your-groq-api-key
# Optional model override (default: llama-3.3-70b-versatile)
GROQ_MODEL=llama-3.3-70b-versatile

NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### Database Setup

1. **Create database schema** - Go to Supabase SQL Editor and run:
   - `scripts/001_create_tables.sql` - Creates all tables
   - `scripts/002_enable_rls.sql` - Enables Row Level Security
   - `scripts/003_profile_trigger.sql` - Auto-creates user profiles

2. **Seed sample data** (optional):
   ```bash
   # Run in Supabase SQL Editor
   ```sql
   /* Copy contents of scripts/004_seed_data.sql */
   ```
   ```

### Authentication Setup

1. **Enable Email/Password Auth**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Email" provider
   - Configure email confirmation settings

2. **Add Redirect URL**:
   - Go to Authentication → URL Configuration
   - Add redirect URL: `http://localhost:3000/auth/callback`
   - Add redirect URL: `https://your-deployed-domain.com/auth/callback`

### Running Locally

```bash
# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

## Architecture

### Database Schema

**Core Tables:**
- `profiles` - User profile information and roles
- `departments` - Academic departments
- `courses` - Course information and credits
- `professors` - Faculty members
- `rooms` - Classrooms and facilities
- `student_groups` - Cohorts and sections
- `course_assignments` - Maps courses to professors and student groups
- `timetables` - Generated schedules
- `timetable_slots` - Individual time slots in schedules
- `constraints` - Custom scheduling constraints
- `time_slot_configs` - Available time slots per day
- `generation_logs` - Algorithm execution history

### Timetable Generation Algorithm

The system uses a **genetic algorithm** with the following approach:

```
1. Initialize Population
   ├─ Create random valid timetables
   ├─ Check hard constraints
   └─ Score using soft constraints

2. Selection
   ├─ Evaluate fitness (constraint violations)
   └─ Select top performers for reproduction

3. Crossover
   ├─ Combine parent timetables
   └─ Inherit superior gene segments

4. Mutation
   ├─ Random slot reassignments
   └─ Occasional constraint violations for exploration

5. Convergence
   ├─ Repeat for configurable iterations
   └─ Return best solution
```

**Configuration Parameters:**
```typescript
{
  populationSize: 100,      // Population per generation
  mutationRate: 0.15,       // 15% mutation probability
  crossoverRate: 0.8,       // 80% crossover probability
  maxIterations: 500,       // Maximum generations
  elitismRate: 0.1,         // Keep top 10% unchanged
}
```

### RBAC & Permissions

**Role Hierarchy:**
```
ADMIN
├─ Create/delete users
├─ Manage all departments
├─ Override constraints
└─ View all reports

HOD (Head of Department)
├─ Manage own department
├─ Assign professors to courses
├─ View department reports
└─ Modify course info

PROFESSOR
├─ View own schedule
├─ Request schedule changes
├─ View assigned courses
└─ Cannot modify data

COORDINATOR
├─ Create courses & professors
├─ Manage rooms
├─ Generate timetables
└─ Export schedules
```

**Database-Level RLS:**
- All data access enforced at PostgreSQL row level
- Policies check `auth.uid()` and role from `profiles.role`
- Department isolation ensures data separation

## API Routes

### Authentication
- `POST /auth/login` - Email/password login
- `POST /auth/sign-up` - New user registration
- `GET /auth/callback` - OAuth callback handler

### Departments
- `GET /api/departments` - List departments (with pagination)
- `POST /api/departments` - Create department (admin/hod)
- `GET /api/departments/[id]` - Get department details
- `PATCH /api/departments/[id]` - Update department
- `DELETE /api/departments/[id]` - Delete department

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/[id]` - Get course details
- `PATCH /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Professors
- `GET /api/professors` - List professors
- `POST /api/professors` - Create professor
- `GET /api/professors/[id]` - Get professor details
- `PATCH /api/professors/[id]` - Update professor
- `DELETE /api/professors/[id]` - Delete professor

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/[id]` - Get room details
- `PATCH /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room

### Timetables
- `GET /api/timetables` - List timetables
- `POST /api/timetables` - Create timetable
- `GET /api/timetables/[id]` - Get timetable details
- `PATCH /api/timetables/[id]` - Update timetable
- `DELETE /api/timetables/[id]` - Delete timetable
- `POST /api/timetables/[id]/generate` - Generate schedule using AI

## Usage

### Authentication

**Sign Up:**
1. Navigate to `/auth/sign-up`
2. Enter email, password, name, and select role
3. Confirm email (check inbox)
4. Redirected to dashboard

**Login:**
1. Navigate to `/auth/login`
2. Enter email and password
3. Access dashboard

### Creating a Timetable

1. **Set Up Data** (if not already done):
   - Go to Dashboard → Rooms → Add rooms with capacity and features
   - Go to Dashboard → Professors → Add faculty members with availability
   - Go to Dashboard → Courses → Add courses with credits and time requirements

2. **Create Timetable**:
   - Click "Create New Timetable"
   - Name the timetable (e.g., "Spring 2025")
   - Set semester and year
   - Configure available time slots (days and hours)

3. **Add Constraints**:
   - Select courses to include
   - Assign professors to courses
   - Assign student groups
   - Set room preferences
   - Add custom constraints (optional)

4. **Generate Schedule**:
   - Click "Generate" button
   - System runs genetic algorithm
   - Monitor progress in real-time
   - View generated timetable
   - Option to regenerate with different parameters

5. **Review & Finalize**:
   - View conflicts and score
   - Manually adjust if needed
   - Export to PDF/Excel
   - Publish to system

### Managing Data

**Departments:**
- Create academic departments
- Assign HODs
- Define department-specific constraints

**Courses:**
- Add courses with credits and prerequisites
- Assign professors (can have multiple instructors)
- Set minimum time slots per week
- Specify preferred time slots

**Professors:**
- Register faculty members
- Set teaching load limits
- Define unavailable time slots
- Specify preferred teaching times

**Rooms:**
- Add classrooms with capacity
- Tag with features (lab, projector, etc.)
- Set maintenance windows

**Student Groups:**
- Create class sections
- Define group size
- Associate with courses

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Groq AI optimization
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile

# Development only
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Optional: Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## Troubleshooting

### "Auth session not found"
- Clear browser cookies and restart
- Verify Supabase redirect URL is configured correctly
- Check email is confirmed in Supabase

### "RLS policy violation"
- Ensure you're logged in
- Check your role has permissions in `scripts/002_enable_rls.sql`
- Verify `profiles` table has a row for your user

### Timetable generation fails
- Ensure all required courses have professors assigned
- Check that rooms have sufficient capacity
- Verify constraints are satisfiable
- Try with fewer courses or more available slots

### Database connection errors
- Verify Supabase credentials in `.env.local`
- Check internet connection
- Ensure Supabase project is running
- Verify database hasn't exceeded connection limits

## Development

### Testing the Algorithm
```typescript
// Example: Generate a test timetable
import { generateTimetable } from '@/lib/timetable/generator'

const config = {
  populationSize: 100,
  mutationRate: 0.15,
  maxIterations: 500,
}

const result = await generateTimetable(courses, professors, rooms, config)
console.log(`Score: ${result.score}, Violations: ${result.violations}`)
```

## Performance Optimization

- **Database Indexes**: All foreign keys are indexed for fast joins
- **RLS Efficiency**: Policies use indexed columns for fast filtering
- **Algorithm Caching**: Generated timetables cached for 1 hour
- **Pagination**: List endpoints return 20 items by default

## Security

- All routes protected by Supabase Auth middleware
- RLS policies enforce role-based access at database level
- Passwords hashed with bcrypt
- API key never exposed to client
- CORS properly configured
- Input validation on all forms and API endpoints

## Support & Documentation

- **PRD**: See `docs/PRD.md` for detailed requirements
- **Issues**: Check GitHub issues or create new ones
- **Docs**: Refer to Supabase docs (supabase.com/docs)

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**SchedulAI** - Making Academic Scheduling Intelligent
