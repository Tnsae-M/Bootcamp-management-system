# CSEC-ASTU Bootcamp Management System (BMS) — Agent Handoff Document

**Generated:** 2026-11-20  
**Project Workspace:** `c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project`  
**Current State:** Full stack operational. Backend 100% migrated to PostgreSQL & Prisma with legacy Mongoose completely removed (all 16 `*.model.js` files deleted). Backend test suite 100% green (102/102). Frontend rebuilt across all 5 stages, 100% typechecked (`tsc --noEmit` code 0), production build passing, and frontend test suite 100% green (13/13).

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
- [UI/UX Improvement Plan (Livery-Adapted)](docs/ui-ux-improvement-plan.md) — Structure, motion, 8px radii, 4px grid, and direct voice adapted from Udemy design kit while preserving CSEC-ASTU brand colors (`#2563eb` / `#3b82f6`).

---

## 3. Directory Structure & Key Modules

### Backend (`/backend`)

- `src/app.js`: Express app with CORS (`credentials: true`, whitelist ports 3000 & 5173), `cookie-parser`, JSON parsing, error middleware. All endpoints mounted at `/api`.
- `src/routes/index.js`: Mounted module routers (`/auth`, `/users`, `/divisions`, `/bootcamps`, `/sessions`, `/attendance`, `/enrollments`, `/tasks`, `/submissions`, `/progress`, `/reports`, `/groups`, `/resources`, `/audit`).
- `src/modules/auth/`: Hybrid auth implementation returning sanitized user with `roles` array and tokens.
- `src/modules/`: 100% PostgreSQL via Prisma ORM. Mongoose completely purged (`mongoose` removed from `package.json`, 16 legacy `*.model.js` files deleted).
- `prisma/schema.prisma`: Comprehensive schema definitions for PostgreSQL (`csec_bms_db`).
- `tests/`: 16 Vitest test suites (102 tests passing).

### Frontend (`/frontend`)

- `src/api/client.ts`: Axios instance with `withCredentials: true`, Bearer interceptor, and 401 automatic silent refresh retry queue.
- `src/app/store.ts`: Redux Toolkit store with 10 slices (`auth`, `bootcamps`, `sessions`, `tasks`, `attendance`, `groups`, `enrollments`, `reports`, `feedback`, `ui`).
- `src/config/navigation.ts`: Declarative navigation seam providing per-role navigation trees (`getNavForRole`, `getDashboardRoot`).
- `src/components/ui/`: Tier 1 primitives (`Button`, `Input`, `Textarea`, `Card`, `Skeleton`, `FormField`, `Badge`, `Modal`, `EmptyState`, `Separator`).
- `src/components/common/`: Tier 2 deep domain primitives (`Logo`, `PageHeader`, `StatusBadge`, `StatGrid`, `DataTable`, `Breadcrumbs`).
- `src/components/layout/`: `Sidebar` (collapsible 256px $\leftrightarrow$ 60px), `Navbar` (with multi-role switcher), `DashboardLayout`, and `ProtectedRoute`.
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

#### Backend Test Suite (102 tests)

```powershell
Set-Location c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend
npx vitest run
```

#### Frontend Test Suite (13 tests)

```powershell
Set-Location c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
npx vitest run
```

#### Frontend Typecheck (tsc)

```powershell
npm run lint --prefix c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
```

#### Frontend Production Build

```powershell
npm run build --prefix c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
```

### Running Development Servers

#### Backend (Port 5000)

```powershell
cd c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend
npm run dev
```

#### Frontend (Port 3000)

```powershell
cd c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/frontend
npm run dev
```

---

## 5. Seeded Test Data & Role Accounts

The database is seeded (`npm run seed --prefix backend`) with realistic datasets covering all 4 academic divisions, all 6 bootcamp lifecycle phases, session attendance PIN verification, deliverables, capstone squads, and induction decisions:

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

## 6. Recent Work & Bug Fixes (Latest Session)

1. **Database Seeding:**
   - Expanded `backend/prisma/seed.js` with comprehensive mock data covering 4 divisions, 6 bootcamps, capstone squad (*CyberDefenders Squad Alpha*), peer reviews, resources, notifications, and 4-signal induction records.
2. **Database Cleanup Audit (Mongoose $\rightarrow$ PostgreSQL/Prisma):**
   - Audited all modules and eliminated all 16 legacy `*.model.js` files.
   - Migrated `users`, `audit`, `progress`, `reports`, `resources`, `enrollments`, and `projects` modules to Prisma ORM.
   - Removed `mongoose` dependency from `backend/package.json` and legacy `MONGODB_URL` from `.env`.
   - Updated `enrollment.service.test.js` to test Prisma transactions.
3. **Frontend & Backend Communication Alignment:**
   - Resolved port 3000 dev server to port 5000 backend routing.
   - Configured Vite proxy and Axios `apiClient` to preserve the `/api` prefix expected by Express.
4. **Auth & Role Pipeline Fixes:**
   - Updated `auth.service.js` to return `roles` in `loginUser` and `currentUser` responses so the frontend `authSlice` receives the user's role array.
5. **Admin Table Key & Rendering Polish:**
   - Fixed missing `<tr>` key warning in `AdminUsers.tsx` with fallback keys (`u.id || u._id || userIdx`).
   - Deduplicated role tags in `<StatusBadge>` mapping with unique composite keys (`${u.id}-${r}-${roleIdx}`).
   - Enhanced `user.service.js` to return `id`, `_id`, `fullName`, `name`, `universityId`, `department`, and deduplicated `roles`.
6. **UI/UX Improvement Plan:**
   - Formulated [docs/ui-ux-improvement-plan.md](docs/ui-ux-improvement-plan.md) adapting the Udemy Livery design kit (neutral dark surfaces, 8px default radii, 4px spacing rhythm, 250ms transitions, conversational microcopy) while maintaining CSEC-ASTU Electric Blue brand identity.

---

## 7. What the Next Session Can Focus On

1. **Execute UI/UX Improvement Plan (Phase 1–3):**
   - **Phase 1 (Tokens):** Refine CSS variables in `src/index.css` (neutral dark surfaces, un-tinted soft shadows, 8px default radius).
   - **Phase 2 (Tier 1 Base Controls):** Polish `Button`, `Card`, `Input`, and `Modal` recipes.
   - **Phase 3 (Tier 2 Primitives):** Polish `StatusBadge`, `StatGrid`, and `PageHeader` in sentence case.
2. **End-to-End Interactive Verification:**
   - Test flows live across roles (Guest apply $\rightarrow$ Admin approve $\rightarrow$ Student PIN attendance with `749201` $\rightarrow$ Instructor grade submission $\rightarrow$ Induction leaderboard).
3. **Deployment Preparation:**
   - Dockerfile creation/review, production environment variable validation, and CI/CD check scripts.

---

## 8. Suggested Skills

When resuming work on this repository, the next agent should invoke:

- `codebase-design` — To maintain the deep module boundaries established in Tier 1 and Tier 2 primitives.
- `diagnosing-bugs` — If any live runtime API connection or database issues occur.
- `tdd` — When introducing new API endpoints or complex feature slices.
- `antigravity-guide` — For Antigravity workflow standards and tool ergonomics.
