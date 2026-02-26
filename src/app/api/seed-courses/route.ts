import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取人教版ID - 直接查询第一条
    const { data: version } = await client
      .from('textbook_versions')
      .select('*')
      .eq('name', '人教版')
      .limit(1);

    // 获取初一ID - 直接查询第一条
    const { data: grade } = await client
      .from('grades')
      .select('*')
      .eq('name', '初一')
      .limit(1);

    if (!version || version.length === 0 || !grade || grade.length === 0) {
      return NextResponse.json(
        { success: false, error: '请先初始化系统数据（年级和教材版本）' },
        { status: 400 }
      );
    }

    const versionId = version[0].id;
    const gradeId = grade[0].id;

    // 人教版初一数学优质课程
    const courses = [
      {
        title: '第一章 有理数',
        chapter: '第一章 有理数',
        videoUrl: 'https://www.bilibili.com/video/BV1d3411y7K6',
        description: '有理数的概念、加减法运算',
        videoType: 'bilibili',
        gradeId: gradeId,
        versionId: versionId,
        createdBy: userId,
      },
      {
        title: '第二章 整式的加减',
        chapter: '第二章 整式的加减',
        videoUrl: 'https://www.bilibili.com/video/BV1f3411y7U8',
        description: '整式的概念及加减运算',
        videoType: 'bilibili',
        gradeId: gradeId,
        versionId: versionId,
        createdBy: userId,
      },
      {
        title: '第三章 一元一次方程',
        chapter: '第三章 一元一次方程',
        videoUrl: 'https://www.bilibili.com/video/BV1cJ41117jL',
        description: '一元一次方程的解法与应用',
        videoType: 'bilibili',
        gradeId: gradeId,
        versionId: versionId,
        createdBy: userId,
      },
      {
        title: '第四章 图形的初步认识',
        chapter: '第四章 图形的初步认识',
        videoUrl: 'https://www.bilibili.com/video/BV1wq4y1m7W8',
        description: '认识平面图形和立体图形',
        videoType: 'bilibili',
        gradeId: gradeId,
        versionId: versionId,
        createdBy: userId,
      },
    ];

    const insertedCourses = [];
    for (const course of courses) {
      try {
        const { data } = await client.from('courses').insert(course).select().single();
        insertedCourses.push(data);
      } catch (err) {
        // 忽略重复插入错误
        console.log('课程可能已存在，跳过:', course.title);
      }
    }

    return NextResponse.json({
      success: true,
      message: '课程预置成功',
      data: {
        count: insertedCourses.length,
        courses: insertedCourses,
      },
    });
  } catch (error) {
    console.error('预置课程失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '预置课程失败',
      },
      { status: 500 }
    );
  }
}
