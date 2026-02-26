import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // 查找用户
    const { data: user } = await client
      .from('app_users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user[0].id,
        email: user[0].email,
        role: user[0].role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        points: user[0].points,
        status: user[0].status,
        token: token,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      },
      { status: 500 }
    );
  }
}
