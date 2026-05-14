export type UserRole = "student" | "admin";
export type StudentStatus = "pending_approval" | "active" | "rejected";
export type TaskStatus = "pending" | "na" | "submitted" | "approved" | "rejected";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Task {
  id: number;
  slug: string;
  name: string;
  description: string;
  is_optional: boolean;
  max_size_mb: number;
  accepted_formats: string;
  sort_order: number;
}

export interface Student {
  id: string;
  applicant_id: string | null;
  full_name: string;
  application_number: string;
  email: string;
  mobile: string;
  department: string;
  category: string;
  status: StudentStatus;
  rejection_reason: string | null;
  created_at: string;
  activated_at: string | null;
}

export interface StudentTask {
  id: string;
  student_id: string;
  task_id: number;
  status: TaskStatus;
  file_path: string | null;
  original_filename: string | null;
  file_size_bytes: number | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  is_na: boolean;
  task?: Task;
}

export interface AllowedApplicant {
  id: string;
  application_number: string;
  full_name: string;
  date_of_birth: string;
  department: string;
  category: string;
  imported_at: string;
  is_registered: boolean;
}

export interface Admin {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
  progress_pct: number;
}

export interface AdminDashboardStats {
  total_students: number;
  fully_admitted: number;
  in_progress: number;
  not_started: number;
  pending_registrations: number;
}