# ADR-0015: Frontend ↔ Backend Route Alignment Audit

**Status:** Active — Issues identified, remediation required  
**Date:** 2026-11-25  
**Audited by:** Agent (auto-generated from live source analysis)  
**Scope:** All frontend service files (`src/services/*.ts`) cross-referenced against all backend route files (`src/modules/**/*.routes.js`)

---

## Context

The project was returning HTTP 404 for requests made by authenticated users. This audit cross-references every HTTP call in the frontend service layer against the registered backend routes to identify exact mismatches, missing endpoints, and gaps in coverage.

**Frontend API base:** `VITE_API_URL || '/api'` → proxied by Vite dev server to `http://localhost:5000/api`  
**Backend mount root:** All routers mounted under `/api` in `src/app.js`

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Frontend call matches backend route exactly |
| ⚠️ | Partial match — works but with caveats (wrong method, query vs path param mismatch, etc.) |
| ❌ | Frontend calls a route that **does not exist** on the backend → guaranteed 404 |
| 🔇 | Backend route exists but **no frontend call** touches it (dead endpoint from frontend perspective) |
| 🆕 | Frontend feature exists but the entire backend module is missing |

---

## 1. Auth — `/api/auth`

Backend file: `src/modules/auth/auth.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `POST /auth/login` | POST | `POST /auth/login` | ✅ | Exact match |
| `POST /auth/register` | POST | `POST /auth/register` | ✅ | Exact match |
| `GET /auth/me` | GET | `GET /auth/me` | ✅ | Exact match |
| `POST /auth/logout` | POST | `POST /auth/logout` | ✅ | Exact match |
| `GET /auth/verify-email/:token` | GET | `GET /auth/verify-email/:token` | ✅ | Also has legacy `GET /auth/verify/:token` alias |
| `POST /auth/resend-verification` | POST | `POST /auth/resend-verification` | ✅ | Exact match |
| `POST /auth/forgot-password` | POST | `POST /auth/forgot-password` | ✅ | Exact match |
| `POST /auth/reset-password/:token` | POST | `POST /auth/reset-password/:token` | ⚠️ | Frontend uses `POST`, backend route uses `POST` ✅ but `auth.service.ts` sends `{ password }` — verify backend expects `password` field, not `newPassword` |
| `PUT /auth/change-password` | PUT | `PUT /auth/change-password` | ✅ | Exact match |
| `PUT /auth/admin/reset-password/:userId` | PUT | `PUT /auth/admin/reset-password/:userId` | ⚠️ | Backend `roleGuard(["ADMIN"])` — but `usersService.adminResetPassword` is called from admin context; ensure token carries a role string the guard accepts (`"ADMIN"` vs `"SUPER_ADMIN"`) |

**Auth summary:** Mostly healthy. 2 caveats around payload field names and role string values.

---

## 2. Divisions — `/api/divisions`

Backend file: `src/modules/divisions/division.route.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /divisions` | GET | `GET /divisions` | ✅ | Exact match (authGuard required) |
| `GET /divisions/:id` | GET | `GET /divisions/:id` | ✅ | Exact match |
| `GET /divisions/:divisionId/bootcamps` | GET | `GET /divisions/:divisionId/bootcamps` | ✅ | Exact match |
| `POST /divisions` | POST | `POST /divisions` | ⚠️ | Backend uses `roleGuard("super admin")` (lowercase string). Frontend `divisionsService.createDivision` exists but no UI page calls it yet. Guard string case may not match SUPER_ADMIN token |
| — | — | `PUT /divisions/:id` | 🔇 | Backend exists; no frontend service call |
| — | — | `DELETE /divisions/:id` | 🔇 | Backend exists; no frontend service call |

---

## 3. Bootcamps — `/api/bootcamps`

Backend file: `src/modules/bootcamps/bootcamp.route.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /bootcamps` | GET | `GET /bootcamps` | ✅ | Public, no auth required |
| `GET /bootcamps/:id` | GET | `GET /bootcamps/:id` | ✅ | Public |
| `POST /bootcamps` | POST | `POST /bootcamps` | ✅ | Requires DIVISION_ADMIN scope |
| `PUT /bootcamps/:id` | PUT | — | ❌ | **`bootcampsService.updateBootcamp` calls `PUT /bootcamps/:id` — no such route on backend.** Backend only has `/status`, `/weights`, `/screen` sub-routes. This call will always 404 |
| `PUT /bootcamps/:id/status` | PUT | `PUT /bootcamps/:id/status` | ✅ | Exact match |
| `PUT /bootcamps/:id/weights` | PUT | `PUT /bootcamps/:id/weights` | ✅ | Exact match |
| `POST /enrollments/apply` (called from bootcampsService) | POST | `POST /enrollments/apply` | ✅ | Works — but it's semantically an enrollment action placed in bootcampsService |
| `POST /bootcamps/:id/screen` (enrollmentsService) | POST | `POST /bootcamps/:id/screen` | ✅ | Exact match |

**🔴 Critical issue:** `PUT /bootcamps/:id` does not exist on the backend.

---

## 4. Sessions — `/api/sessions`

Backend file: `src/modules/sessions/session.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /sessions` | GET | `GET /sessions` | ✅ | Exact match |
| `GET /sessions?bootcamp=:id` | GET | `GET /sessions` (query param) | ⚠️ | Frontend passes `?bootcamp=<id>` as a query string. Backend `GET /sessions` route exists but it's unclear if the controller filters by `req.query.bootcamp`. The backend also exposes `GET /sessions/bootcamp/:bootcampId` (path param). **Frontend uses wrong form** — should call `/sessions/bootcamp/:id` instead |
| `GET /sessions/:id` | GET | `GET /sessions/:id` | ✅ | Exact match |
| `POST /sessions` | POST | — | ❌ | **`sessionsService.createSession` calls `POST /sessions`. Backend only has `POST /sessions/propose`. This will always 404** |
| `PUT /sessions/:id/status` | PUT | — | ❌ | **`sessionsService.updateSessionStatus` calls `PUT /sessions/:id/status` — does not exist. Backend has separate `PUT /sessions/:id/approve`, `PUT /sessions/:id/reject`, `PUT /sessions/:id/cancel`** |

**🔴 Critical issues (3):**
1. `POST /sessions` → must be `POST /sessions/propose`
2. `PUT /sessions/:id/status` → must split into `/approve`, `/reject`, or `/cancel`
3. `GET /sessions?bootcamp=` → query param form unverified; backend path is `/sessions/bootcamp/:id`

---

## 5. Attendance — `/api/attendance`

Backend file: `src/modules/attendance/attendance.route.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `POST /attendance/open-window` | POST | `POST /attendance/open-window` | ✅ | Exact match |
| `POST /attendance/submit` | POST | `POST /attendance/submit` | ✅ | Exact match (alias `POST /attendance/` also exists) |
| `GET /attendance` (with query params) | GET | — | ❌ | **`attendanceService.getRecords` calls `GET /attendance` with optional `?sessionId` / `?bootcampId` params. Backend has no `GET /attendance` root route. Backend only exposes `GET /attendance/me` and `GET /attendance/session/:sessionId`** |
| `PUT /attendance/:id/override` | PUT | — | ❌ | **`attendanceService.overrideAttendance` calls `PUT /attendance/:id/override`. Backend route is `POST /attendance/override` (different method AND path shape)** |
| — | — | `GET /attendance/me` | 🔇 | Backend exists; `attendanceService` has no method for it. No page fetches the student's own attendance records via this route |
| — | — | `GET /attendance/session/:sessionId` | 🔇 | Backend exists; no frontend service method |

**🔴 Critical issues (2):**
1. `GET /attendance` → does not exist; should use `GET /attendance/me` or `GET /attendance/session/:sessionId`
2. `PUT /attendance/:id/override` → must be `POST /attendance/override` with `{ sessionId, userId, status }` body

---

## 6. Enrollments — `/api/enrollments`

Backend file: `src/modules/enrollments/enrollment.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /enrollments/me` | GET | `GET /enrollments/me` | ✅ | Exact match |
| `POST /enrollments/apply` | POST | `POST /enrollments/apply` | ✅ | Also has alias `POST /enrollments/` |
| `GET /enrollments/bootcamp/:bootcampId` | GET | `GET /enrollments/bootcamp/:id` | ✅ | Exact match (DIVISION_ADMIN scope) |

**Enrollments summary: Fully aligned ✅**

---

## 7. Tasks — `/api/tasks`

Backend file: `src/modules/tasks/task.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /tasks` (with optional `?bootcamp=` / `?session=` params) | GET | `GET /tasks` | ⚠️ | Route exists. Whether the controller honours `bootcamp` / `session` query params depends on the controller implementation — needs verification |
| `GET /tasks/:id` | GET | `GET /tasks/:id` | ✅ | Exact match |
| `POST /tasks` | POST | `POST /tasks` | ✅ | Exact match (INSTRUCTOR scope) |
| `DELETE /tasks/:id` | DELETE | `DELETE /tasks/:id` | ✅ | Exact match |
| — | — | `PUT /tasks/:id` | 🔇 | Backend update route exists; `tasksService` has no `updateTask` call |

---

## 8. Submissions — `/api/submissions`

Backend file: `src/modules/submissions/submission.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /submissions` (with `?taskId` / `?userId`) | GET | — | ❌ | **`submissionsService.getSubmissions` calls `GET /submissions`. No such root GET route on backend. Backend only has `GET /submissions/me` and `GET /submissions/task/:taskId`** |
| `POST /tasks/:taskId/submit` | POST | — | ❌ | **`submissionsService.submit` calls `POST /tasks/:taskId/submit`. No such route exists. Backend submission endpoint is `POST /submissions` (with `taskId` in the body)** |
| `PUT /submissions/:id/grade` | PUT | — | ❌ | **`submissionsService.grade` calls `PUT /submissions/:id/grade`. Backend route is `POST /submissions/:id/grade` (POST, not PUT)** |
| — | — | `GET /submissions/me` | 🔇 | Backend exists; `submissionsService` has no method for it |
| — | — | `GET /submissions/task/:taskId` | 🔇 | Backend exists; `submissionsService` has no method for it |
| — | — | `POST /submissions/:id/return` | 🔇 | Backend exists; no frontend service call |

**🔴 Critical issues (3) — this module is the most broken:**
1. `GET /submissions` → 404; must use `GET /submissions/me` or `GET /submissions/task/:taskId`
2. `POST /tasks/:taskId/submit` → 404; must be `POST /submissions` with `taskId` in body
3. `PUT /submissions/:id/grade` → 404; must be `POST /submissions/:id/grade`

---

## 9. Groups — `/api/groups`

Backend file: `src/modules/groups/group.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /groups?bootcamp=:id` | GET | `GET /groups/bootcamp/:bootcampId` | ❌ | **Frontend uses query string `?bootcamp=`. Backend expects path param `/groups/bootcamp/:bootcampId`. Will 404** |
| `POST /groups` | POST | `POST /groups` | ✅ | Exact match |
| `POST /groups/:id/members` | POST | `POST /groups/:id/members` | ✅ | Exact match |
| `DELETE /groups/:id/members/:userId` | DELETE | — | ❌ | **`groupsService.removeMember` calls `DELETE /groups/:id/members/:userId`. No such route on backend** |
| — | — | `PUT /groups/:id/leader` | 🔇 | Backend exists; no frontend service call |

**🔴 Critical issues (2):**
1. `GET /groups?bootcamp=` → must be `GET /groups/bootcamp/:bootcampId`
2. `DELETE /groups/:id/members/:userId` → no backend route exists

---

## 10. Users — `/api/users`

Backend file: `src/modules/users/user.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /users` (with optional `?role=`) | GET | `GET /users` | ✅ | Exact match |
| `GET /users/:id` | GET | `GET /users/:id` | ✅ | Exact match |
| `PUT /users/:id/roles` | PUT | — | ❌ | **`usersService.updateRoles` calls `PUT /users/:id/roles`. No such route on backend. Backend only has `PUT /users/:id` (generic update)** |
| — | — | `POST /users` (create user) | 🔇 | Backend exists (admin-only); no frontend service call |
| — | — | `PUT /users/:id` (generic update) | 🔇 | Backend exists; `usersService` has no `updateUser` method |

**🔴 Critical issue:** `PUT /users/:id/roles` → 404; must be `PUT /users/:id` with roles in body (or backend needs new route).

---

## 11. Reports — `/api/reports`

Backend file: `src/modules/reports/report.route.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| `GET /reports` | GET | `GET /reports` | ✅ | Exact match (ADMIN role required) |
| `GET /reports/analytics` | GET | `GET /reports/analytics` | ✅ | Exact match |
| `POST /reports` | POST | `POST /reports` | ✅ | Exact match |
| `PUT /reports/:id` | PUT | `PUT /reports/:id` | ✅ | Exact match |
| `DELETE /reports/:id` | DELETE | `DELETE /reports/:id` | ⚠️ | Backend uses `roleGuard(['super admin'])` (lowercase) — guard string may not match the `SUPER_ADMIN` token value |

**Reports summary:** Mostly aligned. Role string case mismatch risk on delete.

---

## 12. Feedback — `/api/feedback`

Backend file: `src/modules/feedback/feedback.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| — | — | `POST /feedback/session` | 🔇 | Backend exists; **no frontend service file** (`feedback.service.ts` does not exist) |
| — | — | `POST /feedback/peer-review` | 🔇 | Backend exists; no frontend service file |
| — | — | `GET /feedback/session/:sessionId` | 🔇 | Backend exists; no frontend service file |

**🆕 Entire feedback service layer is missing from the frontend.** The `feedbackSlice.ts` exists in the store but `src/services/feedback.service.ts` was never created.

---

## 13. Progress — `/api/progress`

Backend file: `src/modules/progress/progress.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| — | — | `GET /progress/:bootcampId/me` | 🔇 | Backend exists; **no frontend service file** (`progress.service.ts` does not exist). `StudentProgress.tsx` page exists but has no API call wired up |

**🆕 Progress service entirely missing from frontend.**

---

## 14. Notifications — `/api/notifications`

Backend file: `src/modules/notification/notification.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| — | — | `GET /notifications` | 🔇 | Backend exists; **no frontend service file** (`notifications.service.ts` does not exist). Notification pages exist but make no API calls |
| — | — | `PUT /notifications/:id/read` | 🔇 | Backend exists; no frontend service call |

**🆕 Notifications service entirely missing from frontend.**

---

## 15. Induction — `/api/induction`

Backend file: `src/modules/induction/induction.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| — | — | `GET /induction/leaderboard/:bootcampId` | 🔇 | Backend exists; **no frontend service file**. `AdminReports.tsx` / `AdminBootcamps.tsx` pages do not call this endpoint |
| — | — | `POST /induction/decide` | 🔇 | Backend exists; no frontend service call |

**🆕 Induction service entirely missing from frontend.**

---

## 16. Resources — `/api/resources`

Backend file: `src/modules/resources/resource.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| — | — | `GET /resources/session/:sessionId` | 🔇 | Backend exists; **no frontend service file** (`resources.service.ts` does not exist) |
| — | — | `POST /resources/session/:sessionId` | 🔇 | Backend exists; no frontend service call |
| — | — | `GET /resources/:id/download` | 🔇 | Backend exists; no frontend service call |

**🆕 Resources service entirely missing from frontend.**

---

## 17. Audit — `/api/audit`

Backend file: `src/modules/audit/activity.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| — | — | `GET /audit` | 🔇 | Backend exists; **no frontend service file**. `AdminAuditLog.tsx` page exists but makes no API call |

**🆕 Audit service entirely missing from frontend.**

---

## 18. Projects — `/api/projects`

Backend file: `src/modules/projects/project.routes.js`

| Frontend Call | Method | Backend Route | Status | Notes |
|---|---|---|---|---|
| — | — | `GET /projects/bootcamp/:bootcampId` | 🔇 | Backend exists; no frontend page or service calls it |
| — | — | `POST /projects` | 🔇 | Backend exists; no frontend service call |

---

## Consolidated Issue Register

### 🔴 Critical — Guaranteed 404s (fix immediately)

| # | Frontend Call | Should Be | Module |
|---|---|---|---|
| C-1 | `PUT /bootcamps/:id` | Does not exist — split into `/status`, `/weights` calls | Bootcamps |
| C-2 | `POST /sessions` | `POST /sessions/propose` | Sessions |
| C-3 | `PUT /sessions/:id/status` | `PUT /sessions/:id/approve` or `/reject` or `/cancel` | Sessions |
| C-4 | `GET /sessions?bootcamp=:id` | `GET /sessions/bootcamp/:id` (verify controller) | Sessions |
| C-5 | `GET /attendance` | `GET /attendance/me` or `GET /attendance/session/:sessionId` | Attendance |
| C-6 | `PUT /attendance/:id/override` | `POST /attendance/override` (method + path both wrong) | Attendance |
| C-7 | `GET /submissions` | `GET /submissions/me` or `GET /submissions/task/:taskId` | Submissions |
| C-8 | `POST /tasks/:taskId/submit` | `POST /submissions` with `{ taskId }` in body | Submissions |
| C-9 | `PUT /submissions/:id/grade` | `POST /submissions/:id/grade` | Submissions |
| C-10 | `GET /groups?bootcamp=:id` | `GET /groups/bootcamp/:bootcampId` | Groups |
| C-11 | `DELETE /groups/:id/members/:userId` | No backend route — add backend route or remove FE call | Groups |
| C-12 | `PUT /users/:id/roles` | No backend route — `PUT /users/:id` or add `/roles` backend route | Users |

### ⚠️ Warnings — Likely Misbehaviour

| # | Issue | Module |
|---|---|---|
| W-1 | `roleGuard("super admin")` vs token role `"SUPER_ADMIN"` — case mismatch | Divisions, Reports |
| W-2 | `POST /auth/reset-password/:token` body field: frontend sends `{ password }`, verify backend expects same field name | Auth |
| W-3 | `GET /tasks?bootcamp=` / `?session=` — verify task controller reads these query params | Tasks |
| W-4 | Token stored in `localStorage` (not `httpOnly` cookie) contradicts ADR-0012 — `authSlice` reads `localStorage.getItem('token')` | Auth/Security |

### 🆕 Frontend Pages With No API Wire-Up (UI exists, service missing)

| Page | Missing Service | Backend Endpoints Available |
|---|---|---|
| `StudentProgress.tsx` | `progress.service.ts` | `GET /progress/:bootcampId/me` |
| `StudentResources.tsx`, `InstructorResources.tsx` | `resources.service.ts` | `GET /resources/session/:id`, `POST /resources/session/:id`, `GET /resources/:id/download` |
| `StudentNotifications.tsx`, `InstructorNotifications.tsx`, `AdminNotifications.tsx` | `notifications.service.ts` | `GET /notifications`, `PUT /notifications/:id/read` |
| `AdminAuditLog.tsx` | `audit.service.ts` | `GET /audit` |
| `InstructorSessions.tsx` feedback submission | `feedback.service.ts` | `POST /feedback/session`, `POST /feedback/peer-review`, `GET /feedback/session/:id` |
| `AdminReports.tsx` / Admin induction UI | `induction.service.ts` | `GET /induction/leaderboard/:bootcampId`, `POST /induction/decide` |

---

## Decision

This audit establishes the authoritative baseline for all frontend ↔ backend API alignment work.

**Immediate action required (priority order):**

1. **Fix the 12 guaranteed 404 routes** (C-1 through C-12) — these break core user flows for every role.
2. **Create 6 missing service files** — `progress.service.ts`, `resources.service.ts`, `notifications.service.ts`, `audit.service.ts`, `feedback.service.ts`, `induction.service.ts`.
3. **Resolve role guard string case** — standardise to uppercase (`"SUPER_ADMIN"`, `"ADMIN"`) across all backend `roleGuard` calls.
4. **Audit `localStorage` token storage** vs ADR-0012 (W-4) — the access token is being persisted in `localStorage` which contradicts the in-memory + `httpOnly` cookie design.

---

## Consequences

- Until C-1 through C-12 are fixed, authenticated users will receive 404 responses for most write operations and several read operations regardless of their role or token validity.
- The 6 missing service files mean entire page sections (`Progress`, `Resources`, `Notifications`, `Audit`, `Feedback`, `Induction`) render with no data.
- Role guard string inconsistency means super-admin and division-admin actions may return 403 Forbidden even with a valid token.
