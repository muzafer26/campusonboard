"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  full_name: string;
  application_number: string;
  email: string;
  department: string;
  category: string;
  status: string;
  progress: number;
  created_at: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, meRes] = await Promise.all([
          fetch(`/api/admin/students?page=${page}&limit=20&search=${search}`),
          fetch("/api/auth/me"),
        ]);

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setStudents(data.students || []);
          setTotalPages(data.total_pages || 1);
          setTotal(data.total || 0);
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          setAdminName(meData.user?.full_name || "Admin");
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-navy-dark">All Students</h1>
            <p className="mt-1 text-slate-500">
              Total {total} student{total !== 1 ? "s" : ""} registered
            </p>
          </div>

          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, app no., or email..."
              value={search}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      App No.
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-navy-dark">
                        {student.full_name}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {student.application_number}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{student.email}</td>
                      <td className="px-6 py-3 text-slate-600">{student.department}</td>
                      <td className="px-6 py-3 text-slate-600">{student.category}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(
                            student.status
                          )}`}
                        >
                          {student.status === "pending_approval" ? "Pending" : student.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-brand-blue"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {student.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="text-brand-blue hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No students found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}