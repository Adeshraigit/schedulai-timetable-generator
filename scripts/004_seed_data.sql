-- Seed data for SchedulAI
-- Run this after creating tables and enabling RLS

-- ==================== DEPARTMENTS ====================

INSERT INTO public.departments (id, name, code) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Computer Science', 'CS'),
  ('22222222-2222-2222-2222-222222222222', 'Electrical Engineering', 'EE'),
  ('33333333-3333-3333-3333-333333333333', 'Mechanical Engineering', 'ME'),
  ('44444444-4444-4444-4444-444444444444', 'Mathematics', 'MATH')
ON CONFLICT (code) DO NOTHING;

-- ==================== TIME SLOT CONFIG ====================

INSERT INTO public.time_slot_configs (name, start_time, end_time, duration, slot_order, is_break, department_id) VALUES
  ('Period 1', '09:00', '10:00', 60, 1, false, '11111111-1111-1111-1111-111111111111'),
  ('Period 2', '10:00', '11:00', 60, 2, false, '11111111-1111-1111-1111-111111111111'),
  ('Break', '11:00', '11:15', 15, 3, true, '11111111-1111-1111-1111-111111111111'),
  ('Period 3', '11:15', '12:15', 60, 4, false, '11111111-1111-1111-1111-111111111111'),
  ('Period 4', '12:15', '13:15', 60, 5, false, '11111111-1111-1111-1111-111111111111'),
  ('Lunch', '13:15', '14:00', 45, 6, true, '11111111-1111-1111-1111-111111111111'),
  ('Period 5', '14:00', '15:00', 60, 7, false, '11111111-1111-1111-1111-111111111111'),
  ('Period 6', '15:00', '16:00', 60, 8, false, '11111111-1111-1111-1111-111111111111'),
  ('Period 7', '16:00', '17:00', 60, 9, false, '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- ==================== ROOMS ====================

INSERT INTO public.rooms (name, code, capacity, type, has_projector, has_ac, has_computers, building, floor, department_id) VALUES
  ('Lecture Hall A', 'LH-A', 120, 'lecture_hall', true, true, false, 'Main Building', 1, '11111111-1111-1111-1111-111111111111'),
  ('Lecture Hall B', 'LH-B', 100, 'lecture_hall', true, true, false, 'Main Building', 1, '11111111-1111-1111-1111-111111111111'),
  ('Seminar Room 1', 'SR-1', 40, 'seminar_room', true, true, false, 'Main Building', 2, '11111111-1111-1111-1111-111111111111'),
  ('Seminar Room 2', 'SR-2', 40, 'seminar_room', true, true, false, 'Main Building', 2, '11111111-1111-1111-1111-111111111111'),
  ('Computer Lab 1', 'CL-1', 50, 'computer_lab', true, true, true, 'Tech Block', 1, '11111111-1111-1111-1111-111111111111'),
  ('Computer Lab 2', 'CL-2', 50, 'computer_lab', true, true, true, 'Tech Block', 1, '11111111-1111-1111-1111-111111111111'),
  ('Physics Lab', 'PL-1', 30, 'physics_lab', true, true, false, 'Science Block', 1, '22222222-2222-2222-2222-222222222222'),
  ('Electronics Lab', 'EL-1', 30, 'workshop', true, true, false, 'Tech Block', 2, '22222222-2222-2222-2222-222222222222'),
  ('Workshop', 'WS-1', 40, 'workshop', false, false, false, 'Workshop Block', 1, '33333333-3333-3333-3333-333333333333'),
  ('Tutorial Room 1', 'TR-1', 30, 'seminar_room', true, true, false, 'Main Building', 3, '44444444-4444-4444-4444-444444444444')
ON CONFLICT (code) DO NOTHING;

-- ==================== COURSES ====================

INSERT INTO public.courses (name, code, credits, lecture_hours, lab_hours, tutorial_hours, semester, requires_lab, department_id) VALUES
  ('Data Structures', 'CS201', 4, 3, 2, 0, 3, true, '11111111-1111-1111-1111-111111111111'),
  ('Algorithms', 'CS301', 4, 3, 0, 1, 5, false, '11111111-1111-1111-1111-111111111111'),
  ('Database Systems', 'CS302', 4, 3, 2, 0, 5, true, '11111111-1111-1111-1111-111111111111'),
  ('Operating Systems', 'CS303', 4, 3, 2, 0, 5, true, '11111111-1111-1111-1111-111111111111'),
  ('Computer Networks', 'CS401', 3, 3, 0, 0, 7, false, '11111111-1111-1111-1111-111111111111'),
  ('Machine Learning', 'CS402', 4, 3, 2, 0, 7, true, '11111111-1111-1111-1111-111111111111'),
  ('Circuit Theory', 'EE201', 4, 3, 2, 0, 3, true, '22222222-2222-2222-2222-222222222222'),
  ('Digital Electronics', 'EE301', 4, 3, 2, 0, 5, true, '22222222-2222-2222-2222-222222222222'),
  ('Thermodynamics', 'ME201', 3, 3, 0, 1, 3, false, '33333333-3333-3333-3333-333333333333'),
  ('Fluid Mechanics', 'ME301', 4, 3, 2, 0, 5, true, '33333333-3333-3333-3333-333333333333'),
  ('Calculus I', 'MATH101', 4, 3, 0, 2, 1, false, '44444444-4444-4444-4444-444444444444'),
  ('Linear Algebra', 'MATH201', 3, 3, 0, 1, 3, false, '44444444-4444-4444-4444-444444444444')
ON CONFLICT (code) DO NOTHING;

-- ==================== PROFESSORS ====================

INSERT INTO public.professors (name, email, employee_id, max_hours_per_day, max_hours_per_week, department_id) VALUES
  ('Dr. Alice Smith', 'alice.smith@university.edu', 'EMP001', 6, 18, '11111111-1111-1111-1111-111111111111'),
  ('Dr. Bob Johnson', 'bob.johnson@university.edu', 'EMP002', 6, 18, '11111111-1111-1111-1111-111111111111'),
  ('Dr. Carol Williams', 'carol.williams@university.edu', 'EMP003', 5, 15, '11111111-1111-1111-1111-111111111111'),
  ('Dr. David Brown', 'david.brown@university.edu', 'EMP004', 6, 20, '22222222-2222-2222-2222-222222222222'),
  ('Dr. Eva Martinez', 'eva.martinez@university.edu', 'EMP005', 6, 18, '22222222-2222-2222-2222-222222222222'),
  ('Dr. Frank Lee', 'frank.lee@university.edu', 'EMP006', 5, 15, '33333333-3333-3333-3333-333333333333'),
  ('Dr. Grace Kim', 'grace.kim@university.edu', 'EMP007', 6, 18, '33333333-3333-3333-3333-333333333333'),
  ('Dr. Henry Chen', 'henry.chen@university.edu', 'EMP008', 6, 20, '44444444-4444-4444-4444-444444444444')
ON CONFLICT (employee_id) DO NOTHING;

-- ==================== STUDENT GROUPS ====================

INSERT INTO public.student_groups (name, code, semester, student_count, academic_year, department_id) VALUES
  ('CS Year 2 - Section A', 'CS-2A', 3, 60, '2024-25', '11111111-1111-1111-1111-111111111111'),
  ('CS Year 2 - Section B', 'CS-2B', 3, 55, '2024-25', '11111111-1111-1111-1111-111111111111'),
  ('CS Year 3 - Section A', 'CS-3A', 5, 50, '2024-25', '11111111-1111-1111-1111-111111111111'),
  ('CS Year 3 - Section B', 'CS-3B', 5, 48, '2024-25', '11111111-1111-1111-1111-111111111111'),
  ('CS Year 4', 'CS-4', 7, 45, '2024-25', '11111111-1111-1111-1111-111111111111'),
  ('EE Year 2', 'EE-2', 3, 60, '2024-25', '22222222-2222-2222-2222-222222222222'),
  ('EE Year 3', 'EE-3', 5, 55, '2024-25', '22222222-2222-2222-2222-222222222222'),
  ('ME Year 2', 'ME-2', 3, 50, '2024-25', '33333333-3333-3333-3333-333333333333'),
  ('ME Year 3', 'ME-3', 5, 45, '2024-25', '33333333-3333-3333-3333-333333333333'),
  ('All Year 1', 'ALL-1', 1, 200, '2024-25', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (code) DO NOTHING;
