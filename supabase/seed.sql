-- ============================================================
-- CampusOnboard Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TASKS MASTER DATA (9 admission documents)
-- ============================================================
INSERT INTO tasks (slug, name, description, is_optional, max_size_mb, accepted_formats, sort_order) VALUES
('aadhaar', 'Aadhaar Card', 'Upload a clear scan or photo of your Aadhaar card. Both sides should be visible if physical card.', FALSE, 10, 'pdf,jpg,png', 1),
('marksheet-10', 'SSC Marksheet (10th)', 'Upload your Class 10 final examination marksheet issued by the board.', FALSE, 10, 'pdf,jpg,png', 2),
('marksheet-12', 'HSC Marksheet (12th)', 'Upload your Class 12 final examination marksheet issued by the board.', FALSE, 10, 'pdf,jpg,png', 3),
('lc-tc', 'Leaving Certificate', 'Upload the leaving certificate issued by your previous school or junior college.', FALSE, 10, 'pdf,jpg,png', 4),
('birth-cert', 'Birth Certificate', 'Upload your birth certificate issued by the municipal corporation or hospital.', FALSE, 10, 'pdf,jpg,png', 5),
('caste-cert', 'Caste Certificate', 'Required for reserved categories (OBC/SC/ST/NT/SBC). General category may mark as Not Applicable.', TRUE, 10, 'pdf,jpg,png', 6),
('allotment-letter', 'Allotment Letter / Application Form', 'Upload the official college allotment letter or application form from the exam cell.', FALSE, 10, 'pdf,jpg,png', 7),
('fee-receipt', 'Fee Payment Receipt', 'Upload your admission fee payment receipt, bank challan, or online payment proof.', FALSE, 10, 'pdf,jpg,png', 8),
('passport-photo', 'Passport Photo', 'Upload a recent passport-sized photograph with white or light blue background.', FALSE, 2, 'jpg,png', 9)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. DEMO ADMIN ACCOUNT
-- Email: admin@campus.edu
-- Password: Admin@123
-- bcrypt hash generated with 10 rounds
-- ============================================================
INSERT INTO admins (full_name, email, password_hash, role) VALUES
('Campus Administrator', 'admin@campus.edu', '$2a$10$EIxQOcXfXMlk5JcK0F0E2.lH8FmCnD0Iuv1c2lZdfQYR1nF3hH7Ay', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 3. DEMO ALLOWED APPLICANTS
-- Students who can register (pre-admitted)
-- ============================================================
INSERT INTO allowed_applicants (application_number, full_name, date_of_birth, department, category) VALUES
('APP2026001', 'Aarav Sharma', '2006-04-12', 'Computer Engineering', 'Open'),
('APP2026002', 'Diya Patel', '2006-08-25', 'Information Technology', 'OBC'),
('APP2026003', 'Rohan Deshmukh', '2005-11-03', 'Mechanical Engineering', 'SC'),
('APP2026004', 'Priya Singh', '2006-01-15', 'Computer Engineering', 'Open'),
('APP2026005', 'Aditya Verma', '2006-03-22', 'Electronics Engineering', 'OBC')
ON CONFLICT (application_number) DO NOTHING;

-- ============================================================
-- 4. VERIFY SEED DATA
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '   - Tasks: % rows', (SELECT COUNT(*) FROM tasks);
  RAISE NOTICE '   - Admins: % rows', (SELECT COUNT(*) FROM admins);
  RAISE NOTICE '   - Allowed Applicants: % rows', (SELECT COUNT(*) FROM allowed_applicants);
END $$;