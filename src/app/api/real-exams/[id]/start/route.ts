import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyUser } from "@/lib/auth";

const supabase = getSupabaseClient();

// POST开始考试
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 验证用户身份
    const user = await verifyUser(request.headers.get("authorization"));
    const userId = user.userId;

    // 检查是否有正在进行的考试
    const { data: existingRecord, error: checkError } = await supabase
      .from("real_exam_records")
      .select("*")
      .eq("user_id", userId)
      .eq("exam_id", id)
      .eq("status", "in_progress")
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("检查考试记录失败:", checkError);
      return NextResponse.json(
        { error: "检查考试记录失败" },
        { status: 500 },
      );
    }

    if (existingRecord) {
      // 返回正在进行的考试
      return NextResponse.json({
        success: true,
        data: existingRecord,
      });
    }

    // 获取真题信息
    const { data: exam, error: examError } = await supabase
      .from("real_exams")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: "真题不存在" }, { status: 404 });
    }

    // 检查用户积分是否足够
    console.log("查询用户积分，userId:", userId);
    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("points")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("查询用户积分失败:", userError);
      return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
    }

    if (!userData) {
      console.error("用户数据不存在，userId:", userId);
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (userData.points < 50) {
      return NextResponse.json(
        { error: "积分不足，需要50积分" },
        { status: 400 },
      );
    }

    // 扣除积分
    const { error: pointsError } = await supabase
      .from("app_users")
      .update({ points: userData.points - 50 })
      .eq("id", userId);

    if (pointsError) {
      console.error("扣除积分失败:", pointsError);
      return NextResponse.json({ error: "扣除积分失败" }, { status: 500 });
    }

    // 创建考试记录
    const { data: record, error: recordError } = await supabase
      .from("real_exam_records")
      .insert({
        user_id: userId,
        exam_id: id,
        answers: {},
        status: "in_progress",
        started_at: new Date().toISOString(),
        total_score: exam.total_score,
      })
      .select()
      .single();

    if (recordError) {
      console.error("创建考试记录失败:", recordError);
      // 回滚积分
      await supabase
        .from("app_users")
        .update({ points: userData.points })
        .eq("id", userId);
      return NextResponse.json({ error: "创建考试记录失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...record,
        exam_duration: exam.duration,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "未授权" || error.message === "无效的token")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("开始考试失败:", error);
    return NextResponse.json({ error: `开始考试失败: ${error}` }, { status: 500 });
  }
}
