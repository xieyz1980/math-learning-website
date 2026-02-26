import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个课程
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data: course } = await client
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (!course) {
      return NextResponse.json(
        { success: false, error: '课程不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('获取课程失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取课程失败',
      },
      { status: 500 }
    );
  }
}

// 更新课程
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, chapter, videoUrl, description, videoType, userId } =
      await request.json();

    const client = getSupabaseClient();

    // 验证用户是否是管理员
    const { data: user } = await client
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .limit(1);

    if (!user || user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限修改课程' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (chapter) updateData.chapter = chapter;
    if (videoUrl) updateData.video_url = videoUrl;
    if (description !== undefined) updateData.description = description;
    if (videoType) updateData.video_type = videoType;

    const { data, error } = await client
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '课程更新成功',
      data,
    });
  } catch (error) {
    console.error('更新课程失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新课程失败',
      },
      { status: 500 }
    );
  }
}

// 删除课程
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    const client = getSupabaseClient();

    // 验证用户是否是管理员
    const { data: user } = await client
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .limit(1);

    if (!user || user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限删除课程' },
        { status: 403 }
      );
    }

    const { error } = await client.from('courses').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '课程删除成功',
    });
  } catch (error) {
    console.error('删除课程失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除课程失败',
      },
      { status: 500 }
    );
  }
}
