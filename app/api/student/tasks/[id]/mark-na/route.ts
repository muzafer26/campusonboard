import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const user = await getSessionFromRequest(req);
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(id);
    const supabase = getServiceClient();

    // Get task to check if it's optional (caste certificate)
    const { data: studentTask } = await supabase
      .from("student_tasks")
      .select("*, task:tasks(*)")
      .eq("student_id", user.id)
      .eq("task_id", taskId)
      .maybeSingle();

    if (!studentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!studentTask.task?.is_optional) {
      return NextResponse.json(
        { error: "This task cannot be marked as Not Applicable" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const isUndo = body.undo === true;

    const newStatus = isUndo ? "pending" : "na";

    const { error: updateError } = await supabase
      .from("student_tasks")
      .update({
        status: newStatus,
        is_na: !isUndo,
        file_path: null,
        original_filename: null,
        file_size_bytes: null,
        submitted_at: null,
        reviewed_at: null,
        rejection_reason: null,
      })
      .eq("student_id", user.id)
      .eq("task_id", taskId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update task status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: newStatus,
      message: isUndo ? "Task reset to pending" : "Task marked as Not Applicable",
    });
  } catch (error) {
    console.error("Mark NA error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}