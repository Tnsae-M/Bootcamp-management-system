# 0010 — Frontend State Management using Redux Toolkit (RTK) and Typed Async Thunks

Status: accepted

We decided that the frontend state architecture will use **Redux Toolkit (RTK) with dedicated domain slices, typed async thunks, and an Axios service layer**.

## Context

The CSEC-ASTU Bootcamp Management System requires coordinated state management across 5 user roles with multi-scope permissions (`GLOBAL`, `DIVISION`, `BOOTCAMP`). The UI needs synchronous access to authentication credentials, active role perspective, and cache invalidation across interdependent entities (bootcamps, enrollments, sessions, attendance codes, tasks, and capstone groups).

## Considered Options

- **RTK Slices + Axios Services + Typed Async Thunks (Accepted):** Centralized Redux store with explicit slice definitions and async thunks. Provides total control over payload normalization, error interception, multi-role context switching, and state resets on logout without introducing extra runtime dependencies.
- **RTK Query:** Declarative endpoints with automated caching. Rejected because multi-role context switches, conditional scope querying, and optimistic manual updates create high boilerplate in RTK Query without significant benefit for this application scale.
- **TanStack Query (React Query) + Zustand:** Separates server cache from UI store. Rejected because it introduces new dependencies into the codebase while `@reduxjs/toolkit` and `react-redux` are already installed and vetted.

## Consequences

- The state layer will live under `src/features/<domain>/<domain>Slice.ts`.
- All backend HTTP requests will be abstracted behind `src/services/<domain>.service.ts` backed by a centralized Axios client with JWT bearer interceptors and token refresh handling.
- Components will interact with server state via `useDispatch(actionAsync(...))` and `useSelector(state => state.<domain>)`.

