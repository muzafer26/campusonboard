import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const filterStatus = searchParams.get("filter_status") || "";

  const supabase = getServiceClient();

  let query = supabase
    .from("students")
    .select("*", { count: "exact" });

  if (filterStatus && filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,application_number.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: students, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }

  // Get student tasks for progress
  if (students && students.length > 0) {
    const { data: studentTasks } = await supabase
      .from("student_tasks")
      .select("student_id, status")
      .in("student_id", students.map(s => s.id));

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

    const studentsWithProgress = students.map(student => {
      const prog = progressMap[student.id] || { approved: 0, total: 0 };
      const progressPercent = prog.total > 0 ? Math.round((prog.approved / prog.total) * 100) : 0;
      return {
        ...student,
        progress: progressPercent,
        approved_count: prog.approved,
        total_tasks: 9,
      };
    });

    return NextResponse.json({
      students: studentsWithProgress,
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  }

  return NextResponse.json({
    students: [],
    total: 0,
    page,
    limit,
    total_pages: 0,
  });
}