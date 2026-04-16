import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const professorId = searchParams.get('professorId');

    let query = supabase
      .from('course_assignments')
      .select('id, course_id, professor_id, created_at, updated_at, courses(id, name, code), professors(id, name, email)')
      .order('created_at', { ascending: false });

    if (courseId) query = query.eq('course_id', courseId);
    if (professorId) query = query.eq('professor_id', professorId);

    const { data, error } = await query;
    if (error) throw error;

    const result = (data ?? []).map((row) => {
      const course = row.courses as { id: string; name: string; code: string } | null;
      const professor = row.professors as { id: string; name: string; email: string } | null;
      return {
        id: row.id,
        courseId: row.course_id,
        professorId: row.professor_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        course,
        professor,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch course assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch course assignments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { courseId, professorId } = body;

    if (!courseId || !professorId) {
      return NextResponse.json(
        { error: 'courseId and professorId are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('course_assignments')
      .insert({ course_id: courseId, professor_id: professorId })
      .select('id, course_id, professor_id, created_at, updated_at, courses(id, name, code), professors(id, name, email)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This professor is already assigned to the selected course' },
          { status: 409 }
        );
      }
      throw error;
    }

    const course = data.courses as { id: string; name: string; code: string } | null;
    const professor = data.professors as { id: string; name: string; email: string } | null;

    return NextResponse.json(
      {
        id: data.id,
        courseId: data.course_id,
        professorId: data.professor_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        course,
        professor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create course assignment:', error);
    return NextResponse.json({ error: 'Failed to create course assignment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');

    if (!assignmentId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('course_assignments').delete().eq('id', assignmentId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete course assignment:', error);
    return NextResponse.json({ error: 'Failed to delete course assignment' }, { status: 500 });
  }
}
