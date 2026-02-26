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

    // 获取人教版ID
    const { data: version } = await client
      .from('textbook_versions')
      .select('*')
      .eq('name', '人教版')
      .limit(1);

    // 获取年级ID
    const { data: grade1 } = await client
      .from('grades')
      .select('*')
      .eq('name', '初一')
      .limit(1);

    const { data: grade2 } = await client
      .from('grades')
      .select('*')
      .eq('name', '初二')
      .limit(1);

    const { data: grade3 } = await client
      .from('grades')
      .select('*')
      .eq('name', '初三')
      .limit(1);

    if (!version || version.length === 0) {
      return NextResponse.json(
        { success: false, error: '请先初始化系统数据（教材版本）' },
        { status: 400 }
      );
    }

    if (!grade1 || grade1.length === 0 || !grade2 || grade2.length === 0 || !grade3 || grade3.length === 0) {
      return NextResponse.json(
        { success: false, error: '请先初始化系统数据（年级）' },
        { status: 400 }
      );
    }

    const versionId = version[0].id;

    // 人教版初一数学课程
    const grade1Courses = [
      {
        title: '初一数学：第一章 有理数',
        chapter: '第一章 有理数',
        video_url: 'https://www.bilibili.com/video/BV1d3411y7K6',
        description: '有理数的概念、绝对值、加减乘除运算',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第二章 整式的加减',
        chapter: '第二章 整式的加减',
        video_url: 'https://www.bilibili.com/video/BV1f3411y7U8',
        description: '整式的概念、同类项、合并同类项、去括号法则',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第三章 一元一次方程',
        chapter: '第三章 一元一次方程',
        video_url: 'https://www.bilibili.com/video/BV1cJ41117jL',
        description: '等式的基本性质、解一元一次方程、应用题',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第四章 图形的初步认识',
        chapter: '第四章 图形的初步认识',
        video_url: 'https://www.bilibili.com/video/BV1wq4y1m7W8',
        description: '直线、射线、线段、角的概念与性质',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第五章 相交线与平行线',
        chapter: '第五章 相交线与平行线',
        video_url: 'https://www.bilibili.com/video/BV1oK41117XR',
        description: '相交线、平行线的判定与性质、平移',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第六章 实数',
        chapter: '第六章 实数',
        video_url: 'https://www.bilibili.com/video/BV1uK4y1k7Ah',
        description: '平方根、立方根、实数',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第七章 平面直角坐标系',
        chapter: '第七章 平面直角坐标系',
        video_url: 'https://www.bilibili.com/video/BV1M4411w7uQ',
        description: '平面直角坐标系、坐标方法的简单应用',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第八章 二元一次方程组',
        chapter: '第八章 二元一次方程组',
        video_url: 'https://www.bilibili.com/video/BV1r4411w7xK',
        description: '二元一次方程组的解法、应用',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第九章 不等式与不等式组',
        chapter: '第九章 不等式与不等式组',
        video_url: 'https://www.bilibili.com/video/BV1z4411w7v5',
        description: '一元一次不等式、不等式组',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初一数学：第十章 数据的收集、整理与描述',
        chapter: '第十章 数据的收集、整理与描述',
        video_url: 'https://www.bilibili.com/video/BV1u4411w7wL',
        description: '统计调查、直方图',
        video_type: 'bilibili',
        grade_id: grade1[0].id,
        version_id: versionId,
        created_by: userId,
      },
    ];

    // 人教版初二数学课程
    const grade2Courses = [
      {
        title: '初二数学：第十一章 三角形',
        chapter: '第十一章 三角形',
        video_url: 'https://www.bilibili.com/video/BV1Y7411v7yQ',
        description: '三角形的基本性质、全等三角形',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十二章 轴对称',
        chapter: '第十二章 轴对称',
        video_url: 'https://www.bilibili.com/video/BV1v7411v7cL',
        description: '轴对称图形、等腰三角形、等边三角形',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十三章 实数',
        chapter: '第十三章 实数',
        video_url: 'https://www.bilibili.com/video/BV1N7411v7sJ',
        description: '平方根、立方根、实数',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十四章 一次函数',
        chapter: '第十四章 一次函数',
        video_url: 'https://www.bilibili.com/video/BV1Z7411v7pK',
        description: '函数、一次函数的图像与性质、一次函数与方程不等式',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十五章 整式的乘除与因式分解',
        chapter: '第十五章 整式的乘除与因式分解',
        video_url: 'https://www.bilibili.com/video/BV1K7411v7qG',
        description: '整式的乘法、乘法公式、因式分解',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十六章 分式',
        chapter: '第十六章 分式',
        video_url: 'https://www.bilibili.com/video/BV1b7411v7nJ',
        description: '分式的运算、分式方程',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十七章 反比例函数',
        chapter: '第十七章 反比例函数',
        video_url: 'https://www.bilibili.com/video/BV1J7411v7hW',
        description: '反比例函数的图像与性质、实际问题',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十八章 勾股定理',
        chapter: '第十八章 勾股定理',
        video_url: 'https://www.bilibili.com/video/BV1d7411v7gR',
        description: '勾股定理、勾股定理的应用',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第十九章 四边形',
        chapter: '第十九章 四边形',
        video_url: 'https://www.bilibili.com/video/BV1T7411v7cY',
        description: '平行四边形、矩形、菱形、正方形',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初二数学：第二十章 数据的分析',
        chapter: '第二十章 数据的分析',
        video_url: 'https://www.bilibili.com/video/BV1f7411v7kQ',
        description: '平均数、中位数、众数、方差',
        video_type: 'bilibili',
        grade_id: grade2[0].id,
        version_id: versionId,
        created_by: userId,
      },
    ];

    // 人教版初三数学课程
    const grade3Courses = [
      {
        title: '初三数学：第二十一章 一元二次方程',
        chapter: '第二十一章 一元二次方程',
        video_url: 'https://www.bilibili.com/video/BV1L7411v7mB',
        description: '一元二次方程的解法、根与系数关系、应用',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十二章 二次函数',
        chapter: '第二十二章 二次函数',
        video_url: 'https://www.bilibili.com/video/BV1w7411v7pJ',
        description: '二次函数的图像与性质、二次函数的应用',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十三章 旋转',
        chapter: '第二十三章 旋转',
        video_url: 'https://www.bilibili.com/video/BV1M7411v7hP',
        description: '图形的旋转、中心对称',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十四章 圆',
        chapter: '第二十四章 圆',
        video_url: 'https://www.bilibili.com/video/BV1K7411v7kH',
        description: '圆的基本性质、与圆有关的位置关系、切线',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十五章 概率初步',
        chapter: '第二十五章 概率初步',
        video_url: 'https://www.bilibili.com/video/BV1Z7411v7gY',
        description: '随机事件、概率的含义、计算概率',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十六章 反比例函数',
        chapter: '第二十六章 反比例函数',
        video_url: 'https://www.bilibili.com/video/BV1t7411v7cR',
        description: '反比例函数的图像与性质、应用',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十七章 相似',
        chapter: '第二十七章 相似',
        video_url: 'https://www.bilibili.com/video/BV1d7411v7fQ',
        description: '图形的相似、相似三角形、位似',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十八章 锐角三角函数',
        chapter: '第二十八章 锐角三角函数',
        video_url: 'https://www.bilibili.com/video/BV1f7411v7nX',
        description: '锐角三角函数、解直角三角形',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
      {
        title: '初三数学：第二十九章 投影与视图',
        chapter: '第二十九章 投影与视图',
        video_url: 'https://www.bilibili.com/video/BV1L7411v7mK',
        description: '投影、三视图',
        video_type: 'bilibili',
        grade_id: grade3[0].id,
        version_id: versionId,
        created_by: userId,
      },
    ];

    // 合并所有课程
    const allCourses = [...grade1Courses, ...grade2Courses, ...grade3Courses];

    const insertedCourses = [];
    for (const course of allCourses) {
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
