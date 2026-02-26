import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DELETE 删除真题
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
    console.error("删除真题失败:", error);
    return NextResponse.json(
      { error: `删除真题失败: ${error}` },
      { status: 500 },
    );
  }
}
