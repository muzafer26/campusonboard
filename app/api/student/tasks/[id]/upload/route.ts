import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { saveStudentFile, validateFile } from "@/lib/fileStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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

    // Get the student task with task details
    const { data: studentTask } = await supabase
      .from("student_tasks")
      .select("*, task:tasks(*)")
      .eq("student_id", user.id)
      .eq("task_id", taskId)
      .maybeSingle();

    if (!studentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task can be uploaded
    if (studentTask.status === "submitted") {
      return NextResponse.json(
        { error: "Document already submitted. Awaiting admin review." },
        { status: 400 }
      );
    }

    if (studentTask.status === "approved") {
      return NextResponse.json(
        { error: "This document has been approved by admin." },
        { status: 400 }
      );
    }

    if (studentTask.status === "na") {
      return NextResponse.json(
        { error: "This task is marked as Not Applicable." },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file
    const validationError = validateFile({
      filename: file.name,
      sizeBytes: buffer.length,
      accepted: studentTask.task.accepted_formats,
      maxSizeMb: studentTask.task.max_size_mb,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Save file to Supabase Storage
    let savedFile;
    try {
      savedFile = await saveStudentFile({
        studentId: user.id,
        taskId,
        taskSlug: studentTask.task.slug,
        buffer,
        originalFilename: file.name,
      });
    } catch (storageError) {
      console.error("Storage error:", storageError);
      throw storageError;
    }

    // Update database
    const { error: updateError } = await supabase
      .from("student_tasks")
      .update({
        status: "submitted",
        file_path: savedFile.filePath,
        original_filename: savedFile.originalFilename,
        file_size_bytes: savedFile.sizeBytes,
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq("student_id", user.id)
      .eq("task_id", taskId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save document record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Document submitted successfully. Awaiting admin review.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}