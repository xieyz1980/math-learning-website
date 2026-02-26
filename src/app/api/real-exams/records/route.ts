import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyUser } from "@/lib/auth";

const supabase = getSupabaseClient();

// GET获取用户的考试记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const examId = searchParams.get("examId");

    // 验证用户身份
    const user = await verifyUser(request.headers.get("authorization"));
    const currentUserId = user.userId;

    let query = supabase
      .from("real_exam_records")
      .select(`
        *,
        real_exams (*, grades (*))
      `)
      .eq("user_id", userId || currentUserId)
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
    if (error instanceof Error && (error.message === "未授权" || error.message === "无效的token")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("获取考试记录失败:", error);
    return NextResponse.json(
      { error: `获取考试记录失败: ${error}` },
      { status: 500 },
    );
  }
}
