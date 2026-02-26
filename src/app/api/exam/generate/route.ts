import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdmin } from '@/lib/auth';

const supabase = getSupabaseClient();

// LLM 生成考试题目
async function generateExamQuestions(
  topic: string,
  difficulty: string,
  questionCount: number,
): Promise<{
  questions: Array<{
    type: 'single_choice' | 'multiple_choice' | 'true_false';
    question: string;
    options: string[];
    answer: number | number[];
    score: number;
    explanation: string;
  }>;
}> {
  const config = new Config();
  const client = new LLMClient(config);

  const systemPrompt = `你是一个专业的初中数学考试出题专家。请根据用户提供的主题、难度和题目数量，生成数学选择题。

要求：
1. 题目必须符合初中数学水平
2. 题目难度要与用户指定的难度一致
3. 题目内容必须与指定主题相关
4. 每道题包含题目、选项、答案、分值和解析
5. 答案必须是选项的索引（0-3，表示A-D）
6. 分值要合理分配（总分100分）
7. 解析要清晰易懂
8. 题目要原创，避免与常见试题重复
9. **重要**：JSON必须格式正确，不要包含换行符或特殊字符
10. **重要**：question和explanation字段中的文本不要使用换行符，用空格代替

题目类型：
- single_choice：单选题
- multiple_choice：多选题（可选）
- true_false：判断题

难度定义：
- easy：基础题，主要考察基本概念和简单计算
- medium：中等题，需要一定的理解和应用能力
- hard：难题，需要较强的综合运用能力

请严格按照以下 JSON 格式返回，不要有其他内容：
{"questions":[{"type":"single_choice","question":"题目内容","options":["选项A","选项B","选项C","选项D"],"answer":0,"score":20,"explanation":"解题思路和答案解析"}]}`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `请生成一套初中数学试卷，具体要求如下：
- 考试主题：${topic}
- 难度等级：${difficulty}
- 题目数量：${questionCount}题
- 总分：100分

请生成符合要求的题目，并按照指定格式返回JSON数据。`,
    },
  ];

  try {
    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.7,
    });

    // 清理 JSON 字符串
    let cleanedContent = content
      // 移除markdown代码块标记
      .replace(/```json/g, '')
      .replace(/```/g, '')
      // 移除多余空白
      .replace(/\s+/g, ' ')
      // 修复常见的JSON格式问题
      .replace(/,\s*]/g, ']')  // 移除数组末尾的逗号
      .replace(/,\s*}/g, '}')  // 移除对象末尾的逗号
      // 处理换行符
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ');

    // 尝试提取JSON对象
    const start = cleanedContent.indexOf('{');
    const end = cleanedContent.lastIndexOf('}');
    
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("无法从 LLM 响应中提取 JSON");
    }

    const jsonString = cleanedContent.substring(start, end + 1);

    // 尝试解析，如果失败则尝试修复
    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON解析失败，尝试修复:", parseError);
      
      // 尝试修复：移除未闭合的引号
      let fixedJson = jsonString.replace(/"([^"]*)$/g, '"$1"');
      
      // 尝试修复：修复缺失的逗号
      fixedJson = fixedJson.replace(/"}\s*{/g, '"},{');
      fixedJson = fixedJson.replace(/"]\s*{/g, '"],{');
      
      try {
        result = JSON.parse(fixedJson);
      } catch (secondError) {
        console.error("JSON修复失败:", secondError);
        throw new Error(`JSON解析错误: ${parseError}`);
      }
    }

    // 验证数据
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("缺少题目数据");
    }

    if (result.questions.length !== parseInt(questionCount.toString())) {
      console.warn(`生成的题目数量(${result.questions.length})与要求(${questionCount})不符`);
    }

    // 确保总分接近100分
    const totalScore = result.questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0);
    if (totalScore !== 100) {
      // 调整分值
      const avgScore = Math.floor(100 / result.questions.length);
      let remainingScore = 100;
      result.questions.forEach((q: any, index: number) => {
        if (index === result.questions.length - 1) {
          q.score = remainingScore; // 最后一题补齐剩余分值
        } else {
          q.score = avgScore;
          remainingScore -= avgScore;
        }
      });
    }

    return result;
  } catch (error) {
    console.error("LLM 生成题目失败:", error);
    throw new Error(`生成题目失败: ${error}`);
  }
}

// POST 生成考试题目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty, questionCount } = body;

    // 验证参数
    if (!topic || !difficulty || !questionCount) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证难度
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: '难度等级无效' },
        { status: 400 }
      );
    }

    // 验证题目数量
    const count = parseInt(questionCount.toString());
    if (isNaN(count) || count < 1 || count > 20) {
      return NextResponse.json(
        { success: false, error: '题目数量必须在1-20之间' },
        { status: 400 }
      );
    }

    // 生成题目
    const result = await generateExamQuestions(topic, difficulty, count);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("生成考试题目失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成题目失败',
      },
      { status: 500 }
    );
  }
}
