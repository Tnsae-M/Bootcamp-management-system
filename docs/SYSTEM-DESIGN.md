# BMS v2 — System Design

**Status:** Authoritative v2 design. Supersedes all v1 module layouts.  
**Grounded in:** `SRS.md` v2.0, `CONTEXT.md` v2.0, ADRs 0004–0009

---

## 1. Design Principles

This codebase uses **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam.

- **Deep** = large implementation, small interface. Callers know little; modules do a lot.
- **Seam** = where a module's interface lives; the place where behaviour can vary without editing that place.
- **Adapter** = a concrete thing that satisfies an interface at a seam (e.g. PrismaUserRepo satisfies UserRepo).
- **Leverage** = what callers gain from depth: more capability per unit of interface learned.
- **Locality** = what maintainers gain: a change or bug fix is contained in one place.

The goal: every module should pass the **deletion test** — if you delete it, complexity reappears across N callers. If nothing reappears, it was a pass-through.

---

## 2. Tech Stack (100% Free / Open Source / Self-Hostable)

Every layer in this stack is strictly **100% free**, open-source, or has a perpetual free tier suitable for student club operations without requiring paid subscriptions or credit card lock-ins:

| Layer | Technology | Cost / License | Notes |
| ------- | ----------- |  ---------------- | ------- |
| Runtime | Node.js 20 LTS | Free (MIT) | Standard Node runtime |
| Framework | Express 5 | Free (MIT) | Minimalist, unopinionated web server |
| Language | TypeScript | Free (Apache 2.0) | Type safety across backend & frontend |
| ORM | Prisma 5 | Free (Apache 2.0) | Standard open-source client (no paid Prisma Accelerate/Pulse required) |
| Database | PostgreSQL 16 | Free (PostgreSQL License) | Self-hostable locally/Docker, or free hosted tier (Supabase / Neon free tier) |
| Validation | Zod (all boundaries) | Free (MIT) | In-process schema validation |
| Auth | JWT (access + refresh, httpOnly cookie) | Free | Self-managed in-process (no Auth0 / Clerk paid dependency) |
| File Storage | Local disk storage with Express static serving (or Supabase Free 1GB bucket) | 100% Free | Replaces Cloudinary paid tier risk; files stored on server filesystem or free object storage |
| Notifications | Telegram Bot API | 100% Free | Unlimited free bot messaging directly to students via Telegram |
| Testing | Vitest + Supertest | Free (MIT) | Fast, local unit & integration testing |
| DB Test Adapter | PGLite (local-substitutable — no mocks needed) | Free (Apache 2.0) | In-process WASM Postgres — zero setup, zero cost |
| Frontend | React 18 + TypeScript + Vite | Free (MIT) | Zero-cost modern frontend tooling |
| State | Redux Toolkit (RTK Query for server state) | Free (MIT) | Client state management |
| UI | shadcn/ui + Tailwind CSS | Free (MIT) | Fully open source, copy-paste components |
| Hosting / Deployment | Docker / University Server / Render (Free tier) / Vercel (Free tier) | $0.00 | Stateless architecture easily deployable anywhere without vendor lock-in |

---

## 3. PostgreSQL Schema (Prisma)

```prisma
// schema.prisma
// Generated target — build from this, not from the old Mongoose models

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum Role {
  SUPER_ADMIN
  DIVISION_ADMIN
  INSTRUCTOR
  STUDENT
  GUEST
}

enum ScopeType {
  GLOBAL
  DIVISION
  BOOTCAMP
}

enum EnrollmentStatus {
  APPLICANT
  APPLICANT_REJECTED
  STUDENT
  DROPPED
  INDUCTED
  NOT_INDUCTED
}

enum SessionStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
}

enum AttendanceStatus {
  PRESENT
  LATE
  ABSENT
  EXCUSED
}

enum TaskType {
  INDIVIDUAL
  GROUP_MILESTONE
}

enum SubmissionStatus {
  SUBMITTED
  GRADED
  RETURNED
}

enum SubmissionType {
  FILE
  GITHUB_LINK
  BOTH
}

enum QualitativeFlag {
  EXCELLENT
  SATISFACTORY
  NEEDS_IMPROVEMENT
}

enum BootcampStatus {
  DRAFT
  OPEN
  SCREENING
  ACTIVE
  COMPLETED
}

enum NotificationChannel {
  IN_APP
  TELEGRAM
}

enum InductionDecisionValue {
  INDUCTED
  NOT_INDUCTED
}

// ─── Users & Roles ────────────────────────────────────────────────────────────

model User {
  id                String   @id @default(uuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  universityId      String?  @unique
  department        String?
  telegramUsername  String?
  telegramChatId    String?
  isEmailVerified   Boolean  @default(false)
  refreshTokenHash  String?
  passwordResetToken     String?
  passwordResetExpiresAt DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  roleAssignments   UserRoleAssignment[]
  enrollments       Enrollment[]
  submissions       Submission[]
  attendanceRecords AttendanceRecord[]
  sessionFeedbacks  SessionFeedback[]
  peerReviewsGiven  PeerReview[]       @relation("ReviewerRelation")
  peerReviewsReceived PeerReview[]     @relation("RevieweeRelation")
  notifications     Notification[]
  groupMemberships  GroupMember[]
  inductionDecisions InductionDecision[] @relation("DecidedByRelation")
  auditLogs         AuditLog[]
  proposedSessions  Session[]          @relation("InstructorRelation")
}

model UserRoleAssignment {
  id        String    @id @default(uuid())
  userId    String
  role      Role
  scopeType ScopeType
  scopeId   String?   // divisionId or bootcampId; null when scopeType = GLOBAL

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, role, scopeType, scopeId])
  @@index([userId])
  @@index([scopeId])
}

// ─── Divisions ────────────────────────────────────────────────────────────────

model Division {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  isArchived  Boolean  @default(false)
  createdAt   DateTime @default(now())

  bootcamps   Bootcamp[]
}

// ─── Bootcamps ────────────────────────────────────────────────────────────────

model Bootcamp {
  id                    String        @id @default(uuid())
  divisionId            String
  title                 String
  description           String?
  status                BootcampStatus @default(DRAFT)
  applicationOpenAt     DateTime?
  applicationCloseAt    DateTime?
  startDate             DateTime?
  endDate               DateTime?
  maxApplicants         Int?

  // Scoring weights (must sum to 100 — enforced in service layer)
  attendanceWeight      Int           @default(20)
  individualTaskWeight  Int           @default(40)
  groupMilestoneWeight  Int           @default(30)
  peerReviewWeight      Int           @default(10)

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  division              Division      @relation(fields: [divisionId], references: [id])
  enrollments           Enrollment[]
  sessions              Session[]
  tasks                 Task[]
  groups                Group[]
  resources             Resource[]

  @@index([divisionId])
  @@index([status])
}

// ─── Enrollments & Applications ───────────────────────────────────────────────

model Enrollment {
  id          String           @id @default(uuid())
  userId      String
  bootcampId  String
  status      EnrollmentStatus @default(APPLICANT)
  appliedAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // Application form fields
  motivation        String?
  experience        String?
  portfolioUrl      String?

  user              User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  bootcamp          Bootcamp         @relation(fields: [bootcampId], references: [id], onDelete: Cascade)
  inductionDecision InductionDecision?

  @@unique([userId, bootcampId])
  @@index([bootcampId, status])
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

model Session {
  id           String        @id @default(uuid())
  bootcampId   String
  instructorId String
  title        String
  description  String?
  location     String?       // physical address or URL
  startTime    DateTime
  endTime      DateTime
  status       SessionStatus @default(PENDING)
  rejectionNote String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  bootcamp          Bootcamp           @relation(fields: [bootcampId], references: [id], onDelete: Cascade)
  instructor        User               @relation("InstructorRelation", fields: [instructorId], references: [id])
  attendanceCode    AttendanceCode?
  attendanceRecords AttendanceRecord[]
  sessionFeedbacks  SessionFeedback[]
  resources         Resource[]

  @@index([bootcampId])
  @@index([startTime, endTime]) // global overlap check
}

model AttendanceCode {
  id            String   @id @default(uuid())
  sessionId     String   @unique
  code          String   @unique
  windowMinutes Int      @default(30)
  openedAt      DateTime @default(now())
  expiresAt     DateTime

  session       Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model AttendanceRecord {
  id         String           @id @default(uuid())
  sessionId  String
  userId     String
  status     AttendanceStatus
  submittedAt DateTime?
  overrideNote String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  session    Session          @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId])
  @@index([sessionId])
  @@index([userId])
}

// ─── Tasks & Submissions ──────────────────────────────────────────────────────

model Task {
  id                  String         @id @default(uuid())
  bootcampId          String
  type                TaskType
  title               String
  description         String?
  instructions        String?
  submissionType      SubmissionType
  deadline            DateTime
  maxScore            Float
  allowLateSubmission Boolean        @default(false)
  latePenaltyPercent  Float?
  allowResubmission   Boolean        @default(true)
  peerReviewRequired  Boolean        @default(false)
  milestoneNumber     Int?           // GROUP_MILESTONE only; ordering within capstone
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  bootcamp    Bootcamp     @relation(fields: [bootcampId], references: [id], onDelete: Cascade)
  submissions Submission[]

  @@index([bootcampId, type])
}

model Submission {
  id          String           @id @default(uuid())
  taskId      String
  userId      String?          // null for group submissions
  groupId     String?          // null for individual submissions
  version     Int              @default(1)
  fileUrl     String?
  githubUrl   String?
  status      SubmissionStatus @default(SUBMITTED)
  score       Float?
  feedback    String?
  qualFlag    QualitativeFlag?
  submittedAt DateTime         @default(now())
  gradedAt    DateTime?
  gradedBy    String?          // userId of grader

  task        Task             @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user        User?            @relation(fields: [userId], references: [id])
  group       Group?           @relation(fields: [groupId], references: [id])
  peerReviews PeerReview[]

  @@index([taskId])
  @@index([userId])
  @@index([groupId])
}

// ─── Groups ───────────────────────────────────────────────────────────────────

model Group {
  id         String    @id @default(uuid())
  bootcampId String
  name       String
  createdAt  DateTime  @default(now())

  bootcamp    Bootcamp      @relation(fields: [bootcampId], references: [id], onDelete: Cascade)
  members     GroupMember[]
  submissions Submission[]

  @@index([bootcampId])
}

model GroupMember {
  id       String  @id @default(uuid())
  groupId  String
  userId   String
  isLeader Boolean @default(false)
  joinedAt DateTime @default(now())

  group    Group   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
}

// ─── Peer Reviews ─────────────────────────────────────────────────────────────

model PeerReview {
  id           String   @id @default(uuid())
  submissionId String
  reviewerId   String
  revieweeId   String
  rating       Int      // 1–5
  comment      String?
  submittedAt  DateTime @default(now())

  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  reviewer     User       @relation("ReviewerRelation", fields: [reviewerId], references: [id])
  reviewee     User       @relation("RevieweeRelation", fields: [revieweeId], references: [id])

  @@unique([submissionId, reviewerId, revieweeId])
}

// ─── Session Feedback ─────────────────────────────────────────────────────────

model SessionFeedback {
  id          String   @id @default(uuid())
  sessionId   String
  userId      String
  rating      Int      // 1–5
  comment     String?
  submittedAt DateTime @default(now())

  session     Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id])

  @@unique([sessionId, userId])
}

// ─── Induction ────────────────────────────────────────────────────────────────

model InductionDecision {
  id                    String                 @id @default(uuid())
  enrollmentId          String                 @unique
  decision              InductionDecisionValue
  computedScoreAtDecision Float
  overrideNote          String?
  decidedById           String
  decidedAt             DateTime               @default(now())

  enrollment            Enrollment             @relation(fields: [enrollmentId], references: [id])
  decidedBy             User                   @relation("DecidedByRelation", fields: [decidedById], references: [id])
}

// ─── Resources ────────────────────────────────────────────────────────────────

model Resource {
  id          String   @id @default(uuid())
  bootcampId  String?
  sessionId   String?
  title       String
  description String?
  fileUrl     String?
  externalUrl String?
  mimeType    String?
  downloadCount Int    @default(0)
  uploadedById String
  createdAt   DateTime @default(now())

  bootcamp    Bootcamp? @relation(fields: [bootcampId], references: [id])
  session     Session?  @relation(fields: [sessionId], references: [id])
}

// ─── Notifications ────────────────────────────────────────────────────────────

model Notification {
  id        String              @id @default(uuid())
  userId    String
  channel   NotificationChannel
  eventType String              // e.g. "SESSION_APPROVED", "TASK_GRADED"
  title     String
  body      String
  metadata  Json?               // arbitrary payload for deep-linking
  readAt    DateTime?
  sentAt    DateTime            @default(now())

  user      User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, readAt])
}

model NotificationPreference {
  id        String @id @default(uuid())
  userId    String @unique
  // JSON map of eventType → { inApp: bool, telegram: bool }
  preferences Json  @default("{}")
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

model AuditLog {
  id         String   @id @default(uuid())
  actorId    String
  action     String   // e.g. "INDUCTION_OVERRIDE", "ATTENDANCE_OVERRIDE"
  targetType String
  targetId   String
  metadata   Json?
  createdAt  DateTime @default(now())

  actor      User     @relation(fields: [actorId], references: [id])

  @@index([actorId])
  @@index([targetType, targetId])
}
```

---

## 4. Backend Module Map

Each module follows the shape: `routes → controller → service → (Prisma)`.  
The service is the **deep module** — it owns all business logic, validation rules, and cross-cutting concerns. Controllers are thin (parse HTTP, call service, serialize response). Routes are declarative.

```
backend/src/
├── app.js                     # Express app factory (no globals)
├── server.js                  # Entry point: binds port, starts Telegram bot
├── config/
│   ├── env.js                 # Zod-validated env schema; throws on startup if invalid
│   ├── prisma.js              # Singleton PrismaClient
│   └── upload.js              # Local disk storage / Multer config (zero cost)
├── middleware/
│   ├── auth.middleware.js     # Verifies JWT, attaches req.user (UserRoleAssignment[])
│   ├── scope.guard.js         # NEW: resolves whether req.user's roles cover the resource scope
│   ├── validate.middleware.js # Zod schema validation for body/params/query
│   ├── error.middleware.js    # Centralised error handler → standard error envelope
│   └── rateLimiter.middleware.js
├── modules/
│   ├── auth/
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   └── auth.service.js    # DEEP: register, login, refresh, logout, resetPassword
│   ├── users/
│   │   ├── users.routes.js
│   │   ├── users.controller.js
│   │   ├── users.service.js   # DEEP: profile, role assignment, sanitize
│   │   └── users.sanitize.js  # Allowlist sanitizer — the ONLY exit for User data
│   ├── divisions/
│   │   ├── divisions.routes.js
│   │   ├── divisions.controller.js
│   │   └── divisions.service.js
│   ├── bootcamps/
│   │   ├── bootcamps.routes.js
│   │   ├── bootcamps.controller.js
│   │   └── bootcamps.service.js  # DEEP: lifecycle, weight validation, status transitions
│   ├── enrollments/
│   │   ├── enrollments.routes.js
│   │   ├── enrollments.controller.js
│   │   └── enrollments.service.js # DEEP: application, screening, role promotion on accept
│   ├── sessions/
│   │   ├── sessions.routes.js
│   │   ├── sessions.controller.js
│   │   └── sessions.service.js    # DEEP: propose, approve, global overlap check
│   ├── attendance/
│   │   ├── attendance.routes.js
│   │   ├── attendance.controller.js
│   │   └── attendance.service.js  # DEEP: code gen, auto-status, expiry sweep
│   ├── tasks/
│   │   ├── tasks.routes.js
│   │   ├── tasks.controller.js
│   │   └── tasks.service.js       # DEEP: individual + milestone, deadline enforcement
│   ├── submissions/
│   │   ├── submissions.routes.js
│   │   ├── submissions.controller.js
│   │   └── submissions.service.js # DEEP: versioning, grading, peer review trigger
│   ├── groups/
│   │   ├── groups.routes.js
│   │   ├── groups.controller.js
│   │   └── groups.service.js      # DEEP: formation, invites, leader assignment
│   ├── feedback/
│   │   ├── feedback.routes.js
│   │   ├── feedback.controller.js
│   │   └── feedback.service.js    # DEEP: session feedback + peer review dispatch
│   ├── induction/
│   │   ├── induction.routes.js
│   │   ├── induction.controller.js
│   │   └── induction.service.js   # DEEP: score computation, decision recording, role promotion
│   ├── scoring/
│   │   └── scoring.service.js     # PURE: weighted score calculator (no DB calls)
│   │                               # Internal module — not exposed via routes
│   ├── resources/
│   │   ├── resources.routes.js
│   │   ├── resources.controller.js
│   │   └── resources.service.js
│   ├── notifications/
│   │   ├── notifications.routes.js    # GET /notifications, PATCH read, PATCH preferences
│   │   ├── notifications.controller.js
│   │   ├── notifications.service.js   # DEEP: dispatch, persist, fan-out to channels
│   │   └── telegram.adapter.js        # Adapter: satisfies NotificationChannel interface via Telegram Bot API
│   ├── reports/
│   │   ├── reports.routes.js
│   │   ├── reports.controller.js
│   │   └── reports.service.js         # DEEP: division dashboard, bootcamp dashboard, student PDF
│   └── audit/
│       └── audit.service.js           # Thin write-only module; called by other services
└── utils/
    ├── errors.js          # AppError class hierarchy (ValidationError, ForbiddenError, etc.)
    ├── pagination.js      # Cursor-based pagination helper
    ├── github.validator.js # GitHub URL pattern validation (pure)
    └── code.generator.js  # Attendance code generator (pure, cryptographically random)
```

---

## 5. Deep Module Interfaces

The interfaces below define what callers must know. Implementation is hidden.

### 5.1 `auth.service`

```js
// Interface (what callers know)
register(data: RegisterInput): Promise<{ user: SanitizedUser, tokens: Tokens }>
login(email, password): Promise<{ user: SanitizedUser, tokens: Tokens }>
refresh(refreshToken): Promise<Tokens>
logout(userId): Promise<void>
forgotPassword(email): Promise<void>   // sends reset link; always resolves (no email oracle)
resetPassword(token, newPassword): Promise<void>

// What callers never know:
// — bcrypt hashing rounds
// — JWT signing algorithm, claims structure
// — refresh token rotation strategy
// — rate-limit counters
// — email delivery mechanism
```

### 5.2 `sessions.service`

```js
// Interface
propose(bootcampId, instructorId, data: SessionInput): Promise<Session>
  // Throws ConflictError if global time overlap detected
  // Throws ValidationError if startTime < now+1hr or duration < 30min
approve(sessionId, adminId): Promise<Session>
  // Re-checks overlap at approval time (another session may have been approved since proposal)
reject(sessionId, adminId, note): Promise<Session>
cancel(sessionId, actorId): Promise<Session>
  // Notifies enrolled students
list(bootcampId, filters): Promise<PaginatedResult<Session>>
get(sessionId): Promise<Session>

// What callers never know:
// — global overlap SQL query shape
// — notification dispatch internals
// — which fields are indexed for overlap performance
```

### 5.3 `attendance.service`

```js
// Interface
openWindow(sessionId, instructorId, windowMinutes?): Promise<{ code: string, expiresAt: Date }>
  // Generates cryptographically random 5-char code
  // Schedules auto-mark job for expiresAt
submit(sessionId, userId, code): Promise<AttendanceRecord>
  // Validates code, computes PRESENT/LATE, creates record
  // Throws ConflictError if already submitted
  // Throws UnprocessableError if code expired
override(sessionId, userId, actorId, status, note?): Promise<AttendanceRecord>
getSummary(sessionId): Promise<AttendanceSummary>

// What callers never know:
// — code storage format or expiry check mechanism
// — auto-mark sweep implementation (cron vs. event)
// — 30-minute window default
```

### 5.4 `scoring.service` (pure, no DB)

```js
// Interface — pure functions, no I/O
computeWeightedScore(signals: ScoringSignals, weights: BootcampWeights): number
  // signals: { attendanceRate, avgIndividualScore, avgMilestoneScore, avgPeerReviewScore }
  // weights: { attendance, individualTask, groupMilestone, peerReview } (sum = 100)
  // returns: 0–100 float

adjustMilestoneScore(groupScore: number, peerRating: number): number
  // pure peer-review weight adjustment formula

// What callers never know:
// — internal formula (can change without callers knowing)
// — normalization logic
```

### 5.5 `induction.service`

```js
// Interface
computeAllScores(bootcampId): Promise<RankedStudent[]>
  // Calls scoring.service (pure); reads signals from DB
  // Returns full ranked leaderboard with score breakdown
recordDecision(enrollmentId, decision, adminId, overrideNote?): Promise<InductionDecision>
  // Validates bootcamp is COMPLETED
  // If INDUCTED: creates DIVISION_ADMIN-scoped UserRoleAssignment(STUDENT→DIVISION_MEMBER) [actually promotes user]
  // Writes AuditLog entry
  // Notifies student
finalize(bootcampId, adminId): Promise<BatchResult>
  // Marks all undecided enrollments as NOT_INDUCTED
  // Transitions bootcamp status to COMPLETED

// What callers never know:
// — score computation formula
// — how role promotion works at DB level
// — audit log format
```

### 5.6 `notifications.service`

```js
// Interface
dispatch(event: NotificationEvent): Promise<void>
  // event: { type, recipientId, payload }
  // Persists in-app notification
  // Fans out to Telegram if user has chatId and event is enabled in preferences
markRead(notificationId, userId): Promise<void>
listUnread(userId, pagination): Promise<PaginatedResult<Notification>>
updatePreferences(userId, prefs): Promise<void>

// What callers never know:
// — Telegram Bot API details (injected via telegram.adapter)
// — in-app persistence schema
// — delivery failure handling (logged, not retried in v1)
```

---

## 6. Scope Guard Design

The `scope.guard.js` middleware replaces the flat role-string guard from v1. It resolves whether a request's User holds a Role that covers the target resource's scope.

```js
// Usage in routes:
router.patch(
  '/sessions/:sessionId/approve',
  auth(),                           // attaches req.user
  scopeGuard({
    role: 'DIVISION_ADMIN',
    scope: 'division',
    resolveScope: (req) =>          // returns divisionId from the resource
      prisma.session
        .findUnique({ where: { id: req.params.sessionId }, select: { bootcamp: { select: { divisionId: true } } } })
        .then(s => s?.bootcamp?.divisionId)
  }),
  sessionController.approve
);

// scopeGuard checks:
// 1. Does req.user have a UserRoleAssignment with role >= required?
// 2. Does that assignment's scopeId match the resolved resource scope?
// 3. SUPER_ADMIN bypasses scope check (global role).
```

**Hierarchy (encoded once in `scope.guard.js`):**

```
SUPER_ADMIN → (admits everywhere)
DIVISION_ADMIN → (admits for their Division and its child Bootcamps)
INSTRUCTOR → (admits for their assigned Bootcamp)
STUDENT → (admits for their enrolled Bootcamp)
GUEST → (admits only public endpoints)
```

> DIVISION_ADMIN does **not** imply INSTRUCTOR (ADR-0002 principle preserved).

---

## 7. Frontend Module Map

```
frontend/src/
├── main.tsx
├── App.tsx                    # Router root
├── routes/
│   ├── index.tsx              # Route tree with lazy-loaded feature pages
│   └── guards/
│       ├── AuthGuard.tsx      # Redirect unauthenticated → /login
│       └── RoleGuard.tsx      # Redirect insufficient scope → /unauthorized
├── api/
│   └── baseApi.ts             # RTK Query base with JWT refresh interceptor
├── features/
│   ├── auth/
│   │   ├── authSlice.ts       # user, tokens, activeRole (presentation only)
│   │   ├── authApi.ts         # RTK Query endpoints: login, register, refresh
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── divisions/
│   │   ├── divisionsApi.ts
│   │   └── pages/DivisionsPage.tsx
│   ├── bootcamps/
│   │   ├── bootcampsApi.ts
│   │   ├── pages/
│   │   │   ├── BootcampListPage.tsx
│   │   │   ├── BootcampDetailPage.tsx
│   │   │   └── BootcampLeaderboardPage.tsx
│   │   └── components/
│   │       ├── BootcampCard.tsx
│   │       └── ScoringWeightForm.tsx
│   ├── enrollments/
│   │   ├── enrollmentsApi.ts
│   │   └── pages/
│   │       ├── ApplyPage.tsx          # Guest applies to Bootcamp
│   │       └── ApplicantQueuePage.tsx # Division Admin screens applicants
│   ├── sessions/
│   │   ├── sessionsApi.ts
│   │   └── pages/
│   │       ├── SessionListPage.tsx
│   │       ├── SessionDetailPage.tsx
│   │       └── SessionFormPage.tsx
│   ├── attendance/
│   │   ├── attendanceApi.ts
│   │   └── components/
│   │       ├── AttendanceTab.tsx      # In SessionDetailPage
│   │       ├── OpenAttendanceButton.tsx
│   │       └── AttendanceCodeForm.tsx # Student submits code
│   ├── tasks/
│   │   ├── tasksApi.ts
│   │   └── pages/
│   │       ├── TaskListPage.tsx
│   │       ├── TaskDetailPage.tsx
│   │       └── TaskFormPage.tsx
│   ├── submissions/
│   │   ├── submissionsApi.ts
│   │   └── components/
│   │       ├── SubmitTaskForm.tsx
│   │       └── GradeSubmissionForm.tsx
│   ├── groups/
│   │   ├── groupsApi.ts
│   │   └── pages/
│   │       ├── GroupFormationPage.tsx
│   │       └── GroupDetailPage.tsx
│   ├── feedback/
│   │   ├── feedbackApi.ts
│   │   └── components/
│   │       ├── SessionFeedbackForm.tsx
│   │       └── PeerReviewForm.tsx
│   ├── induction/
│   │   ├── inductionApi.ts
│   │   └── pages/
│   │       └── InductionReviewPage.tsx  # Leaderboard + per-student decision UI
│   ├── reports/
│   │   ├── reportsApi.ts
│   │   └── pages/
│   │       ├── DivisionDashboardPage.tsx
│   │       ├── BootcampAnalyticsPage.tsx
│   │       └── StudentProfilePage.tsx
│   └── notifications/
│       ├── notificationsApi.ts
│       └── components/
│           └── NotificationBell.tsx
├── components/
│   ├── ui/                   # shadcn/ui primitives (untouched)
│   └── shared/
│       ├── DataTable.tsx
│       ├── PageHeader.tsx
│       └── EmptyState.tsx
├── types/
│   └── index.ts              # Canonical shared types (User, Bootcamp, Session, etc.)
│                              # Single source of truth — no duplicate types in features
└── lib/
    ├── utils.ts              # cn(), formatDate(), etc.
    └── validations.ts        # Zod schemas reused across forms
```

---

## 8. Key Seams

| Seam | What varies across it | Adapters |
|------|-----------------------|---------|
| `notifications.service` → channel | In-app vs Telegram | `InAppAdapter` (Prisma write) + `TelegramAdapter` (Bot API HTTP) |
| `auth.middleware` → user identity | Real JWT vs test fixture | Real verifier + in-process test fixture |
| `scoring.service` → formula | Weight formula can change | Pure function — no seam needed; change internally |
| `attendance.service` → auto-mark sweep | Cron job vs event trigger | In-process `setTimeout` (v1) — real seam deferred to v2 |
| `resources.service` → file storage | Local disk (Multer) vs free object storage | `LocalDiskAdapter` (default $0) + `SupabaseStorageAdapter` (free tier) |

> **Discipline:** Only the notification channel seam has two real adapters today. The others are either single-adapter (hypothetical) or pure.

---

## 9. Business Logic Concentration

The following rules live **only** in the service layer. They are never re-implemented in controllers, routes, or the frontend.

| Rule | Module |
|------|--------|
| Global session no-overlap | `sessions.service.propose` + `sessions.service.approve` |
| Session minimum duration (30 min) | `sessions.service.propose` |
| Session minimum lead time (1 hour) | `sessions.service.propose` |
| Attendance code expiry → auto-ABSENT | `attendance.service` (sweep on `expiresAt`) |
| PRESENT/LATE boundary (30-min window) | `attendance.service.submit` |
| One attendance record per student/session | DB unique constraint + `attendance.service.submit` |
| Only PRESENT/LATE students can submit Session Feedback | `feedback.service` |
| One Session Feedback per student/session | DB unique constraint + `feedback.service` |
| Scoring weights sum to 100 | `bootcamps.service` (on create/update) |
| Scoring weights locked at ACTIVE status | `bootcamps.service` (status transition guard) |
| Peer Review triggers after Milestone submission | `submissions.service.grade` |
| Induction decision promotes STUDENT → DIVISION MEMBER | `induction.service.recordDecision` |
| GitHub URL validation | `github.validator.js` (pure utility, called by `submissions.service`) |
| Group size 2–8 | `groups.service` |
| One group per student per bootcamp | DB unique constraint (`GroupMember.userId + bootcampId`) + `groups.service` |
| Application only while Bootcamp status = OPEN | `enrollments.service.apply` |

---

## 10. Deepening Opportunities from v1

The v1 codebase has these known shallow patterns to fix as modules are rewritten:

| v1 Pattern | Problem | v2 Fix |
|------------|---------|--------|
| `user.model.js` with `_id`, global `roles[]` | ObjectId-based, MongoDB schema | Deleted. Replaced by Prisma `User` + `UserRoleAssignment` |
| `role.guard.js` encoding `SUPER ADMIN → ADMIN` implication | v1 logic preserved but loses Division scope | Rewritten as `scope.guard.js` with full scope resolution |
| Overlap check in `session.service` limited to same division | Bug — allowed cross-division conflicts | `sessions.service` queries globally (ADR-0007) |
| `progress` module (generic weekly text) | Shallow pass-through; no grading, no milestone structure | Deleted. Replaced by Group Milestone Tasks in `tasks` module |
| `projects` module | Unclear ownership, overlaps with `progress` | Deleted. Capstone project is modeled as `GROUP_MILESTONE` Tasks |
| `enrollment.service` overwrites `divisionId` on user | Broken: assumes one Division per user | Deleted. Enrollment scopes the user to a Bootcamp only; role is promoted via `UserRoleAssignment` |


