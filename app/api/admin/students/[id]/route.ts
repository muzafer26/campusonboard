import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Get student details
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Get all tasks with master task info
  const { data: tasks } = await supabase
    .from("student_tasks")
    .select("*, task:tasks(*)")
    .eq("student_id", id)
    .order("task_id", { ascending: true });

  return NextResponse.json({
    student,
    tasks: tasks || [],
  });
}