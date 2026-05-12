import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const taskId = parseInt(params.id);
  const supabase = getServiceClient();

  const { data: studentTask } = await supabase
    .from("student_tasks")
    .select("*, task:tasks(*)")
    .eq("student_id", user.id)
    .eq("task_id", taskId)
    .maybeSingle();

  if (!studentTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task: studentTask });
}