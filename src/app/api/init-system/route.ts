import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 1. 创建年级
    const grades = [
      { name: '初一', sort_order: 1 },
      { name: '初二', sort_order: 2 },
      { name: '初三', sort_order: 3 },
      { name: '高一', sort_order: 4 },
      { name: '高二', sort_order: 5 },
      { name: '高三', sort_order: 6 },
    ];

    for (const grade of grades) {
      const { error } = await client.from('grades').insert(grade);
      if (error) {
        console.error('插入年级失败:', error);
      }
    }

    // 2. 创建教材版本
    const versions = [
      { name: '人教版', publisher: '人民教育出版社' },
      { name: '北京版', publisher: '北京出版社' },
      { name: '北师大版', publisher: '北京师范大学出版社' },
    ];

    for (const version of versions) {
      const { error } = await client.from('textbook_versions').insert(version);
      if (error) {
        console.error('插入教材版本失败:', error);
      }
    }

    // 3. 创建测试账号
    const testUsers = [
      { email: 'test1@example.com', password: '12234567890', role: 'user' },
      { email: 'test2@example.com', password: '12234567890', role: 'user' },
      { email: 'test3@example.com', password: '12234567890', role: 'user' },
    ];

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const { error } = await client.from('app_users').insert({
        email: user.email,
        password: hashedPassword,
        role: user.role,
        points: 300,
        status: 'active',
      });
      if (error) {
        console.error('插入用户失败:', error);
      }
    }

    // 4. 创建系统配置
    const configs = [
      { key: 'default_points', value: '300', description: '新用户默认积分' },
      { key: 'watch_video_cost', value: '10', description: '看一次课程消耗积分' },
      { key: 'take_exam_cost', value: '50', description: '参加一次考试消耗积分' },
    ];

    for (const config of configs) {
      await client.from('system_config').insert(config);
    }

    return NextResponse.json({
      success: true,
      message: '系统初始化成功',
      data: {
        grades: grades.length,
        versions: versions.length,
        testUsers: testUsers.length,
        configs: configs.length,
      },
    });
  } catch (error) {
    console.error('系统初始化失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '系统初始化失败',
      },
      { status: 500 }
    );
  }
}
