"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle, XCircle, Eye } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  application_number: string;
  email: string;
  mobile: string;
  department: string;
  category: string;
  status: string;
  created_at: string;
  activated_at: string | null;
}

interface StudentTask {
  id: string;
  task_id: number;
  status: string;
  file_path: string | null;
  original_filename: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_na: boolean;
  task: {
    id: number;
    name: string;
    description: string;
    slug: string;
  };
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const [rejectingTask, setRejectingTask] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, meRes] = await Promise.all([
          fetch(`/api/admin/students/${studentId}`),
          fetch("/api/auth/me"),
        ]);

        if (studentRes.ok) {
          const data = await studentRes.json();
          setStudent(data.student);
          setTasks(data.tasks || []);
        } else if (studentRes.status === 404) {
          router.push("/admin/students");
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          setAdminName(meData.user?.full_name || "Admin");
        }
      } catch (error) {
        console.error("Failed to fetch student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, router]);

  const handleApprove = async (taskId: number) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/tasks/${taskId}/approve`, {
        method: "PATCH",
      });

      if (res.ok) {
        // Refresh tasks
        const studentRes = await fetch(`/api/admin/students/${studentId}`);
        if (studentRes.ok) {
          const data = await studentRes.json();
          setTasks(data.tasks || []);
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to approve document");
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("Failed to approve document");
    }
  };

  const handleReject = async (taskId: number) => {
    if (!rejectionReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/students/${studentId}/tasks/${taskId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (res.ok) {
        // Refresh tasks
        const studentRes = await fetch(`/api/admin/students/${studentId}`);
        if (studentRes.ok) {
          const data = await studentRes.json();
          setTasks(data.tasks || []);
        }
        setRejectingTask(null);
        setRejectionReason("");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to reject document");
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert("Failed to reject document");
    }
  };

  const handleDownload = (taskId: number, filename: string) => {
    window.open(`/api/admin/students/${studentId}/tasks/${taskId}/download`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-success";
      case "submitted":
        return "text-warning";
      case "rejected":
        return "text-danger";
      case "na":
        return "text-brand-blue";
      default:
        return "text-slate-400";
    }
  };

  if (loading) {
    return (
      <AppShell role="admin" fullName={adminName}>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!student) {
    return (
      <AppShell role="admin" fullName={adminName}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-navy-dark">Student not found</h2>
          <Link href="/admin/students" className="mt-4 inline-block text-brand-blue">
            ← Back to Students
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="admin" fullName={adminName}>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-navy-dark"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>

        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Full Name" value={student.full_name} />
              <InfoItem label="Application Number" value={student.application_number} />
              <InfoItem label="Email" value={student.email} />
              <InfoItem label="Mobile" value={student.mobile} />
              <InfoItem label="Department" value={student.department} />
              <InfoItem label="Category" value={student.category} />
              <InfoItem label="Status" value={student.status} />
              <InfoItem label="Registered" value={formatDate(student.created_at)} />
              {student.activated_at && (
                <InfoItem label="Activated" value={formatDate(student.activated_at)} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      File
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-navy-dark">{task.task.name}</p>
                          <p className="text-xs text-slate-500">{task.task.description}</p>
                          {task.rejection_reason && task.status === "rejected" && (
                            <p className="mt-1 text-xs text-danger">
                              Reason: {task.rejection_reason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={task.status as any} />
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {task.submitted_at ? formatDateTime(task.submitted_at) : "—"}
                      </td>
                      <td className="px-6 py-3">
                        {task.file_path ? (
                          <button
                            onClick={() => handleDownload(task.task_id, task.original_filename || "document")}
                            className="inline-flex items-center gap-1 text-brand-blue hover:underline"
                          >
                            <Download className="h-4 w-4" /> Download
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {task.status === "submitted" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApprove(task.task_id)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectingTask(task.task_id)}
                            >
                              <XCircle className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        )}
                        {task.status === "approved" && (
                          <span className="text-sm text-success">✓ Approved</span>
                        )}
                        {task.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/api/admin/students/${studentId}/tasks/${task.task_id}/view`, "_blank")}
                          >
                            <Eye className="mr-1 h-4 w-4" /> View Rejected
                          </Button>
                        )}
                        {task.status === "na" && (
                          <span className="text-sm text-brand-blue">Not Applicable</span>
                        )}
                        {task.status === "pending" && (
                          <span className="text-sm text-slate-400">Awaiting upload</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Rejection Modal */}
        {rejectingTask !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-navy-dark">Reject Document</h3>
              <p className="mt-1 text-sm text-slate-500">
                Please provide a reason for rejection. This will be visible to the student.
              </p>
              <Textarea
                className="mt-4"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectingTask(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(rejectingTask)}
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-navy-dark">{value || "—"}</p>
    </div>
  );
}