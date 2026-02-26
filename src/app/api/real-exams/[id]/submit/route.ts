import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { verifyUser } from "@/lib/auth";

const supabase = getSupabaseClient();

interface SubmitData {
  recordId: string;
  answers: Record<string, string>; // { questionId: answer }
}

// AI判卷和结果分析
async function gradeExam(
  userAnswers: Record<string, string>,
  questions: any[],
): Promise<{
  score: number;
  detailedResults: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    score: number;
    questionType: string;
    knowledgePoints: string[];
  }>;
  analysis: {
    summary: string;
    weakPoints: string[];
    suggestions: string[];
    strongPoints: string[];
  };
}> {
  const config = new Config();
  const client = new LLMClient(config);

  // 准备题目和答案数据
  const questionsData = questions.map((q) => ({
    id: q.id,
    questionNumber: q.question_number,
    questionType: q.question_type,
    content: q.content,
    options: q.options,
    answer: q.answer,
    score: q.score,
    knowledgePoints: q.knowledge_points,
  }));

  const systemPrompt = `你是一个专业的数学考试判卷老师，擅长批改初中数学试卷并给出学习建议。

请根据提供的题目、标准答案和用户答案，进行判卷和分析，并按照以下JSON格式返回：

{
  "detailedResults": [
    {
      "questionId": "题目ID",
      "userAnswer": "用户答案",
      "correctAnswer": "标准答案",
      "isCorrect": true/false,
      "score": 5,
      "questionType": "选择题",
      "knowledgePoints": ["有理数", "绝对值"]
    }
  ],
  "analysis": {
    "summary": "总体表现评价",
    "weakPoints": ["知识点1", "知识点2"],
    "suggestions": ["建议1", "建议2"],
    "strongPoints": ["优势1", "优势2"]
  }
}

判卷规则：
1. 选择题：答案完全匹配才算对，否则得0分
2. 填空题：根据答案的准确性给分，完全正确得满分，部分正确酌情给分
3. 解答题：根据解题步骤和最终答案综合评分，必要时给予部分分数
4. analysis.summary要给出总体评价，包括得分率、学习态度等
5. analysis.weakPoints要列出需要加强的知识点（至少2个）
6. analysis.suggestions要给出具体的学习建议（至少3条）
7. analysis.strongPoints要列出做得好的地方（至少1个）
8. 只返回JSON，不要有其他解释性文字`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `请批改以下数学试卷：

题目数据：
${JSON.stringify(questionsData, null, 2)}

用户答案：
${JSON.stringify(userAnswers, null, 2)}`,
    },
  ];

  try {
    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.3,
    });

    // 提取JSON部分
    const content = response.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("无法从LLM响应中提取JSON");
    }

    const result = JSON.parse(jsonMatch[0]);

    // 计算总分
    const totalScore = result.detailedResults.reduce(
      (sum: number, r: any) => sum + (r.score || 0),
      0,
    );

    return {
      score: totalScore,
      detailedResults: result.detailedResults,
      analysis: result.analysis,
    };
  } catch (error) {
    console.error("AI判卷错误:", error);
    throw new Error(`AI判卷失败: ${error}`);
  }
}

// POST提交答案并判卷
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { recordId, answers }: SubmitData = await request.json();

    // 验证用户身份
    const user = await verifyUser(request.headers.get("authorization"));
    const userId = user.userId;

    // 获取考试记录
    const { data: record, error: recordError } = await supabase
      .from("real_exam_records")
      .select("*")
      .eq("id", recordId)
      .eq("user_id", userId)
      .eq("exam_id", id)
      .eq("status", "in_progress")
      .single();

    if (recordError || !record) {
      return NextResponse.json(
        { error: "考试记录不存在或已完成" },
        { status: 404 },
      );
    }

    // 获取题目
    const { data: questions, error: questionsError } = await supabase
      .from("real_exam_questions")
      .select("*")
      .eq("exam_id", id)
      .order("question_number", { ascending: true });

    if (questionsError) {
      console.error("获取题目失败:", questionsError);
      return NextResponse.json({ error: "获取题目失败" }, { status: 500 });
    }

    // AI判卷
    console.log("开始AI判卷...");
    const gradeResult = await gradeExam(answers, questions);
    console.log("AI判卷完成，得分:", gradeResult.score);

    // 更新考试记录
    const { error: updateError } = await supabase
      .from("real_exam_records")
      .update({
        answers,
        score: gradeResult.score,
        status: "completed",
        completed_at: new Date().toISOString(),
        analysis: gradeResult.analysis,
      })
      .eq("id", recordId);

    if (updateError) {
      console.error("更新考试记录失败:", updateError);
      return NextResponse.json(
        { error: "更新考试记录失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        recordId,
        score: gradeResult.score,
        totalScore: record.total_score,
        detailedResults: gradeResult.detailedResults,
        analysis: gradeResult.analysis,
      },
    });
  } catch (error) {
    console.error("提交答案失败:", error);
    return NextResponse.json(
      { error: `提交答案失败: ${error}` },
      { status: 500 },
    );
  }
}
