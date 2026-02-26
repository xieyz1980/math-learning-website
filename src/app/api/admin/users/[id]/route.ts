import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

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
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user || user.email !== "xieyouzehpu@outlook.com") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const { error } = await supabase
      .from("users")
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user || user.email !== "xieyouzehpu@outlook.com") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    // 删除用户
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("删除用户失败:", error);
      return NextResponse.json({ error: "删除用户失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除用户失败:", error);
    return NextResponse.json(
      { error: `删除用户失败: ${error}` },
      { status: 500 },
    );
  }
}
