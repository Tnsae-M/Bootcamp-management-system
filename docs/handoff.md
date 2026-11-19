# CSEC-ASTU Bootcamp Management System (BMS) — Agent Handoff Document

**Generated:** 2026-11-20  
**Project Workspace:** `c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project`  
**Current State:** Full stack operational. Backend test suite 100% green (102/102). Frontend rebuilt from scratch across all 5 stages, 100% typechecked (`tsc --noEmit` code 0), production build passing, and frontend test suite 100% green (13/13).

---

## 1. Project Overview & Ubiquitous Language

The **CSEC-ASTU Bootcamp Management System (BMS)** is the centralized management platform engineered for the Computer Science & Engineering Club at Adama Science and Technology University (ASTU). It manages specialized division bootcamps (Competitive Programming, Cybersecurity & Defense, Software Engineering, Applied AI), cohort lifecycle phases, dynamic session attendance PIN verification, deliverable submissions, and computes transparent graduation induction using a multi-signal evaluation model.

### Ubiquitous Language Key Terms
- **Division:** Specialization academic pillar (e.g., Development, Cybersecurity, CP, AI).
- **Bootcamp / Cohort:** Training program with specific dates and 6-phase lifecycle: `DRAFT` ➔ `OPEN` ➔ `SCREENING` ➔ `ACTIVE` ➔ `COMPLETED` ➔ `ARCHIVED`.
- **Induction Signals (4-Signal Model):**
  1. *Attendance Integrity* (default 30% weight): Validated PIN check-in during active session windows.
  2. *Task Rigor & Completion* (default 40% weight): Laboratory solutions turn-in rate.
  3. *Grading Mastery* (Average Score): Mean evaluation points awarded by instructors.
  4. *Capstone Milestones & Peer Review* (default 20% weight + 10% peer): Team milestones and peer feedback.
  - *Threshold:* Students achieving $\ge 75\%$ aggregate index are inducted into CSEC.
- **Roles:** `SUPER_ADMIN`, `DIVISION_ADMIN`, `INSTRUCTOR`, `STUDENT`, `GUEST`.

---

## 2. Architecture & Decision Records (ADRs)

Consult the ratified ADR documents:
- [ADR-0010: Frontend State Management RTK](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/docs/adr/0010-frontend-state-management-rtk.md) — Redux Toolkit + Axios client + typed async thunks.
- [ADR-0011: Frontend Route Partitioning by Role](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/docs/adr/0011-frontend-route-partitioning-by-role.md) — Role-partitioned portals (`/dashboard/:role/*`) with active role switching for multi-role users.
- [ADR-0012: Hybrid Auth httpOnly Cookies](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/docs/adr/0012-hybrid-auth-httponly-cookies.md) — Short-lived Bearer access token in memory + `httpOnly`, `SameSite=Lax` refresh cookie with automatic silent refresh queue.
- [ADR-0013: Two-Tier UI Deep Primitives](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/docs/adr/0013-two-tier-ui-deep-primitives.md) — Tier 1 (shadcn/radix base) + Tier 2 (deep domain primitives hiding domain status maps and token logic).

---

## 3. Directory Structure & Key Modules

### Backend (`/backend`)
- `src/app.js`: Express app with CORS (`credentials: true`), `cookie-parser`, JSON parsing, error middleware.
- `src/routes/index.js`: Mounted module routers (`/auth`, `/users`, `/divisions`, `/bootcamps`, `/sessions`, `/attendance`, `/enrollments`, `/tasks`, `/submissions`, `/progress`, `/reports`, `/groups`, `/resources`, `/audit`).
- `src/modules/auth/`: Hybrid auth implementation with `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/login`, `POST /api/auth/register`, and `PUT /api/auth/change-password`.
- `prisma/schema.prisma`: Schema definitions for PostgreSQL database.
- `tests/`: 16 Vitest test suites (102 tests).

### Frontend (`/frontend`)
- `src/api/client.ts`: Axios instance with `withCredentials: true`, Bearer interceptor, and 401 automatic silent refresh retry queue.
- `src/app/store.ts`: Redux Toolkit store with 10 slices (`auth`, `bootcamps`, `sessions`, `tasks`, `attendance`, `groups`, `enrollments`, `reports`, `feedback`, `ui`).
- `src/config/navigation.ts`: Declarative navigation seam providing per-role navigation trees (`getNavForRole`, `getDashboardRoot`).
- `src/components/ui/`: Tier 1 primitives (`Button`, `Input`, `Textarea`, `Card`, `Skeleton`, `FormField`, `Badge`, `Modal`, `EmptyState`, `Separator`).
- `src/components/common/`: Tier 2 deep domain primitives (`Logo`, `PageHeader`, `StatusBadge`, `StatGrid`, `DataTable`, `Breadcrumbs`).
- `src/components/layout/`: `Sidebar` (collapsible 256px $\leftrightarrow$ 60px), `Navbar`, `DashboardLayout`, and `ProtectedRoute`.
- `src/pages/`:
  - Public/Auth: `LandingPage`, `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `VerifyEmailPage`, `NotFoundPage`.
  - Guest (`/dashboard/guest/*`): `GuestDashboard`, `GuestApplications`, `GuestProfile`.
  - Student (`/dashboard/student/*`): `StudentDashboard`, `StudentBootcamps`, `StudentSessions`, `StudentTasks`, `StudentProgress`, `StudentGroups`, `StudentResources`, `StudentNotifications`.
  - Instructor (`/dashboard/instructor/*`): `InstructorDashboard`, `InstructorSessions`, `InstructorTasks`, `InstructorSubmissions`, `InstructorAttendance`, `InstructorGroups`, `InstructorResources`, `InstructorNotifications`.
  - Admin (`/dashboard/admin/*`): `AdminDashboard`, `AdminDivisions`, `AdminBootcamps`, `AdminUsers`, `AdminEnrollments`, `AdminReports`, `AdminAuditLog`, `AdminNotifications`.
- `src/tests/`: Vitest frontend unit tests ([navigation.test.ts](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend/src/tests/navigation.test.ts), [authSlice.test.ts](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend/src/tests/authSlice.test.ts), [utils.test.ts](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend/src/tests/utils.test.ts)).

---

## 4. How to Run & Verify

### Running Tests
- **Backend Test Suite (102 tests):**
  ```powershell
  Set-Location c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend
  npx vitest run
  ```
- **Frontend Test Suite (13 tests):**
  ```powershell
  Set-Location c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
  npx vitest run
  ```
- **Frontend Typecheck (tsc):**
  ```powershell
  npm run lint --prefix c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
  ```
- **Frontend Production Build:**
  ```powershell
  npm run build --prefix c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
  ```

### Running Development Servers
- **Backend (Port 5000):**
  ```powershell
  cd c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend
  npm run dev
  ```
- **Frontend (Port 3000):**
  ```powershell
  cd c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
  npm run dev
  ```

---

## 5. What the Next Session Can Focus On

1. **End-to-End Interactive Testing:** Run both servers concurrently and test end-to-end user journeys (guest registration $\rightarrow$ application $\rightarrow$ admin admissions screening $\rightarrow$ student session check-in with PIN $\rightarrow$ instructor grading).
2. **Database Seeding & Test Data:** Populate seed scripts (`prisma/seed.js`) with realistic mock divisions, bootcamps, and users for visual demonstration.
3. **Deployment Preparation:** Dockerfile creation or review, environment variable configuration for staging/production.

---

## 6. Suggested Skills

When resuming work on this repository, the next agent should invoke:
- `codebase-design` — To maintain the deep module boundaries established in Tier 1 and Tier 2 primitives.
- `diagnosing-bugs` — If any live runtime API connection or database issues occur.
- `tdd` — When introducing new API endpoints or complex feature slices.
- `antigravity-guide` — For Antigravity workflow standards and tool ergonomics.

