import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户的笔记
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    let query = client.from('notes').select('*').eq('user_id', userId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: notes } = await query.order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: notes || [],
    });
  } catch (error) {
    console.error('获取笔记失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取笔记失败',
      },
      { status: 500 }
    );
  }
}

// 保存或更新笔记
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, content } = await request.json();

    if (!userId || !courseId || !content) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查是否已有该课程的笔记
    const { data: existingNote } = await client
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    let note;
    if (existingNote) {
      // 更新已有笔记
      const { data, error } = await client
        .from('notes')
        .update({ content })
        .eq('id', existingNote.id)
        .select()
        .single();

      if (error) throw error;
      note = data;
    } else {
      // 创建新笔记
      const { data, error } = await client
        .from('notes')
        .insert({
          user_id: userId,
          course_id: courseId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      note = data;
    }

    return NextResponse.json({
      success: true,
      message: '笔记保存成功',
      data: note,
    });
  } catch (error) {
    console.error('保存笔记失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '保存笔记失败',
      },
      { status: 500 }
    );
  }
}
