import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET获取真题列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gradeId = searchParams.get("gradeId");
    const region = searchParams.get("region");
    const examType = searchParams.get("examType");
    const year = searchParams.get("year");

    let query = supabase
      .from("real_exams")
      .select(`
        *,
        grades (*),
        questions:real_exam_questions(count)
      `)
      .eq("status", "active")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });

    // 添加筛选条件
    if (gradeId) {
      query = query.eq("grade_id", gradeId);
    }
    if (region) {
      query = query.ilike("region", `%${region}%`);
    }
    if (examType) {
      query = query.eq("exam_type", examType);
    }
    if (year) {
      query = query.eq("year", parseInt(year));
    }

    const { data, error } = await query;

    if (error) {
      console.error("获取真题列表失败:", error);
      return NextResponse.json(
        { error: "获取真题列表失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data.map((exam: any) => ({
        ...exam,
        question_count: exam.questions?.[0]?.count || 0,
      })),
    });
  } catch (error) {
    console.error("获取真题列表失败:", error);
    return NextResponse.json(
      { error: `获取真题列表失败: ${error}` },
      { status: 500 },
    );
  }
}
