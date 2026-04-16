-- SchedulAI Row Level Security Policies
-- Implements RBAC with role-based access control

-- ==================== ENABLE RLS ====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- ==================== HELPER FUNCTIONS ====================

-- Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Get user department
CREATE OR REPLACE FUNCTION public.get_user_department(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT department_id FROM public.profiles WHERE id = user_id;
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Check if user is HOD of department
CREATE OR REPLACE FUNCTION public.is_hod_of_department(dept_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'hod' 
    AND department_id = dept_id
  );
$$;

-- Check if user belongs to department
CREATE OR REPLACE FUNCTION public.belongs_to_department(dept_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (department_id = dept_id OR role = 'admin')
  );
$$;

-- ==================== PROFILES POLICIES ====================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- HODs can view profiles in their department
CREATE POLICY "profiles_select_hod" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'hod' 
    AND department_id = public.get_user_department(auth.uid())
  );

-- Users can update their own profile (except role)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Insert via trigger only (security definer)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ==================== DEPARTMENTS POLICIES ====================

-- Everyone can view departments
CREATE POLICY "departments_select_all" ON public.departments
  FOR SELECT USING (true);

-- Only admins can create/update/delete departments
CREATE POLICY "departments_insert_admin" ON public.departments
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "departments_update_admin" ON public.departments
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "departments_delete_admin" ON public.departments
  FOR DELETE USING (public.is_admin());

-- ==================== COURSES POLICIES ====================

-- Users can view courses in their department, admins see all
CREATE POLICY "courses_select" ON public.courses
  FOR SELECT USING (
    public.is_admin() 
    OR public.belongs_to_department(department_id)
  );

-- Admins and HODs can manage courses
CREATE POLICY "courses_insert" ON public.courses
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "courses_update" ON public.courses
  FOR UPDATE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "courses_delete" ON public.courses
  FOR DELETE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

-- ==================== PROFESSORS POLICIES ====================

-- Users can view professors in their department
CREATE POLICY "professors_select" ON public.professors
  FOR SELECT USING (
    public.is_admin() 
    OR public.belongs_to_department(department_id)
  );

-- Professors can view and update their own record
CREATE POLICY "professors_select_own" ON public.professors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "professors_update_own" ON public.professors
  FOR UPDATE USING (user_id = auth.uid());

-- Admins and HODs can manage professors
CREATE POLICY "professors_insert" ON public.professors
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "professors_update" ON public.professors
  FOR UPDATE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "professors_delete" ON public.professors
  FOR DELETE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

-- ==================== ROOMS POLICIES ====================

-- Users can view rooms in their department
CREATE POLICY "rooms_select" ON public.rooms
  FOR SELECT USING (
    public.is_admin() 
    OR public.belongs_to_department(department_id)
  );

-- Admins and HODs can manage rooms
CREATE POLICY "rooms_insert" ON public.rooms
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "rooms_update" ON public.rooms
  FOR UPDATE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "rooms_delete" ON public.rooms
  FOR DELETE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

-- ==================== STUDENT GROUPS POLICIES ====================

CREATE POLICY "student_groups_select" ON public.student_groups
  FOR SELECT USING (
    public.is_admin() 
    OR public.belongs_to_department(department_id)
  );

CREATE POLICY "student_groups_insert" ON public.student_groups
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "student_groups_update" ON public.student_groups
  FOR UPDATE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "student_groups_delete" ON public.student_groups
  FOR DELETE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

-- ==================== COURSE ASSIGNMENTS POLICIES ====================

CREATE POLICY "course_assignments_select" ON public.course_assignments
  FOR SELECT USING (
    public.is_admin() 
    OR EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id 
      AND public.belongs_to_department(c.department_id)
    )
  );

CREATE POLICY "course_assignments_insert" ON public.course_assignments
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id 
      AND public.is_hod_of_department(c.department_id)
    )
  );

CREATE POLICY "course_assignments_delete" ON public.course_assignments
  FOR DELETE USING (
    public.is_admin() 
    OR EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id 
      AND public.is_hod_of_department(c.department_id)
    )
  );

-- ==================== TIMETABLES POLICIES ====================

-- Users can view timetables in their department
CREATE POLICY "timetables_select" ON public.timetables
  FOR SELECT USING (
    public.is_admin() 
    OR public.belongs_to_department(department_id)
    OR created_by = auth.uid()
  );

-- Coordinators, HODs, and admins can create timetables
CREATE POLICY "timetables_insert" ON public.timetables
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
    OR (
      public.get_user_role(auth.uid()) = 'coordinator' 
      AND public.belongs_to_department(department_id)
    )
  );

-- Owners, HODs, and admins can update timetables
CREATE POLICY "timetables_update" ON public.timetables
  FOR UPDATE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
    OR created_by = auth.uid()
  );

-- Only HODs and admins can delete timetables
CREATE POLICY "timetables_delete" ON public.timetables
  FOR DELETE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

-- ==================== TIMETABLE SLOTS POLICIES ====================

CREATE POLICY "timetable_slots_select" ON public.timetable_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.timetables t 
      WHERE t.id = timetable_id 
      AND (
        public.is_admin() 
        OR public.belongs_to_department(t.department_id)
        OR t.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "timetable_slots_insert" ON public.timetable_slots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.timetables t 
      WHERE t.id = timetable_id 
      AND (
        public.is_admin() 
        OR public.is_hod_of_department(t.department_id)
        OR t.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "timetable_slots_update" ON public.timetable_slots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.timetables t 
      WHERE t.id = timetable_id 
      AND (
        public.is_admin() 
        OR public.is_hod_of_department(t.department_id)
        OR t.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "timetable_slots_delete" ON public.timetable_slots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.timetables t 
      WHERE t.id = timetable_id 
      AND (
        public.is_admin() 
        OR public.is_hod_of_department(t.department_id)
        OR t.created_by = auth.uid()
      )
    )
  );

-- ==================== CONSTRAINTS POLICIES ====================

CREATE POLICY "constraints_select" ON public.constraints
  FOR SELECT USING (
    public.is_admin() 
    OR public.belongs_to_department(department_id)
    OR created_by = auth.uid()
  );

CREATE POLICY "constraints_insert" ON public.constraints
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
    OR (
      public.get_user_role(auth.uid()) IN ('coordinator', 'professor')
      AND public.belongs_to_department(department_id)
    )
  );

CREATE POLICY "constraints_update" ON public.constraints
  FOR UPDATE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
    OR created_by = auth.uid()
  );

CREATE POLICY "constraints_delete" ON public.constraints
  FOR DELETE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
    OR created_by = auth.uid()
  );

-- ==================== TIME SLOT CONFIG POLICIES ====================

CREATE POLICY "time_slot_configs_select" ON public.time_slot_configs
  FOR SELECT USING (true);

CREATE POLICY "time_slot_configs_insert" ON public.time_slot_configs
  FOR INSERT WITH CHECK (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "time_slot_configs_update" ON public.time_slot_configs
  FOR UPDATE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

CREATE POLICY "time_slot_configs_delete" ON public.time_slot_configs
  FOR DELETE USING (
    public.is_admin() 
    OR public.is_hod_of_department(department_id)
  );

-- ==================== GENERATION LOGS POLICIES ====================

CREATE POLICY "generation_logs_select" ON public.generation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.timetables t 
      WHERE t.id = timetable_id 
      AND (
        public.is_admin() 
        OR public.belongs_to_department(t.department_id)
        OR t.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "generation_logs_insert" ON public.generation_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.timetables t 
      WHERE t.id = timetable_id 
      AND (
        public.is_admin() 
        OR public.is_hod_of_department(t.department_id)
        OR t.created_by = auth.uid()
      )
    )
  );
