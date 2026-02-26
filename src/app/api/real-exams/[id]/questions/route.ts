import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const supabase = getSupabaseClient();

// GET获取题目列表（带答案）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 验证用户身份
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "用户未登录" }, { status: 401 });
    }

    // 检查是否已完成考试
    const { data: record, error: recordError } = await supabase
      .from("real_exam_records")
      .select("*")
      .eq("exam_id", id)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .maybeSingle();

    if (recordError && recordError.code !== "PGRST116") {
      console.error("检查考试记录失败:", recordError);
      return NextResponse.json(
        { error: "检查考试记录失败" },
        { status: 500 },
      );
    }

    // 只有管理员或已完成考试的用户才能查看答案
    const isAdmin = user.email === "xieyouzehpu@outlook.com";

    if (!isAdmin && !record) {
      return NextResponse.json(
        { error: "请先完成考试才能查看答案" },
        { status: 403 },
      );
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

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("获取题目列表失败:", error);
    return NextResponse.json(
      { error: `获取题目列表失败: ${error}` },
      { status: 500 },
    );
  }
}
