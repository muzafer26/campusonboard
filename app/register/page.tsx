"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, CheckCircle2, Info, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    application_number: "",
    date_of_birth: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
  });
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [applicantValid, setApplicantValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function lookupApplicant() {
    if (!form.application_number) return;

    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/auth/lookup-applicant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_number: form.application_number }),
      });

      const data = await res.json();

      if (data.found && !data.already_registered) {
        setDepartment(data.department);
        setCategory(data.category);
        setApplicantValid(true);
        setError("");
      } else if (data.already_registered) {
        setError("This application number has already been registered.");
        setApplicantValid(false);
      } else {
        setError("Application number not found. Please check your allotment letter.");
        setApplicantValid(false);
        setDepartment("");
        setCategory("");
      }
    } catch (err) {
      setError("Failed to verify application number.");
      setApplicantValid(false);
    } finally {
      setVerifying(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/\d/.test(form.password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (!/^[A-Za-z\s.'-]{3,}$/.test(form.full_name)) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    if (!/^(\+91)?\d{10}$/.test(form.mobile.replace(/\s/g, ""))) {
      setError("Mobile number must be a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          application_number: form.application_number,
          date_of_birth: form.date_of_birth,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xl">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-serif text-3xl text-navy-dark mt-6">
            Registration Submitted!
          </h1>
          <p className="text-slate-600 mt-3">
            Your account has been created and is pending admin approval.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            You will receive confirmation once your account is activated by the
            admission office.
          </p>
          <Link href="/login">
            <Button className="mt-8 w-full">Go to Login</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy-dark font-bold text-xl"
          >
            <GraduationCap className="h-7 w-7 text-brand-blue" />
            <span className="font-serif">CampusOnboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl text-navy-dark">
              Student Admission Registration
            </h1>
            <p className="text-slate-600 mt-2">
              Enter your details to begin the admission process
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  placeholder="Enter your full name"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Application Number */}
              <div>
                <Label htmlFor="application_number">Application / Merit Number *</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="application_number"
                    placeholder="Enter your application number"
                    required
                    value={form.application_number}
                    onChange={(e) => {
                      setForm({ ...form, application_number: e.target.value });
                      setApplicantValid(false);
                      setDepartment("");
                      setCategory("");
                    }}
                    className={applicantValid ? "border-success" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={lookupApplicant}
                    disabled={verifying || !form.application_number}
                  >
                    {verifying ? "..." : "Verify"}
                  </Button>
                </div>
                {applicantValid && (
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Valid application number
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  required
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Department (Auto-filled) */}
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  placeholder="Auto-filled after verification"
                  readOnly
                  className="mt-1.5 bg-slate-50"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Mobile */}
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  required
                  pattern="\d{10}"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, at least 1 number"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Re-enter your password"
                  required
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold">About Caste Certificate:</p>
                <p>
                  If you belong to the General/Open category, you can mark the Caste
                  Certificate task as "Not Applicable" after logging in. Reserved
                  category students must upload their caste certificate.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <Link href="/login" className="text-sm text-brand-blue hover:underline">
                Already have an account? Sign in
              </Link>
              <Button
                type="submit"
                size="lg"
                disabled={loading || !applicantValid}
                className="min-w-[200px]"
              >
                {loading ? "Submitting..." : "Register"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}