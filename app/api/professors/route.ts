import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    const where: Record<string, unknown> = {};
    if (departmentId) where.departmentId = departmentId;

    const professors = await prisma.professor.findMany({
      where,
      include: {
        department: true,
        assignments: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(professors);
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

    const professor = await prisma.professor.create({
      data: {
        name,
        email,
        employeeId,
        maxHoursPerDay: maxHoursPerDay || 6,
        maxHoursPerWeek: maxHoursPerWeek || 20,
        preferredDays: preferredDays ? JSON.stringify(preferredDays) : null,
        unavailableDays: unavailableDays ? JSON.stringify(unavailableDays) : null,
        preferredTimeSlots: preferredTimeSlots ? JSON.stringify(preferredTimeSlots) : null,
        departmentId,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(professor, { status: 201 });
  } catch (error) {
    console.error('Failed to create professor:', error);
    return NextResponse.json(
      { error: 'Failed to create professor' },
      { status: 500 }
    );
  }
}
