import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let query = supabase.from('professors').select('*').order('name', { ascending: true });
    if (departmentId) query = query.eq('department_id', departmentId);

    const { data: professors, error } = await query;
    if (error) throw error;

    const professorIds = (professors ?? []).map((p) => p.id);
    const departmentIds = Array.from(new Set((professors ?? []).map((p) => p.department_id)));

    const [departmentsRes, assignmentsRes] = await Promise.all([
      departmentIds.length > 0
        ? supabase.from('departments').select('id, name, code').in('id', departmentIds)
        : Promise.resolve({ data: [], error: null }),
      professorIds.length > 0
        ? supabase
            .from('course_assignments')
            .select('id, course_id, professor_id, created_at, updated_at, courses(*)')
            .in('professor_id', professorIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (departmentsRes.error) throw departmentsRes.error;
    if (assignmentsRes.error) throw assignmentsRes.error;

    const departmentMap = new Map((departmentsRes.data ?? []).map((d) => [d.id, d]));
    const assignmentMap = new Map<string, Array<Record<string, unknown>>>();

    for (const assignment of assignmentsRes.data ?? []) {
      const list = assignmentMap.get(assignment.professor_id) ?? [];
      list.push(assignment as unknown as Record<string, unknown>);
      assignmentMap.set(assignment.professor_id, list);
    }

    const result = (professors ?? []).map((professor) => {
      const department = departmentMap.get(professor.department_id);
      const assignments = (assignmentMap.get(professor.id) ?? []).map((a) => {
        const course = a.courses as Record<string, unknown> | null;
        return {
          id: a.id,
          courseId: a.course_id,
          professorId: a.professor_id,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          course: course
            ? {
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
              }
            : null,
        };
      });

      return {
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
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
        assignments,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch professors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professors' },
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
      email,
      employeeId,
      maxHoursPerDay,
      maxHoursPerWeek,
      preferredDays,
      unavailableDays,
      preferredTimeSlots,
      departmentId,
    } = body;

    if (!name || !email || !employeeId || !departmentId) {
      return NextResponse.json(
        { error: 'Name, email, employeeId, and departmentId are required' },
        { status: 400 }
      );
    }

    const { data: professor, error } = await supabase
      .from('professors')
      .insert({
        name,
        email,
        employee_id: employeeId,
        max_hours_per_day: maxHoursPerDay || 6,
        max_hours_per_week: maxHoursPerWeek || 20,
        preferred_days: preferredDays || null,
        unavailable_days: unavailableDays || null,
        preferred_time_slots: preferredTimeSlots || null,
        department_id: departmentId,
      })
      .select('*')
      .single();

    if (error) throw error;

    const { data: department } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('id', professor.department_id)
      .maybeSingle();

    return NextResponse.json(
      {
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
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
        assignments: [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create professor:', error);
    return NextResponse.json(
      { error: 'Failed to create professor' },
      { status: 500 }
    );
  }
}
