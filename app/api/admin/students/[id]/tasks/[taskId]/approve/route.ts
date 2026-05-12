import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from("student_tasks")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: null,
    })
    .eq("student_id", params.id)
    .eq("task_id", parseInt(params.taskId))
    .eq("status", "submitted");

  if (error) {
    console.error("Approve error:", error);
    return NextResponse.json(
      { error: "Failed to approve document" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Document approved",
  });
}