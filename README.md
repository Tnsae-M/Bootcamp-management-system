# CSEC-ASTU Bootcamp Management System (BMS)

[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react&logoColor=black)](https://react.dev)
[![Vite 6](https://img.shields.io/badge/Vite-6.2.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.1.14-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19.3-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Vitest](https://img.shields.io/badge/Vitest-4.1.10-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Tests Passing](https://img.shields.io/badge/Tests-115%20Passing-brightgreen)]()

The centralized bootcamp lifecycle management platform engineered for the **Computer Science & Engineering Community at Adama Science and Technology University (CSEC-ASTU)**. 

BMS streamlines the operation of intensive multi-track bootcamps, enables cryptographic and PIN-based session attendance check-ins, tracks coding problem sets and milestone deliverables, and computes transparent graduation induction using a multi-signal evaluation model.

---

## 🌟 Key Features

### 🎓 1. Multi-Track Specializations
- Division-scoped curriculum tracks:
  - **Competitive Programming:** ICPC problem-solving, algorithms, graph theory, dynamic programming.
  - **Cybersecurity & Defense:** Network security, web pentesting, cryptography, reverse engineering, CTF drills.
  - **Software Engineering & Web:** Modern fullstack stacks, distributed systems, PostgreSQL, Docker, DevOps.
  - **Applied AI & Data Science:** Machine learning foundations, neural networks, data pipelines, model evaluation.

### ⏱️ 2. Dynamic Time-Sensitive Attendance PINs
- Instructors launch 10–15 minute attendance windows directly from their teaching portal.
- Generates a live, time-limited verification code.
- Students check in from desktop or mobile; verified attendances update induction scores immediately with audit timestamps.

### 📊 3. 4-Signal Induction Calculation Engine
Transparent evaluation index calculated against the official CSEC division induction threshold ($\ge 75\%$ aggregate index):
1. **Attendance Integrity (30% default weight):** Validated presence across official scheduled sessions.
2. **Task Rigor & Turn-in (40% default weight):** On-time submission of lab problem sets.
3. **Grading Mastery (Average Score):** Mean points awarded by instructors during code review.
4. **Capstone Milestones & Peer Review (20% + 10% weights):** Collaborative project deliverables and peer evaluations.

### 🛡️ 4. Role-Partitioned Portals & Role Switcher
Partitioned portals under `/dashboard/:role/*` backed by canonical route guards and dynamic role switching for multi-role users:
- **Guest Portal (`/dashboard/guest/*`):** Browse open cohorts across divisions, submit application statements, track screening outcomes, and manage profile settings.
- **Student Portal (`/dashboard/student/*`):** Learning dashboard, quick attendance PIN input, enrolled bootcamps, session schedule, GitHub deliverable submissions, 4-signal progress index, and capstone groups.
- **Instructor Portal (`/dashboard/instructor/*`):** Teaching hub, schedule sessions, launch attendance PIN windows, author assignments, grading queue with rubric criteria, attendee roster with absence overrides, and resource sharing.
- **Admin Portal (`/dashboard/admin/*`):** Global system metrics, division management, cohort launcher with 6-stage lifecycle transitions, user RBAC governance, candidate screening, cohort graduation audits, and immutable security event logs.

### 🔐 5. Hybrid Authentication Architecture
- **Short-Lived Access Tokens:** Kept in memory via Redux Toolkit.
- **HttpOnly Refresh Cookies:** Protected with `SameSite=Lax` and `HttpOnly` flags, safeguarding against XSS.
- **Silent Refresh Queue:** Automatic token refresh on 401 API responses with concurrency request queuing.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (React 19 + Vite 6 + Redux Toolkit)"]
        UI_Tier1["Tier 1 UI Primitives (Button, Modal, Card, Input)"]
        UI_Tier2["Tier 2 Domain Primitives (StatusBadge, PageHeader, StatGrid)"]
        Router["React Router v7 (/dashboard/:role/*)"]
        AxiosClient["Axios Client (withCredentials + Silent 401 Refresh Queue)"]
        ReduxStore["Redux Store (10 Feature Slices)"]
    end

    subgraph Server ["Backend (Node.js + Express)"]
        AuthMiddleware["Auth & Scope Guards (RoleGuard + ScopeGuard)"]
        CookieParser["cookie-parser (httpOnly Refresh Cookie)"]
        Modules["Modules: Auth, Bootcamps, Sessions, Attendance, Tasks, Groups, Progress, Audit"]
        PrismaORM["Prisma Client"]
    end

    subgraph Database ["PostgreSQL"]
        DB[(BMS Database)]
    end

    Router --> UI_Tier2 --> UI_Tier1
    Router --> AxiosClient
    AxiosClient <-->|REST + Bearer Token + Cookie| Server
    Server --> AuthMiddleware --> Modules --> PrismaORM --> DB
```

---

## 📂 Repository Structure

```
csec-astu-bms-project/
├── HANDOFF.md                   # Permanent agent session handoff & architectural guide
├── README.md                    # Project documentation
├── backend/
│   ├── src/
│   │   ├── app.js               # Express application configuration
│   │   ├── config/              # Prisma and database connection
│   │   ├── middleware/          # Role guard, scope guard, rate limiter, error handler
│   │   ├── modules/             # Domain modules (auth, bootcamps, sessions, attendance, tasks, etc.)
│   │   └── routes/              # Centralized API route index
│   ├── prisma/                  # Schema, migrations, and seed scripts
│   ├── tests/                   # 16 Vitest test suites (102 tests)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client with silent refresh queue
│   │   ├── app/                 # Redux Toolkit store and typed hooks
│   │   ├── components/
│   │   │   ├── ui/              # Tier 1 UI primitives (button, input, modal, card, etc.)
│   │   │   ├── common/          # Tier 2 domain primitives (StatusBadge, StatGrid, PageHeader)
│   │   │   ├── layout/          # Sidebar, Navbar, DashboardLayout, ProtectedRoute
│   │   │   └── theme/           # ThemeProvider, ThemeToggle (Light/Dark mode)
│   │   ├── config/              # Declarative navigation seam (navigation.ts)
│   │   ├── features/            # 10 Redux feature slices (auth, bootcamps, sessions, tasks, etc.)
│   │   ├── pages/               # 27 role-partitioned pages (guest, student, instructor, admin, auth)
│   │   ├── services/            # Typed API services
│   │   ├── types/               # Canonical domain TypeScript models
│   │   ├── tests/               # Vitest frontend unit tests
│   │   ├── App.tsx              # React Router v7 route tree
│   │   └── main.tsx             # Application entrypoint
│   └── package.json
│
└── docs/
    └── adr/                     # Architectural Decision Records
        ├── 0010-frontend-state-management-rtk.md
        ├── 0011-frontend-route-partitioning-by-role.md
        ├── 0012-hybrid-auth-httponly-cookies.md
        └── 0013-two-tier-ui-deep-primitives.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **PostgreSQL:** Running on `127.0.0.1:5432`

### 1. Backend Setup
```powershell
cd backend
npm install

# Configure environment variables in backend/.env:
# DATABASE_URL="postgresql://user:password@localhost:5432/csec_bms?schema=public"
# JWT_SECRET="your-jwt-access-secret"
# JWT_REFRESH_SECRET="your-jwt-refresh-secret"
# PORT=5000

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed initial data
npm run seed

# Start development server (Port 5000)
npm run dev
```

### 2. Frontend Setup
```powershell
cd ../frontend
npm install

# Start development server (Port 3000)
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🧪 Testing & Verification

Both frontend and backend are thoroughly covered by automated test suites:

### Running Backend Tests (102 tests)
```powershell
cd backend
npx vitest run
```
*Output: 16 test files passed, 102 passed out of 102 tests.*

### Running Frontend Tests (13 tests)
```powershell
cd frontend
npx vitest run
```
*Output: 3 test files passed, 13 passed out of 13 tests.*

### Running Frontend Typecheck
```powershell
npm run lint --prefix frontend
```
*Output: `tsc --noEmit` exited with Code 0 (Zero errors).*

### Running Frontend Production Build
```powershell
npm run build --prefix frontend
```
*Output: All 1,834 modules transformed, 34 code-split lazy chunks generated in `dist/`.*

---

## 📜 Architectural Decision Records (ADRs)

| ADR | Title | Decision Summary |
|---|---|---|
| [ADR-0010](docs/adr/0010-frontend-state-management-rtk.md) | Frontend State Management | Redux Toolkit (10 slices) + Axios client + typed async thunks. |
| [ADR-0011](docs/adr/0011-frontend-route-partitioning-by-role.md) | Route Partitioning by Role | Distinct portals under `/dashboard/:role/*` with an active role switcher. |
| [ADR-0012](docs/adr/0012-hybrid-auth-httponly-cookies.md) | Hybrid Authentication | `httpOnly` refresh token cookie + short-lived Bearer access token with silent refresh queue. |
| [ADR-0013](docs/adr/0013-two-tier-ui-deep-primitives.md) | Two-Tier UI Primitives | Tier 1 (Radix/Tailwind base) + Tier 2 (Deep domain primitives encapsulating domain mapping). |

---

## 👥 Roles & Canonical Permissions

| Role | Scope | Key Capabilities |
|---|---|---|
| **SUPER_ADMIN** | Global | Full system governance, audit trails, user role management, system health. |
| **DIVISION_ADMIN** | Division | Launch bootcamps, configure induction weights, screen applicants, approve sessions. |
| **INSTRUCTOR** | Bootcamp | Schedule sessions, generate 15-minute attendance PINs, author tasks, grade submissions. |
| **STUDENT** | Cohort | Enter attendance PINs, submit code deliverables, monitor 4-signal induction progress. |
| **GUEST** | Public | Browse open bootcamp catalogue, submit enrollment applications, manage profile. |

---

## 🤝 Community & Contributing

Built with ❤️ by and for the **Computer Science & Engineering Community (CSEC-ASTU)** at Adama Science and Technology University.

For guidelines, feature requests, or contributions, adhere to the CSEC-ASTU Code of Conduct and coordinate with division leads.

