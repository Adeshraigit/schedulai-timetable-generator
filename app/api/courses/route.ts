import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');

    const where: Record<string, unknown> = {};
    if (departmentId) where.departmentId = departmentId;
    if (semester) where.semester = parseInt(semester);

    const courses = await prisma.course.findMany({
      where,
      include: {
        department: true,
        assignments: {
          include: {
            professor: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(courses);
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

    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits: credits || 3,
        lectureHours: lectureHours || 3,
        labHours: labHours || 0,
        tutorialHours: tutorialHours || 0,
        semester: semester || 1,
        requiresLab: requiresLab || false,
        requiresSpecial: requiresSpecial || false,
        specialRoomType,
        departmentId,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Failed to create course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
