"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [role, setRole] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const destination =
        next || (data.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <GraduationCap className="h-8 w-8 text-accent-amber" />
          <span className="font-serif text-2xl font-bold text-navy-dark">
            CampusOnboard
          </span>
        </div>
        <h1 className="font-serif text-3xl text-navy-dark">Sign in</h1>
        <p className="text-slate-600 mt-1 text-sm">
          Choose your role and enter your credentials
        </p>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`py-2.5 text-sm font-semibold rounded-md transition-all ${
            role === "student"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          Student Portal
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`py-2.5 text-sm font-semibold rounded-md transition-all ${
            role === "admin"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          Admin Dashboard
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder={role === "student" ? "student@example.com" : "admin@campus.edu"}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-6 rounded-lg bg-brand-pale p-4">
        <p className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-2">
          Demo Credentials
        </p>
        {role === "admin" ? (
          <div className="text-sm text-slate-700">
            <p>
              <span className="font-medium">Email:</span> admin@campus.edu
            </p>
            <p>
              <span className="font-medium">Password:</span> Admin@123
            </p>
          </div>
        ) : (
          <div className="text-sm text-slate-700">
            <p>
              <span className="font-medium">Email:</span> student@example.com
            </p>
            <p>
              <span className="font-medium">Password:</span> (use registered password)
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Register first using Application Number from seed data
            </p>
          </div>
        )}
      </div>

      {role === "student" && (
        <div className="mt-6 text-center text-sm text-slate-600">
          New student?{" "}
          <Link
            href="/register"
            className="text-brand-blue font-semibold hover:underline"
          >
            Create an account
          </Link>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-3 w-3" />
        <span>Secure session with httpOnly cookies</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-dark text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-8 w-8 text-accent-amber" />
            <span className="font-serif">CampusOnboard</span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-5xl leading-tight">Welcome back.</h2>
          <p className="text-white/70 mt-4 max-w-md text-lg">
            Sign in to continue your admission process or manage student applications.
          </p>
          <div className="mt-8 flex gap-6">
            <div>
              <div className="text-2xl font-bold text-accent-amber">100%</div>
              <div className="text-xs text-white/50">Digital Process</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-amber">24/7</div>
              <div className="text-xs text-white/50">Support</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} CampusOnboard
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 to-white">
        <Suspense
          fallback={
            <div className="text-center text-slate-500">Loading login form...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}