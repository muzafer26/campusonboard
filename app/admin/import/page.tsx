"use client";

import { useEffect, useState } from "react";
import { Download, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImportExportPage() {
  const [adminName, setAdminName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    duplicates?: number;
    skipped?: number;
  } | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setAdminName(data.user?.full_name || "Admin");
      }
    };
    fetchMe();
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import-applicants", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadResult({
          success: true,
          message: data.message || "Import completed",
          imported: data.imported,
          duplicates: data.duplicates,
          skipped: data.skipped,
        });
      } else {
        setUploadResult({
          success: false,
          message: data.error || "Import failed",
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleExport = () => {
    window.open("/api/admin/export", "_blank");
  };

  return (
    <AppShell role="admin" fullName={adminName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-navy-dark">Import / Export</h1>
          <p className="mt-1 text-slate-500">
            Bulk upload admitted students or export admission data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Import Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-brand-blue" />
                Import Allowed Applicants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV file containing admitted students. They will be able to
                register using their application number and date of birth.
              </p>

              <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                <p className="font-semibold">CSV Format:</p>
                <p className="mt-1 font-mono">
                  application_number, full_name, date_of_birth(YYYY-MM-DD), department, category
                </p>
                <p className="mt-1">Example:</p>
                <p className="font-mono">
                  APP2024001, John Doe, 2005-05-15, Computer Engineering, Open
                </p>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                  id="csv-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="csv-upload"
                  className="flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-slate-300 p-6 transition-colors hover:border-brand-blue hover:bg-slate-50"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-sm font-medium text-navy-dark">
                      {uploading ? "Uploading..." : "Click to upload CSV"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Supported format: .csv (max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {uploadResult && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    uploadResult.success
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-danger"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {uploadResult.success ? (
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{uploadResult.message}</p>
                      {uploadResult.imported !== undefined && (
                        <p className="mt-1 text-xs">
                          Imported: {uploadResult.imported} | Duplicates: {uploadResult.duplicates} | Skipped: {uploadResult.skipped}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-brand-blue" />
                Export Student Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Download a CSV report containing all active students with their
                document submission status and progress.
              </p>

              <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                <p className="font-semibold">Export includes:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>Student personal information</li>
                  <li>Document approval counts</li>
                  <li>Registration and activation dates</li>
                  <li>Current admission status</li>
                </ul>
              </div>

              <Button onClick={handleExport} className="w-full gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>How to Prepare Your CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-3 py-2 text-left font-semibold">Column</th>
                    <th className="px-3 py-2 text-left font-semibold">Description</th>
                    <th className="px-3 py-2 text-left font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">application_number</td>
                    <td className="px-3 py-2">Unique merit/application number</td>
                    <td className="px-3 py-2 font-mono text-xs">APP2024001</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">full_name</td>
                    <td className="px-3 py-2">Student's full name</td>
                    <td className="px-3 py-2 font-mono text-xs">John Doe</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">date_of_birth</td>
                    <td className="px-3 py-2">Birth date (YYYY-MM-DD format)</td>
                    <td className="px-3 py-2 font-mono text-xs">2005-05-15</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">department</td>
                    <td className="px-3 py-2">Department name</td>
                    <td className="px-3 py-2 font-mono text-xs">Computer Engineering</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono text-xs">category</td>
                    <td className="px-3 py-2">Open, OBC, SC, ST, NT, SBC</td>
                    <td className="px-3 py-2 font-mono text-xs">Open</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}