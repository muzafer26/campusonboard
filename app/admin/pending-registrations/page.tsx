"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

interface PendingStudent {
  id: string;
  full_name: string;
  application_number: string;
  email: string;
  mobile: string;
  department: string;
  category: string;
  created_at: string;
}

export default function PendingRegistrationsPage() {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingRes, meRes] = await Promise.all([
          fetch("/api/admin/pending-registrations"),
          fetch("/api/auth/me"),
        ]);

        if (pendingRes.ok) {
          const data = await pendingRes.json();
          setStudents(data.students || []);
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          setAdminName(meData.user?.full_name || "Admin");
        }
      } catch (error) {
        console.error("Failed to fetch pending registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleActivate = async (studentId: string) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/activate`, {
        method: "PATCH",
      });

      if (res.ok) {
        // Remove from list
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to activate student");
      }
    } catch (error) {
      console.error("Activation error:", error);
      alert("Failed to activate student");
    }
  };

  const handleReject = async (studentId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/students/${studentId}/reject-registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        setRejectingId(null);
        setRejectionReason("");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to reject registration");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject registration");
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

  return (
    <AppShell role="admin" fullName={adminName}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl text-navy-dark">Pending Registrations</h1>
          <p className="mt-1 text-slate-500">
            {students.length} student{students.length !== 1 ? "s" : ""} waiting for approval
          </p>
        </div>

        {/* Students List */}
        {students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-slate-500">No pending registrations</p>
              <p className="text-sm text-slate-400">
                All student registrations have been processed
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-navy-dark">
                          {student.full_name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Application: {student.application_number}
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <InfoRow label="Email" value={student.email} />
                        <InfoRow label="Mobile" value={student.mobile} />
                        <InfoRow label="Department" value={student.department} />
                        <InfoRow label="Category" value={student.category} />
                        <InfoRow label="Registered" value={formatDateTime(student.created_at)} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        onClick={() => handleActivate(student.id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" /> Activate
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setRejectingId(student.id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>

                  {/* Rejection Modal inline for this student */}
                  {rejectingId === student.id && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-danger">
                        Rejection Reason (required)
                      </p>
                      <Textarea
                        placeholder="Explain why this registration is being rejected..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(student.id)}
                          disabled={!rejectionReason.trim()}
                        >
                          Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}:</span>{" "}
      <span className="text-slate-700">{value}</span>
    </div>
  );
}