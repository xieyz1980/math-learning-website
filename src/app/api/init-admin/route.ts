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

    // 3. 检查是否已有课程数据
    const { data: existingCourses } = await client
      .from('courses')
      .select('*')
      .limit(1);

    if (!existingCourses || existingCourses.length === 0) {
      // 创建示例课程数据
      const sampleCourses = [
        {
          title: '初一数学：有理数的运算',
          chapter: '第一章 有理数',
          videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
          description: '本节课讲解有理数的基本概念和运算规则，包括加法、减法、乘法和除法。',
          videoType: 'bilibili',
          createdBy: 'xieyouzehpu@outlook.com',
        },
        {
          title: '初一数学：一元一次方程',
          chapter: '第二章 一元一次方程',
          videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
          description: '学习一元一次方程的解法和实际应用，掌握方程的基本概念。',
          videoType: 'bilibili',
          createdBy: 'xieyouzehpu@outlook.com',
        },
        {
          title: '初二数学：二次根式',
          chapter: '第十六章 二次根式',
          videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
          description: '二次根式的概念、性质和运算，以及其在实际问题中的应用。',
          videoType: 'bilibili',
          createdBy: 'xieyouzehpu@outlook.com',
        },
        {
          title: '初二数学：勾股定理',
          chapter: '第十八章 勾股定理',
          videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
          description: '勾股定理的证明和应用，直角三角形边长关系的探索。',
          videoType: 'bilibili',
          createdBy: 'xieyouzehpu@outlook.com',
        },
        {
          title: '初三数学：一元二次方程',
          chapter: '第二十一章 一元二次方程',
          videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
          description: '一元二次方程的解法，包括配方法、公式法和因式分解法。',
          videoType: 'bilibili',
          createdBy: 'xieyouzehpu@outlook.com',
        },
        {
          title: '初三数学：二次函数',
          chapter: '第二十二章 二次函数',
          videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
          description: '二次函数的图像和性质，以及在实际问题中的应用。',
          videoType: 'bilibili',
          createdBy: 'xieyouzehpu@outlook.com',
        },
      ];

      const { data: coursesData, error: coursesError } = await client
        .from('courses')
        .insert(sampleCourses)
        .select();

      if (coursesError) {
        throw coursesError;
      }

      if (coursesData && coursesData.length > 0) {
        results.push({
          type: 'sample_courses',
          message: `示例课程创建成功，共 ${coursesData.length} 门课程`,
          data: {
            count: coursesData.length,
          },
        });
      }
    } else {
      results.push({
        type: 'sample_courses',
        message: '示例课程已存在',
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
