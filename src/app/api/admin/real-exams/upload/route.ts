import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdmin } from "@/lib/auth";

const supabase = getSupabaseClient();

// LLM 提取试卷所有信息（包括元数据和题目）
async function extractExamFromPDF(
  pdfUrl: string,
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

  const systemPrompt = `你是一个专业的数学试卷解析专家，擅长从数学试卷中提取完整信息。

请从提供的 PDF 试卷中提取所有信息，并按照以下 JSON 格式返回：

{"title":"试卷标题","grade":"初一/初二/初三","region":"地区名称","semester":"上学期/下学期","examType":"期中/期末/模拟","year":2024,"duration":120,"questions":[{"question_number":1,"question_type":"选择题","content":"题目内容（包括题干）","options":{"A":"选项A内容","B":"选项B内容","C":"选项C内容","D":"选项D内容"},"answer":"A","score":5,"difficulty":"easy","knowledge_points":["有理数","绝对值"]}],"total_score":100}

注意事项：
1. title: 提取试卷的完整标题
2. grade: 只能是"初一"、"初二"或"初三"
3. region: 提取地区信息，如"海淀区"、"西城区"等
4. semester: 只能是"上学期"或"下学期"
5. examType: 只能是"期中"、"期末"或"模拟"
6. year: 提取考试年份（4位数字）
7. duration: 提取考试时长（分钟）
8. question_type 只能是：选择题、填空题、解答题
9. difficulty 只能是：easy、medium、hard
10. score 要根据题目实际分值填写
11. knowledge_points 要提取题目涉及的知识点（至少1个）
12. 对于选择题，options 是必需的
13. 对于填空题和解答题，options 为 null
14. answer 字段要包含完整的答案内容
15. 只返回 JSON，不要有其他解释性文字
16. 确保提取到所有信息，不要遗漏
17. **重要**：JSON必须格式正确，不要包含换行符或特殊字符
18. **重要**：content字段中的文本不要使用换行符，用空格代替
19. **重要**：确保所有字符串都用双引号括起来
20. **重要**：确保数组元素之间有逗号分隔`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `请解析以下数学试卷（PDF文件），提取试卷的所有信息（标题、年级、地区、学期、考试类型、年份、时长）以及所有题目信息。

试卷文件地址：${pdfUrl}`,
    },
  ];

  try {
    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.3,
    });

    // 清理 JSON 字符串
    let cleanedContent = response.content;
    
    // 打印原始内容用于调试
    console.log("LLM原始内容长度:", cleanedContent.length);
    console.log("LLM原始内容(前500字符):", cleanedContent.substring(0, 500));
    console.log("LLM原始内容(后500字符):", cleanedContent.substring(Math.max(0, cleanedContent.length - 500)));
    
    cleanedContent = cleanedContent
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

    // 验证必填字段
    if (!result.title || !result.grade || !result.region || !result.semester || !result.examType || !result.year || !result.duration) {
      throw new Error("缺少必填字段");
    }

    // 验证题目数据
    if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
      throw new Error("缺少题目数据");
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

    console.log("PDF 上传成功，key:", pdfKey);

    // 生成 PDF 的访问 URL
    const pdfUrl = await storage.generatePresignedUrl({
      key: pdfKey,
      expireTime: 3600, // 1 小时有效期
    });

    console.log("PDF URL 生成成功，开始 LLM 解析...");

    // 使用 LLM 提取试卷所有信息
    const extractedData = await extractExamFromPDF(pdfUrl);
    console.log("LLM 解析完成：", {
      title: extractedData.title,
      grade: extractedData.grade,
      questions: extractedData.questions.length,
      totalScore: extractedData.totalScore,
    });

    // 获取年级 ID
    const { data: grade } = await supabase
      .from("grades")
      .select("id")
      .eq("name", extractedData.grade)
      .limit(1)
      .single();

    if (!grade) {
      return NextResponse.json({ error: `找不到年级：${extractedData.grade}` }, { status: 400 });
    }

    // 创建真题记录
    const { data: exam, error: examError } = await supabase
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
