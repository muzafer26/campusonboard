import { NextRequest, NextResponse } from "next/server";
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
    .select("id, status, full_name, application_number, email, department, category, created_at, activated_at")
    .order("created_at", { ascending: false });

  // Get pending registrations count
  const { count: pendingCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_approval");

  // Get student tasks for progress calculation
  const { data: studentTasks } = await supabase
    .from("student_tasks")
    .select("student_id, status")
    .in("student_id", (students || []).map(s => s.id));

  // Calculate progress for each student
  const progressMap: Record<string, { approved: number; total: number }> = {};
  for (const task of studentTasks || []) {
    if (!progressMap[task.student_id]) {
      progressMap[task.student_id] = { approved: 0, total: 0 };
    }
    progressMap[task.student_id].total++;
    if (task.status === "approved" || task.status === "na") {
      progressMap[task.student_id].approved++;
    }
  }

  const studentsWithProgress = (students || []).map(student => {
    const progress = progressMap[student.id] || { approved: 0, total: 9 };
    const progressPercent = progress.total > 0 ? Math.round((progress.approved / progress.total) * 100) : 0;
    return {
      ...student,
      progress: progressPercent,
      approved_count: progress.approved,
      total_count: progress.total,
    };
  });

  // Calculate stats
  const totalStudents = studentsWithProgress.length;
  const fullyAdmitted = studentsWithProgress.filter(s => s.approved_count === 9 && s.status === "active").length;
  const inProgress = studentsWithProgress.filter(s => s.status === "active" && s.approved_count > 0 && s.approved_count < 9).length;
  const notStarted = studentsWithProgress.filter(s => s.status === "active" && s.approved_count === 0).length;

  return NextResponse.json({
    stats: {
      totalStudents,
      fullyAdmitted,
      inProgress,
      notStarted,
      pending_registrations: pendingCount || 0,
    },
    students: studentsWithProgress,
  });
}