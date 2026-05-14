"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface AdminStats {
  totalStudents: number;
  fullyAdmitted: number;
  inProgress: number;
  notStarted: number;
  pending_registrations: number;
}

interface Student {
  id: string;
  full_name: string;
  application_number: string;
  department: string;
  email: string;
  status: string;
  progress: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, meRes] = await Promise.all([
          fetch("/api/admin/dashboard"),
          fetch("/api/auth/me"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setStudents(data.students.slice(0, 5));
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          setAdminName(meData.user?.full_name || "Admin");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = () => {
    window.open("/api/admin/export", "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending_approval":
        return "bg-amber-100 text-amber-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-600";
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-navy-dark">Admin Dashboard</h1>
            <p className="mt-1 text-slate-500">
              Overview of student admission progress
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* Pending Registrations Alert */}
        {stats && stats.pending_registrations > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-amber-50 border border-amber-200 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800">
                  <span className="font-semibold">{stats.pending_registrations}</span> student
                  registration(s) are waiting for approval.
                </p>
              </div>
              <Link href="/admin/pending-registrations">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Review Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Students"
            value={stats?.totalStudents || 0}
            icon={Users}
            color="bg-blue-50 text-brand-blue"
          />
          <StatCard
            label="Fully Admitted"
            value={stats?.fullyAdmitted || 0}
            icon={GraduationCap}
            color="bg-green-50 text-success"
          />
          <StatCard
            label="In Progress"
            value={stats?.inProgress || 0}
            icon={Clock}
            color="bg-amber-50 text-warning"
          />
          <StatCard
            label="Pending Approvals"
            value={stats?.pending_registrations || 0}
            icon={UserCheck}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Recent Students Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Students</CardTitle>
            <Link
              href="/admin/students"
              className="text-sm text-brand-blue hover:underline"
            >
              View All →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-3 font-semibold text-slate-600">Student Name</th>
                    <th className="pb-3 font-semibold text-slate-600">App No.</th>
                    <th className="pb-3 font-semibold text-slate-600">Department</th>
                    <th className="pb-3 font-semibold text-slate-600">Progress</th>
                    <th className="pb-3 font-semibold text-slate-600">Status</th>
                    <th className="pb-3 font-semibold text-slate-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-navy-dark">
                        {student.full_name}
                      </td>
                      <td className="py-3 text-slate-600">{student.application_number}</td>
                      <td className="py-3 text-slate-600">{student.department}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-brand-blue transition-all"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {student.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(
                            student.status
                          )}`}
                        >
                          {student.status === "pending_approval"
                            ? "Pending"
                            : student.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="text-brand-blue hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-navy-dark">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}