import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Get all active students
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Get all student tasks
  const { data: studentTasks } = await supabase
    .from("student_tasks")
    .select("student_id, status, task_id");

  // Build progress data
  const progressMap: Record<string, { approved: number; submitted: number; pending: number; rejected: number; na: number }> = {};

  for (const task of studentTasks || []) {
    if (!progressMap[task.student_id]) {
      progressMap[task.student_id] = { approved: 0, submitted: 0, pending: 0, rejected: 0, na: 0 };
    }
    progressMap[task.student_id][task.status as keyof typeof progressMap[typeof task.student_id]]++;
  }

  const exportData = (students || []).map(student => {
    const progress = progressMap[student.id] || { approved: 0, submitted: 0, pending: 9, rejected: 0, na: 0 };
    return {
      "Application Number": student.application_number,
      "Full Name": student.full_name,
      "Email": student.email,
      "Mobile": student.mobile,
      "Department": student.department,
      "Category": student.category,
      "Status": student.status,
      "Approved Documents": progress.approved,
      "Submitted Documents": progress.submitted,
      "Pending Documents": progress.pending,
      "Rejected Documents": progress.rejected,
      "Not Applicable": progress.na,
      "Registration Date": student.created_at,
      "Activation Date": student.activated_at || "Not Activated",
    };
  });

  const csv = Papa.unparse(exportData);
  const filename = `campusonboard_export_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}