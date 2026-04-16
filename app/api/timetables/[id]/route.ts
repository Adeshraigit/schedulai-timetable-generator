import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    const { data: timetable, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    const [departmentRes, profileRes, slotsRes] = await Promise.all([
      supabase
        .from('departments')
        .select('id, name, code')
        .eq('id', timetable.department_id)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', timetable.created_by)
        .maybeSingle(),
      supabase
        .from('timetable_slots')
        .select('*')
        .eq('timetable_id', id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true }),
    ]);

    if (departmentRes.error) throw departmentRes.error;
    if (profileRes.error) throw profileRes.error;
    if (slotsRes.error) throw slotsRes.error;

    const slots = slotsRes.data ?? [];
    const courseIds = Array.from(new Set(slots.map((s) => s.course_id)));
    const professorIds = Array.from(new Set(slots.map((s) => s.professor_id)));
    const roomIds = Array.from(new Set(slots.map((s) => s.room_id)));
    const studentGroupIds = Array.from(new Set(slots.map((s) => s.student_group_id)));

    const [coursesRes, professorsRes, roomsRes, groupsRes] = await Promise.all([
      courseIds.length > 0
        ? supabase.from('courses').select('*').in('id', courseIds)
        : Promise.resolve({ data: [], error: null }),
      professorIds.length > 0
        ? supabase.from('professors').select('*').in('id', professorIds)
        : Promise.resolve({ data: [], error: null }),
      roomIds.length > 0
        ? supabase.from('rooms').select('*').in('id', roomIds)
        : Promise.resolve({ data: [], error: null }),
      studentGroupIds.length > 0
        ? supabase.from('student_groups').select('*').in('id', studentGroupIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (coursesRes.error) throw coursesRes.error;
    if (professorsRes.error) throw professorsRes.error;
    if (roomsRes.error) throw roomsRes.error;
    if (groupsRes.error) throw groupsRes.error;

    const courseMap = new Map((coursesRes.data ?? []).map((c) => [c.id, c]));
    const professorMap = new Map((professorsRes.data ?? []).map((p) => [p.id, p]));
    const roomMap = new Map((roomsRes.data ?? []).map((r) => [r.id, r]));
    const groupMap = new Map((groupsRes.data ?? []).map((g) => [g.id, g]));

    const mappedSlots = slots.map((slot) => {
      const course = courseMap.get(slot.course_id);
      const professor = professorMap.get(slot.professor_id);
      const room = roomMap.get(slot.room_id);
      const group = groupMap.get(slot.student_group_id);

      return {
        id: slot.id,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        slotType: slot.slot_type.toUpperCase(),
        course: course
          ? { id: course.id, name: course.name, code: course.code }
          : { id: slot.course_id, name: 'Unknown', code: '-' },
        professor: professor
          ? { id: professor.id, name: professor.name }
          : { id: slot.professor_id, name: 'Unknown' },
        room: room
          ? { id: room.id, name: room.name, code: room.code }
          : { id: slot.room_id, name: 'Unknown', code: '-' },
        studentGroup: group
          ? { id: group.id, name: group.name, code: group.code }
          : { id: slot.student_group_id, name: 'Unknown', code: '-' },
      };
    });

    const result = {
      id: timetable.id,
      name: timetable.name,
      semester: timetable.semester,
      academicYear: timetable.academic_year,
      status: timetable.status.toUpperCase(),
      isPublished: timetable.is_published,
      version: timetable.version,
      score: timetable.score,
      conflicts: timetable.conflicts,
      departmentId: timetable.department_id,
      createdById: timetable.created_by,
      createdAt: timetable.created_at,
      updatedAt: timetable.updated_at,
      department: departmentRes.data
        ? {
            id: departmentRes.data.id,
            name: departmentRes.data.name,
            code: departmentRes.data.code,
          }
        : null,
      createdBy: profileRes.data
        ? {
            id: profileRes.data.id,
            name: profileRes.data.name,
            email: profileRes.data.email,
          }
        : { id: timetable.created_by, name: 'Unknown', email: '' },
      slots: mappedSlots,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch timetable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timetable' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.semester !== undefined) data.semester = body.semester;
    if (body.academicYear !== undefined) data.academic_year = body.academicYear;
    if (body.status !== undefined) data.status = String(body.status).toLowerCase();
    if (body.score !== undefined) data.score = body.score;
    if (body.conflicts !== undefined) data.conflicts = body.conflicts;
    if (body.departmentId !== undefined) data.department_id = body.departmentId;
    if (body.isPublished !== undefined) data.is_published = body.isPublished;

    const { data: timetable, error } = await supabase
      .from('timetables')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: timetable.id,
      name: timetable.name,
      semester: timetable.semester,
      academicYear: timetable.academic_year,
      status: timetable.status.toUpperCase(),
      isPublished: timetable.is_published,
      version: timetable.version,
      score: timetable.score,
      conflicts: timetable.conflicts,
      departmentId: timetable.department_id,
      createdById: timetable.created_by,
      createdAt: timetable.created_at,
      updatedAt: timetable.updated_at,
    });
  } catch (error) {
    console.error('Failed to update timetable:', error);
    return NextResponse.json(
      { error: 'Failed to update timetable' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    const { error } = await supabase.from('timetables').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete timetable:', error);
    return NextResponse.json(
      { error: 'Failed to delete timetable' },
      { status: 500 }
    );
  }
}
