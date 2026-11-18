# 0011 — Frontend Route Partitioning by Role Persona with Presentation Active-Role Switcher

Status: accepted

We decided that the frontend routing will be partitioned into role-specific dashboard portals (`/dashboard/:role/*`) backed by an **Active Role Switcher** in the navigation header.

## Context

A CSEC-ASTU BMS user may hold multiple scoped roles simultaneously (e.g. `DIVISION_ADMIN` for Development, `INSTRUCTOR` for a web bootcamp, and `STUDENT` in a competitive programming track). We need to provide clear, dedicated user experiences for each role without confusing UI clutter or security ambiguity.

## Considered Options

- **Role-Partitioned Portals with Active Role Switcher (Accepted):** Dedicated route prefixes (`/dashboard/admin/*`, `/dashboard/instructor/*`, `/dashboard/student/*`, `/dashboard/guest/*`). Switching active role dynamically switches the sidebar navigation tree and dashboard perspective without requiring re-authentication.
- **Resource/Entity-Centric Routes:** Single URLs (`/bootcamps/:id`) with conditional action rendering based on permissions. Rejected because it scatters complex role checks across components and fails to provide dedicated home hubs for instructors or students.
- **Unified Single Dashboard with Dynamic Widgets:** One dashboard showing mixed tasks, grading, and administrative widgets. Rejected due to high cognitive load and visual noise for multi-role users.

## Consequences

- The application shell will read the current active role from Redux (`state.auth.activeRole`) and persist it in `localStorage`.
- Protected route guards will verify that the user actually holds the role required to enter a given `/dashboard/:role` branch.
- The active role remains a client-side presentation filter for navigation and UX clarity; the backend continues to strictly enforce authentic permissions via `scope.guard.js` and `role.guard.js`.

