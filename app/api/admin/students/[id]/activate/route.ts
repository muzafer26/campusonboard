import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Check if student exists and is pending
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", params.id)
    .eq("status", "pending_approval")
    .maybeSingle();

  if (!student) {
    return NextResponse.json(
      { error: "Student not found or already activated" },
      { status: 404 }
    );
  }

  // Activate student
  const { error: updateError } = await supabase
    .from("students")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", params.id);

  if (updateError) {
    console.error("Activation error:", updateError);
    return NextResponse.json(
      { error: "Failed to activate student" },
      { status: 500 }
    );
  }

  // Create 9 student_task rows (skip if already exist)
  const { data: existingTasks } = await supabase
    .from("student_tasks")
    .select("id")
    .eq("student_id", params.id);

  if (!existingTasks || existingTasks.length === 0) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id")
      .order("id", { ascending: true });

    if (tasks && tasks.length > 0) {
      const studentTasks = tasks.map((task) => ({
        student_id: params.id,
        task_id: task.id,
        status: "pending",
      }));

      const { error: tasksError } = await supabase
        .from("student_tasks")
        .insert(studentTasks);

      if (tasksError) {
        console.error("Error creating student tasks:", tasksError);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Student activated successfully",
  });
}