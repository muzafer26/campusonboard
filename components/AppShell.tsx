"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Users,
  FileSpreadsheet,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface AppShellProps {
  role: "student" | "admin";
  fullName: string;
  children: React.ReactNode;
}

export function AppShell({ role, fullName, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const studentNavItems: NavItem[] = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/tasks", label: "My Tasks", icon: ListChecks },
  ];

  const adminNavItems: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "All Students", icon: Users },
    { href: "/admin/pending-registrations", label: "Pending Approvals", icon: UserCheck },
    { href: "/admin/import", label: "Import / Export", icon: FileSpreadsheet },
  ];

  const navItems = role === "student" ? studentNavItems : adminNavItems;

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] bg-navy-dark text-white shadow-xl">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <GraduationCap className="h-8 w-8 text-accent-amber" />
          <span className="font-serif text-xl font-bold">CampusOnboard</span>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4">
          <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            {role === "student" ? "Student Portal" : "Admin Dashboard"}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-blue text-white shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                {getGreeting()}, <span className="font-semibold text-navy-dark">{fullName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {role === "student" ? "Complete your admission tasks" : "Manage student admissions"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-semibold text-sm">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}