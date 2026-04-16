import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, name, code, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) throw error;

    const departmentIds = (departments ?? []).map((d) => d.id);

    const [coursesCountRes, professorsCountRes, roomsCountRes] = await Promise.all([
      departmentIds.length > 0
        ? supabase.from('courses').select('department_id')
        : Promise.resolve({ data: [], error: null }),
      departmentIds.length > 0
        ? supabase.from('professors').select('department_id')
        : Promise.resolve({ data: [], error: null }),
      departmentIds.length > 0
        ? supabase.from('rooms').select('department_id')
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (coursesCountRes.error) throw coursesCountRes.error;
    if (professorsCountRes.error) throw professorsCountRes.error;
    if (roomsCountRes.error) throw roomsCountRes.error;

    const courseMap = new Map<string, number>();
    const professorMap = new Map<string, number>();
    const roomMap = new Map<string, number>();

    for (const row of coursesCountRes.data ?? []) {
      courseMap.set(row.department_id, (courseMap.get(row.department_id) ?? 0) + 1);
    }
    for (const row of professorsCountRes.data ?? []) {
      professorMap.set(row.department_id, (professorMap.get(row.department_id) ?? 0) + 1);
    }
    for (const row of roomsCountRes.data ?? []) {
      roomMap.set(row.department_id, (roomMap.get(row.department_id) ?? 0) + 1);
    }

    const result = (departments ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      _count: {
        courses: courseMap.get(d.id) ?? 0,
        professors: professorMap.get(d.id) ?? 0,
        rooms: roomMap.get(d.id) ?? 0,
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert({ name, code })
      .select('id, name, code, created_at, updated_at')
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        id: department.id,
        name: department.name,
        code: department.code,
        createdAt: department.created_at,
        updatedAt: department.updated_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}
