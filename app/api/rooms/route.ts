import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (departmentId) where.departmentId = departmentId;
    if (type) where.type = type;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        department: true,
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
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
      capacity,
      type,
      hasProjector,
      hasAC,
      hasComputers,
      specialEquipment,
      building,
      floor,
      departmentId,
    } = body;

    if (!name || !code || !capacity || !departmentId) {
      return NextResponse.json(
        { error: 'Name, code, capacity, and departmentId are required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        code,
        capacity,
        type: type || 'LECTURE_HALL',
        hasProjector: hasProjector ?? true,
        hasAC: hasAC || false,
        hasComputers: hasComputers || false,
        specialEquipment: specialEquipment ? JSON.stringify(specialEquipment) : null,
        building,
        floor,
        departmentId,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
