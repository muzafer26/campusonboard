import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { z } from "zod";

export const runtime = "nodejs";

const rejectSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = rejectSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || "Rejection reason is required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from("student_tasks")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: result.data.reason,
    })
    .eq("student_id", params.id)
    .eq("task_id", parseInt(params.taskId))
    .eq("status", "submitted");

  if (error) {
    console.error("Reject error:", error);
    return NextResponse.json(
      { error: "Failed to reject document" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Document rejected",
    reason: result.data.reason,
  });
}