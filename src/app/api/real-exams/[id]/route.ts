import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const supabase = getSupabaseClient();

// GET获取真题详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 获取真题基本信息
    const { data: exam, error: examError } = await supabase
      .from("real_exams")
      .select(`
        *,
        grades (*)
      `)
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "真题不存在" }, { status: 404 });
    }

    // 获取题目列表
    const { data: questions, error: questionsError } = await supabase
      .from("real_exam_questions")
      .select("*")
      .eq("exam_id", id)
      .order("question_number", { ascending: true });

    if (questionsError) {
      console.error("获取题目列表失败:", questionsError);
      return NextResponse.json(
        { error: "获取题目列表失败" },
        { status: 500 },
      );
    }

    // 隐藏答案（用户查看详情时）
    const questionsWithoutAnswer = questions.map((q: any) => ({
      ...q,
      answer: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...exam,
        questions: questionsWithoutAnswer,
      },
    });
  } catch (error) {
    console.error("获取真题详情失败:", error);
    return NextResponse.json(
      { error: `获取真题详情失败: ${error}` },
      { status: 500 },
    );
  }
}
