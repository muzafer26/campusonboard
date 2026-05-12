import { getServiceClient, STORAGE_BUCKET } from "./supabase";

export interface SavedFile {
  filePath: string;
  originalFilename: string;
  sizeBytes: number;
}

export async function saveStudentFile(opts: {
  studentId: string;
  taskId: number;
  taskSlug: string;
  buffer: Buffer;
  originalFilename: string;
}): Promise<SavedFile> {
  const supabase = getServiceClient();

  const ext = opts.originalFilename.split(".").pop()?.toLowerCase() || "";
  const timestamp = Date.now();
  const path = `${opts.studentId}/${opts.taskId}/${opts.taskSlug}_${timestamp}.${ext}`;

  const contentType = getMimeForExt(opts.originalFilename);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, opts.buffer, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return {
    filePath: path,
    originalFilename: opts.originalFilename,
    sizeBytes: opts.buffer.length,
  };
}

export async function readStudentFile(filePath: string): Promise<Buffer> {
  const supabase = getServiceClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(filePath);

  if (error || !data) {
    console.error("Storage download error:", error);
    throw new Error("File not found");
  }

  return Buffer.from(await data.arrayBuffer());
}

export async function deleteStudentFile(filePath: string): Promise<boolean> {
  const supabase = getServiceClient();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error("Storage delete error:", error);
    return false;
  }

  return true;
}

export function getMimeForExt(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

export function validateFile(opts: {
  filename: string;
  sizeBytes: number;
  accepted: string;
  maxSizeMb: number;
}): string | null {
  const ext = opts.filename.split(".").pop()?.toLowerCase();
  const normalizedExt = ext === "jpeg" ? "jpg" : ext;

  const allowedFormats = opts.accepted
    .split(",")
    .map((f) => f.trim().toLowerCase());

  if (!normalizedExt || !allowedFormats.includes(normalizedExt)) {
    return `File type .${ext} not allowed. Accepted: ${opts.accepted.toUpperCase()}`;
  }

  const maxBytes = opts.maxSizeMb * 1024 * 1024;
  if (opts.sizeBytes > maxBytes) {
    return `File exceeds ${opts.maxSizeMb} MB limit. Your file: ${(opts.sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return null;
}