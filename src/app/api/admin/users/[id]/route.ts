import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdmin } from "@/lib/auth";

const supabase = getSupabaseClient();

// PATCH 更新用户
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 验证管理员权限
    await verifyAdmin(request.headers.get("authorization"));

    const { error } = await supabase
      .from("app_users")
      .update({
        ...(body.status && { status: body.status }),
        ...(body.role && { role: body.role }),
      })
      .eq("id", id);

    if (error) {
      console.error("更新用户失败:", error);
      return NextResponse.json({ error: "更新用户失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "更新成功",
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "未授权" || error.message === "无效的token")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message === "权限不足") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("更新用户失败:", error);
    return NextResponse.json(
      { error: `更新用户失败: ${error}` },
      { status: 500 },
    );
  }
}

// DELETE 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 验证管理员权限
    await verifyAdmin(request.headers.get("authorization"));

    // 删除用户
    const { error } = await supabase.from("app_users").delete().eq("id", id);

    if (error) {
      console.error("删除用户失败:", error);
      return NextResponse.json({ error: "删除用户失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "未授权" || error.message === "无效的token")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message === "权限不足") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("删除用户失败:", error);
    return NextResponse.json(
      { error: `删除用户失败: ${error}` },
      { status: 500 },
    );
  }
}
