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

    if (!grade1 || grade1.length === 0 || !grade2 || grade2.length === 0 || !grade3 || grade3.length === 0) {
      return NextResponse.json(
        { success: false, error: '请先初始化系统数据（年级）' },
        { status: 400 }
      );
    }

    // 2025年试卷
    const exams2025 = [
      {
        title: '2025年海淀区初一数学期中考试',
        gradeId: grade1[0].id,
        region: '海淀',
        examType: '期中',
        duration: 90,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '计算：|-5| + 3 的结果是（  ）', options: ['A. -2', 'B. 2', 'C. -8', 'D. 8'], answer: 3, score: 3 },
          { id: 2, type: 'single_choice', question: '下列各数中，绝对值最小的数是（  ）', options: ['A. -3', 'B. -2', 'C. 0', 'D. 2'], answer: 2, score: 3 },
          { id: 3, type: 'single_choice', question: '若a＜b，则下列不等式一定成立的是（  ）', options: ['A. a-3＞b-3', 'B. 3a＜3b', 'C. -a＞-b', 'D. a÷3＜b÷3'], answer: 2, score: 3 },
          { id: 4, type: 'single_choice', question: '方程2x-5=3的解是（  ）', options: ['A. x=1', 'B. x=2', 'C. x=3', 'D. x=4'], answer: 3, score: 3 },
          { id: 5, type: 'single_choice', question: '-(-3)的相反数是（  ）', options: ['A. -3', 'B. 3', 'C. 0', 'D. -9'], answer: 0, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2025年西城区初一数学期中考试',
        gradeId: grade1[0].id,
        region: '西城',
        examType: '期中',
        duration: 90,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '下列各数中，是负数的是（  ）', options: ['A. 0', 'B. -0.5', 'C. 1/2', 'D. +3'], answer: 1, score: 3 },
          { id: 2, type: 'single_choice', question: '数轴上表示-2和3的点之间的距离是（  ）', options: ['A. 1', 'B. 3', 'C. 5', 'D. 6'], answer: 2, score: 3 },
          { id: 3, type: 'single_choice', question: '若a＞b，则下列不等式一定成立的是（  ）', options: ['A. a+3＜b+3', 'B. a-3＜b-3', 'C. -3a＜-3b', 'D. a÷3＞b÷3'], answer: 3, score: 3 },
          { id: 4, type: 'single_choice', question: '方程2x+1=7的解是（  ）', options: ['A. x=2', 'B. x=3', 'C. x=4', 'D. x=5'], answer: 1, score: 3 },
          { id: 5, type: 'single_choice', question: '|-2|的相反数是（  ）', options: ['A. -2', 'B. 2', 'C. 0', 'D. -4'], answer: 0, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2025年海淀区初一数学期末考试',
        gradeId: grade1[0].id,
        region: '海淀',
        examType: '期末',
        duration: 120,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '下列各数中，有理数是（  ）', options: ['A. π', 'B. √2', 'C. -3.14', 'D. √3'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '点P(-2,3)在第几象限？（  ）', options: ['A. 第一象限', 'B. 第二象限', 'C. 第三象限', 'D. 第四象限'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '方程组{x+y=5, x-y=1的解是（  ）', options: ['A. x=2, y=3', 'B. x=3, y=2', 'C. x=4, y=1', 'D. x=1, y=4'], answer: 1, score: 3 },
          { id: 4, type: 'single_choice', question: '√16的平方根是（  ）', options: ['A. 4', 'B. ±4', 'C. 2', 'D. ±2'], answer: 3, score: 3 },
          { id: 5, type: 'single_choice', question: '若a²=9，则a的值是（  ）', options: ['A. 3', 'B. -3', 'C. ±3', 'D. 9'], answer: 2, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2025年西城区初一数学期末考试',
        gradeId: grade1[0].id,
        region: '西城',
        examType: '期末',
        duration: 120,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '数轴上到原点距离为3的点有（  ）', options: ['A. 1个', 'B. 2个', 'C. 3个', 'D. 4个'], answer: 1, score: 3 },
          { id: 2, type: 'single_choice', question: '点M(3,0)在（  ）', options: ['A. 第一象限', 'B. x轴上', 'C. y轴上', 'D. 原点'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '不等式3x＞6的解集是（  ）', options: ['A. x＞2', 'B. x＜2', 'C. x＞6', 'D. x＜6'], answer: 0, score: 3 },
          { id: 4, type: 'single_choice', question: '方程x²=4的解是（  ）', options: ['A. x=2', 'B. x=-2', 'C. x=±2', 'D. x=4'], answer: 2, score: 3 },
          { id: 5, type: 'single_choice', question: '下列式子正确的是（  ）', options: ['A. |-a|=a', 'B. |-a|=-a', 'C. |-a|=|a|', 'D. |-a|≥a'], answer: 2, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2025年海淀区初二数学期中考试',
        gradeId: grade2[0].id,
        region: '海淀',
        examType: '期中',
        duration: 100,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '下列图形中，是轴对称图形的是（  ）', options: ['A. 平行四边形', 'B. 梯形', 'C. 等腰三角形', 'D. 不等边三角形'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '若一次函数y=2x-1的图象经过点（a,3），则a的值是（  ）', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '下列等式中，是一元一次方程的是（  ）', options: ['A. x+2=0', 'B. x²-3x=0', 'C. 1/x+1=2', 'D. |x|+1=0'], answer: 0, score: 3 },
          { id: 4, type: 'single_choice', question: '分式2/3和4/6的值（  ）', options: ['A. 相等', 'B. 2/3＞4/6', 'C. 2/3＜4/6', 'D. 无法比较'], answer: 0, score: 3 },
          { id: 5, type: 'single_choice', question: '若a>0，b<0，则a-b的值（  ）', options: ['A. 大于0', 'B. 小于0', 'C. 等于0', 'D. 无法确定'], answer: 0, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2025年西城区初二数学期中考试',
        gradeId: grade2[0].id,
        region: '西城',
        examType: '期中',
        duration: 100,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '等腰三角形的一个角是50°，则底角是（  ）', options: ['A. 50°', 'B. 65°', 'C. 50°或65°', 'D. 80°'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '函数y=-2x+3中，y随x的增大而（  ）', options: ['A. 增大', 'B. 减小', 'C. 不变', 'D. 无法确定'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '分式(x+1)/(x-1)有意义，则x（  ）', options: ['A. x≠1', 'B. x≠-1', 'C. x≠0', 'D. x≠±1'], answer: 0, score: 3 },
          { id: 4, type: 'single_choice', question: '若ab>0，则a和b（  ）', options: ['A. 都为正', 'B. 都为负', 'C. 同号', 'D. 异号'], answer: 2, score: 3 },
          { id: 5, type: 'single_choice', question: '勾股数是（  ）', options: ['A. 1,2,3', 'B. 3,4,5', 'C. 2,3,4', 'D. 4,5,6'], answer: 1, score: 3 },
        ],
        created_by: userId,
      },
    ];

    // 2024年试卷
    const exams2024 = [
      {
        title: '2024年海淀区初一数学期中考试',
        gradeId: grade1[0].id,
        region: '海淀',
        examType: '期中',
        duration: 90,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '计算：(-2)³的结果是（  ）', options: ['A. -6', 'B. 6', 'C. -8', 'D. 8'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '下列说法正确的是（  ）', options: ['A. 0是最小的数', 'B. -3<-2', 'C. 绝对值最小的数是1', 'D. 正数都大于负数'], answer: 3, score: 3 },
          { id: 3, type: 'single_choice', question: '合并同类项：3a+2a-5a=（  ）', options: ['A. 0', 'B. 10a', 'C. a', 'D. 5a'], answer: 0, score: 3 },
          { id: 4, type: 'single_choice', question: '如果2x-3=5，那么x=（  ）', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'], answer: 3, score: 3 },
          { id: 5, type: 'single_choice', question: '数轴上表示-3和2的距离是（  ）', options: ['A. 1', 'B. 3', 'C. 5', 'D. 6'], answer: 2, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2024年西城区初一数学期中考试',
        gradeId: grade1[0].id,
        region: '西城',
        examType: '期中',
        duration: 90,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '|-2|+|3|的值是（  ）', options: ['A. 1', 'B. 5', 'C. -1', 'D. -5'], answer: 1, score: 3 },
          { id: 2, type: 'single_choice', question: '在数轴上，表示-1.5的点在（  ）', options: ['A. 原点右侧', 'B. 原点左侧', 'C. 原点', 'D. 无法确定'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '去括号：-(a-b)=（  ）', options: ['A. -a-b', 'B. -a+b', 'C. a-b', 'D. a+b'], answer: 1, score: 3 },
          { id: 4, type: 'single_choice', question: '方程3x=6的解是（  ）', options: ['A. x=2', 'B. x=3', 'C. x=6', 'D. x=9'], answer: 0, score: 3 },
          { id: 5, type: 'single_choice', question: '若x=-2，则x²=（  ）', options: ['A. -4', 'B. 4', 'C. -2', 'D. 2'], answer: 1, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2024年海淀区初二数学期中考试',
        gradeId: grade2[0].id,
        region: '海淀',
        examType: '期中',
        duration: 100,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '等边三角形的一个角是（  ）', options: ['A. 30°', 'B. 45°', 'C. 60°', 'D. 90°'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '一次函数y=x+1的图象经过（  ）', options: ['A. (0,1)', 'B. (1,0)', 'C. (0,-1)', 'D. (-1,0)'], answer: 0, score: 3 },
          { id: 3, type: 'single_choice', question: '分式1/(x-2)有意义，则x（  ）', options: ['A. x=2', 'B. x≠2', 'C. x>2', 'D. x<2'], answer: 1, score: 3 },
          { id: 4, type: 'single_choice', question: '若ab<0，则a和b（  ）', options: ['A. 都为正', 'B. 都为负', 'C. 同号', 'D. 异号'], answer: 3, score: 3 },
          { id: 5, type: 'single_choice', question: '在Rt△ABC中，∠C=90°，AC=3，BC=4，则AB=（  ）', options: ['A. 5', 'B. 6', 'C. 7', 'D. 8'], answer: 0, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2024年西城区初二数学期中考试',
        gradeId: grade2[0].id,
        region: '西城',
        examType: '期中',
        duration: 100,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '轴对称图形的对称轴有（  ）', options: ['A. 1条', 'B. 2条', 'C. 无数条', 'D. 至少1条'], answer: 3, score: 3 },
          { id: 2, type: 'single_choice', question: '函数y=3x-2中，当x=1时，y=（  ）', options: ['A. 1', 'B. 2', 'C. 3', 'D. 5'], answer: 0, score: 3 },
          { id: 3, type: 'single_choice', question: '分式2/(3x)的值是（  ）', options: ['A. 2/3', 'B. 2/(3x)', 'C. 2x/3', 'D. 3x/2'], answer: 1, score: 3 },
          { id: 4, type: 'single_choice', question: '若a²=16，则a=（  ）', options: ['A. 4', 'B. -4', 'C. ±4', 'D. 16'], answer: 2, score: 3 },
          { id: 5, type: 'single_choice', question: '勾股定理中，两直角边分别是5和12，斜边是（  ）', options: ['A. 13', 'B. 14', 'C. 15', 'D. 17'], answer: 0, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2024年海淀区初三数学期中考试',
        gradeId: grade3[0].id,
        region: '海淀',
        examType: '期中',
        duration: 120,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '方程x²-4=0的解是（  ）', options: ['A. x=2', 'B. x=-2', 'C. x=±2', 'D. x=4'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '二次函数y=x²的图象是（  ）', options: ['A. 直线', 'B. 抛物线', 'C. 双曲线', 'D. 圆'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '圆的半径为3，则圆的面积是（  ）', options: ['A. 3π', 'B. 6π', 'C. 9π', 'D. 12π'], answer: 2, score: 3 },
          { id: 4, type: 'single_choice', question: 'sin30°的值是（  ）', options: ['A. 1/2', 'B. √2/2', 'C. √3/2', 'D. 1'], answer: 0, score: 3 },
          { id: 5, type: 'single_choice', question: '抛硬币出现正面的概率是（  ）', options: ['A. 1/3', 'B. 1/2', 'C. 2/3', 'D. 1'], answer: 1, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2024年西城区初三数学期中考试',
        gradeId: grade3[0].id,
        region: '西城',
        examType: '期中',
        duration: 120,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '方程2x²-8=0的解是（  ）', options: ['A. x=2', 'B. x=-2', 'C. x=±2', 'D. x=±4'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '二次函数y=-x²的开口方向是（  ）', options: ['A. 向上', 'B. 向下', 'C. 向左', 'D. 向右'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '圆的直径为6，则圆的半径是（  ）', options: ['A. 3', 'B. 6', 'C. 9', 'D. 12'], answer: 0, score: 3 },
          { id: 4, type: 'single_choice', question: 'cos60°的值是（  ）', options: ['A. 1/2', 'B. √2/2', 'C. √3/2', 'D. 1'], answer: 0, score: 3 },
          { id: 5, type: 'single_choice', question: '掷骰子出现偶数的概率是（  ）', options: ['A. 1/6', 'B. 1/3', 'C. 1/2', 'D. 2/3'], answer: 2, score: 3 },
        ],
        created_by: userId,
      },
    ];

    // 2023年试卷
    const exams2023 = [
      {
        title: '2023年海淀区初一数学期中考试',
        gradeId: grade1[0].id,
        region: '海淀',
        examType: '期中',
        duration: 90,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '-3的相反数是（  ）', options: ['A. -3', 'B. 3', 'C. 1/3', 'D. -1/3'], answer: 1, score: 3 },
          { id: 2, type: 'single_choice', question: '在数轴上，原点表示的数是（  ）', options: ['A. -1', 'B. 0', 'C. 1', 'D. 2'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '同类项的特点是（  ）', options: ['A. 字母相同', 'B. 指数相同', 'C. 字母和指数都相同', 'D. 系数相同'], answer: 2, score: 3 },
          { id: 4, type: 'single_choice', question: '方程x+5=0的解是（  ）', options: ['A. x=5', 'B. x=-5', 'C. x=0', 'D. x=1'], answer: 1, score: 3 },
          { id: 5, type: 'single_choice', question: '|0|的值是（  ）', options: ['A. 0', 'B. 1', 'C. -1', 'D. 不存在'], answer: 0, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2023年西城区初一数学期中考试',
        gradeId: grade1[0].id,
        region: '西城',
        examType: '期中',
        duration: 90,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '下列各数中，最小的数是（  ）', options: ['A. -1', 'B. 0', 'C. 1', 'D. 2'], answer: 0, score: 3 },
          { id: 2, type: 'single_choice', question: '|-3|的值是（  ）', options: ['A. -3', 'B. 3', 'C. 0', 'D. 9'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '合并同类项：2x+3x=（  ）', options: ['A. 5x', 'B. 6x', 'C. 5x²', 'D. 6x²'], answer: 0, score: 3 },
          { id: 4, type: 'single_choice', question: '方程x-2=0的解是（  ）', options: ['A. x=2', 'B. x=-2', 'C. x=0', 'D. x=1'], answer: 0, score: 3 },
          { id: 5, type: 'single_choice', question: '数轴上到原点距离为2的点有（  ）', options: ['A. 1个', 'B. 2个', 'C. 3个', 'D. 4个'], answer: 1, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2023年海淀区初二数学期中考试',
        gradeId: grade2[0].id,
        region: '海淀',
        examType: '期中',
        duration: 100,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '等腰三角形的对称轴有（  ）', options: ['A. 1条', 'B. 2条', 'C. 3条', 'D. 1条或3条'], answer: 3, score: 3 },
          { id: 2, type: 'single_choice', question: '一次函数y=2x的图象经过（  ）', options: ['A. (0,2)', 'B. (1,2)', 'C. (2,1)', 'D. (0,0)'], answer: 3, score: 3 },
          { id: 3, type: 'single_choice', question: '分式x/(x+1)的值是（  ）', options: ['A. x/(x+1)', 'B. 1', 'C. 0', 'D. 无法确定'], answer: 0, score: 3 },
          { id: 4, type: 'single_choice', question: '若a²+b²=0，则a和b（  ）', options: ['A. a=0', 'B. b=0', 'C. a=b=0', 'D. 无法确定'], answer: 2, score: 3 },
          { id: 5, type: 'single_choice', question: '直角三角形中，斜边为5，一直角边为3，则另一直角边为（  ）', options: ['A. 2', 'B. 4', 'C. 6', 'D. 8'], answer: 1, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2023年西城区初二数学期中考试',
        gradeId: grade2[0].id,
        region: '西城',
        examType: '期中',
        duration: 100,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '正方形的对称轴有（  ）', options: ['A. 2条', 'B. 3条', 'C. 4条', 'D. 8条'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '函数y=-2x中，y随x的增大而（  ）', options: ['A. 增大', 'B. 减小', 'C. 不变', 'D. 无法确定'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '分式1/x的值是（  ）', options: ['A. 1', 'B. x', 'C. 1/x', 'D. 0'], answer: 2, score: 3 },
          { id: 4, type: 'single_choice', question: '若a+b=0，则a和b（  ）', options: ['A. 互为相反数', 'B. 互为倒数', 'C. 都为0', 'D. 相等'], answer: 0, score: 3 },
          { id: 5, type: 'single_choice', question: '等腰直角三角形的底角是（  ）', options: ['A. 30°', 'B. 45°', 'C. 60°', 'D. 90°'], answer: 1, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2023年海淀区初三数学期中考试',
        gradeId: grade3[0].id,
        region: '海淀',
        examType: '期中',
        duration: 120,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '方程x²-9=0的解是（  ）', options: ['A. x=3', 'B. x=-3', 'C. x=±3', 'D. x=9'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '二次函数y=2x²的开口（  ）', options: ['A. 向上', 'B. 向下', 'C. 向左', 'D. 向右'], answer: 0, score: 3 },
          { id: 3, type: 'single_choice', question: '圆的周长公式是（  ）', options: ['A. C=πr', 'B. C=2πr', 'C. C=πr²', 'D. C=2πr²'], answer: 1, score: 3 },
          { id: 4, type: 'single_choice', question: 'tan45°的值是（  ）', options: ['A. 0', 'B. 1', 'C. √2', 'D. √3'], answer: 1, score: 3 },
          { id: 5, type: 'single_choice', question: '从3个红球和2个白球中任取一球，取到红球的概率是（  ）', options: ['A. 1/5', 'B. 2/5', 'C. 3/5', 'D. 2/3'], answer: 2, score: 3 },
        ],
        created_by: userId,
      },
      {
        title: '2023年西城区初三数学期中考试',
        gradeId: grade3[0].id,
        region: '西城',
        examType: '期中',
        duration: 120,
        totalScore: 100,
        questions: [
          { id: 1, type: 'single_choice', question: '方程x²-1=0的解是（  ）', options: ['A. x=1', 'B. x=-1', 'C. x=±1', 'D. x=0'], answer: 2, score: 3 },
          { id: 2, type: 'single_choice', question: '二次函数y=-2x²的开口（  ）', options: ['A. 向上', 'B. 向下', 'C. 向左', 'D. 向右'], answer: 1, score: 3 },
          { id: 3, type: 'single_choice', question: '圆的面积公式是（  ）', options: ['A. S=πr', 'B. S=2πr', 'C. S=πr²', 'D. S=2πr²'], answer: 2, score: 3 },
          { id: 4, type: 'single_choice', question: 'cot45°的值是（  ）', options: ['A. 0', 'B. 1', 'C. √2', 'D. √3'], answer: 1, score: 3 },
          { id: 5, type: 'single_choice', question: '掷硬币出现反面的概率是（  ）', options: ['A. 0', 'B. 1/2', 'C. 1', 'D. 无法确定'], answer: 1, score: 3 },
        ],
        created_by: userId,
      },
    ];

    // 合并所有试卷
    const allExams = [...exams2025, ...exams2024, ...exams2023];
    const insertedExams = [];

    for (const exam of allExams) {
      try {
        const { data } = await client.from('exam_papers').insert(exam).select().single();
        insertedExams.push(data);
      } catch (err) {
        console.log('试卷可能已存在，跳过:', exam.title);
      }
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
