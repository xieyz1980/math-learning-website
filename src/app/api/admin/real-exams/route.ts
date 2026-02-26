import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const supabase = getSupabaseClient();

// GET /api/admin/real-exams - 获取所有真题列表
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const user = await verifyAdmin(authHeader);
    if (!user) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const { data: exams, error } = await supabase
      .from("real_exams")
      .select(`
        *,
        grades:grade_id (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("获取真题列表失败:", error);
      return NextResponse.json({ error: "获取真题列表失败" }, { status: 500 });
    }

    return NextResponse.json({ exams: exams || [] });
  } catch (error) {
    console.error("获取真题列表错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
