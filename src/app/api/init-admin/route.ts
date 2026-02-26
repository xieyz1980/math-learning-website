import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 检查超级管理员是否已存在
    const { data: existingAdmin } = await client
      .from('users')
      .select('*')
      .eq('email', 'xieyouzehpu@outlook.com')
      .single();

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: '超级管理员已存在',
      });
    }

    // 创建超级管理员账号
    const hashedPassword = await bcrypt.hash('xyz20010', 10);

    const { data, error } = await client
      .from('users')
      .insert({
        email: 'xieyouzehpu@outlook.com',
        password: hashedPassword,
        role: 'admin',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '超级管理员创建成功',
      data: {
        id: data.id,
        email: data.email,
        role: data.role,
      },
    });
  } catch (error) {
    console.error('初始化超级管理员失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '初始化失败',
      },
      { status: 500 }
    );
  }
}
