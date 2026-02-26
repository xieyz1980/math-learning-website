import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查找用户
    const { data: user } = await client
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '当前密码错误' },
        { status: 401 }
      );
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await client
      .from('app_users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '修改密码失败',
      },
      { status: 500 }
    );
  }
}
