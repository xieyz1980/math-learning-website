import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { verifyAdmin } from "@/lib/auth";

const supabase = getSupabaseClient();

// DELETE 删除真题
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 验证管理员权限
    await verifyAdmin(request.headers.get("authorization"));

    // 先删除考试记录
    const { error: recordsError } = await supabase
      .from("real_exam_records")
      .delete()
      .eq("exam_id", id);

    if (recordsError) {
      console.error("删除考试记录失败:", recordsError);
      return NextResponse.json(
        { error: "删除考试记录失败" },
        { status: 500 },
      );
    }

    // 再删除题目
    const { error: questionsError } = await supabase
      .from("real_exam_questions")
      .delete()
      .eq("exam_id", id);

    if (questionsError) {
      console.error("删除题目失败:", questionsError);
      return NextResponse.json({ error: "删除题目失败" }, { status: 500 });
    }

    // 最后删除真题
    const { error: examError } = await supabase
      .from("real_exams")
      .delete()
      .eq("id", id);

    if (examError) {
      console.error("删除真题失败:", examError);
      return NextResponse.json({ error: "删除真题失败" }, { status: 500 });
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
    console.error("删除真题失败:", error);
    return NextResponse.json(
      { error: `删除真题失败: ${error}` },
      { status: 500 },
    );
  }
}
