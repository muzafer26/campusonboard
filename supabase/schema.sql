-- ============================================================
-- CampusOnboard Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ALLOWED APPLICANTS TABLE
-- Master list of admitted students (imported by admin via CSV)
-- ============================================================
CREATE TABLE IF NOT EXISTS allowed_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE NOT NULL,
  department VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('Open', 'OBC', 'SC', 'ST', 'NT', 'SBC')),
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  is_registered BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- 2. STUDENTS TABLE
-- Registered student accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID UNIQUE REFERENCES allowed_applicants(id) ON DELETE SET NULL,
  full_name VARCHAR(200) NOT NULL,
  application_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  department VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval', 'active', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ
);

-- ============================================================
-- 3. TASKS TABLE
-- Master list of 9 admission documents
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE,
  max_size_mb INT NOT NULL DEFAULT 10,
  accepted_formats VARCHAR(50) NOT NULL DEFAULT 'pdf,jpg,png',
  sort_order INT NOT NULL
);

-- ============================================================
-- 4. STUDENT TASKS TABLE
-- Tracks each student's document submission status
-- ============================================================
CREATE TABLE IF NOT EXISTS student_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'na', 'submitted', 'approved', 'rejected')),
  file_path TEXT,
  original_filename VARCHAR(500),
  file_size_bytes BIGINT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  is_na BOOLEAN DEFAULT FALSE,
  UNIQUE(student_id, task_id)
);

-- ============================================================
-- 5. ADMINS TABLE
-- Pre-seeded admin accounts (no self-registration)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) DEFAULT 'admin'
    CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_application_number ON students(application_number);
CREATE INDEX IF NOT EXISTS idx_student_tasks_student ON student_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_tasks_status ON student_tasks(status);
CREATE INDEX IF NOT EXISTS idx_student_tasks_task ON student_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_allowed_applicants_appno ON allowed_applicants(application_number);
CREATE INDEX IF NOT EXISTS idx_allowed_applicants_registered ON allowed_applicants(is_registered);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- Enable RLS on all tables
-- ============================================================

-- Students table RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to students"
  ON students FOR ALL
  USING (auth.role() = 'admin');

-- Student tasks table RLS
ALTER TABLE student_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own tasks"
  ON student_tasks FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own tasks"
  ON student_tasks FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Admins have full access to student_tasks"
  ON student_tasks FOR ALL
  USING (auth.role() = 'admin');

-- Tasks table RLS (read-only for students)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  USING (true);

-- Allowed applicants table RLS
ALTER TABLE allowed_applicants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to allowed_applicants"
  ON allowed_applicants FOR ALL
  USING (auth.role() = 'admin');

-- Admins table RLS (only super_admin can modify)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own record"
  ON admins FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admins have full access to admins"
  ON admins FOR ALL
  USING (auth.role() = 'super_admin');