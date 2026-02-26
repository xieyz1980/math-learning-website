import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdmin } from "@/lib/auth";

const supabase = getSupabaseClient();

// LLM 解析PDF试卷
async function parseExamFromPDF(
  pdfUrl: string,
  filename: string,
): Promise<{
  title: string;
  grade: string;
  region: string;
  semester: string;
  examType: string;
  year: number;
  duration: number;
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

  const systemPrompt = `你是数学试卷解析专家。从PDF试卷中提取信息，返回简洁JSON。格式：{"title":"试卷标题","grade":"初一","region":"海淀区","semester":"上学期","examType":"期中","year":2024,"duration":90,"questions":[{"question_number":1,"question_type":"选择题","content":"题干","options":{"A":"选项A","B":"选项B","C":"选项C","D":"选项D"},"answer":"A","score":5,"difficulty":"easy","knowledge_points":["有理数"]}],"total_score":100}。规则：grade=初一/初二/初三；question_type=选择题/填空题/解答题；difficulty=easy/medium/hard；无options填null；只返回JSON。`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `解析此试卷：${filename}，URL：${pdfUrl}`,
    },
  ];

  try {
    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.3,
    });

    let cleanedContent = response.content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // 提取JSON
    const start = cleanedContent.indexOf('{');
    const end = cleanedContent.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error("未找到JSON");
    }

    let jsonString = cleanedContent.substring(start, end + 1);

    // 尝试解析
    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (e) {
      // 尝试修复
      jsonString = jsonString
        .replace(/,\s*]/g, ']')
        .replace(/,\s*}/g, '}')
        .replace(/"}\s*{/g, '"},{')
        .replace(/"]\s*{/g, '"],{');
      result = JSON.parse(jsonString);
    }

    // 验证和补全
    result.title = result.title || filename.replace('.pdf', '');
    result.grade = result.grade || "初一";
    result.region = result.region || "未知";
    result.semester = result.semester || "上学期";
    result.examType = result.examType || "期中";
    result.year = result.year || new Date().getFullYear();
    result.duration = result.duration || 90;
    
    if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
      throw new Error("缺少题目");
    }

    result.totalScore = result.totalScore || result.questions.reduce((s, q) => s + (q.score || 0), 0);

    return result;
  } catch (error) {
    console.error("解析失败:", error);
    throw new Error(`解析失败: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request.headers.get("authorization"));

    const formData = await request.formData();
    const pdfFile = formData.get("pdfFile") as File | null;

    if (!pdfFile || pdfFile.type !== "application/pdf") {
      return NextResponse.json({ error: "请上传PDF" }, { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("上传PDF到对象存储...");

    const { S3Storage } = await import("coze-coding-dev-sdk");
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: "",
      secretKey: "",
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });

    const pdfKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: `real-exams/${pdfFile.name}_${Date.now()}.pdf`,
      contentType: "application/pdf",
    });

    console.log("PDF上传成功:", pdfKey);

    const pdfUrl = await storage.generatePresignedUrl({
      key: pdfKey,
      expireTime: 3600,
    });

    console.log("开始LLM解析...");

    const extractedData = await parseExamFromPDF(pdfUrl, pdfFile.name);
    console.log("解析完成:", {
      title: extractedData.title,
      questions: extractedData.questions.length,
    });

    const { data: grade } = await supabase
      .from("grades")
      .select("id")
      .eq("name", extractedData.grade)
      .limit(1)
      .single();

    if (!grade) {
      return NextResponse.json({ error: "年级不存在" }, { status: 400 });
    }

    const { data: exam } = await supabase
      .from("real_exams")
      .insert({
        title: extractedData.title,
        grade_id: grade.id,
        region: extractedData.region,
        semester: extractedData.semester,
        exam_type: extractedData.examType,
        year: extractedData.year,
        duration: extractedData.duration,
        total_score: extractedData.totalScore,
        question_count: extractedData.questions.length,
        uploaded_by: (await verifyAdmin(request.headers.get("authorization"))).userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

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

    await supabase.from("real_exam_questions").insert(questionsToInsert);

    return NextResponse.json({
      success: true,
      exam,
      questionCount: extractedData.questions.length,
    });
  } catch (error) {
    console.error("上传失败:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
