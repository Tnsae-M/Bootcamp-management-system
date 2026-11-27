# ADR-0016: API Contract Audit & Endpoint Cleanup

- **Status:** Accepted
- **Date:** 2026-11-28
- **Supersedes / Extends:** [ADR-0015: Frontend ↔ Backend Route Alignment Audit](0015-frontend-backend-route-alignment-audit.md)

---

## Context

Following the initial route alignment fixes in ADR-0015, manual testing and a full cross-check of all `frontend/src/services/*.ts` files against all `backend/src/modules/*/*.route(s).js` files revealed additional API contract mismatches:

1. Several frontend service methods in `frontend/src/services/index.ts` and `tasks.service.ts` were still calling non-existent nested routes or mismatched query parameters, causing `404 Not Found` responses or silent filter failures.
2. Several frontend pages were calling removed service methods (`attendanceService.getRecords()`, `submissionsService.getSubmissions()`), throwing synchronous `TypeError`s inside `Promise.all(...)` and preventing valid API responses (like `GET /api/sessions` and `GET /api/tasks`) from rendering.
3. Several backend routes are duplicated aliases or completely unused by the frontend, while a few frontend service methods point to endpoints that do not exist on the backend.

### Fixes Already Applied (2026-11-28)

- **`StudentSessions.tsx`:** Replaced `attendanceService.getRecords()` with `attendanceService.getMyAttendance()` in `loadSessionsData` and `handlePinSubmit` (restored session rendering).
- **`StudentTasks.tsx`:** Replaced `submissionsService.getSubmissions()` with `submissionsService.getMySubmissions()` in `loadTasksData` and `handleSubmitWork` (restored task rendering).
- **`tasks.service.ts`:** Fixed `getTasks()` query parameters from `bootcamp` / `session` to `bootcampId` / `type` to match `task.controller.js`.
- **`services/index.ts` (`feedbackService`):** Fixed `getFeedback` (`GET /feedback/session/${sessionId}`) and `submitFeedback` (`POST /feedback/session` with `{ sessionId, ...payload }`), and added `submitPeerReview` (`POST /feedback/peer-review`).

---

## Audit Findings

### 1. Endpoints & Call Sites That Need Replacing

#### A. Frontend Services → Backend Route Mismatches (Guaranteed 404s)

| Service / File | Current Frontend Call | Issue | Replacement |
|---|---|---|---|
| `resourcesService` (`services/index.ts`) | `GET /resources?session=...&bootcamp=...` | Route does not exist on `resource.routes.js` | `GET /resources/session/${sessionId}` |
| `resourcesService` (`services/index.ts`) | `POST /resources` | Route does not exist on `resource.routes.js` | `POST /resources/session/${sessionId}` |
| `projectsService` (`services/index.ts`) | `GET /bootcamps/${bootcampId}/projects` | Mounted at `/api/projects`, not `/api/bootcamps` | `GET /projects/bootcamp/${bootcampId}` |
| `projectsService` (`services/index.ts`) | `POST /bootcamps/${bootcampId}/projects` | Mounted at `/api/projects`, not `/api/bootcamps` | `POST /projects` (pass `bootcampId` in body) |

#### B. Remaining Broken Frontend Call Sites (`tsc --noEmit` Errors)

| File | Broken Call | Replacement |
|---|---|---|
| `features/attendance/attendanceSlice.ts` (L47) | `attendanceService.getRecords(params)` | `getSessionAttendance(sessionId)` or `getMyAttendance()` |
| `pages/instructor/InstructorAttendance.tsx` (L65) | `attendanceService.getRecords({ sessionId })` | `attendanceService.getSessionAttendance(sessId)` |
| `pages/instructor/InstructorAttendance.tsx` (L87) | `attendanceService.overrideAttendance(id, status, note)` | `attendanceService.overrideAttendance({ sessionId, userId, status, overrideNote })` |
| `pages/instructor/InstructorDashboard.tsx` (L49) | `submissionsService.getSubmissions()` | Remove or replace with per-task `getSubmissionsByTask(taskId)` (currently breaks dashboard session rendering!) |
| `pages/instructor/InstructorSubmissions.tsx` (L52, L87) | `submissionsService.getSubmissions()` | `submissionsService.getSubmissionsByTask(selectedTaskId)` |
| `pages/instructor/InstructorGroups.tsx` (L120) | `groupsService.removeMember(...)` | Add `DELETE /api/groups/:id/members/:userId` on backend or remove button |

---

### 2. Endpoints Not Needed Completely (Redundant / Dead)

#### A. Redundant Backend Route Aliases (Safe to Deprecate/Remove)

| Backend Route | File | Reason Not Needed |
|---|---|---|
| `POST /api/attendance/` | `attendance.route.js` (L17) | Duplicate alias of `POST /api/attendance/submit` |
| `POST /api/enrollments/` | `enrollment.routes.js` (L15) | Duplicate alias of `POST /api/enrollments/apply` |
| `GET /api/auth/verify/:token` | `auth.routes.js` (L17) | Duplicate alias of `GET /api/auth/verify-email/:token` (frontend uses `/verify-email/:token`) |
| `POST /api/divisions/:divisionId/bootcamps` | `division.route.js` (L29) | Redundant with `POST /api/bootcamps` (uses legacy `roleGuard("admin")` instead of `scopeGuard`) |

#### B. Dead Frontend Service Method (No Backend Endpoint)

| Frontend Call | File | Resolution |
|---|---|---|
| `notificationsService.markAllAsRead()` (`PUT /notifications/read-all`) | `services/index.ts` (L14-16) | Remove from frontend or implement `PUT /api/notifications/read-all` on backend |

#### C. Backend Endpoints With No Frontend Consumer

| Backend Route | Status |
|---|---|
| `PUT /api/divisions/:id`, `DELETE /api/divisions/:id` | No frontend service/UI; keep for admin API or add UI later |
| `PUT /api/tasks/:id` | No `updateTask` in `tasks.service.ts` |
| `PUT /api/groups/:id/leader` | No `assignLeader` in `groups.service.ts` |
| `GET /api/reports/:id` | No `getReportById` in `reports.service.ts` |
| `GET /api/resources/:id/download` | Missing `downloadResource` in `resourcesService` |
| `GET /api/induction/leaderboard/:bootcampId`, `POST /api/induction/decide` | Missing `induction.service.ts` (needed for Admin Induction UI) |

---

### 3. Backend Guard Misconfigurations Blocking Valid Calls

- **`division.route.js` (L12, L18, L22):** `POST /`, `PUT /:id`, `DELETE /:id` use `roleGuard("super admin")` **without `authGuard`** (so `req.user` is `undefined`) and with lowercase `"super admin"`.
- **`report.route.js` (L13):** `DELETE /:id` uses lowercase `roleGuard(['super admin'])`.
- **`resource.routes.js` (L28):** `POST /session/:sessionId` uses lowercase `roleGuard(["admin", "instructor"])`.
- **`project.routes.js` (L8):** `POST /` uses lowercase `roleGuard(["admin", "instructor", "student"])`.

---

## Decision

1. **Replace broken frontend service routes** in `resourcesService` and `projectsService` (`frontend/src/services/index.ts`) to match `resource.routes.js` and `project.routes.js`.
2. **Fix the remaining 5 frontend files** with broken ADR-0015 call sites (`attendanceSlice.ts`, `InstructorAttendance.tsx`, `InstructorDashboard.tsx`, `InstructorSubmissions.tsx`, `InstructorGroups.tsx`).
3. **Fix backend `authGuard` / `roleGuard` casing** on `division.route.js`, `report.route.js`, `resource.routes.js`, and `project.routes.js`.
4. **Remove redundant backend route aliases** (`POST /attendance/`, `POST /enrollments/`, `GET /auth/verify/:token`, `POST /divisions/:divisionId/bootcamps`) and remove or implement `PUT /notifications/read-all`.
