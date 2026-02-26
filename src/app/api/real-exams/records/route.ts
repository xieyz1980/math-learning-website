import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const supabase = getSupabaseClient();

// GET获取用户的考试记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const examId = searchParams.get("examId");

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
      .from("real_exam_records")
      .select(`
        *,
        real_exams (*, grades (*))
      `)
      .eq("user_id", userId || user.id)
      .order("created_at", { ascending: false });

    if (examId) {
      query = query.eq("exam_id", examId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("获取考试记录失败:", error);
      return NextResponse.json({ error: "获取考试记录失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("获取考试记录失败:", error);
    return NextResponse.json(
      { error: `获取考试记录失败: ${error}` },
      { status: 500 },
    );
  }
}
