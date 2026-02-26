import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 检查超级管理员是否已存在
    const { data: existingAdmin } = await client
      .from('app_users')
      .select('*')
      .eq('email', 'xieyouzehpu@outlook.com')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return NextResponse.json({
        success: true,
        message: '超级管理员已存在',
      });
    }

    // 创建超级管理员账号
    const hashedPassword = await bcrypt.hash('xyz20010', 10);

    const { data, error } = await client
      .from('app_users')
      .insert({
        email: 'xieyouzehpu@outlook.com',
        password: hashedPassword,
        role: 'admin',
        points: 1000,
        status: 'active',
      })
      .select()
      .limit(1);

    if (error) {
      throw error;
    }

    const newAdmin = Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (!newAdmin) {
      return NextResponse.json(
        { success: false, error: '创建管理员失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '超级管理员创建成功',
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
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
