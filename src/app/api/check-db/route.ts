import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const results = [];

    // 检查表是否存在
    const { data: tables, error: checkError } = await client.rpc(
      'check_tables_exist'
    );

    // 如果 RPC 不存在，直接尝试查询来判断
    const tableNames = ['app_users', 'courses', 'wrong_questions', 'exam_records', 'real_exams'];

    for (const tableName of tableNames) {
      try {
        const { data, error } = await client
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          results.push({
            table: tableName,
            status: 'error',
            message: error.message,
          });
        } else {
          results.push({
            table: tableName,
            status: 'exists',
            message: '表已存在',
          });
        }
      } catch (e: any) {
        results.push({
          table: tableName,
          status: 'error',
          message: e.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据库表检查完成',
      results,
    });
  } catch (error) {
    console.error('检查数据库表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '检查失败',
      },
      { status: 500 }
    );
  }
}
