import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
  try {
    const { id } = await params;
    const body = await request.json();
    const { config: userConfig } = body;

    // Update timetable status to GENERATING
    await prisma.timetable.update({
      where: { id },
      data: { status: 'GENERATING' },
    });

    // Fetch timetable with department
    const timetable = await prisma.timetable.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    // Fetch all required data
    const [courses, professors, rooms, studentGroups, constraints] = await Promise.all([
      prisma.course.findMany({
        where: { departmentId: timetable.departmentId },
        include: {
          assignments: {
            include: { professor: true },
          },
        },
      }),
      prisma.professor.findMany({
        where: { departmentId: timetable.departmentId },
      }),
      prisma.room.findMany({
        where: { departmentId: timetable.departmentId, isAvailable: true },
      }),
      prisma.studentGroup.findMany({
        where: { academicYear: timetable.academicYear },
      }),
      prisma.constraint.findMany({
        where: { isActive: true },
      }),
    ]);

    // Transform data for the algorithm
    const courseRequirements: CourseRequirement[] = [];
    
    for (const course of courses) {
      for (const assignment of course.assignments) {
        // For each course-professor assignment, create requirements for each student group of matching semester
        const matchingGroups = studentGroups.filter(g => g.semester === course.semester);
        
        for (const group of matchingGroups) {
          courseRequirements.push({
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            professorId: assignment.professorId,
            professorName: assignment.professor.name,
            studentGroupId: group.id,
            lectureHours: course.lectureHours,
            labHours: course.labHours,
            tutorialHours: course.tutorialHours,
            requiresLab: course.requiresLab,
            specialRoomType: course.specialRoomType,
            semester: course.semester,
          });
        }
      }
    }

    const roomsInfo: RoomInfo[] = rooms.map(room => ({
      id: room.id,
      name: room.name,
      code: room.code,
      capacity: room.capacity,
      type: room.type,
      hasComputers: room.hasComputers,
      specialEquipment: room.specialEquipment ? JSON.parse(room.specialEquipment) : [],
    }));

    const professorsInfo: ProfessorInfo[] = professors.map(prof => ({
      id: prof.id,
      name: prof.name,
      maxHoursPerDay: prof.maxHoursPerDay,
      maxHoursPerWeek: prof.maxHoursPerWeek,
      preferredDays: prof.preferredDays ? JSON.parse(prof.preferredDays) : [],
      unavailableDays: prof.unavailableDays ? JSON.parse(prof.unavailableDays) : [],
      preferredTimeSlots: prof.preferredTimeSlots ? JSON.parse(prof.preferredTimeSlots) : [],
    }));

    const studentGroupsInfo: StudentGroupInfo[] = studentGroups.map(group => ({
      id: group.id,
      name: group.name,
      code: group.code,
      semester: group.semester,
      studentCount: group.studentCount,
    }));

    const constraintsInfo: Constraint[] = constraints.map(c => ({
      id: c.id,
      type: c.type,
      priority: c.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      isHard: c.isHard,
      parameters: JSON.parse(c.parameters),
      courseId: c.courseId || undefined,
      professorId: c.professorId || undefined,
      roomId: c.roomId || undefined,
      studentGroupId: c.studentGroupId || undefined,
    }));

    // Merge user config with defaults
    const config = { ...DEFAULT_CONFIG, ...userConfig };

    // Generate timetable
    const result = await generateTimetable(
      courseRequirements,
      roomsInfo,
      professorsInfo,
      studentGroupsInfo,
      constraintsInfo,
      config
    );

    // Log generation result
    await prisma.generationLog.create({
      data: {
        timetableId: id,
        status: result.success ? 'SUCCESS' : 'PARTIAL',
        iteration: result.iterations,
        score: result.score,
        hardViolations: result.hardViolations,
        softViolations: result.softViolations,
        message: result.success
          ? `Generated successfully in ${result.generationTime}ms`
          : `Generated with ${result.hardViolations} hard violations`,
      },
    });

    // Delete existing slots
    await prisma.timetableSlot.deleteMany({
      where: { timetableId: id },
    });

    // Create new slots
    if (result.schedule.length > 0) {
      await prisma.timetableSlot.createMany({
        data: result.schedule.map(slot => ({
          timetableId: id,
          dayOfWeek: slot.timeSlot.dayOfWeek,
          startTime: slot.timeSlot.startTime,
          endTime: slot.timeSlot.endTime,
          slotType: slot.slotType,
          courseId: slot.courseId,
          professorId: slot.professorId,
          roomId: slot.roomId,
          studentGroupId: slot.studentGroupId,
        })),
      });
    }

    // Update timetable status
    await prisma.timetable.update({
      where: { id },
      data: {
        status: result.success ? 'GENERATED' : 'DRAFT',
        score: result.score,
        conflicts: result.hardViolations,
      },
    });

    return NextResponse.json({
      success: result.success,
      score: result.score,
      hardViolations: result.hardViolations,
      softViolations: result.softViolations,
      slotsCreated: result.schedule.length,
      generationTime: result.generationTime,
      conflicts: result.conflicts.slice(0, 10), // Return first 10 conflicts
    });
  } catch (error) {
    console.error('Failed to generate timetable:', error);

    // Reset status on error
    const { id } = await params;
    await prisma.timetable.update({
      where: { id },
      data: { status: 'DRAFT' },
    });

    return NextResponse.json(
      { error: 'Failed to generate timetable', details: String(error) },
      { status: 500 }
    );
  }
}
