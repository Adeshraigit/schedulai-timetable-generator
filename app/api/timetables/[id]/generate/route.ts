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
import { optimizeGenerationConfigWithGroq } from '@/lib/ai/groq';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const { config: userConfig, useAI = false, aiPrompt = '' } = body;

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

    const [coursesRes, professorsRes, roomsRes, constraintsRes] =
      await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('department_id', timetable.department_id),
        supabase
          .from('professors')
          .select('*')
          .eq('department_id', timetable.department_id),
        supabase
          .from('rooms')
          .select('*')
          .eq('department_id', timetable.department_id)
          .eq('is_available', true),
        supabase.from('constraints').select('*').eq('is_active', true),
      ]);

    if (coursesRes.error) throw coursesRes.error;
    if (professorsRes.error) throw professorsRes.error;
    if (roomsRes.error) throw roomsRes.error;
    if (constraintsRes.error) throw constraintsRes.error;

    const courses = coursesRes.data ?? [];
    const professors = professorsRes.data ?? [];
    const rooms = roomsRes.data ?? [];
    const constraints = constraintsRes.data ?? [];

    if (courses.length === 0) {
      await supabase.from('timetables').update({ status: 'draft' }).eq('id', id);
      return NextResponse.json(
        {
          error: 'No courses found for this department. Add courses before generating.',
          diagnostics: { departmentId: timetable.department_id, courseCount: 0 },
        },
        { status: 400 }
      );
    }

    const courseIds = courses.map((c) => c.id);
    const { data: assignments, error: assignmentsError } = await supabase
      .from('course_assignments')
      .select('id, course_id, professor_id, professors(id, name)')
      .in('course_id', courseIds);

    if (assignmentsError) throw assignmentsError;

    // Prefer matching academic year; fallback to department groups to avoid silent empty schedules.
    const { data: groupsForYear, error: groupsForYearError } = await supabase
      .from('student_groups')
      .select('*')
      .eq('academic_year', timetable.academic_year)
      .eq('department_id', timetable.department_id);

    if (groupsForYearError) throw groupsForYearError;

    let studentGroups = groupsForYear ?? [];
    let usedYearFallback = false;

    if (studentGroups.length === 0) {
      const { data: allDeptGroups, error: allDeptGroupsError } = await supabase
        .from('student_groups')
        .select('*')
        .eq('department_id', timetable.department_id);

      if (allDeptGroupsError) throw allDeptGroupsError;
      studentGroups = allDeptGroups ?? [];
      usedYearFallback = studentGroups.length > 0;
    }

    if (studentGroups.length === 0) {
      await supabase.from('timetables').update({ status: 'draft' }).eq('id', id);
      return NextResponse.json(
        {
          error: 'No student groups found for this department. Add student groups before generating.',
          diagnostics: {
            departmentId: timetable.department_id,
            academicYear: timetable.academic_year,
            studentGroupCount: 0,
          },
        },
        { status: 400 }
      );
    }

    const safeAssignments = assignments ?? [];
    let autoAssignmentUsed = false;
    let effectiveAssignments = safeAssignments;

    if (safeAssignments.length === 0 && professors.length > 0) {
      autoAssignmentUsed = true;
      effectiveAssignments = courses.map((course, idx) => {
        const professor = professors[idx % professors.length];
        return {
          id: `auto-${course.id}-${professor.id}`,
          course_id: course.id,
          professor_id: professor.id,
          professors: {
            id: professor.id,
            name: professor.name,
          },
        };
      });
    }

    const assignmentsByCourse = new Map<string, typeof effectiveAssignments>();
    for (const assignment of effectiveAssignments) {
      const list = assignmentsByCourse.get(assignment.course_id) ?? [];
      list.push(assignment);
      assignmentsByCourse.set(assignment.course_id, list);
    }

    if (effectiveAssignments.length === 0) {
      await supabase.from('timetables').update({ status: 'draft' }).eq('id', id);
      return NextResponse.json(
        {
          error:
            'No course assignments found. Assign professors to courses before generating.',
          diagnostics: {
            courseCount: courses.length,
            assignmentCount: 0,
            professorCount: professors.length,
          },
        },
        { status: 400 }
      );
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

    const totalRequestedHours = courseRequirements.reduce(
      (sum, c) => sum + c.lectureHours + c.labHours + c.tutorialHours,
      0
    );

    if (courseRequirements.length === 0 || totalRequestedHours === 0) {
      await supabase.from('timetables').update({ status: 'draft' }).eq('id', id);
      return NextResponse.json(
        {
          error:
            'No schedulable requirements found. Check course semester alignment, student groups, and course hour settings.',
          diagnostics: {
            courseCount: courses.length,
            assignmentCount: effectiveAssignments.length,
            studentGroupCount: studentGroups.length,
            courseRequirementCount: courseRequirements.length,
            totalRequestedHours,
            usedYearFallback,
            autoAssignmentUsed,
          },
        },
        { status: 400 }
      );
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

    let config = { ...DEFAULT_CONFIG, ...userConfig };
    let aiNotes: string[] = [];
    let aiApplied = false;

    if (useAI) {
      try {
        const aiOptimization = await optimizeGenerationConfigWithGroq({
          config,
          courses: courseRequirements,
          rooms: roomsInfo,
          professors: professorsInfo,
          studentGroups: studentGroupsInfo,
          constraints: constraintsInfo,
          userPrompt: typeof aiPrompt === 'string' ? aiPrompt : undefined,
        });

        if (aiOptimization) {
          config = { ...config, ...aiOptimization.configOverrides };
          aiNotes = aiOptimization.notes;
          aiApplied = Object.keys(aiOptimization.configOverrides).length > 0;
        }
      } catch (aiError) {
        console.error('Groq optimization failed, continuing with standard config:', aiError);
      }
    }

    const result = await generateTimetable(
      courseRequirements,
      roomsInfo,
      professorsInfo,
      studentGroupsInfo,
      constraintsInfo,
      config
    );

    if (result.schedule.length === 0) {
      await supabase.from('timetables').update({ status: 'draft' }).eq('id', id);
      return NextResponse.json(
        {
          error:
            'Generation completed with 0 slots. Check room capacity/types, professor availability, and constraints.',
          diagnostics: {
            courseRequirementCount: courseRequirements.length,
            totalRequestedHours,
            roomCount: roomsInfo.length,
            professorCount: professorsInfo.length,
            studentGroupCount: studentGroupsInfo.length,
            hardViolations: result.hardViolations,
            softViolations: result.softViolations,
            usedYearFallback,
            autoAssignmentUsed,
          },
        },
        { status: 400 }
      );
    }

    await supabase.from('generation_logs').insert({
      timetable_id: id,
      status: result.success ? 'SUCCESS' : 'PARTIAL',
      iteration: result.iterations,
      score: result.score,
      hard_violations: result.hardViolations,
      soft_violations: result.softViolations,
      message: result.success
        ? `Generated successfully in ${result.generationTime}ms`
        : `Generated with ${result.hardViolations} hard violations${usedYearFallback ? ' (student-group year fallback used)' : ''}${autoAssignmentUsed ? ' (auto-assigned professors)' : ''}`,
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
      aiUsed: useAI,
      aiApplied,
      aiNotes,
      autoAssignmentUsed,
      effectiveConfig: {
        maxIterations: config.maxIterations,
        populationSize: config.populationSize,
        mutationRate: config.mutationRate,
        crossoverRate: config.crossoverRate,
        elitismCount: config.elitismCount,
      },
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
