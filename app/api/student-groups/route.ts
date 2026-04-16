import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');

    const where: Record<string, unknown> = {};
    if (semester) where.semester = parseInt(semester);
    if (academicYear) where.academicYear = academicYear;

    const studentGroups = await prisma.studentGroup.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(studentGroups);
  } catch (error) {
    console.error('Failed to fetch student groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, semester, studentCount, academicYear } = body;

    if (!name || !code || !semester || !studentCount || !academicYear) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const studentGroup = await prisma.studentGroup.create({
      data: {
        name,
        code,
        semester,
        studentCount,
        academicYear,
      },
    });

    return NextResponse.json(studentGroup, { status: 201 });
  } catch (error) {
    console.error('Failed to create student group:', error);
    return NextResponse.json(
      { error: 'Failed to create student group' },
      { status: 500 }
    );
  }
}
