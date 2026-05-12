import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { readStudentFile } from "@/lib/fileStorage";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const supabase = getServiceClient();

    const { data: studentTask } = await supabase
      .from("student_tasks")
      .select("*")
      .eq("student_id", user.id)
      .eq("task_id", taskId)
      .maybeSingle();

    if (!studentTask || !studentTask.file_path) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

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
        "Content-Disposition": `inline; filename="${originalFilename}"`,
      },
    });
  } catch (error) {
    console.error("View error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}