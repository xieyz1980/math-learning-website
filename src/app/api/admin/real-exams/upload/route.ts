import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { S3Storage } from "coze-coding-dev-sdk";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdmin } from "@/lib/auth";

const supabase = getSupabaseClient();

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

// 使用 LLM 处理 PDF 并提取题目
async function extractQuestionsFromPDF(
  pdfUrl: string,
  title: string,
): Promise<{
  questions: Array<{
    question_number: number;
    question_type: string;
    content: string;
    options?: any;
    answer: string;
    score: number;
    difficulty: string;
    knowledge_points: string[];
  }>;
  totalScore: number;
}> {
  const config = new Config();
  const client = new LLMClient(config);

  const systemPrompt = `你是一个专业的数学试卷解析专家，擅长从数学试卷中提取题目信息。

请从提供的 PDF 试卷中提取所有题目，并按照以下 JSON 格式返回：

{
  "questions": [
    {
      "question_number": 1,
      "question_type": "选择题",
      "content": "题目内容（包括题干）",
      "options": {
        "A": "选项A内容",
        "B": "选项B内容",
        "C": "选项C内容",
        "D": "选项D内容"
      },
      "answer": "A",
      "score": 5,
      "difficulty": "easy",
      "knowledge_points": ["有理数", "绝对值"]
    }
  ],
  "total_score": 100
}

注意事项：
1. question_type 只能是：选择题、填空题、解答题
2. difficulty 只能是：easy、medium、hard
3. score 要根据题目实际分值填写
4. knowledge_points 要提取题目涉及的知识点（至少1个）
5. 对于选择题，options 是必需的
6. 对于填空题和解答题，options 为 null
7. answer 字段要包含完整的答案内容
8. 只返回 JSON，不要有其他解释性文字
9. 确保提取到所有题目，不要遗漏`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `请解析以下数学试卷（PDF文件）：\n\n试卷标题：${title}\n\n试卷文件地址：${pdfUrl}\n\n请从该 PDF 文件中提取所有题目信息。`,
    },
  ];

  try {
    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.3,
    });

    // 提取 JSON 部分
    const content = response.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("无法从 LLM 响应中提取 JSON");
    }

    const result = JSON.parse(jsonMatch[0]);

    // 验证数据格式
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("解析结果格式错误：缺少 questions 数组");
    }

    // 计算总分（如果 LLM 没有提供）
    if (!result.totalScore || result.totalScore === 0) {
      result.totalScore = result.questions.reduce(
        (sum: number, q: any) => sum + (q.score || 0),
        0,
      );
    }

    return result;
  } catch (error) {
    console.error("LLM 解析错误:", error);
    throw new Error(`解析试卷失败: ${error}`);
  }
}

// POST 上传真题
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const decoded = await verifyAdmin(request.headers.get("authorization"));

    const formData = await request.formData();
    const pdfFile = formData.get("pdfFile") as File | null;
    const title = formData.get("title") as string;
    const gradeId = formData.get("gradeId") as string;
    const region = formData.get("region") as string;
    const semester = formData.get("semester") as string;
    const examType = formData.get("examType") as string;
    const year = parseInt(formData.get("year") as string);
    const duration = parseInt(formData.get("duration") as string);

    // 验证必填字段
    if (!title || !gradeId || !region || !semester || !examType || !year || !duration) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    // 必须提供文件
    if (!pdfFile) {
      return NextResponse.json({ error: "请上传 PDF 文件" }, { status: 400 });
    }

    // 检查文件类型
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json({ error: "只支持 PDF 文件" }, { status: 400 });
    }

    // 读取文件内容
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("开始上传 PDF 到对象存储...");
    // 上传 PDF 到对象存储
    const pdfKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: `real-exams/${title}_${Date.now()}.pdf`,
      contentType: "application/pdf",
    });

    console.log("PDF 上传成功，key:", pdfKey);

    // 生成 PDF 的访问 URL
    const pdfUrl = await storage.generatePresignedUrl({
      key: pdfKey,
      expireTime: 3600, // 1 小时有效期
    });

    console.log("PDF URL 生成成功:", pdfUrl);

    // 使用 LLM 提取题目
    console.log("开始 LLM 解析题目...");
    const extractedData = await extractQuestionsFromPDF(pdfUrl, title);
    console.log("LLM 解析完成，提取题目数量:", extractedData.questions.length);

    // 创建真题记录
    const { data: exam, error: examError } = await supabase
      .from("real_exams")
      .insert({
        title,
        grade_id: gradeId,
        region,
        semester,
        exam_type: examType,
        year,
        duration,
        total_score: extractedData.totalScore,
        question_count: extractedData.questions.length,
        uploaded_by: decoded.userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (examError) {
      console.error("创建真题记录失败:", examError);
      return NextResponse.json({ error: "创建真题记录失败" }, { status: 500 });
    }

    // 批量插入题目
    const questionsToInsert = extractedData.questions.map((q) => ({
      exam_id: exam.id,
      question_number: q.question_number,
      question_type: q.question_type,
      content: q.content,
      options: q.options || null,
      answer: q.answer,
      score: q.score,
      difficulty: q.difficulty,
      knowledge_points: q.knowledge_points,
    }));

    const { error: questionsError } = await supabase
      .from("real_exam_questions")
      .insert(questionsToInsert);

    if (questionsError) {
      console.error("插入题目失败:", questionsError);
      // 回滚：删除真题记录
      await supabase.from("real_exams").delete().eq("id", exam.id);
      return NextResponse.json({ error: "插入题目失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      exam,
      questionCount: extractedData.questions.length,
      totalScore: extractedData.totalScore,
    });
  } catch (error) {
    console.error("上传真题失败:", error);
    return NextResponse.json(
      { error: `上传真题失败: ${error}` },
      { status: 500 },
    );
  }
}
