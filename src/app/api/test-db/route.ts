import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 测试查询年级
    const { data: grades, error: gradesError } = await client
      .from('grades')
      .select('*')
      .limit(10);

    // 测试查询版本
    const { data: versions, error: versionsError } = await client
      .from('textbook_versions')
      .select('*')
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        grades,
        gradesError,
        versions,
        versionsError,
      },
    });
  } catch (error) {
    console.error('测试查询失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '测试查询失败',
      },
      { status: 500 }
    );
  }
}
