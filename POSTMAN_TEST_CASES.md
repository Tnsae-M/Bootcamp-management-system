# CSEC-ASTU BMS — Postman API Test Cases

> **Purpose:** Systematic test cases for debugging the 404 issue affecting authenticated requests.  
> **Base URL:** `{{BASE_URL}}` → `http://localhost:5000/api`  
> **Auth:** Protected routes require a Bearer token from the login flow — save it as `{{ACCESS_TOKEN}}` in your Postman environment.

---

## Postman Environment Setup

| Variable | Value | Notes |
|---|---|---|
| `BASE_URL` | `http://localhost:5000/api` | Backend API root |
| `ACCESS_TOKEN` | _(auto-set by login Tests script)_ | JWT Bearer token |
| `DIVISION_ID` | _(copy from GET /divisions response)_ | Runtime UUID — not hardcoded |
| `USER_ID` | _(copy from GET /users response)_ | Runtime UUID — not hardcoded |
| `ENROLLMENT_ID` | _(copy from GET /enrollments/me response)_ | Runtime UUID |
| `SUBMISSION_ID` | _(copy from GET /submissions/me response)_ | Runtime UUID |
| `NOTIFICATION_ID` | _(copy from GET /notifications response)_ | Runtime UUID |

> All other IDs used in tests below are hardcoded from `seed.js` and written directly into the request bodies/URLs.

---

## 🩺 0. Health Check (No Auth)

### 0.1 — API Health Ping

> **Start here every time.** If this returns 404 the server is not running or the `/api` prefix is misconfigured — nothing else will work.

```
GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{ "message": "API is running" }
```
**Status:** `200 OK`

---

## 🔐 1. Auth Module — `/api/auth`

### 1.1 — Register New User (Guest)

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "fullName": "Test User",
  "email": "testuser.new@csec.astu.edu.et",
  "password": "TestPass123!",
  "universityId": "UGR/9999/26",
  "department": "Computer Science"
}
```

**Status:** `201 Created`

---

### 1.2 — Login as Super Admin ⭐ (Run First — Sets Token)

> Add this to the **Tests** tab to auto-capture the token:
> ```js
> const json = pm.response.json();
> pm.environment.set("ACCESS_TOKEN", json.accessToken);
> ```

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "{{SUPER_ADMIN_EMAIL}}",
  "password": "Admin123!"
}
```

> `SUPER_ADMIN_EMAIL` is kept as a placeholder because it is a personal Gmail address. Set it in your Postman environment.

**Expected Response:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "fullName": "Tinsae Melkamu (Head Admin)",
    "roles": ["SUPER_ADMIN"]
  }
}
```
**Status:** `200 OK`

---

### 1.3 — Login as Cyber Division Admin

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "cyber.admin@csec.astu.edu.et",
  "password": "Admin123!"
}
```

**Expected Response:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "fullName": "Hirut Lemma (Cyber Head)",
    "roles": ["DIVISION_ADMIN"]
  }
}
```
**Status:** `200 OK`

---

### 1.4 — Login as Dev Division Admin

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "dev.admin@csec.astu.edu.et",
  "password": "Admin123!"
}
```

**Status:** `200 OK`

---

### 1.5 — Login as Cyber Instructor

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "cyber.instructor@csec.astu.edu.et",
  "password": "Password123!"
}
```

**Expected Response:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "fullName": "Yonas Kassa (Security Lead)",
    "roles": ["INSTRUCTOR"]
  }
}
```
**Status:** `200 OK`

---

### 1.6 — Login as Web Instructor

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "instructor@csec.astu.edu.et",
  "password": "Password123!"
}
```

**Status:** `200 OK`

---

### 1.7 — Login as Student — Abebe Bikila (Squad Leader, Active in Cyber & Web)

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "student@csec.astu.edu.et",
  "password": "Password123!"
}
```

**Expected Response:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "fullName": "Abebe Bikila",
    "roles": ["STUDENT"]
  }
}
```
**Status:** `200 OK`

---

### 1.8 — Login as Student — Selamawit Tadesse (Top rank, Inducted 2025)

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "selam.student@csec.astu.edu.et",
  "password": "Password123!"
}
```

**Status:** `200 OK`

---

### 1.9 — Login as Guest Applicant — Chaltu Desta (Pending)

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "applicant@csec.astu.edu.et",
  "password": "Password123!"
}
```

**Status:** `200 OK`

---

### 1.10 — Get Current User (`/auth/me`) 🔒

> **Key diagnostic test.** If login succeeds but this returns 404, the `authGuard` middleware or the route mounting at `/api/auth/me` is broken.

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
{
  "id": "...",
  "fullName": "...",
  "email": "...",
  "roles": ["..."]
}
```
**Status:** `200 OK`

---

### 1.11 — Refresh Token

```
POST http://localhost:5000/api/auth/refresh
```

_(Relies on the `httpOnly` refresh cookie set at login — no body needed)_

**Expected Response:**
```json
{ "accessToken": "eyJ..." }
```
**Status:** `200 OK`

---

### 1.12 — Logout

```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

### 1.13 — Forgot Password

```
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json
```

**Body:**
```json
{
  "email": "student@csec.astu.edu.et"
}
```

**Status:** `200 OK`

---

### 1.14 — Change Password 🔒

```
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePass456!"
}
```

**Status:** `200 OK`

---

## 🏛️ 2. Divisions Module — `/api/divisions`

### 2.1 — List All Divisions 🔒

```
GET http://localhost:5000/api/divisions
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
[
  { "name": "Cybersecurity Division",              "slug": "cybersecurity" },
  { "name": "Development Division",                "slug": "development" },
  { "name": "Competitive Programming Division",    "slug": "competitive-programming" },
  { "name": "Applied AI Division",                 "slug": "applied-ai" }
]
```
**Status:** `200 OK`

---

### 2.2 — Get Division by ID 🔒

> Copy a division `id` from the 2.1 response and paste it below.

```
GET http://localhost:5000/api/divisions/{{DIVISION_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

### 2.3 — Get Bootcamps Under a Division 🔒

```
GET http://localhost:5000/api/divisions/{{DIVISION_ID}}/bootcamps
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

## 🎓 3. Bootcamps Module — `/api/bootcamps`

### 3.1 — List All Bootcamps (Public — No Auth)

```
GET http://localhost:5000/api/bootcamps
```

**Expected Response:** Array of all 6 seeded bootcamps across all 6 lifecycle phases.  
**Status:** `200 OK`

---

### 3.2 — Get ACTIVE Cyber Bootcamp (Public)

```
GET http://localhost:5000/api/bootcamps/demo-bootcamp-cyber-2026
```

**Expected Response:**
```json
{
  "id": "demo-bootcamp-cyber-2026",
  "title": "Cybersecurity & Defense Bootcamp 2026",
  "status": "ACTIVE",
  "attendanceWeight": 20,
  "individualTaskWeight": 40,
  "groupMilestoneWeight": 30,
  "peerReviewWeight": 10
}
```
**Status:** `200 OK`

---

### 3.3 — Get OPEN Web Dev Bootcamp (Public)

```
GET http://localhost:5000/api/bootcamps/demo-bootcamp-dev-2026
```

**Expected Response:**
```json
{
  "id": "demo-bootcamp-dev-2026",
  "title": "Fullstack Web Development Bootcamp 2026",
  "status": "OPEN"
}
```
**Status:** `200 OK`

---

### 3.4 — Get SCREENING CP Bootcamp (Public)

```
GET http://localhost:5000/api/bootcamps/demo-bootcamp-cp-2026
```

**Expected:** `status: "SCREENING"` — **Status:** `200 OK`

---

### 3.5 — Get DRAFT AI Bootcamp (Public)

```
GET http://localhost:5000/api/bootcamps/demo-bootcamp-ai-2026
```

**Expected:** `status: "DRAFT"` — **Status:** `200 OK`

---

### 3.6 — Get COMPLETED Bootcamp (Public)

```
GET http://localhost:5000/api/bootcamps/demo-bootcamp-dev-2025
```

**Expected:** `status: "COMPLETED"` — **Status:** `200 OK`

---

### 3.7 — Get ARCHIVED Bootcamp (Public)

```
GET http://localhost:5000/api/bootcamps/demo-bootcamp-cp-2025
```

**Expected:** `status: "ARCHIVED"` — **Status:** `200 OK`

---

### 3.8 — Create Bootcamp (Division Admin) 🔒

> Login as `cyber.admin@csec.astu.edu.et` first. `divisionId` must be the UUID from GET /divisions.

```
POST http://localhost:5000/api/bootcamps
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "divisionId": "{{DIVISION_ID}}",
  "title": "New Test Bootcamp",
  "description": "Test bootcamp for Postman validation.",
  "status": "DRAFT",
  "maxApplicants": 20,
  "attendanceWeight": 20,
  "individualTaskWeight": 40,
  "groupMilestoneWeight": 30,
  "peerReviewWeight": 10
}
```

**Status:** `201 Created`

---

### 3.9 — Transition Bootcamp Status (Division Admin) 🔒

```
PUT http://localhost:5000/api/bootcamps/demo-bootcamp-cyber-2026/status
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "ACTIVE"
}
```

**Status:** `200 OK`

---

### 3.10 — Update Bootcamp Weights (Division Admin) 🔒

```
PUT http://localhost:5000/api/bootcamps/demo-bootcamp-cyber-2026/weights
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "attendanceWeight": 30,
  "individualTaskWeight": 40,
  "groupMilestoneWeight": 20,
  "peerReviewWeight": 10
}
```

**Status:** `200 OK`

---

### 3.11 — Screen Applicant (Division Admin) 🔒

```
POST http://localhost:5000/api/bootcamps/demo-bootcamp-dev-2026/screen
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "{{USER_ID}}",
  "decision": "ACCEPTED"
}
```

**Status:** `200 OK`

---

## 📅 4. Sessions Module — `/api/sessions`

### 4.1 — List All Sessions 🔒

```
GET http://localhost:5000/api/sessions
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

### 4.2 — Get LIVE Session (Session 2 — Active PIN) 🔒

```
GET http://localhost:5000/api/sessions/demo-cyber-session-2
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
{
  "id": "demo-cyber-session-2",
  "title": "Session 2: Web App Penetration Testing & OWASP Top 10",
  "status": "APPROVED",
  "location": "ASTU Main Computer Lab B"
}
```
**Status:** `200 OK`

---

### 4.3 — Get Past Session (Session 1 — Completed) 🔒

```
GET http://localhost:5000/api/sessions/demo-cyber-session-1
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected:** `status: "COMPLETED"` — **Status:** `200 OK`

---

### 4.4 — Get Sessions by Bootcamp 🔒

```
GET http://localhost:5000/api/sessions/bootcamp/demo-bootcamp-cyber-2026
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** Array of 4 sessions — Completed, LIVE, Upcoming, Pending.  
**Status:** `200 OK`

---

### 4.5 — Propose a New Session (Instructor) 🔒

> Login as `cyber.instructor@csec.astu.edu.et` first.

```
POST http://localhost:5000/api/sessions/propose
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "bootcampId": "demo-bootcamp-cyber-2026",
  "title": "Session 5: Advanced Cryptography & PKI",
  "description": "Deep dive into TLS handshakes, certificate chains, and HSM key management.",
  "location": "Lab 402 / Block 513",
  "startTime": "2026-12-15T09:00:00.000Z",
  "endTime": "2026-12-15T12:00:00.000Z"
}
```

**Status:** `201 Created`

---

### 4.6 — Approve Session (Division Admin) 🔒

> Login as `cyber.admin@csec.astu.edu.et`. Use the session ID of the PENDING session (`demo-cyber-session-4`).

```
PUT http://localhost:5000/api/sessions/demo-cyber-session-4/approve
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

### 4.7 — Reject Session (Division Admin) 🔒

```
PUT http://localhost:5000/api/sessions/demo-cyber-session-4/reject
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Conflicts with scheduled lab maintenance."
}
```

**Status:** `200 OK`

---

### 4.8 — Cancel Session 🔒

```
PUT http://localhost:5000/api/sessions/demo-cyber-session-3/cancel
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

## ✅ 5. Attendance Module — `/api/attendance`

### 5.1 — View My Attendance Records (Student) 🔒

> Login as `student@csec.astu.edu.et`

```
GET http://localhost:5000/api/attendance/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** Array of attendance records for Abebe Bikila.  
**Status:** `200 OK`

---

### 5.2 — Submit Attendance PIN — Live Demo ⭐ (Student) 🔒

> **The key E2E test.**  
> 1. Login as `student@csec.astu.edu.et` (Abebe — has NOT checked in yet)  
> 2. Submit PIN `749201` for Session 2

```
POST http://localhost:5000/api/attendance/submit
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "demo-cyber-session-2",
  "code": "749201"
}
```

**Expected Response:**
```json
{
  "message": "Attendance recorded successfully.",
  "status": "PRESENT"
}
```
**Status:** `200 OK`

---

### 5.3 — Submit via Root Attendance Route (Alias) 🔒

> Same as 5.2 but uses the alias `POST /attendance/`

```
POST http://localhost:5000/api/attendance
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "demo-cyber-session-2",
  "code": "749201"
}
```

**Status:** `200 OK`

---

### 5.4 — Open Attendance Window (Instructor) 🔒

> Login as `cyber.instructor@csec.astu.edu.et`

```
POST http://localhost:5000/api/attendance/open-window
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "demo-cyber-session-2",
  "windowMinutes": 45
}
```

**Expected Response:**
```json
{
  "code": "749201",
  "expiresAt": "..."
}
```
**Status:** `200 OK`

---

### 5.5 — View Session Attendance Summary (Instructor/Admin) 🔒

```
GET http://localhost:5000/api/attendance/session/demo-cyber-session-2
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
[
  { "fullName": "Selamawit Tadesse", "status": "PRESENT" },
  { "fullName": "Abebe Bikila",      "status": "PRESENT" }
]
```
**Status:** `200 OK`

---

### 5.6 — Override Attendance Record (Instructor) 🔒

```
POST http://localhost:5000/api/attendance/override
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "demo-cyber-session-1",
  "userId": "{{USER_ID}}",
  "status": "EXCUSED",
  "note": "Excused due to campus shuttle delay."
}
```

**Status:** `200 OK`

---

## 📋 6. Enrollments Module — `/api/enrollments`

### 6.1 — View My Enrollments (Student) 🔒

> Login as `student@csec.astu.edu.et` — Abebe is enrolled in both Cyber 2026 and Web 2026.

```
GET http://localhost:5000/api/enrollments/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** 2 enrollment records — `STUDENT` status in both bootcamps.  
**Status:** `200 OK`

---

### 6.2 — Apply to Bootcamp (Guest) 🔒

> Login as `new.guest@csec.astu.edu.et` (Helen — no applications yet).

```
POST http://localhost:5000/api/enrollments/apply
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "bootcampId": "demo-bootcamp-dev-2026",
  "motivation": "Eager to build full-stack systems and contribute to open-source campus tooling.",
  "experience": "Self-taught React and Node.js developer with 3 personal projects."
}
```

**Expected Response:**
```json
{
  "message": "Application submitted successfully.",
  "status": "APPLICANT"
}
```
**Status:** `201 Created`

---

### 6.3 — View Bootcamp Enrollments (Division Admin) 🔒

> Login as `cyber.admin@csec.astu.edu.et`

```
GET http://localhost:5000/api/enrollments/bootcamp/demo-bootcamp-cyber-2026
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** 4 STUDENT enrollments — Abebe, Selamawit, Kidus, Meron.  
**Status:** `200 OK`

---

### 6.4 — View Web Bootcamp Enrollments — Mix of APPLICANT and STUDENT (Division Admin) 🔒

> Login as `dev.admin@csec.astu.edu.et`

```
GET http://localhost:5000/api/enrollments/bootcamp/demo-bootcamp-dev-2026
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
- Abebe Bikila — `STUDENT`
- Chaltu Desta — `APPLICANT`
- Dawit Mengistu — `APPLICANT_REJECTED`

**Status:** `200 OK`

---

## 📝 7. Tasks Module — `/api/tasks`

### 7.1 — List All Tasks 🔒

```
GET http://localhost:5000/api/tasks
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

### 7.2 — Get Graded Lab 1 by ID 🔒

```
GET http://localhost:5000/api/tasks/demo-cyber-task-1
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
{
  "id": "demo-cyber-task-1",
  "title": "Lab 1: Network Traffic Dissection & Threat Hunt",
  "type": "INDIVIDUAL",
  "submissionType": "FILE",
  "maxScore": 100
}
```
**Status:** `200 OK`

---

### 7.3 — Get Active Lab 2 (Due Soon) 🔒

```
GET http://localhost:5000/api/tasks/demo-cyber-task-2
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
{
  "id": "demo-cyber-task-2",
  "title": "Lab 2: Automated SQL Injection & Blind Exploit Suite",
  "submissionType": "GITHUB_LINK",
  "allowLateSubmission": false
}
```
**Status:** `200 OK`

---

### 7.4 — Get Capstone Group Milestone Task 🔒

```
GET http://localhost:5000/api/tasks/demo-cyber-task-capstone-m1
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
{
  "id": "demo-cyber-task-capstone-m1",
  "type": "GROUP_MILESTONE",
  "title": "Capstone Milestone 1: Zero-Trust Security Architecture & Threat Model",
  "peerReviewRequired": true
}
```
**Status:** `200 OK`

---

### 7.5 — Create Task (Instructor) 🔒

> Login as `cyber.instructor@csec.astu.edu.et`

```
POST http://localhost:5000/api/tasks
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "bootcampId": "demo-bootcamp-cyber-2026",
  "type": "INDIVIDUAL",
  "title": "Lab 5: Reverse Engineering with Ghidra",
  "description": "Decompile and annotate a provided ELF binary to identify the hidden flag.",
  "instructions": "Submit a written report with annotated Ghidra screenshots.",
  "submissionType": "FILE",
  "deadline": "2026-12-20T23:59:00.000Z",
  "maxScore": 100,
  "allowLateSubmission": false,
  "allowResubmission": true
}
```

**Status:** `201 Created`

---

### 7.6 — Update Task Deadline (Instructor) 🔒

```
PUT http://localhost:5000/api/tasks/demo-cyber-task-2
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "deadline": "2026-12-30T23:59:00.000Z",
  "allowLateSubmission": true,
  "latePenaltyPercent": 15
}
```

**Status:** `200 OK`

---

## 📤 8. Submissions Module — `/api/submissions`

### 8.1 — View My Submissions (Student) 🔒

> Login as `selam.student@csec.astu.edu.et` — she has 2 submissions in the seed.

```
GET http://localhost:5000/api/submissions/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
- Lab 1 submission — `status: "GRADED"`, `score: 98`
- Lab 2 submission — `status: "SUBMITTED"`

**Status:** `200 OK`

---

### 8.2 — Submit Task (GitHub Link — Student) 🔒

> Login as `student@csec.astu.edu.et` (Abebe — hasn't submitted Lab 2 yet)

```
POST http://localhost:5000/api/submissions
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "taskId": "demo-cyber-task-2",
  "githubUrl": "https://github.com/abebe-bikila/csec-blind-sqli-suite"
}
```

**Status:** `201 Created`

---

### 8.3 — Submit Task (File Upload — Student) 🔒

```
POST http://localhost:5000/api/submissions
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: multipart/form-data
```

**Form Data:**
| Key | Value |
|---|---|
| `taskId` | `demo-cyber-task-1` |
| `file` | _(attach a PDF file)_ |

**Status:** `201 Created`

---

### 8.4 — View Submissions for Lab 2 (Instructor) 🔒

> Login as `cyber.instructor@csec.astu.edu.et`

```
GET http://localhost:5000/api/submissions/task/demo-cyber-task-2
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** Selamawit's `SUBMITTED` Lab 2 GitHub submission ready for grading.  
**Status:** `200 OK`

---

### 8.5 — Grade a Submission (Instructor) 🔒

> `{{SUBMISSION_ID}}` = copy from 8.4 response (Selamawit's Lab 2 submission ID)

```
POST http://localhost:5000/api/submissions/{{SUBMISSION_ID}}/grade
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "score": 95,
  "qualFlag": "EXCELLENT",
  "feedback": "Outstanding Python exploit chain with clean WAF bypass edge case handling."
}
```

**Status:** `200 OK`

---

### 8.6 — Return Submission for Revision (Instructor) 🔒

```
POST http://localhost:5000/api/submissions/{{SUBMISSION_ID}}/return
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "feedback": "Please add documentation comments and include Wireshark capture screenshots."
}
```

**Status:** `200 OK`

---

## 📊 9. Progress Module — `/api/progress`

### 9.1 — View My Progress in Cyber Bootcamp (Student) 🔒

> Login as `selam.student@csec.astu.edu.et` — top-ranked student.

```
GET http://localhost:5000/api/progress/demo-bootcamp-cyber-2026/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
{
  "attendanceScore": 100.0,
  "taskCompletionScore": 100.0,
  "averageGrade": 98.0,
  "peerReviewScore": 100.0,
  "aggregateIndex": 99.0
}
```
**Status:** `200 OK`

---

### 9.2 — View Abebe's Progress 🔒

> Login as `student@csec.astu.edu.et`

```
GET http://localhost:5000/api/progress/demo-bootcamp-cyber-2026/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

## 👥 10. Groups Module — `/api/groups`

### 10.1 — View Groups in Cyber Bootcamp 🔒

```
GET http://localhost:5000/api/groups/bootcamp/demo-bootcamp-cyber-2026
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": "demo-group-cyberdefenders",
    "name": "CyberDefenders Squad Alpha",
    "members": [
      { "fullName": "Abebe Bikila",      "isLeader": true },
      { "fullName": "Selamawit Tadesse", "isLeader": false },
      { "fullName": "Kidus Yohannes",    "isLeader": false },
      { "fullName": "Meron Hailu",       "isLeader": false }
    ]
  }
]
```
**Status:** `200 OK`

---

### 10.2 — Create New Group (Student) 🔒

> Login as `student@csec.astu.edu.et`

```
POST http://localhost:5000/api/groups
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "bootcampId": "demo-bootcamp-cyber-2026",
  "name": "Phantom Bytes"
}
```

**Status:** `201 Created`

---

### 10.3 — Add Member to Group 🔒

```
POST http://localhost:5000/api/groups/demo-group-cyberdefenders/members
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "{{USER_ID}}"
}
```

**Status:** `200 OK`

---

### 10.4 — Assign Group Leader 🔒

```
PUT http://localhost:5000/api/groups/demo-group-cyberdefenders/leader
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "{{USER_ID}}"
}
```

**Status:** `200 OK`

---

## 💬 11. Feedback Module — `/api/feedback`

### 11.1 — Submit Session Feedback (Student) 🔒

> Login as `student@csec.astu.edu.et` — feedback window is 48h after session end.

```
POST http://localhost:5000/api/feedback/session
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "demo-cyber-session-1",
  "rating": 5,
  "comment": "Incredibly hands-on. The Nmap exercises were well-structured and practical."
}
```

**Status:** `201 Created`

---

### 11.2 — Submit Peer Review (Student) 🔒

> `{{GROUP_SUBMISSION_ID}}` = `demo-sub-cyber-group-m1`

```
POST http://localhost:5000/api/feedback/peer-review
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "submissionId": "demo-sub-cyber-group-m1",
  "revieweeId": "{{USER_ID}}",
  "rating": 4,
  "comment": "Great architecture diagrams. Could improve documentation clarity."
}
```

**Status:** `201 Created`

---

### 11.3 — View Session Feedback (Instructor/Admin) 🔒

> Login as `cyber.instructor@csec.astu.edu.et` — sees anonymous aggregated feedback.

```
GET http://localhost:5000/api/feedback/session/demo-cyber-session-1
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** 2 seeded feedback entries from Selamawit (5★) and Abebe (4★).  
**Status:** `200 OK`

---

## 📚 12. Resources Module — `/api/resources`

### 12.1 — Get Resources for Session 2 🔒

```
GET http://localhost:5000/api/resources/session/demo-cyber-session-2
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": "demo-res-owasp-ref",
    "title": "OWASP Top 10 Web Exploitation Reference Card",
    "externalUrl": "https://owasp.org/www-project-top-ten/",
    "downloadCount": 39
  }
]
```
**Status:** `200 OK`

---

### 12.2 — Download a Resource 🔒

```
GET http://localhost:5000/api/resources/demo-res-linux-guide/download
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK` _(file stream or redirect)_

---

### 12.3 — Upload Resource (Instructor) 🔒

> Login as `cyber.instructor@csec.astu.edu.et`

```
POST http://localhost:5000/api/resources/session/demo-cyber-session-2
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: multipart/form-data
```

**Form Data:**
| Key | Value |
|---|---|
| `file` | _(attach a PDF/ZIP)_ |
| `title` | `Ghidra Reverse Engineering Cheatsheet` |
| `description` | `Quick reference for static analysis workflow.` |

**Status:** `201 Created`

---

## 🏆 13. Induction Module — `/api/induction`

### 13.1 — View Leaderboard for Completed Bootcamp (Division Admin) 🔒

> Login as `dev.admin@csec.astu.edu.et` — this bootcamp belongs to the Development division.

```
GET http://localhost:5000/api/induction/leaderboard/demo-bootcamp-dev-2025
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** Ranked list —
- Selamawit Tadesse — `94.2` → `INDUCTED`
- Abebe Bikila — `81.5` → `INDUCTED`
- Yared Alemu — `58.4` → `NOT_INDUCTED` (below 75% threshold)

**Status:** `200 OK`

---

### 13.2 — Record Induction Decision (Division Admin) 🔒

> `{{ENROLLMENT_ID}}` = copy from GET /enrollments/bootcamp/... response.

```
POST http://localhost:5000/api/induction/decide
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "enrollmentId": "{{ENROLLMENT_ID}}",
  "decision": "INDUCTED",
  "overrideNote": "Exceptional capstone delivery and leadership throughout the cohort."
}
```

**Status:** `200 OK`

---

## 🔔 14. Notifications Module — `/api/notifications`

### 14.1 — View My Notifications (Student — Abebe) 🔒

> Login as `student@csec.astu.edu.et` — 2 seeded notifications exist.

```
GET http://localhost:5000/api/notifications
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "eventType": "SESSION_REMINDER",
    "title": "Session 2 is Active: Web App Penetration Testing",
    "readAt": null
  },
  {
    "eventType": "TASK_GRADED",
    "title": "Lab 1 Graded: Network Traffic Dissection",
    "readAt": "..."
  }
]
```
**Status:** `200 OK`

---

### 14.2 — Mark Notification as Read 🔒

> `{{NOTIFICATION_ID}}` = copy an `id` from 14.1 response.

```
PUT http://localhost:5000/api/notifications/{{NOTIFICATION_ID}}/read
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

## 👤 15. Users Module — `/api/users`

### 15.1 — List All Users (Any Authenticated User) 🔒

```
GET http://localhost:5000/api/users
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:** All 16 seeded users (super admin, 4 division admins, 3 instructors, 5 students, 3 guests).  
**Status:** `200 OK`

---

### 15.2 — Get User by ID 🔒

> Copy a `userId` from the 15.1 response.

```
GET http://localhost:5000/api/users/{{USER_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Status:** `200 OK`

---

### 15.3 — Update User (Admin) 🔒

> Login as super admin. `{{USER_ID}}` from previous response.

```
PUT http://localhost:5000/api/users/{{USER_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "fullName": "Updated Full Name",
  "department": "Updated Department"
}
```

**Status:** `200 OK`

---

## 📋 16. Audit Log Module — `/api/audit`

### 16.1 — View Audit Logs (Admin) 🔒

> Login as super admin — 3 audit entries seeded.

```
GET http://localhost:5000/api/audit
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "action": "SESSION_APPROVED",
    "targetType": "SESSION",
    "metadata": { "sessionTitle": "Session 2: Web App Penetration Testing & OWASP Top 10" }
  },
  {
    "action": "ATTENDANCE_OVERRIDE",
    "targetType": "ATTENDANCE_RECORD",
    "metadata": { "student": "Kidus Yohannes", "note": "Excused 5 minutes due to campus shuttle delay" }
  },
  {
    "action": "INDUCTION_DECISION_FINALIZED",
    "targetType": "BOOTCAMP",
    "metadata": { "inductedCount": 2, "totalCandidates": 3 }
  }
]
```
**Status:** `200 OK`

---

## 🔥 17. 404 Diagnostic Checklist

Run these in order. Each passing test narrows down where the 404 originates.

| # | Test | Expected | What it proves |
|---|---|---|---|
| 1 | `GET /api/health` | `200` | Server is up, `/api` prefix works |
| 2 | `POST /api/auth/login` | `200` + token | Auth route is mounted correctly |
| 3 | `GET /api/auth/me` + token | `200` | `authGuard` reads the Bearer token |
| 4 | `GET /api/divisions` + token | `200` | Module routes are mounted under `/api` |
| 5 | `GET /api/bootcamps` _(no auth)_ | `200` | Public routes bypass auth correctly |

**Most common causes of 404 on authenticated requests:**

```
❌ Token sent as:  Authorization: <token>           ← Missing "Bearer " prefix
✅ Correct:        Authorization: Bearer <token>

❌ Calling:        http://localhost:3000/api/...     ← Frontend Vite port, not backend
✅ Correct:        http://localhost:5000/api/...

❌ Calling:        http://localhost:5000/divisions   ← Missing /api prefix
✅ Correct:        http://localhost:5000/api/divisions

❌ Token expired — re-run test 1.2 (login) to get a fresh ACCESS_TOKEN
```

---

## 🗂️ Seed Data Quick Reference

### Bootcamp IDs (hardcoded)

| ID | Title | Status |
|---|---|---|
| `demo-bootcamp-cyber-2026` | Cybersecurity & Defense Bootcamp 2026 | `ACTIVE` |
| `demo-bootcamp-dev-2026` | Fullstack Web Development Bootcamp 2026 | `OPEN` |
| `demo-bootcamp-cp-2026` | Competitive Programming Winter Camp 2026 | `SCREENING` |
| `demo-bootcamp-ai-2026` | Applied Generative AI & Deep Learning 2026 | `DRAFT` |
| `demo-bootcamp-dev-2025` | Fullstack Web Development Cohort 2025 | `COMPLETED` |
| `demo-bootcamp-cp-2025` | ICPC National Qualifier Training 2025 | `ARCHIVED` |

### Session IDs (hardcoded)

| ID | Title | Status |
|---|---|---|
| `demo-cyber-session-1` | Session 1: Linux Internals, Bash Scripting & Network Recon | `COMPLETED` |
| `demo-cyber-session-2` | Session 2: Web App Penetration Testing & OWASP Top 10 | `APPROVED` ⚡ LIVE |
| `demo-cyber-session-3` | Session 3: Binary Exploitation & Memory Safety Fundamentals | `APPROVED` |
| `demo-cyber-session-4` | Session 4: Malware Analysis Sandbox Engineering | `PENDING` |

### Task IDs (hardcoded)

| ID | Title | Type |
|---|---|---|
| `demo-cyber-task-1` | Lab 1: Network Traffic Dissection & Threat Hunt | `INDIVIDUAL` |
| `demo-cyber-task-2` | Lab 2: Automated SQL Injection & Blind Exploit Suite | `INDIVIDUAL` |
| `demo-cyber-task-capstone-m1` | Capstone Milestone 1: Zero-Trust Security Architecture | `GROUP_MILESTONE` |

### Submission IDs (hardcoded)

| ID | Student | Task | Status |
|---|---|---|---|
| `demo-sub-task1-selam` | Selamawit | Lab 1 | `GRADED` (98/100) |
| `demo-sub-task1-abebe` | Abebe | Lab 1 | `GRADED` (86/100) |
| `demo-sub-task2-selam` | Selamawit | Lab 2 | `SUBMITTED` (pending grade) |
| `demo-sub-cyber-group-m1` | CyberDefenders Squad | Capstone M1 | `SUBMITTED` |

### Group IDs (hardcoded)

| ID | Name |
|---|---|
| `demo-group-cyberdefenders` | CyberDefenders Squad Alpha |

### Resource IDs (hardcoded)

| ID | Title |
|---|---|
| `demo-res-linux-guide` | CSEC Linux & Networking Survival Guide |
| `demo-res-owasp-ref` | OWASP Top 10 Web Exploitation Reference Card |
| `demo-res-fullstack-arch` | Fullstack System Architecture & REST Guidelines |

### Test Accounts

| Role | Email | Password |
|---|---|---|
| `SUPER_ADMIN` | _(personal email — set in Postman env)_ | `Admin123!` |
| `DIVISION_ADMIN` — Cyber | `cyber.admin@csec.astu.edu.et` | `Admin123!` |
| `DIVISION_ADMIN` — Dev | `dev.admin@csec.astu.edu.et` | `Admin123!` |
| `DIVISION_ADMIN` — CP | `cp.admin@csec.astu.edu.et` | `Admin123!` |
| `DIVISION_ADMIN` — AI | `ai.admin@csec.astu.edu.et` | `Admin123!` |
| `INSTRUCTOR` — Cyber | `cyber.instructor@csec.astu.edu.et` | `Password123!` |
| `INSTRUCTOR` — Web | `instructor@csec.astu.edu.et` | `Password123!` |
| `INSTRUCTOR` — CP | `cp.instructor@csec.astu.edu.et` | `Password123!` |
| `STUDENT` — Abebe (Squad Leader) | `student@csec.astu.edu.et` | `Password123!` |
| `STUDENT` — Selamawit (Top rank, Inducted) | `selam.student@csec.astu.edu.et` | `Password123!` |
| `STUDENT` — Kidus | `kidus.student@csec.astu.edu.et` | `Password123!` |
| `STUDENT` — Meron | `meron.student@csec.astu.edu.et` | `Password123!` |
| `STUDENT` — Yared (NOT_INDUCTED demo) | `yared.student@csec.astu.edu.et` | `Password123!` |
| `GUEST` — Chaltu (Pending applicant) | `applicant@csec.astu.edu.et` | `Password123!` |
| `GUEST` — Dawit (Rejected applicant) | `rejected.applicant@csec.astu.edu.et` | `Password123!` |
| `GUEST` — Helen (No applications yet) | `new.guest@csec.astu.edu.et` | `Password123!` |

> **Live attendance PIN:** `749201` — Session `demo-cyber-session-2`, Cyber 2026 bootcamp.
