import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST开始考试
export async function POST(
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

    // 检查是否有正在进行的考试
    const { data: existingRecord, error: checkError } = await supabase
      .from("real_exam_records")
      .select("*")
      .eq("user_id", user.id)
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
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("points")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
    }

    if (userData.points < 50) {
      return NextResponse.json(
        { error: "积分不足，需要50积分" },
        { status: 400 },
      );
    }

    // 扣除积分
    const { error: pointsError } = await supabase
      .from("users")
      .update({ points: userData.points - 50 })
      .eq("id", user.id);

    if (pointsError) {
      console.error("扣除积分失败:", pointsError);
      return NextResponse.json({ error: "扣除积分失败" }, { status: 500 });
    }

    // 创建考试记录
    const { data: record, error: recordError } = await supabase
      .from("real_exam_records")
      .insert({
        user_id: user.id,
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
        .from("users")
        .update({ points: userData.points })
        .eq("id", user.id);
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
    console.error("开始考试失败:", error);
    return NextResponse.json({ error: `开始考试失败: ${error}` }, { status: 500 });
  }
}
