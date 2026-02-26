import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取所有课程
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    const { data: courses } = await client
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: courses || [],
    });
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取课程列表失败',
      },
      { status: 500 }
    );
  }
}

// 添加新课程
export async function POST(request: NextRequest) {
  try {
    const { title, chapter, videoUrl, description, videoType, userId } =
      await request.json();

    if (!title || !chapter || !videoUrl || !userId) {
      return NextResponse.json(
        { success: false, error: '标题、章节、视频链接和创建者ID不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 验证用户是否是管理员
    const { data: user } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限添加课程' },
        { status: 403 }
      );
    }

    const { data, error } = await client
      .from('courses')
      .insert({
        title,
        chapter,
        videoUrl,
        description,
        videoType: videoType || 'bilibili',
        createdBy: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '课程添加成功',
      data,
    });
  } catch (error) {
    console.error('添加课程失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '添加课程失败',
      },
      { status: 500 }
    );
  }
}
