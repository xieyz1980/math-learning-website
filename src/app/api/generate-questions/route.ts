import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, questionCount } = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一个专业的初中数学出题老师。你需要根据给定的主题和难度，生成选择题。
请严格按照以下JSON格式输出，不要添加任何其他内容：

{
  "questions": [
    {
      "id": 1,
      "question": "题目内容",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      "correctAnswer": "A",
      "explanation": "题目解析"
    }
  ]
}

要求：
1. 题目要符合初中数学课程标准
2. 难度要适中，避免过于简单或过难
3. 选项要合理，不能有明显的错误选项
4. 每道题都要提供详细的解析
5. 严格按照JSON格式输出，不要有多余的文字`;

    const userPrompt = `请生成 ${questionCount || 5} 道关于"${topic}"的${difficulty || '中等'}难度选择题。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.7,
    });

    // 提取JSON内容
    let jsonContent = response.content;
    // 尝试找到JSON部分
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const questionsData = JSON.parse(jsonContent);

    return NextResponse.json({
      success: true,
      data: questionsData,
    });
  } catch (error) {
    console.error('生成题目失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成题目失败',
      },
      { status: 500 }
    );
  }
}
