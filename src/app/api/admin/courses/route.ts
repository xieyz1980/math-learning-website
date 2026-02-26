import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdmin } from '@/lib/auth';

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
    // 验证管理员权限
    const decoded = await verifyAdmin(request.headers.get("authorization"));

    const { title, chapter, videoUrl, description, videoType } =
      await request.json();

    if (!title || !chapter || !videoUrl) {
      return NextResponse.json(
        { success: false, error: '标题、章节和视频链接不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('courses')
      .insert({
        title,
        chapter,
        videoUrl,
        description,
        videoType: videoType || 'bilibili',
        createdBy: decoded.userId,
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
    if (error instanceof Error && (error.message === "未授权" || error.message === "无效的token")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message === "权限不足") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
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
