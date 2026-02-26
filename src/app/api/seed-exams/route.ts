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

    // 获取初一ID - 直接查询第一条
    const { data: grade } = await client
      .from('grades')
      .select('*')
      .eq('name', '初一')
      .limit(1);

    if (!grade || grade.length === 0) {
      return NextResponse.json(
        { success: false, error: '请先初始化系统数据（年级）' },
        { status: 400 }
      );
    }

    const gradeId = grade[0].id;

    // 海淀区初一数学期中考试（示例）
    const haidianMidterm = {
      title: '2024-2025学年海淀区初一数学期中考试',
      gradeId: grade.id,
      examType: '期中',
      region: '海淀',
      duration: 90,
      totalScore: 100,
      questions: [
        {
          id: 1,
          type: '选择题',
          question: '计算：|-5| + 3 的结果是（  ）',
          options: ['A. -2', 'B. 2', 'C. -8', 'D. 8'],
          correctAnswer: 'D',
          score: 3,
          explanation: '绝对值|-5|=5，5+3=8',
        },
        {
          id: 2,
          type: '选择题',
          question: '下列各数中，绝对值最小的数是（  ）',
          options: ['A. -3', 'B. -2', 'C. 0', 'D. 2'],
          correctAnswer: 'C',
          score: 3,
          explanation: '0的绝对值是0，是所有数中绝对值最小的',
        },
        {
          id: 3,
          type: '选择题',
          question: '若a＜b，则下列不等式一定成立的是（  ）',
          options: ['A. a-3＞b-3', 'B. 3a＜3b', 'C. -a＞-b', 'D. a÷3＜b÷3'],
          correctAnswer: 'C',
          score: 3,
          explanation: '不等式两边同时乘以或除以同一个负数，不等号方向要改变',
        },
        {
          id: 4,
          type: '选择题',
          question: '方程2x-5=3的解是（  ）',
          options: ['A. x=1', 'B. x=2', 'C. x=3', 'D. x=4'],
          correctAnswer: 'D',
          score: 3,
          explanation: '2x-5=3 → 2x=8 → x=4',
        },
        {
          id: 5,
          type: '选择题',
          question: '-(-3)的相反数是（  ）',
          options: ['A. -3', 'B. 3', 'C. 0', 'D. -9'],
          correctAnswer: 'A',
          score: 3,
          explanation: '-(-3)=3，3的相反数是-3',
        },
        {
          id: 6,
          type: '填空题',
          question: '若x+2=5，则x=______',
          correctAnswer: '3',
          score: 4,
          explanation: 'x+2=5 → x=5-2=3',
        },
        {
          id: 7,
          type: '填空题',
          question: '-1的倒数是______',
          correctAnswer: '-1',
          score: 4,
          explanation: '-1的倒数还是-1',
        },
        {
          id: 8,
          type: '填空题',
          question: '比较大小：-3______-5（填"＞"、"＜"或"="）',
          correctAnswer: '>',
          score: 4,
          explanation: '在数轴上，-3在-5的右边，所以-3＞-5',
        },
        {
          id: 9,
          type: '解答题',
          question: '解方程：3(x-2)=9',
          correctAnswer: 'x=5',
          score: 10,
          explanation: '3(x-2)=9 → x-2=3 → x=5',
        },
        {
          id: 10,
          type: '解答题',
          question: '已知|x-2|+(y+3)²=0，求x+y的值',
          correctAnswer: 'x+y=-1',
          score: 10,
          explanation: '|x-2|+(y+3)²=0，因为绝对值和平方都≥0，且和为0，所以|x-2|=0且(y+3)²=0，得x=2，y=-3，x+y=-1',
        },
      ],
      createdBy: userId,
    };

    // 西城区初一数学期中考试（示例）
    const xichengMidterm = {
      title: '2024-2025学年西城区初一数学期中考试',
      gradeId: grade.id,
      examType: '期中',
      region: '西城',
      duration: 90,
      totalScore: 100,
      questions: [
        {
          id: 1,
          type: '选择题',
          question: '下列各数中，是负数的是（  ）',
          options: ['A. 0', 'B. -0.5', 'C. 1/2', 'D. +3'],
          correctAnswer: 'B',
          score: 3,
          explanation: '只有-0.5是负数，其他都不是负数',
        },
        {
          id: 2,
          type: '选择题',
          question: '数轴上表示-2和3的点之间的距离是（  ）',
          options: ['A. 1', 'B. 3', 'C. 5', 'D. 6'],
          correctAnswer: 'C',
          score: 3,
          explanation: '-2到0的距离是2，0到3的距离是3，总共2+3=5',
        },
        {
          id: 3,
          type: '选择题',
          question: '若a＞b，则下列不等式一定成立的是（  ）',
          options: ['A. a+3＜b+3', 'B. a-3＜b-3', 'C. -3a＜-3b', 'D. a÷3＞b÷3'],
          correctAnswer: 'D',
          score: 3,
          explanation: '不等式两边同时除以同一个正数，不等号方向不变',
        },
        {
          id: 4,
          type: '选择题',
          question: '方程2x+1=7的解是（  ）',
          options: ['A. x=2', 'B. x=3', 'C. x=4', 'D. x=5'],
          correctAnswer: 'B',
          score: 3,
          explanation: '2x+1=7 → 2x=6 → x=3',
        },
        {
          id: 5,
          type: '选择题',
          question: '|-2|的相反数是（  ）',
          options: ['A. -2', 'B. 2', 'C. 0', 'D. -4'],
          correctAnswer: 'A',
          score: 3,
          explanation: '|-2|=2，2的相反数是-2',
        },
        {
          id: 6,
          type: '填空题',
          question: '若x-3=7，则x=______',
          correctAnswer: '10',
          score: 4,
          explanation: 'x-3=7 → x=7+3=10',
        },
        {
          id: 7,
          type: '填空题',
          question: '2的倒数是______',
          correctAnswer: '1/2',
          score: 4,
          explanation: '2的倒数是1/2',
        },
        {
          id: 8,
          type: '填空题',
          question: '比较大小：-5______-3（填"＞"、"＜"或"="）',
          correctAnswer: '<',
          score: 4,
          explanation: '在数轴上，-5在-3的左边，所以-5＜-3',
        },
        {
          id: 9,
          type: '解答题',
          question: '解方程：2x+5=15',
          correctAnswer: 'x=5',
          score: 10,
          explanation: '2x+5=15 → 2x=10 → x=5',
        },
        {
          id: 10,
          type: '解答题',
          question: '已知(x-1)²+|y+2|=0，求x-y的值',
          correctAnswer: 'x-y=3',
          score: 10,
          explanation: '(x-1)²+|y+2|=0，因为平方和绝对值都≥0，且和为0，所以(x-1)²=0且|y+2|=0，得x=1，y=-2，x-y=1-(-2)=3',
        },
      ],
      createdBy: userId,
    };

    // 海淀区初一数学期末考试（示例）
    const haidianFinal = {
      title: '2024-2025学年海淀区初一数学期末考试',
      gradeId: grade.id,
      examType: '期末',
      region: '海淀',
      duration: 120,
      totalScore: 100,
      questions: [
        {
          id: 1,
          type: '选择题',
          question: '下列各数中，有理数是（  ）',
          options: ['A. π', 'B. √2', 'C. -3.14', 'D. √3'],
          correctAnswer: 'C',
          score: 3,
          explanation: '-3.14是有限小数，是有理数；π、√2、√3都是无理数',
        },
        {
          id: 2,
          type: '选择题',
          question: '点P(-2,3)在第几象限？（  ）',
          options: ['A. 第一象限', 'B. 第二象限', 'C. 第三象限', 'D. 第四象限'],
          correctAnswer: 'B',
          score: 3,
          explanation: '横坐标-2是负数，纵坐标3是正数，所以在第二象限',
        },
        {
          id: 3,
          type: '选择题',
          question: '方程组{x+y=5, x-y=1的解是（  ）',
          options: ['A. x=2, y=3', 'B. x=3, y=2', 'C. x=4, y=1', 'D. x=1, y=4'],
          correctAnswer: 'B',
          score: 3,
          explanation: '两式相加得2x=6，x=3；代入第一式得3+y=5，y=2',
        },
        {
          id: 4,
          type: '选择题',
          question: '√16的平方根是（  ）',
          options: ['A. 4', 'B. ±4', 'C. 2', 'D. ±2'],
          correctAnswer: 'D',
          score: 3,
          explanation: '√16=4，4的平方根是±2',
        },
        {
          id: 5,
          type: '选择题',
          question: '若a²=9，则a的值是（  ）',
          options: ['A. 3', 'B. -3', 'C. ±3', 'D. 9'],
          correctAnswer: 'C',
          score: 3,
          explanation: '因为(±3)²=9，所以a=±3',
        },
        {
          id: 6,
          type: '填空题',
          question: '在平面直角坐标系中，点(0,3)在______轴上',
          correctAnswer: 'y',
          score: 4,
          explanation: '横坐标为0，纵坐标不为0，点在y轴上',
        },
        {
          id: 7,
          type: '填空题',
          question: '9的算术平方根是______',
          correctAnswer: '3',
          score: 4,
          explanation: '9的算术平方根是√9=3',
        },
        {
          id: 8,
          type: '填空题',
          question: '比较大小：√3______2（填"＞"、"＜"或"="）',
          correctAnswer: '<',
          score: 4,
          explanation: '√3≈1.732，1.732＜2，所以√3＜2',
        },
        {
          id: 9,
          type: '解答题',
          question: '解方程组：{x+2y=7, 3x-2y=1',
          correctAnswer: 'x=2, y=2.5',
          score: 10,
          explanation: '两式相加得4x=8，x=2；代入第一式得2+2y=7，2y=5，y=2.5',
        },
        {
          id: 10,
          type: '解答题',
          question: '已知点A(2,3)和B(-1,5)，求线段AB的中点坐标',
          correctAnswer: '(0.5,4)',
          score: 10,
          explanation: '中点坐标=((2+(-1))/2, (3+5)/2)=(0.5,4)',
        },
      ],
      createdBy: userId,
    };

    const exams = [haidianMidterm, xichengMidterm, haidianFinal];
    const insertedExams = [];

    for (const exam of exams) {
      const { data } = await client.from('exam_papers').insert(exam).select().single();
      insertedExams.push(data);
    }

    return NextResponse.json({
      success: true,
      message: '试卷预置成功',
      data: {
        count: insertedExams.length,
        exams: insertedExams,
      },
    });
  } catch (error) {
    console.error('预置试卷失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '预置试卷失败',
      },
      { status: 500 }
    );
  }
}
