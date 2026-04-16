import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');

    let query = supabase
      .from('courses')
      .select('*')
      .order('code', { ascending: true });

    if (departmentId) query = query.eq('department_id', departmentId);
    if (semester) query = query.eq('semester', parseInt(semester));

    const { data: courses, error } = await query;
    if (error) throw error;

    const courseIds = (courses ?? []).map((c) => c.id);
    const departmentIds = Array.from(new Set((courses ?? []).map((c) => c.department_id)));

    const [departmentsRes, assignmentsRes] = await Promise.all([
      departmentIds.length > 0
        ? supabase.from('departments').select('id, name, code').in('id', departmentIds)
        : Promise.resolve({ data: [], error: null }),
      courseIds.length > 0
        ? supabase
            .from('course_assignments')
            .select('id, course_id, professor_id, created_at, updated_at, professors(*)')
            .in('course_id', courseIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (departmentsRes.error) throw departmentsRes.error;
    if (assignmentsRes.error) throw assignmentsRes.error;

    const departmentMap = new Map((departmentsRes.data ?? []).map((d) => [d.id, d]));
    const assignmentMap = new Map<string, Array<Record<string, unknown>>>();

    for (const assignment of assignmentsRes.data ?? []) {
      const list = assignmentMap.get(assignment.course_id) ?? [];
      list.push(assignment as unknown as Record<string, unknown>);
      assignmentMap.set(assignment.course_id, list);
    }

    const result = (courses ?? []).map((course) => {
      const department = departmentMap.get(course.department_id);
      const assignments = (assignmentMap.get(course.id) ?? []).map((a) => {
        const professor = a.professors as Record<string, unknown> | null;
        return {
          id: a.id,
          courseId: a.course_id,
          professorId: a.professor_id,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          professor: professor
            ? {
                id: professor.id,
                name: professor.name,
                email: professor.email,
                employeeId: professor.employee_id,
                maxHoursPerDay: professor.max_hours_per_day,
                maxHoursPerWeek: professor.max_hours_per_week,
                preferredDays: professor.preferred_days,
                unavailableDays: professor.unavailable_days,
                preferredTimeSlots: professor.preferred_time_slots,
                departmentId: professor.department_id,
                createdAt: professor.created_at,
                updatedAt: professor.updated_at,
              }
            : null,
        };
      });

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        credits: course.credits,
        lectureHours: course.lecture_hours,
        labHours: course.lab_hours,
        tutorialHours: course.tutorial_hours,
        semester: course.semester,
        requiresLab: course.requires_lab,
        requiresSpecial: course.requires_special,
        specialRoomType: course.special_room_type,
        departmentId: course.department_id,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
        assignments,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const {
      name,
      code,
      credits,
      lectureHours,
      labHours,
      tutorialHours,
      semester,
      requiresLab,
      requiresSpecial,
      specialRoomType,
      departmentId,
    } = body;

    if (!name || !code || !departmentId) {
      return NextResponse.json(
        { error: 'Name, code, and departmentId are required' },
        { status: 400 }
      );
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        name,
        code,
        credits: credits || 3,
        lecture_hours: lectureHours || 3,
        lab_hours: labHours || 0,
        tutorial_hours: tutorialHours || 0,
        semester: semester || 1,
        requires_lab: requiresLab || false,
        requires_special: requiresSpecial || false,
        special_room_type: specialRoomType || null,
        department_id: departmentId,
      })
      .select('*')
      .single();

    if (error) throw error;

    const { data: department } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('id', course.department_id)
      .maybeSingle();

    return NextResponse.json(
      {
        id: course.id,
        name: course.name,
        code: course.code,
        credits: course.credits,
        lectureHours: course.lecture_hours,
        labHours: course.lab_hours,
        tutorialHours: course.tutorial_hours,
        semester: course.semester,
        requiresLab: course.requires_lab,
        requiresSpecial: course.requires_special,
        specialRoomType: course.special_room_type,
        departmentId: course.department_id,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
        assignments: [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
