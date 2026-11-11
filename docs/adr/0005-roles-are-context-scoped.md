# 0005 — Roles are scoped to Division or Bootcamp, not global

Status: accepted

We decided that Role Assignments in v2 are **context-scoped**: a User holds a role relative to a specific Division or Bootcamp, not the entire system. `SUPER ADMIN` is the sole exception — it is global by definition. This replaces the flat global `roles` array from v1 (ADR-0003, superseded).

A Division Admin's authority is scoped to their Division. An Instructor's authority is scoped to their Bootcamp assignment. A Student's access is scoped to their active Enrollment.

## Considered Options

- **Global flat roles (v1 model):** Any ADMIN was an admin everywhere; any INSTRUCTOR could touch any bootcamp. Rejected because CSEC-ASTU explicitly needs Division Heads who can only manage their own Division, and Instructors who can only grade the sessions they were assigned to teach.
- **Full RBAC with permission bits:** Fine-grained permission flags per resource. Rejected as over-engineered for a club platform with four fixed divisions and predictable role shapes.

## Consequences

- The `UserRole` table carries `(userId, role, scopeType, scopeId)` — not a simple string array on the User.
- Guards must resolve scope: does the requesting User's role cover this resource's Division or Bootcamp?
- A User can legitimately hold multiple scoped roles simultaneously (e.g. Division Admin for Development, Student in a CPD Bootcamp).
- JWT payloads carry the full Role Assignment list; scope checks happen in route handlers, not at the token boundary.
