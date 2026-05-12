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

  const { data: studentTasks } = await supabase
    .from("student_tasks")
    .select("*, task:tasks(*)")
    .eq("student_id", user.id)
    .order("task_id", { ascending: true });

  return NextResponse.json({ tasks: studentTasks || [] });
}