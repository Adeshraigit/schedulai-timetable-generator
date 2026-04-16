-- SchedulAI Database Schema with RLS
-- Run this script to create all tables with Row Level Security

-- ==================== USER PROFILES ====================
-- Links to Supabase auth.users table

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'coordinator' CHECK (role IN ('admin', 'hod', 'professor', 'coordinator')),
  department_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== DEPARTMENTS ====================

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key after departments table exists
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_department_fk 
  FOREIGN KEY (department_id) 
  REFERENCES public.departments(id) 
  ON DELETE SET NULL;

-- ==================== COURSES ====================

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  lecture_hours INTEGER NOT NULL DEFAULT 3,
  lab_hours INTEGER NOT NULL DEFAULT 0,
  tutorial_hours INTEGER NOT NULL DEFAULT 0,
  semester INTEGER NOT NULL,
  requires_lab BOOLEAN DEFAULT FALSE,
  requires_special BOOLEAN DEFAULT FALSE,
  special_room_type TEXT,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== PROFESSORS ====================

CREATE TABLE IF NOT EXISTS public.professors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  max_hours_per_day INTEGER DEFAULT 6,
  max_hours_per_week INTEGER DEFAULT 20,
  preferred_days JSONB,
  unavailable_days JSONB,
  preferred_time_slots JSONB,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ROOMS ====================

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'lecture_hall' CHECK (type IN ('lecture_hall', 'seminar_room', 'computer_lab', 'physics_lab', 'chemistry_lab', 'workshop', 'auditorium')),
  has_projector BOOLEAN DEFAULT TRUE,
  has_ac BOOLEAN DEFAULT FALSE,
  has_computers BOOLEAN DEFAULT FALSE,
  special_equipment JSONB,
  building TEXT,
  floor INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== STUDENT GROUPS ====================

CREATE TABLE IF NOT EXISTS public.student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  semester INTEGER NOT NULL,
  student_count INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== COURSE ASSIGNMENTS ====================

CREATE TABLE IF NOT EXISTS public.course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, professor_id)
);

-- ==================== TIMETABLES ====================

CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'generated', 'published', 'archived')),
  is_published BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  score FLOAT,
  conflicts INTEGER DEFAULT 0,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TIMETABLE SLOTS ====================

CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID NOT NULL REFERENCES public.timetables(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  student_group_id UUID NOT NULL REFERENCES public.student_groups(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_type TEXT NOT NULL DEFAULT 'lecture' CHECK (slot_type IN ('lecture', 'lab', 'tutorial', 'seminar')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CONSTRAINTS ====================

CREATE TABLE IF NOT EXISTS public.constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_hard BOOLEAN DEFAULT FALSE,
  description TEXT,
  parameters JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES public.professors(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  student_group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TIME SLOT CONFIG ====================

CREATE TABLE IF NOT EXISTS public.time_slot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  slot_order INTEGER NOT NULL,
  is_break BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== GENERATION LOGS ====================

CREATE TABLE IF NOT EXISTS public.generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID NOT NULL REFERENCES public.timetables(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  iteration INTEGER NOT NULL,
  score FLOAT NOT NULL,
  hard_violations INTEGER NOT NULL,
  soft_violations INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department_id);
CREATE INDEX IF NOT EXISTS idx_professors_department ON public.professors(department_id);
CREATE INDEX IF NOT EXISTS idx_rooms_department ON public.rooms(department_id);
CREATE INDEX IF NOT EXISTS idx_student_groups_department ON public.student_groups(department_id);
CREATE INDEX IF NOT EXISTS idx_timetables_department ON public.timetables(department_id);
CREATE INDEX IF NOT EXISTS idx_timetables_created_by ON public.timetables(created_by);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_timetable ON public.timetable_slots(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_day ON public.timetable_slots(timetable_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_constraints_department ON public.constraints(department_id);
