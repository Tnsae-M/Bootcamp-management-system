# 0004 — Bootcamp is the core operational unit, not Division

Status: accepted

We decided that all learning activity (Sessions, Tasks, Attendance, Groups, Enrollments, Induction decisions) is owned by a **Bootcamp**, not by a Division. A Division is a permanent institutional track that acts only as the parent container. This replaces the v1 model where sessions, tasks, and groups floated directly under a Division.

## Considered Options

- **Division as core unit (v1 model):** Sessions and tasks attached directly to Division. Bootcamp was an informal tag. Rejected because it conflates the permanent organizational structure with the time-bound learning cycle, making it impossible to run successive cohorts, archive old data, or compute per-cohort analytics cleanly.
- **Bootcamp spans multiple Divisions (cross-divisional matrix):** Rejected — CSEC-ASTU Bootcamps are always run inside a single Division's domain and staffed by that Division's instructors.

## Consequences

- Every operational entity (`Session`, `Task`, `Enrollment`, `Group`, `AttendanceRecord`) carries a `bootcampId` foreign key, never a bare `divisionId`.
- Division-level analytics are aggregations over their child Bootcamps, not first-class data.
- Running a second cohort (Dev Cohort 2027) requires creating a new Bootcamp under the same Division — no data migration needed.
