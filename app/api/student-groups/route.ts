import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');

    let query = supabase
      .from('student_groups')
      .select('*')
      .order('code', { ascending: true });

    if (semester) query = query.eq('semester', parseInt(semester));
    if (academicYear) query = query.eq('academic_year', academicYear);

    const { data: studentGroups, error } = await query;
    if (error) throw error;

    const result = (studentGroups ?? []).map((group) => ({
      id: group.id,
      name: group.name,
      code: group.code,
      semester: group.semester,
      studentCount: group.student_count,
      academicYear: group.academic_year,
      departmentId: group.department_id,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    }));

    return NextResponse.json(result);
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
    const supabase = createAdminClient();
    const body = await request.json();
    const { name, code, semester, studentCount, academicYear, departmentId } = body;

    if (!name || !code || !semester || !studentCount || !academicYear || !departmentId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const { data: studentGroup, error } = await supabase
      .from('student_groups')
      .insert({
        name,
        code,
        semester,
        student_count: studentCount,
        academic_year: academicYear,
        department_id: departmentId,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        id: studentGroup.id,
        name: studentGroup.name,
        code: studentGroup.code,
        semester: studentGroup.semester,
        studentCount: studentGroup.student_count,
        academicYear: studentGroup.academic_year,
        departmentId: studentGroup.department_id,
        createdAt: studentGroup.created_at,
        updatedAt: studentGroup.updated_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create student group:', error);
    return NextResponse.json(
      { error: 'Failed to create student group' },
      { status: 500 }
    );
  }
}
