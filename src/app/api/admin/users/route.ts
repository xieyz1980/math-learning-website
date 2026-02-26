import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdmin } from "@/lib/auth";

const supabase = getSupabaseClient();

// GET 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    await verifyAdmin(request.headers.get("authorization"));

    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("获取用户列表失败:", error);
      return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "未授权" || error.message === "无效的token")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message === "权限不足") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { error: `获取用户列表失败: ${error}` },
      { status: 500 },
    );
  }
}
