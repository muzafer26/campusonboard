"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, FileText, CheckCircle, Clock, XCircle, MinusCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EduBot } from "@/components/EduBot";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

interface Task {
  id: string;
  task_id: number;
  status: "pending" | "submitted" | "approved" | "rejected" | "na";
  submitted_at: string | null;
  rejection_reason: string | null;
  is_na: boolean;
  task: {
    id: number;
    name: string;
    description: string;
    sort_order: number;
  };
}

type FilterType = "all" | "pending" | "submitted" | "approved" | "rejected";

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [student, setStudent] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks);
          setStudent(data.student);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "submitted":
        return <Clock className="h-5 w-5 text-warning" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-danger" />;
      case "na":
        return <MinusCircle className="h-5 w-5 text-brand-blue" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50";
      case "submitted":
        return "bg-amber-50";
      case "rejected":
        return "bg-red-50";
      case "na":
        return "bg-blue-50";
      default:
        return "bg-slate-50";
    }
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl text-navy-dark">My Documents</h1>
          <p className="mt-1 text-slate-500">
            Upload and track all required admission documents
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                filter === f.value
                  ? "bg-brand-blue text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                  {tasks.filter((t) => t.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-slate-500">No documents in this category</p>
                <p className="text-sm text-slate-400">
                  {filter === "pending"
                    ? "All documents have been submitted!"
                    : filter === "rejected"
                    ? "Great! No rejected documents."
                    : "Check back later for updates"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/student/tasks/${task.task_id}`}>
                  <div
                    className={`flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-md ${getStatusBg(
                      task.status
                    )}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                      <div>
                        <h3 className="font-semibold text-navy-dark">
                          {task.task?.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {task.task?.description}
                        </p>
                        {task.status === "rejected" && task.rejection_reason && (
                          <p className="mt-1 text-xs text-danger">
                            Reason: {task.rejection_reason}
                          </p>
                        )}
                        {task.status === "submitted" && task.submitted_at && (
                          <p className="mt-1 text-xs text-slate-400">
                            Submitted: {new Date(task.submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={task.status} />
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Progress Summary */}
        <Card className="bg-brand-pale border-brand-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-blue">Your Progress</p>
                <p className="text-2xl font-bold text-navy-dark">
                  {tasks.filter((t) => t.status === "approved" || t.status === "na").length} / {tasks.length}
                </p>
              </div>
              <div className="h-2 flex-1 mx-4 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-brand-blue transition-all"
                  style={{
                    width: `${
                      (tasks.filter((t) => t.status === "approved" || t.status === "na").length /
                        tasks.length) *
                      100
                    }%`,
                  }}
                />
              </div>
              <Link href="/student/dashboard">
                <button className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm hover:bg-slate-50">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <EduBot />
    </AppShell>
  );
}