import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const type = searchParams.get('type');

    let query = supabase.from('rooms').select('*').order('code', { ascending: true });
    if (departmentId) query = query.eq('department_id', departmentId);
    if (type) query = query.eq('type', type.toLowerCase());

    const { data: rooms, error } = await query;
    if (error) throw error;

    const departmentIds = Array.from(new Set((rooms ?? []).map((r) => r.department_id)));
    const { data: departments, error: departmentsError } =
      departmentIds.length > 0
        ? await supabase.from('departments').select('id, name, code').in('id', departmentIds)
        : { data: [], error: null };

    if (departmentsError) throw departmentsError;
    const departmentMap = new Map((departments ?? []).map((d) => [d.id, d]));

    const result = (rooms ?? []).map((room) => {
      const department = departmentMap.get(room.department_id);
      return {
        id: room.id,
        name: room.name,
        code: room.code,
        capacity: room.capacity,
        type: room.type.toUpperCase(),
        hasProjector: room.has_projector,
        hasAC: room.has_ac,
        hasComputers: room.has_computers,
        specialEquipment: room.special_equipment,
        building: room.building,
        floor: room.floor,
        isAvailable: room.is_available,
        departmentId: room.department_id,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
      };
    });

    return NextResponse.json(result);
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
    const supabase = createAdminClient();
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

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        name,
        code,
        capacity,
        type: (type || 'LECTURE_HALL').toLowerCase(),
        has_projector: hasProjector ?? true,
        has_ac: hasAC || false,
        has_computers: hasComputers || false,
        special_equipment: specialEquipment || null,
        building: building || null,
        floor: floor || null,
        department_id: departmentId,
      })
      .select('*')
      .single();

    if (error) throw error;

    const { data: department } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('id', room.department_id)
      .maybeSingle();

    return NextResponse.json(
      {
        id: room.id,
        name: room.name,
        code: room.code,
        capacity: room.capacity,
        type: room.type.toUpperCase(),
        hasProjector: room.has_projector,
        hasAC: room.has_ac,
        hasComputers: room.has_computers,
        specialEquipment: room.special_equipment,
        building: room.building,
        floor: room.floor,
        isAvailable: room.is_available,
        departmentId: room.department_id,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
