import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const supabase = getSupabaseClient();

// GET 获取学习统计数据
export async function GET(request: NextRequest) {
  try {
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

    // 获取用户基本信息
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("points, created_at")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("获取用户信息失败:", userError);
      return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
    }

    // 获取学习记录（视频学习时长）
    const { data: studyRecords, error: studyError } = await supabase
      .from("study_records")
      .select("watched_duration, created_at")
      .eq("user_id", user.id);

    // 获取考试记录
    const { data: examRecords, error: examError } = await supabase
      .from("exam_records")
      .select("score, total_score, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "completed");

    // 获取真题考试记录
    const { data: realExamRecords, error: realExamError } = await supabase
      .from("real_exam_records")
      .select("score, total_score, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "completed");

    // 获取错题统计
    const { data: wrongQuestions, error: wrongError } = await supabase
      .from("wrong_questions")
      .select("mastered, created_at")
      .eq("user_id", user.id);

    // 计算统计数据
    const totalStudyTime =
      studyRecords?.reduce((sum, r) => sum + (r.watched_duration || 0), 0) || 0;
    const studyTimeHours = Math.floor(totalStudyTime / 3600);
    const studyTimeMinutes = Math.floor((totalStudyTime % 3600) / 60);

    const examCount = (examRecords?.length || 0) + (realExamRecords?.length || 0);
    const avgScore =
      examCount > 0
        ? [
            ...(examRecords || []),
            ...(realExamRecords || []),
          ].reduce((sum, r) => sum + (r.score || 0), 0) / examCount
        : 0;

    const wrongCount = wrongQuestions?.length || 0;
    const masteredCount =
      wrongQuestions?.filter((q) => q.mastered).length || 0;

    // 计算最近7天的学习数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStudyRecords = studyRecords?.filter(
      (r) => new Date(r.created_at) >= sevenDaysAgo
    ) || [];
    const recentExamRecords = [
      ...(examRecords || []),
      ...(realExamRecords || []),
    ].filter((r) => new Date(r.created_at) >= sevenDaysAgo);

    // 按日期统计
    const dailyStats: Record<string, { studyTime: number; examCount: number }> = {};

    // 初始化最近7天
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyStats[dateStr] = { studyTime: 0, examCount: 0 };
    }

    // 统计每天的学习时间
    recentStudyRecords.forEach((r) => {
      const dateStr = new Date(r.created_at).toISOString().split("T")[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].studyTime += r.watched_duration || 0;
      }
    });

    // 统计每天的考试次数
    recentExamRecords.forEach((r) => {
      const dateStr = new Date(r.created_at).toISOString().split("T")[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].examCount += 1;
      }
    });

    // 转换为数组
    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      studyTime: Math.floor(stats.studyTime / 60), // 转换为分钟
      examCount: stats.examCount,
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          points: userData.points,
          totalStudyTime: `${studyTimeHours}小时${studyTimeMinutes}分钟`,
          examCount,
          avgScore: Math.round(avgScore),
          wrongCount,
          masteredCount,
          daysActive: Math.floor(
            (Date.now() - new Date(userData.created_at).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        },
        chartData,
        recentExams: [
          ...(examRecords || []).slice(0, 5),
          ...(realExamRecords || []).slice(0, 5),
        ]
          .sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 5),
        knowledgePoints: [], // 可以从错题或考试记录中提取
      },
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { error: `获取统计数据失败: ${error}` },
      { status: 500 },
    );
  }
}
