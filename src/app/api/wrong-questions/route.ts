import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const supabase = getSupabaseClient();

// GET 获取错题列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mastered = searchParams.get("mastered");

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

    let query = supabase
      .from("wrong_questions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (mastered === "true") {
      query = query.eq("mastered", true);
    } else if (mastered === "false") {
      query = query.eq("mastered", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("获取错题列表失败:", error);
      return NextResponse.json({ error: "获取错题列表失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("获取错题列表失败:", error);
    return NextResponse.json(
      { error: `获取错题列表失败: ${error}` },
      { status: 500 },
    );
  }
}

// POST 添加错题
export async function POST(request: NextRequest) {
  try {
    const {
      questionId,
      questionType,
      questionContent,
      userAnswer,
      correctAnswer,
      score,
      questionSource,
      sourceId,
      recordId,
      knowledgePoints,
    } = await request.json();

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

    // 检查是否已存在该错题
    const { data: existing } = await supabase
      .from("wrong_questions")
      .select("*")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .maybeSingle();

    if (existing) {
      // 已存在，更新练习次数
      const { error: updateError } = await supabase
        .from("wrong_questions")
        .update({
          practice_count: existing.practice_count + 1,
          last_practiced_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("更新错题失败:", updateError);
        return NextResponse.json({ error: "更新错题失败" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: existing,
      });
    }

    // 不存在，创建新错题
    const { data, error } = await supabase
      .from("wrong_questions")
      .insert({
        user_id: user.id,
        question_id: questionId,
        question_type: questionType,
        question_content: questionContent,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        score,
        question_source: questionSource,
        source_id: sourceId,
        record_id: recordId,
        knowledge_points: knowledgePoints,
      })
      .select()
      .single();

    if (error) {
      console.error("添加错题失败:", error);
      return NextResponse.json({ error: "添加错题失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("添加错题失败:", error);
    return NextResponse.json(
      { error: `添加错题失败: ${error}` },
      { status: 500 },
    );
  }
}
