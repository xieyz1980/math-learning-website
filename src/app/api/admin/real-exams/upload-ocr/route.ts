import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdmin } from "@/lib/auth";

const supabase = getSupabaseClient();

// LLM 解析OCR提取的试卷文本
async function parseExamFromOCRText(
  title: string,
  ocrText: string,
): Promise<{
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

  const systemPrompt = `你是一个专业的数学试卷解析专家，擅长从OCR识别的文本中提取完整的试卷信息。

请从提供的试卷文本中提取所有信息，并按照以下 JSON 格式返回：

{"title":"试卷标题","grade":"初一/初二/初三","region":"地区名称","semester":"上学期/下学期","examType":"期中/期末/模拟","year":2024,"duration":120,"questions":[{"question_number":1,"question_type":"选择题","content":"题目内容","options":{"A":"选项A","B":"选项B","C":"选项C","D":"选项D"},"answer":"A","score":5,"difficulty":"easy","knowledge_points":["有理数","绝对值"]}],"total_score":100}

注意事项：
1. title: 从文本中提取试卷标题，如果没有则使用提供的标题
2. grade: 只能是"初一"、"初二"或"初三"
3. region: 提取地区信息，如"海淀区"、"西城区"等，没有则填"未知"
4. semester: 只能是"上学期"或"下学期"
5. examType: 只能是"期中"、"期末"或"模拟"
6. year: 提取考试年份（4位数字），没有则填当前年份
7. duration: 提取考试时长（分钟），没有则填90
8. question_type 只能是：选择题、填空题、解答题
9. difficulty 只能是：easy、medium、hard
10. score 根据题目分值填写，如果没有则平均分配
11. knowledge_points 提取题目涉及的知识点（至少1个）
12. 对于选择题，options 是必需的
13. 对于填空题和解答题，options 为 null
14. answer 字段要包含完整的答案内容
15. 只返回 JSON，不要有其他解释性文字
16. 确保提取到所有题目，不要遗漏
17. **重要**：JSON必须格式正确，不要包含换行符或特殊字符
18. **重要**：content字段中的文本不要使用换行符，用空格代替`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `请解析以下数学试卷的OCR识别文本，提取试卷的所有信息（标题、年级、地区、学期、考试类型、年份、时长）以及所有题目信息。

试卷标题：${title}

试卷内容：
${ocrText}

请提取试卷的所有信息，并按照指定格式返回JSON数据。`,
    },
  ];

  try {
    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.3,
    });

    // 清理 JSON 字符串
    let cleanedContent = response.content;
    
    console.log("LLM原始内容长度:", cleanedContent.length);
    
    cleanedContent = cleanedContent
      // 移除markdown代码块标记
      .replace(/```json/g, '')
      .replace(/```/g, '')
      // 移除多余空白
      .replace(/\s+/g, ' ')
      // 修复常见的JSON格式问题
      .replace(/,\s*]/g, ']')
      .replace(/,\s*}/g, '}')
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
      
      let fixedJson = jsonString.replace(/"([^"]*)$/g, '"$1"');
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
    if (!result.grade || !result.region || !result.semester || !result.examType || !result.year || !result.duration) {
      // 设置默认值
      result.grade = result.grade || "初一";
      result.region = result.region || "未知";
      result.semester = result.semester || "上学期";
      result.examType = result.examType || "期中";
      result.year = result.year || new Date().getFullYear();
      result.duration = result.duration || 90;
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

// POST 上传OCR识别的文本
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const decoded = await verifyAdmin(request.headers.get("authorization"));

    const body = await request.json();
    const { title, ocrText } = body;

    // 验证参数
    if (!title || !ocrText) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    console.log("开始OCR解析，文本长度:", ocrText.length);

    // 使用 LLM 解析OCR文本
    const extractedData = await parseExamFromOCRText(title, ocrText);
    console.log("LLM 解析完成：", {
      title: title,
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
        title: title,
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
      { status: 500 }
    );
  }
}
