"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  UploadCloud,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  Undo2,
  FileCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface TaskDetail {
  id: string;
  task_id: number;
  status: "pending" | "submitted" | "approved" | "rejected" | "na";
  file_path: string | null;
  original_filename: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_na: boolean;
  task: {
    id: number;
    slug: string;
    name: string;
    description: string;
    is_optional: boolean;
    max_size_mb: number;
    accepted_formats: string;
    sort_order: number;
  };
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [student, setStudent] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, studentRes] = await Promise.all([
          fetch(`/api/student/tasks/${taskId}`),
          fetch("/api/auth/me"),
        ]);

        if (taskRes.ok) {
          const taskData = await taskRes.json();
          setTask(taskData.task);
        } else if (taskRes.status === 404) {
          router.push("/student/dashboard");
        }

        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudent(studentData.user);
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, router]);

  const validateFile = (file: File): boolean => {
    if (!task) return false;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const normalizedExt = ext === "jpeg" ? "jpg" : ext;
    const allowedFormats = task.task.accepted_formats.split(",").map((f) => f.trim().toLowerCase());

    if (!normalizedExt || !allowedFormats.includes(normalizedExt)) {
      setError(`File type .${ext} not allowed. Accepted: ${task.task.accepted_formats.toUpperCase()}`);
      return false;
    }

    const maxBytes = task.task.max_size_mb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File exceeds ${task.task.max_size_mb} MB limit. Your file: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      return false;
    }

    setError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setSuccess("");
    } else {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`/api/student/tasks/${taskId}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setSuccess("Document submitted successfully! Awaiting admin review.");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Refresh task data
        const taskRes = await fetch(`/api/student/tasks/${taskId}`);
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          setTask(taskData.task);
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleMarkNA = async (undo: boolean = false) => {
    try {
      const res = await fetch(`/api/student/tasks/${taskId}/mark-na`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ undo }),
      });

      if (res.ok) {
        const taskRes = await fetch(`/api/student/tasks/${taskId}`);
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          setTask(taskData.task);
          setSuccess(undo ? "Task reset to pending" : "Marked as Not Applicable");
          setTimeout(() => setSuccess(""), 3000);
        }
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleViewFile = () => {
    window.open(`/api/student/tasks/${taskId}/view`, "_blank");
  };

  const canUpload = task?.status === "pending" || task?.status === "rejected";
  const isCasteCertificate = task?.task?.slug === "caste-cert";
  const showNAOption = isCasteCertificate && task?.task?.is_optional && task?.status !== "approved";

  if (loading) {
    return (
      <AppShell role="student" fullName={student?.full_name?.split(" ")[0] || "Student"}>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell role="student" fullName={student?.full_name?.split(" ")[0] || "Student"}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-navy-dark">Task not found</h2>
          <Link href="/student/dashboard" className="mt-4 inline-block text-brand-blue">
            ← Back to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="student" fullName={student?.full_name?.split(" ")[0] || "Student"}>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-navy-dark"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Task Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl text-navy-dark">{task.task.name}</h1>
                <p className="mt-1 text-slate-500">{task.task.description}</p>
              </div>
              <StatusBadge status={task.status} />
            </div>

            {/* Instructions */}
            <div className="mt-6 rounded-lg bg-brand-pale p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-brand-blue shrink-0" />
                <div>
                  <p className="font-semibold text-brand-blue">Instructions</p>
                  <p className="text-sm text-slate-700">{task.task.description}</p>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>Formats: {task.task.accepted_formats.toUpperCase()}</span>
                    <span>Max size: {task.task.max_size_mb} MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            {task.status === "rejected" && task.rejection_reason && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-danger shrink-0" />
                  <div>
                    <p className="font-semibold text-danger">Document Rejected</p>
                    <p className="text-sm text-red-700">{task.rejection_reason}</p>
                    <p className="mt-2 text-sm text-red-600">
                      Please upload a corrected document below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Not Applicable Option (Caste Certificate only) */}
            {showNAOption && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-brand-blue">Not Applicable Option</p>
                    <p className="text-sm text-slate-600">
                      If you belong to General/Open category and do not have a caste certificate,
                      you can mark this document as Not Applicable.
                    </p>
                  </div>
                  {task.status === "na" ? (
                    <Button variant="outline" onClick={() => handleMarkNA(true)}>
                      <Undo2 className="mr-2 h-4 w-4" /> Undo
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => handleMarkNA(false)}>
                      Mark as Not Applicable
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Upload Zone */}
            {canUpload && !(task.status === "na") && (
              <div className="mt-6">
                <div
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    selectedFile
                      ? "border-success bg-green-50"
                      : "border-slate-300 hover:border-brand-blue hover:bg-slate-50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="mx-auto h-10 w-10 text-brand-blue" />
                  <p className="mt-2 font-medium text-navy-dark">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {task.task.accepted_formats.toUpperCase()} up to {task.task.max_size_mb} MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={task.task.accepted_formats
                      .split(",")
                      .map((f) => `.${f.trim()}`)
                      .join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {selectedFile && (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-success" />
                      <span className="text-sm text-navy-dark">{selectedFile.name}</span>
                      <span className="text-xs text-slate-500">
                        ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button onClick={handleUpload} disabled={uploading} size="sm">
                      {uploading ? "Uploading..." : "Submit Document"}
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-danger">
                    <AlertCircle className="mr-1 inline h-4 w-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-success">
                    <CheckCircle className="mr-1 inline h-4 w-4" />
                    {success}
                  </div>
                )}
              </div>
            )}

            {/* Submitted / Approved View */}
            {(task.status === "submitted" || task.status === "approved") && (
              <div className="mt-6 rounded-lg bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {task.status === "submitted" ? (
                      <Clock className="h-5 w-5 text-warning" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    <div>
                      <p className="font-medium text-navy-dark">
                        {task.status === "submitted"
                          ? "Awaiting Admin Review"
                          : "Approved by Admin"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {task.status === "submitted"
                          ? `Submitted on ${new Date(task.submitted_at!).toLocaleDateString()}`
                          : `Reviewed on ${new Date(task.reviewed_at!).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  {task.file_path && (
                    <Button variant="outline" onClick={handleViewFile}>
                      <Eye className="mr-2 h-4 w-4" /> View Submission
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* NA Status View */}
            {task.status === "na" && (
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium text-navy-dark">Marked as Not Applicable</p>
                      <p className="text-sm text-slate-500">
                        This document is not required for your category.
                      </p>
                    </div>
                  </div>
                  {isCasteCertificate && (
                    <Button variant="outline" onClick={() => handleMarkNA(true)}>
                      <Undo2 className="mr-2 h-4 w-4" /> Undo
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}