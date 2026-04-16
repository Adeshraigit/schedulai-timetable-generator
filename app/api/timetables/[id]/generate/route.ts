import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateTimetable,
  type CourseRequirement,
  type RoomInfo,
  type ProfessorInfo,
  type StudentGroupInfo,
  type Constraint,
  DEFAULT_CONFIG,
} from '@/lib/timetable';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const { config: userConfig } = body;

    await supabase.from('timetables').update({ status: 'generating' }).eq('id', id);

    const { data: timetable, error: timetableError } = await supabase
      .from('timetables')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (timetableError) throw timetableError;
    if (!timetable) {
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    }

    const [coursesRes, assignmentsRes, professorsRes, roomsRes, studentGroupsRes, constraintsRes] =
      await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('department_id', timetable.department_id),
        supabase
          .from('course_assignments')
          .select('id, course_id, professor_id, professors(id, name)')
          .in(
            'course_id',
            (
              await supabase
                .from('courses')
                .select('id')
                .eq('department_id', timetable.department_id)
            ).data?.map((c) => c.id) ?? ['00000000-0000-0000-0000-000000000000']
          ),
        supabase
          .from('professors')
          .select('*')
          .eq('department_id', timetable.department_id),
        supabase
          .from('rooms')
          .select('*')
          .eq('department_id', timetable.department_id)
          .eq('is_available', true),
        supabase
          .from('student_groups')
          .select('*')
          .eq('academic_year', timetable.academic_year)
          .eq('department_id', timetable.department_id),
        supabase.from('constraints').select('*').eq('is_active', true),
      ]);

    if (coursesRes.error) throw coursesRes.error;
    if (assignmentsRes.error) throw assignmentsRes.error;
    if (professorsRes.error) throw professorsRes.error;
    if (roomsRes.error) throw roomsRes.error;
    if (studentGroupsRes.error) throw studentGroupsRes.error;
    if (constraintsRes.error) throw constraintsRes.error;

    const courses = coursesRes.data ?? [];
    const assignments = assignmentsRes.data ?? [];
    const professors = professorsRes.data ?? [];
    const rooms = roomsRes.data ?? [];
    const studentGroups = studentGroupsRes.data ?? [];
    const constraints = constraintsRes.data ?? [];

    const assignmentsByCourse = new Map<string, typeof assignments>();
    for (const assignment of assignments) {
      const list = assignmentsByCourse.get(assignment.course_id) ?? [];
      list.push(assignment);
      assignmentsByCourse.set(assignment.course_id, list);
    }

    const courseRequirements: CourseRequirement[] = [];
    for (const course of courses) {
      const courseAssignments = assignmentsByCourse.get(course.id) ?? [];
      for (const assignment of courseAssignments) {
        const matchingGroups = studentGroups.filter((g) => g.semester === course.semester);

        for (const group of matchingGroups) {
          const professor = assignment.professors as { id: string; name: string } | null;
          courseRequirements.push({
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            professorId: assignment.professor_id,
            professorName: professor?.name ?? 'Unknown',
            studentGroupId: group.id,
            lectureHours: course.lecture_hours,
            labHours: course.lab_hours,
            tutorialHours: course.tutorial_hours,
            requiresLab: course.requires_lab,
            specialRoomType: course.special_room_type,
            semester: course.semester,
          });
        }
      }
    }

    const roomsInfo: RoomInfo[] = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      code: room.code,
      capacity: room.capacity,
      type: room.type.toUpperCase(),
      hasComputers: room.has_computers,
      specialEquipment: Array.isArray(room.special_equipment) ? room.special_equipment : [],
    }));

    const professorsInfo: ProfessorInfo[] = professors.map((prof) => ({
      id: prof.id,
      name: prof.name,
      maxHoursPerDay: prof.max_hours_per_day,
      maxHoursPerWeek: prof.max_hours_per_week,
      preferredDays: Array.isArray(prof.preferred_days) ? prof.preferred_days : [],
      unavailableDays: Array.isArray(prof.unavailable_days) ? prof.unavailable_days : [],
      preferredTimeSlots: Array.isArray(prof.preferred_time_slots) ? prof.preferred_time_slots : [],
    }));

    const studentGroupsInfo: StudentGroupInfo[] = studentGroups.map((group) => ({
      id: group.id,
      name: group.name,
      code: group.code,
      semester: group.semester,
      studentCount: group.student_count,
    }));

    const constraintsInfo: Constraint[] = constraints.map((c) => ({
      id: c.id,
      type: c.type.toUpperCase(),
      priority: String(c.priority).toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      isHard: c.is_hard,
      parameters: (c.parameters as Record<string, unknown>) ?? {},
      courseId: c.course_id || undefined,
      professorId: c.professor_id || undefined,
      roomId: c.room_id || undefined,
      studentGroupId: c.student_group_id || undefined,
    }));

    const config = { ...DEFAULT_CONFIG, ...userConfig };

    const result = await generateTimetable(
      courseRequirements,
      roomsInfo,
      professorsInfo,
      studentGroupsInfo,
      constraintsInfo,
      config
    );

    await supabase.from('generation_logs').insert({
      timetable_id: id,
      status: result.success ? 'SUCCESS' : 'PARTIAL',
      iteration: result.iterations,
      score: result.score,
      hard_violations: result.hardViolations,
      soft_violations: result.softViolations,
      message: result.success
        ? `Generated successfully in ${result.generationTime}ms`
        : `Generated with ${result.hardViolations} hard violations`,
    });

    await supabase.from('timetable_slots').delete().eq('timetable_id', id);

    if (result.schedule.length > 0) {
      const rows = result.schedule.map((slot) => ({
        timetable_id: id,
        day_of_week: slot.timeSlot.dayOfWeek,
        start_time: slot.timeSlot.startTime,
        end_time: slot.timeSlot.endTime,
        slot_type: slot.slotType.toLowerCase(),
        course_id: slot.courseId,
        professor_id: slot.professorId,
        room_id: slot.roomId,
        student_group_id: slot.studentGroupId,
      }));

      const { error: slotInsertError } = await supabase.from('timetable_slots').insert(rows);
      if (slotInsertError) throw slotInsertError;
    }

    await supabase
      .from('timetables')
      .update({
        status: result.success ? 'generated' : 'draft',
        score: result.score,
        conflicts: result.hardViolations,
      })
      .eq('id', id);

    return NextResponse.json({
      success: result.success,
      score: result.score,
      hardViolations: result.hardViolations,
      softViolations: result.softViolations,
      slotsCreated: result.schedule.length,
      generationTime: result.generationTime,
      conflicts: result.conflicts.slice(0, 10),
    });
  } catch (error) {
    console.error('Failed to generate timetable:', error);
    await supabase.from('timetables').update({ status: 'draft' }).eq('id', id);

    return NextResponse.json(
      { error: 'Failed to generate timetable', details: String(error) },
      { status: 500 }
    );
  }
}
