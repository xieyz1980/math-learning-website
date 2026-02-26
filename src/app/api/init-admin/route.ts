import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const results = [];

    // 1. 检查超级管理员是否已存在
    const { data: existingAdmin } = await client
      .from('app_users')
      .select('*')
      .eq('email', 'xieyouzehpu@outlook.com')
      .limit(1);

    if (!existingAdmin || existingAdmin.length === 0) {
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

      if (newAdmin) {
        results.push({
          type: 'admin',
          message: '超级管理员创建成功',
          data: {
            id: newAdmin.id,
            email: newAdmin.email,
            role: newAdmin.role,
          },
        });
      }
    } else {
      results.push({
        type: 'admin',
        message: '超级管理员已存在',
      });
    }

    // 2. 检查测试用户是否已存在
    const { data: existingTestUser } = await client
      .from('app_users')
      .select('*')
      .eq('email', 'test1@example.com')
      .limit(1);

    if (!existingTestUser || existingTestUser.length === 0) {
      // 创建测试用户账号
      const hashedPassword = await bcrypt.hash('12234567890', 10);

      const { data, error } = await client
        .from('app_users')
        .insert({
          email: 'test1@example.com',
          password: hashedPassword,
          role: 'user',
          points: 300,
          status: 'active',
        })
        .select()
        .limit(1);

      if (error) {
        throw error;
      }

      const newUser = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (newUser) {
        results.push({
          type: 'test_user',
          message: '测试用户创建成功',
          data: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
          },
        });
      }
    } else {
      results.push({
        type: 'test_user',
        message: '测试用户已存在',
      });
    }

    return NextResponse.json({
      success: true,
      message: '初始化完成',
      results,
    });
  } catch (error) {
    console.error('初始化用户失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '初始化失败',
      },
      { status: 500 }
    );
  }
}
