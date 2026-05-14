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
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = rejectSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from("students")
    .update({
      status: "rejected",
      rejection_reason: result.data.reason,
    })
    .eq("id", id)
    .eq("status", "pending_approval");

  if (error) {
    console.error("Rejection error:", error);
    return NextResponse.json(
      { error: "Failed to reject registration" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Registration rejected",
  });
}