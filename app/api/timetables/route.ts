import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    let query = supabase
      .from('timetables')
      .select('*')
      .order('created_at', { ascending: false });

    if (departmentId) query = query.eq('department_id', departmentId);
    if (status) query = query.eq('status', status.toLowerCase());

    const { data: timetables, error } = await query;
    if (error) throw error;

    const departmentIds = Array.from(new Set((timetables ?? []).map((t) => t.department_id)));
    const createdByIds = Array.from(new Set((timetables ?? []).map((t) => t.created_by)));
    const timetableIds = (timetables ?? []).map((t) => t.id);

    const [departmentsRes, profilesRes, slotsRes] = await Promise.all([
      departmentIds.length > 0
        ? supabase.from('departments').select('id, name, code').in('id', departmentIds)
        : Promise.resolve({ data: [], error: null }),
      createdByIds.length > 0
        ? supabase.from('profiles').select('id, name, email').in('id', createdByIds)
        : Promise.resolve({ data: [], error: null }),
      timetableIds.length > 0
        ? supabase.from('timetable_slots').select('id, timetable_id').in('timetable_id', timetableIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (departmentsRes.error) throw departmentsRes.error;
    if (profilesRes.error) throw profilesRes.error;
    if (slotsRes.error) throw slotsRes.error;

    const deptMap = new Map((departmentsRes.data ?? []).map((d) => [d.id, d]));
    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const slotCount = new Map<string, number>();
    for (const s of slotsRes.data ?? []) {
      slotCount.set(s.timetable_id, (slotCount.get(s.timetable_id) ?? 0) + 1);
    }

    const result = (timetables ?? []).map((t) => {
      const department = deptMap.get(t.department_id);
      const profile = profileMap.get(t.created_by);

      return {
        id: t.id,
        name: t.name,
        semester: t.semester,
        academicYear: t.academic_year,
        status: t.status.toUpperCase(),
        isPublished: t.is_published,
        version: t.version,
        score: t.score,
        conflicts: t.conflicts,
        departmentId: t.department_id,
        createdById: t.created_by,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
        createdBy: profile
          ? { id: profile.id, name: profile.name, email: profile.email }
          : { id: t.created_by, name: 'Unknown', email: '' },
        _count: {
          slots: slotCount.get(t.id) ?? 0,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch timetables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timetables' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { name, semester, academicYear, departmentId, createdById } = body;

    if (!name || !semester || !academicYear || !departmentId) {
      return NextResponse.json(
        { error: 'Name, semester, academicYear, and departmentId are required' },
        { status: 400 }
      );
    }

    let effectiveCreatedBy = createdById as string | undefined;
    if (!effectiveCreatedBy || effectiveCreatedBy === 'admin-user-id') {
      const { data: firstProfile } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle();
      effectiveCreatedBy = firstProfile?.id;
    }

    if (!effectiveCreatedBy) {
      return NextResponse.json(
        { error: 'No profile user found to set createdById' },
        { status: 400 }
      );
    }

    const { data: timetable, error } = await supabase
      .from('timetables')
      .insert({
        name,
        semester,
        academic_year: academicYear,
        department_id: departmentId,
        created_by: effectiveCreatedBy,
        status: 'draft',
      })
      .select('*')
      .single();

    if (error) throw error;

    const [{ data: department }, { data: profile }] = await Promise.all([
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
    ]);

    return NextResponse.json(
      {
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
        department: department
          ? { id: department.id, name: department.name, code: department.code }
          : null,
        createdBy: profile
          ? { id: profile.id, name: profile.name, email: profile.email }
          : { id: timetable.created_by, name: 'Unknown', email: '' },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create timetable:', error);
    return NextResponse.json(
      { error: 'Failed to create timetable' },
      { status: 500 }
    );
  }
}
