"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EduBot } from "@/components/EduBot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type TaskStatusType } from "@/components/ui/status-badge";

interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
  progress_pct: number;
}

interface Task {
  id: string;
  task_id: number;
  status: string;
  submitted_at: string | null;
  rejection_reason: string | null;
  task: {
    id: number;
    name: string;
    description: string;
    sort_order: number;
  };
}

interface Student {
  id: string;
  full_name: string;
  department: string;
  application_number: string;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats({ ...data.counts, progress_pct: data.progress });
          setTasks(data.tasks);
          setStudent(data.student);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getNextPendingTask = () => {
    return tasks.find((t) => t.status === "rejected") || tasks.find((t) => t.status === "pending");
  };

  const nextTask = getNextPendingTask();
  const allApproved = stats && (stats.approved + (stats.completed - stats.approved)) === stats.total;

  if (loading) {
    return (
      <AppShell role="student" fullName="Student">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="student" fullName={student?.full_name?.split(" ")[0] || "Student"}>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-dark to-brand-blue p-8 text-white"
        >
          <div className="relative z-10">
            <h1 className="font-serif text-3xl md:text-4xl">
              {getGreeting()}, {student?.full_name?.split(" ")[0] || "Student"}! 👋
            </h1>
            <p className="mt-2 text-white/80">
              {student?.department} • {student?.application_number}
            </p>
            <p className="mt-1 text-sm text-white/60">
              Complete your admission by uploading all required documents
            </p>
          </div>

          {/* Progress Ring */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="#F59E0B"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(stats?.progress_pct || 0) * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {stats?.progress_pct}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admission Complete Banner */}
        {allApproved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-green-50 border border-green-200 p-6 text-center"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-3 text-2xl font-bold text-green-800">Admission Complete! 🎉</h2>
            <p className="mt-1 text-green-600">
              Congratulations! All your documents have been approved. Your admission is confirmed.
            </p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Documents"
            value={stats?.total || 9}
            icon={FileText}
            color="text-slate-600"
          />
          <StatCard
            label="Approved"
            value={stats?.approved || 0}
            icon={CheckCircle}
            color="text-success"
          />
          <StatCard
            label="Pending"
            value={(stats?.pending || 0) + (stats?.submitted || 0)}
            icon={Clock}
            color="text-warning"
          />
          <StatCard
            label="Rejected"
            value={stats?.rejected || 0}
            icon={XCircle}
            color="text-danger"
          />
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Progress & Next Step */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90 transform">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E2E8F0"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#1A56DB"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${(stats?.progress_pct || 0) * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-navy-dark">{stats?.progress_pct || 0}%</span>
                    <span className="text-xs text-slate-500">Complete</span>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-slate-600">
                  {stats?.approved || 0} of {stats?.total || 9} documents approved
                </p>
              </CardContent>
            </Card>

            {nextTask && !allApproved && (
              <Card className="border-l-4 border-l-brand-blue">
                <CardContent className="p-6">
                  <div className="mb-2 inline-flex items-center rounded-full bg-brand-pale px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                    Next Step
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-navy-dark">
                    {nextTask.task?.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {nextTask.task?.description}
                  </p>
                  {nextTask.status === "rejected" && nextTask.rejection_reason && (
                    <div className="mt-3 rounded-md bg-red-50 p-2 text-sm text-danger">
                      <AlertCircle className="mr-1 inline h-3 w-3" />
                      {nextTask.rejection_reason}
                    </div>
                  )}
                  <Link href={`/student/tasks/${nextTask.task_id}`}>
                    <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light">
                      Complete Now <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Task Checklist */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Document Checklist</CardTitle>
                <Link
                  href="/student/tasks"
                  className="text-sm text-brand-blue hover:underline"
                >
                  View All →
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task, index) => (
                    <TaskRow key={task.id} task={task} index={index} />
                  ))}
                  {tasks.length > 5 && (
                    <div className="pt-2 text-center text-sm text-slate-500">
                      + {tasks.length - 5} more documents
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <EduBot />
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
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <p className="text-2xl font-bold text-navy-dark">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, index }: { task: Task; index: number }) {
  const getStatusBorder = () => {
    if (task.status === "rejected") return "border-l-danger bg-red-50/40";
    if (task.status === "submitted") return "border-l-warning";
    if (task.status === "approved") return "border-l-success";
    return "border-l-slate-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center justify-between rounded-lg border border-l-4 p-4 ${getStatusBorder()}`}
    >
      <div className="flex-1">
        <h4 className="font-semibold text-navy-dark">{task.task?.name}</h4>
        <p className="text-xs text-slate-500">{task.task?.description}</p>
        {task.status === "rejected" && task.rejection_reason && (
          <p className="mt-1 text-xs text-danger">Reason: {task.rejection_reason}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <StatusBadge status={task.status as TaskStatusType} />
        <Link href={`/student/tasks/${task.task_id}`}>
          <ChevronRight className="h-5 w-5 text-slate-400 hover:text-brand-blue" />
        </Link>
      </div>
    </motion.div>
  );
}