# CampusOnboard 🎓

**Digital Admission Onboarding Agent** — Complete Your College Admission From Home

CampusOnboard is a full-stack web application built with [Next.js 14](https://nextjs.org/) that digitizes the entire college admission document submission process. Students can register, verify their identity, upload required documents, and track their admission status — all remotely. Administrators can import applicant lists, review submissions, and manage the onboarding workflow from a single dashboard.

---

## ✨ Features

### For Students
- **Self-Registration** — Register using your application number and verify your identity via date of birth
- **Document Upload** — Upload all 9 required admission documents (Aadhaar, marksheets, certificates, photos, etc.)
- **Progress Tracking** — Real-time dashboard showing submission progress and status of each document
- **Mark as N/A** — Optional documents can be marked as "Not Applicable"
- **EduBot Assistant** — Built-in AI chatbot to answer questions about the admission process

### For Administrators
- **CSV Import** — Bulk import admitted student lists via CSV file upload
- **Student Management** — View, activate, or reject student registrations
- **Document Review** — Review submitted documents with approve/reject workflow
- **Dashboard Analytics** — Overview of total students, fully admitted, in-progress, and pending registrations
- **Data Export** — Export student data and admission status

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | JWT-based (custom auth with bcrypt + jose) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation |
| **Charts** | [Recharts](https://recharts.org/) |
| **File Parsing** | [PapaParse](https://www.papaparse.com/) (CSV) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **AI Chat** | Custom EduBot (OpenAI-compatible API) |

---

## 📁 Project Structure

```
campusonboard/
├── app/
│   ├── admin/               # Admin dashboard & management pages
│   │   ├── dashboard/       # Admin analytics dashboard
│   │   ├── import/          # CSV applicant import
│   │   ├── pending-registrations/  # Pending student approvals
│   │   └── students/        # Student list & detail views
│   ├── api/                 # API routes (RESTful)
│   │   ├── admin/           # Admin API endpoints
│   │   ├── auth/            # Authentication endpoints
│   │   ├── edubot/          # AI chatbot endpoint
│   │   ├── student/         # Student API endpoints
│   │   └── verify-applicant/ # Applicant verification
│   ├── login/               # Login page
│   ├── register/            # Student registration page
│   └── student/             # Student dashboard & tasks
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── AppShell.tsx         # Application layout shell
│   └── EduBot.tsx           # AI chatbot component
├── lib/
│   ├── auth.ts              # JWT & authentication utilities
│   ├── edubot.ts            # EduBot AI integration
│   ├── fileStorage.ts       # File upload/storage logic
│   ├── supabase.ts          # Supabase client setup
│   └── utils.ts             # Utility functions
├── supabase/
│   ├── schema.sql           # Database schema (tables, indexes, RLS)
│   └── seed.sql             # Seed data (tasks, demo admin, applicants)
├── types/
│   └── index.ts             # TypeScript type definitions
└── public/                  # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- [Supabase](https://supabase.com/) project (free tier works)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/muzafer26/campusonboard.git
   cd campusonboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy [`.env.example`](.env.example) to `.env.local` and fill in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |----------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous API key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin operations) |
   | `JWT_SECRET` | Secret key for JWT token signing (32+ chars) |
   | `NEXT_PUBLIC_APP_URL` | Application URL (`http://localhost:3000` for dev) |
   | `SUPABASE_STORAGE_BUCKET` | Storage bucket name (default: `documents`) |

4. **Set up the database**

   Run the SQL from [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor to create all tables.

5. **Seed demo data** (optional)

   Run the SQL from [`supabase/seed.sql`](supabase/seed.sql) to populate:
   - 9 admission document task definitions
   - 1 demo admin account (`admin@campus.edu` / `Admin@123`)
   - 5 demo applicants for testing registration

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Admission Documents (Tasks)

Students must submit the following 9 documents:

| # | Document | Optional | Max Size | Formats |
|---|----------|----------|----------|---------|
| 1 | Aadhaar Card | No | 10 MB | PDF, JPG, PNG |
| 2 | SSC Marksheet (10th) | No | 10 MB | PDF, JPG, PNG |
| 3 | HSC Marksheet (12th) | No | 10 MB | PDF, JPG, PNG |
| 4 | Leaving Certificate | No | 10 MB | PDF, JPG, PNG |
| 5 | Birth Certificate | No | 10 MB | PDF, JPG, PNG |
| 6 | Caste Certificate | Yes | 10 MB | PDF, JPG, PNG |
| 7 | Allotment Letter | No | 10 MB | PDF, JPG, PNG |
| 8 | Fee Payment Receipt | No | 10 MB | PDF, JPG, PNG |
| 9 | Passport Photo | No | 2 MB | JPG, PNG |

---

## 🔄 Workflow

### Student Flow

1. **Register** — Enter application number, verify identity (name + DOB), create account
2. **Wait for Approval** — Admin activates the student account
3. **Upload Documents** — Submit required documents one by one
4. **Track Progress** — Monitor approval status on the dashboard
5. **Complete Admission** — All documents approved = admission confirmed

### Admin Flow

1. **Import Applicants** — Upload CSV of admitted students
2. **Approve Registrations** — Review and activate student accounts
3. **Review Documents** — Approve or reject submitted documents
4. **Monitor Dashboard** — Track overall admission progress

---

## 🧪 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@campus.edu` | `Admin@123` |

To test student registration, use one of the seeded applicant application numbers:
- `APP2026001` (Aarav Sharma)
- `APP2026002` (Diya Patel)
- `APP2026003` (Rohan Deshmukh)
- `APP2026004` (Priya Singh)
- `APP2026005` (Aditya Verma)

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📄 License

This project is for educational/institutional use.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.
