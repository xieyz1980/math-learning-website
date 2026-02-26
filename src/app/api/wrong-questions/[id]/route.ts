import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

const supabase = getSupabaseClient();

// PATCH 更新错题（标记已掌握、添加笔记等）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

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

    const { error } = await supabase
      .from("wrong_questions")
      .update({
        ...(body.mastered !== undefined && { mastered: body.mastered }),
        ...(body.note !== undefined && { note: body.note }),
        ...(body.practice_count !== undefined && {
          practice_count: body.practice_count,
        }),
        ...(body.last_practiced_at !== undefined && {
          last_practiced_at: body.last_practiced_at,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("更新错题失败:", error);
      return NextResponse.json({ error: "更新错题失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新错题失败:", error);
    return NextResponse.json(
      { error: `更新错题失败: ${error}` },
      { status: 500 },
    );
  }
}

// DELETE 删除错题
export async function DELETE(
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

    const { error } = await supabase
      .from("wrong_questions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("删除错题失败:", error);
      return NextResponse.json({ error: "删除错题失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除错题失败:", error);
    return NextResponse.json(
      { error: `删除错题失败: ${error}` },
      { status: 500 },
    );
  }
}
