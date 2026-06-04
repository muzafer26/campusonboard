import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { readStudentFile } from "@/lib/fileStorage";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await context.params;
  const user = await getSessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: studentTask } = await supabase
    .from("student_tasks")
    .select("*")
    .eq("student_id", id)
    .eq("task_id", parseInt(taskId))
    .maybeSingle();

  if (!studentTask || !studentTask.file_path) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const fileBuffer = await readStudentFile(studentTask.file_path);
    const originalFilename = studentTask.original_filename || "document.pdf";

    // Determine content type
    const ext = originalFilename.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    if (ext === "png") contentType = "image/png";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${originalFilename}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve file" },
      { status: 500 }
    );
  }
}