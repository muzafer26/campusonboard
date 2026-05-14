# CampusOnboard — Comprehensive Code Review Report

**Live Site:** https://campusonboard.vercel.app/  
**Reviewed:** May 14, 2026  
**Reviewer:** Automated codebase analysis

---

## Executive Summary

CampusOnboard is a well-structured Next.js 14 application for digital college admission onboarding. The architecture is clean, the code is organized, and the UI is polished. Below is a detailed breakdown of findings across security, authentication, API design, database schema, UI/UX, and performance.

---

## 1. Authentication & Session Management

### Strengths
- **JWT-based sessions** using [`jose`](lib/auth.ts:21) with HS256 — no reliance on Supabase Auth, giving full control.
- **httpOnly cookies** with `secure: true` in production ([`setSessionCookie`](lib/auth.ts:37-45)).
- **7-day session expiry** with proper `maxAge`.
- **Role-based access** enforced in both middleware and API routes.
- **Password hashing** with bcrypt (10 rounds) in [`register`](app/api/auth/register/route.ts:69) and [`login`](app/api/auth/login/route.ts:37).

### Issues & Recommendations

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 1 | **HIGH** | **Dev fallback secret** — [`lib/auth.ts:14`](lib/auth.ts:14) uses `"dev-insecure-fallback-key-do-not-use-in-production"` when `JWT_SECRET` is missing. If this fallback is ever deployed to production (e.g., missing env var), all JWT tokens can be forged. | Remove the fallback entirely. In production, the app should crash on startup if `JWT_SECRET` is missing. The current check at [`lib/auth.ts:9`](lib/auth.ts:9) only throws in production but still uses the fallback. |
| 2 | **MEDIUM** | **No CSRF protection** — The app uses cookie-based auth but has no CSRF token mechanism. Since cookies are `SameSite: "lax"`, this is partially mitigated but not fully. | Add a CSRF token for state-changing requests, or use `SameSite: "strict"` on the session cookie. |
| 3 | **MEDIUM** | **No rate limiting on login** — [`/api/auth/login`](app/api/auth/login/route.ts:9) has no rate limiting, making it vulnerable to brute-force attacks. | Implement rate limiting (e.g., upstash-rate-limiter or in-memory with a configurable threshold). |
| 4 | **LOW** | **No password complexity enforcement on login route** — The register route validates password strength, but the login route doesn't enforce any policy server-side. | Acceptable for login (validation happens at registration), but consider adding server-side password policy validation on the register endpoint. |

---

## 2. Middleware & Route Protection

### Strengths
- Clean middleware at [`middleware.ts`](middleware.ts:20) with explicit public path allowlist.
- Proper redirect to login with `next` query parameter for post-login redirect.
- Security headers set in [`next.config.js`](next.config.js:7-18): `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`.

### Issues & Recommendations

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 5 | **MEDIUM** | **No role-based routing in middleware** — Middleware only checks for session existence, not role. A student could access `/admin/dashboard` if they have a valid session cookie (though API routes do check roles). | Add role-based path matching in middleware to redirect unauthorized users away from admin routes. |
| 6 | **LOW** | **Missing `Strict-Transport-Security` (HSTS) header** — Not set in [`next.config.js`](next.config.js:7-18). | Add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` header. |
| 7 | **LOW** | **Missing `Content-Security-Policy` header** — Not configured. | Add a CSP header to mitigate XSS risks, especially since Google Fonts are loaded from external CDN. |

---

## 3. API Routes — Security & Correctness

### Strengths
- **Consistent role checking** — Every protected API route calls [`getSessionFromRequest`](lib/auth.ts:61) and validates the role.
- **Zod validation** used on registration ([`registerSchema`](app/api/auth/register/route.ts:8-15)), lookup, and reject endpoints.
- **Service client** (`getServiceClient`) used for all DB operations — bypasses RLS intentionally with app-level auth.
- **File upload validation** — [`validateFile`](lib/fileStorage.ts:87) checks file extension and size.

### Issues & Recommendations

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 8 | **HIGH** | **No input validation on login** — [`/api/auth/login`](app/api/auth/login/route.ts:11-12) only checks for truthiness of email/password/role but doesn't use Zod or any schema validation. Malformed input could cause unexpected behavior. | Add Zod schema validation to the login endpoint, matching the pattern used in register. |
| 9 | **MEDIUM** | **No file type validation (magic bytes)** — [`validateFile`](lib/fileStorage.ts:87) only checks file extension, not actual content. A `.pdf` renamed `.jpg` would pass validation. | Add magic byte / MIME content inspection using a library like `file-type` to verify actual file content matches the extension. |
| 10 | **MEDIUM** | **No file size limit on server side before processing** — The entire file is loaded into memory via [`Buffer.from(await file.arrayBuffer())`](app/api/student/tasks/[id]/upload/route.ts:64) before validation. Large files could cause OOM. | Check `Content-Length` header or file size before reading into buffer. Consider streaming validation. |
| 11 | **LOW** | **Generic error messages on login** — [`/api/auth/login`](app/api/auth/login/route.ts:31-33) returns "Invalid email or password" for both missing user and wrong password. This is good security practice (don't reveal which is wrong). | ✅ Already correct — no change needed. |
| 12 | **LOW** | **`/api/edubot` is public** — The EduBot endpoint at [`/api/edubot`](app/api/edubot/route.ts:6) is in the public paths list in middleware. This is intentional, but the endpoint exposes the internal `getBotReply` function. | Acceptable for a chatbot, but consider adding basic rate limiting. |
| 13 | **LOW** | **No pagination on admin dashboard** — [`/api/admin/dashboard`](app/api/admin/dashboard/route.ts:16-19) fetches ALL students without pagination. Could become slow with many students. | Add pagination or limit the query (e.g., last 50 students). |

---

## 4. Database Schema

### Strengths
- **Well-normalized schema** with proper foreign keys and constraints.
- **UUID primary keys** for security (non-enumerable IDs).
- **Proper CHECK constraints** on status fields (`pending_approval`, `active`, `rejected`).
- **Unique constraints** on `student_id + task_id` to prevent duplicate submissions.
- **Indexes** on frequently queried columns.
- **Cascading deletes** on `student_tasks`.

### Issues & Recommendations

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 14 | **LOW** | **`password_hash` stored in `students` table** — While bcrypt hashing is used, consider if Supabase Auth could be leveraged instead for additional security features (password reset, MFA). | This is a valid architectural choice. Document the reasoning in the schema. |
| 15 | **LOW** | **No `updated_at` timestamps** — Tables lack `updated_at` columns for tracking record modifications. | Add `updated_at TIMESTAMPTZ DEFAULT NOW()` to `students`, `student_tasks`, and `allowed_applicants` tables. |
| 16 | **LOW** | **`reviewed_by` is UUID but no FK constraint** — [`student_tasks.reviewed_by`](supabase/schema.sql:75) references an admin but has no foreign key constraint. | Add `REFERENCES admins(id) ON DELETE SET NULL` for referential integrity. |

---

## 5. UI/UX & Frontend

### Strengths
- **Polished design** — Clean, modern UI with consistent color scheme (navy + amber + blue).
- **Responsive layout** — Works on mobile and desktop.
- **Framer Motion animations** — Smooth transitions and micro-interactions.
- **Progress ring** on student dashboard — Excellent visual feedback.
- **EduBot** — Helpful chatbot for student guidance.
- **Demo credentials** displayed on login page — Great for testing.
- **Accessible form labels** — Proper `htmlFor` attributes on all inputs.

### Issues & Recommendations

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 17 | **MEDIUM** | **No loading skeleton on student dashboard** — The dashboard shows a spinner while loading. A skeleton UI would provide a better perceived performance. | Replace the spinner with skeleton placeholders matching the card layout. |
| 18 | **MEDIUM** | **No error boundary** — If any page crashes, the user sees a white screen or React error. | Add a global error boundary in [`app/layout.tsx`](app/layout.tsx:18) using Next.js `error.tsx` and `global-error.tsx`. |
| 19 | **LOW** | **No `loading.tsx` files** — Next.js 14 supports `loading.tsx` for automatic loading states per route segment. | Add `loading.tsx` files for dashboard and task pages. |
| 20 | **LOW** | **No `not-found.tsx`** — Missing custom 404 page. | Add a custom 404 page at `app/not-found.tsx`. |
| 21 | **LOW** | **Hardcoded stats on landing page** — [`app/page.tsx:88-100`](app/page.tsx:88) shows "9 Documents Tracked", "24/7 EduBot Support", "100% Digital" as static values. | Consider making these dynamic or adding a subtle animation when they come into view. |
| 22 | **LOW** | **No dark mode toggle** — The app has a dark navy theme for landing/auth pages but no dark mode for the dashboard. | Add a dark mode toggle if desired, or ensure consistency. |

---

## 6. Performance & Technical Debt

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 23 | **MEDIUM** | **No `next/image` usage** — The app doesn't use Next.js Image optimization anywhere. While there are no user-uploaded images displayed, the logo and any future images should use `next/image`. | Use `next/image` for any static assets. |
| 24 | **LOW** | **`@supabase/ssr` in dependencies but unused** — [`package.json`](package.json:13) includes `@supabase/ssr` but the app uses custom JWT auth instead of Supabase Auth SSR. | Remove unused dependency. |
| 25 | **LOW** | **No `sitemap.xml` or `robots.txt`** — Missing for SEO. | Add `app/sitemap.ts` and `app/robots.ts` for better search engine indexing. |
| 26 | **LOW** | **No PWA manifest** — The app could benefit from a `manifest.json` and service worker for offline support. | Add PWA support if offline access is desired. |

---

## 7. Environment & Configuration

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 27 | **MEDIUM** | **`NEXT_PUBLIC_APP_URL` in `.env.example`** — This is set as `NEXT_PUBLIC_` prefixed, meaning it's exposed to the client. If used anywhere client-side, it could leak internal URLs. | Verify this is only used server-side, or rename to `APP_URL` without the `NEXT_PUBLIC_` prefix. |
| 28 | **LOW** | **No `vercel.json` review** — The project has a [`vercel.json`](vercel.json) but its contents weren't reviewed. | Ensure `vercel.json` has proper redirects, headers, and region configuration. |

---

## 8. Summary of Priority Actions

### 🔴 Critical (Fix Immediately)
1. **Remove dev JWT fallback** — Ensure production crashes if `JWT_SECRET` is missing.

### 🟠 High Priority
2. **Add Zod validation to login endpoint.**
3. **Add magic byte file validation** for uploads.
4. **Add rate limiting** to login and register endpoints.
5. **Add role-based middleware routing** to prevent unauthorized page access.

### 🟡 Medium Priority
6. **Add CSRF protection** or tighten `SameSite` to `strict`.
7. **Add error boundary** (`error.tsx` + `global-error.tsx`).
8. **Add loading skeletons** instead of spinners.
9. **Add pagination** to admin dashboard API.
10. **Add HSTS and CSP headers.**

### 🟢 Nice-to-Have
11. Add `updated_at` timestamps to tables.
12. Add `loading.tsx` and `not-found.tsx` pages.
13. Remove unused `@supabase/ssr` dependency.
14. Add SEO files (`sitemap.xml`, `robots.txt`).
15. Add PWA support.

---

## 9. Overall Assessment

**Architecture:** 8/10 — Clean separation of concerns, proper use of Next.js App Router, consistent patterns.  
**Security:** 7/10 — Good foundation with JWT + httpOnly cookies, but has critical gaps (dev fallback secret, no rate limiting, no CSRF).  
**UI/UX:** 9/10 — Polished, responsive, well-designed interface with helpful features like EduBot and progress tracking.  
**Code Quality:** 8/10 — Well-structured TypeScript, consistent error handling, good use of Zod validation.  
**Database:** 8/10 — Well-normalized schema with proper constraints and indexes.

**Overall:** The application is production-ready with a solid foundation. Addressing the critical and high-priority items above will significantly improve security posture and user experience.
