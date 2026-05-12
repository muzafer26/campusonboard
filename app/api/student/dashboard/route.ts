import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Get student details
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Get all tasks with their master task info
  const { data: studentTasks } = await supabase
    .from("student_tasks")
    .select("*, task:tasks(*)")
    .eq("student_id", user.id)
    .order("task_id", { ascending: true });

  const tasks = studentTasks || [];

  // Calculate statistics
  const total = tasks.length;
  const approved = tasks.filter((t) => t.status === "approved" || t.status === "na").length;
  const submitted = tasks.filter((t) => t.status === "submitted").length;
  const rejected = tasks.filter((t) => t.status === "rejected").length;
  const pending = tasks.filter((t) => t.status === "pending").length;

  const progress_pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  return NextResponse.json({
    student,
    tasks,
    counts: { total, approved, submitted, rejected, pending },
    progress: progress_pct,
  });
}