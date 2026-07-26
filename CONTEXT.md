# CSEC-ASTU Bootcamp Management System

A bootcamp management system for the CSEC-ASTU club: admins run divisions and bootcamps, instructors run sessions and tasks, students attend and submit. One backend context; the frontend mirrors its language.

## Language

**User**:
A person with an account, identified by `_id`, holding one or more Roles. The canonical wire shape is defined by the sanitizer (see ADR-0001) — anything not in it does not leave the backend.
_Avoid_: account, member

**Role**:
One of `SUPER ADMIN`, `ADMIN`, `INSTRUCTOR`, `STUDENT` — always uppercase, always carried as an array (`roles`). A User can hold several at once.
_Avoid_: `role` (singular field — deleted legacy), lowercase variants

**Active Role**:
The single Role a logged-in User is currently acting as, chosen client-side from their `roles`. Determines which dashboard and guards apply.

**Division**:
An organizational unit of the club that Users belong to. Users reference it via `divisionId`; on the wire it travels populated (`{_id, name}`).
_Avoid_: `division` (bare string field — deleted legacy), group

**Bootcamp**:
A training program a User is enrolled in. A User's enrollments travel as `bootcamps`, each entry a populated `bootcampId` reference.

**Progress Report**:
The backend-computed summary of a student's standing in a bootcamp: `attendanceRate`, `taskCompletionRate`, `avgScore`, and their weighted `overallProgress` (30/40/30). Computed only on the backend; the frontend displays, never derives.
_Avoid_: score (ambiguous — say `avgScore` or `overallProgress`)

**Sanitized User**:
The only User representation allowed to cross the API boundary — produced by the shared allowlist sanitizer in the users module. Secrets (`password`, `refreshToken`, reset/verification tokens) are structurally absent, not just hidden.

## Session workflow

Every working session ends with `/handoff` (project skill, `.claude/skills/handoff/`): it writes `HANDOFF-<date>.md` at the repo root with verified progress and next actions, syncs this glossary if terms changed, and updates memory. Session state lives in the HANDOFF file — never in this glossary.
