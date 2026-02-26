import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查邮箱是否已存在
    const { data: existingUser } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await client
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        role: 'user',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '注册成功',
      data: {
        id: data.id,
        email: data.email,
        role: data.role,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '注册失败',
      },
      { status: 500 }
    );
  }
}
