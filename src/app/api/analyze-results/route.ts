import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { questions, userAnswers } = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 计算得分
    let correctCount = 0;
    const results = questions.map((q: any, index: number) => {
      const isCorrect = q.correctAnswer === userAnswers[index];
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[index],
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // 使用LLM生成分析报告
    const wrongQuestions = results.filter((r: any) => !r.isCorrect);

    let analysis = '';
    if (wrongQuestions.length > 0) {
      const wrongQuestionsText = wrongQuestions.map((r: any) => {
        return `题目：${r.question}\n正确答案：${r.correctAnswer}\n你的答案：${r.userAnswer}\n解析：${r.explanation}`;
      }).join('\n\n');

      const systemPrompt = `你是一个专业的初中数学辅导老师。请根据学生的错题情况，提供针对性的学习建议。
要求：
1. 分析错题的原因（是概念不清、计算错误、还是粗心大意）
2. 提供具体的改进建议
3. 鼓励学生继续努力
4. 语气要亲切友好，适合初中生阅读`;

      const userPrompt = `学生完成了考试，总分 ${score} 分（共 ${questions.length} 题，做对 ${correctCount} 题）。
以下是错题详情：

${wrongQuestionsText}

请给出详细的分析和学习建议。`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ];

      const response = await client.invoke(messages, {
        model: 'doubao-seed-2-0-pro-260215',
        temperature: 0.8,
      });

      analysis = response.content;
    } else {
      analysis = '太棒了！全部正确！你的基础非常扎实，继续保持这种学习态度！🎉';
    }

    return NextResponse.json({
      success: true,
      data: {
        score,
        correctCount,
        totalCount: questions.length,
        results,
        analysis,
      },
    });
  } catch (error) {
    console.error('分析结果失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '分析结果失败',
      },
      { status: 500 }
    );
  }
}
