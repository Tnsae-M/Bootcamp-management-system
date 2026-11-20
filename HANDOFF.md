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
- [ADR-0010: Frontend State Management RTK](docs/adr/0010-frontend-state-management-rtk.md) — Redux Toolkit + Axios client + typed async thunks.
- [ADR-0011: Frontend Route Partitioning by Role](docs/adr/0011-frontend-route-partitioning-by-role.md) — Role-partitioned portals (`/dashboard/:role/*`) with active role switching for multi-role users.
- [ADR-0012: Hybrid Auth httpOnly Cookies](docs/adr/0012-hybrid-auth-httponly-cookies.md) — Short-lived Bearer access token in memory + `httpOnly`, `SameSite=Lax` refresh cookie with automatic silent refresh queue.
- [ADR-0013: Two-Tier UI Deep Primitives](docs/adr/0013-two-tier-ui-deep-primitives.md) — Tier 1 (shadcn/radix base) + Tier 2 (deep domain primitives hiding domain status maps and token logic).

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
- `src/tests/`: Vitest frontend unit tests (`navigation.test.ts`, `authSlice.test.ts`, `utils.test.ts`).

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

## 5. Seeded Test Data & Role Accounts

The database is seeded with complete realistic datasets covering all 4 academic divisions, all 6 bootcamp lifecycle phases, session attendance PIN verification, deliverables, capstone squads, and induction decisions:

| Role | Account Email | Password | Scope & Notes |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `tinsae.melkamu.tk@gmail.com` | `Admin123!` | GLOBAL scope — Full system administrative access, audit logs, reports |
| **DIVISION_ADMIN** | `dev.admin@csec.astu.edu.et` | `Admin123!` | Development Division Head |
| **DIVISION_ADMIN** | `cyber.admin@csec.astu.edu.et` | `Admin123!` | Cybersecurity Division Head (Reviews Session proposals) |
| **DIVISION_ADMIN** | `cp.admin@csec.astu.edu.et` | `Admin123!` | Competitive Programming Division Head |
| **DIVISION_ADMIN** | `ai.admin@csec.astu.edu.et` | `Admin123!` | Applied AI Division Head |
| **INSTRUCTOR** | `cyber.instructor@csec.astu.edu.et` | `Password123!` | Cybersecurity Lead (manages active sessions, grading, PIN) |
| **INSTRUCTOR** | `instructor@csec.astu.edu.et` | `Password123!` | Web Development Lead |
| **INSTRUCTOR** | `cp.instructor@csec.astu.edu.et` | `Password123!` | Competitive Programming Coach |
| **STUDENT** | `student@csec.astu.edu.et` | `Password123!` | Abebe Bikila — Squad leader, active in Cyber & Web (ready to enter live PIN!) |
| **STUDENT** | `selam.student@csec.astu.edu.et` | `Password123!` | Selamawit Tadesse — Top rank (94.2%), Inducted 2025, active in 2026 |
| **STUDENT** | `kidus.student@csec.astu.edu.et` | `Password123!` | Kidus Yohannes — Active in Cyber |
| **STUDENT** | `meron.student@csec.astu.edu.et` | `Password123!` | Meron Hailu — Active in Cyber |
| **STUDENT** | `yared.student@csec.astu.edu.et` | `Password123!` | Yared Alemu — Cohort 2025 `NOT_INDUCTED` (<75% threshold demo) |
| **GUEST** | `applicant@csec.astu.edu.et` | `Password123!` | Chaltu Desta — Pending applicant in Web Dev 2026 |
| **GUEST** | `rejected.applicant@csec.astu.edu.et` | `Password123!` | Dawit Mengistu — Rejected applicant status demo |
| **GUEST** | `new.guest@csec.astu.edu.et` | `Password123!` | Helen Berhanu — Clean guest with no applications submitted |

### Live Attendance PIN Demo
- **Bootcamp:** Cybersecurity & Defense Bootcamp 2026 (`ACTIVE`)
- **Session:** *Session 2: Web App Penetration Testing & OWASP Top 10* (`APPROVED`, active window)
- **Active PIN Code:** `749201`
- **Verification Flow:** Log in as `student@csec.astu.edu.et` $\rightarrow$ Navigate to Student Sessions $\rightarrow$ Enter PIN `749201` to record attendance as `PRESENT`.

---

## 6. What the Next Session Can Focus On

1. **End-to-End Interactive Testing:** Run both servers concurrently and test end-to-end user journeys across all 4 role portals using the seeded accounts.
2. **Deployment Preparation:** Dockerfile creation or review, environment variable configuration for staging/production.

---

## 7. Suggested Skills

When resuming work on this repository, the next agent should invoke:
- `codebase-design` — To maintain the deep module boundaries established in Tier 1 and Tier 2 primitives.
- `diagnosing-bugs` — If any live runtime API connection or database issues occur.
- `tdd` — When introducing new API endpoints or complex feature slices.
- `antigravity-guide` — For Antigravity workflow standards and tool ergonomics.

