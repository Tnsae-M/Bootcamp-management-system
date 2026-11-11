# 0006 — PostgreSQL replaces MongoDB as the primary database

Status: accepted

We decided to migrate from **MongoDB + Mongoose** to **PostgreSQL + Prisma** as the primary datastore for v2.

The v2 domain model is fundamentally relational: scoped Role Assignments, leaderboard queries joining Enrollment × AttendanceRecord × Submission × PeerReview, global no-overlap session constraint checks, and the Student lifecycle state machine all require joins, transactions, and unique constraints that MongoDB expresses awkwardly via `$lookup` aggregation pipelines and application-level enforcement.

## Considered Options

- **Keep MongoDB, design around it:** Accept complex aggregation pipelines for the leaderboard and analytics queries, enforce unique constraints in application code. Rejected — the leaderboard alone requires a 5-way join with group-by and weighted arithmetic; this is a query the relational model solves in one SQL statement and MongoDB requires a multi-stage pipeline that is fragile to schema evolution.
- **Hybrid PostgreSQL + MongoDB:** Core relational entities in PostgreSQL, unstructured data (notifications, audit logs) in MongoDB. Rejected — operational cost of running two databases outweighs the marginal benefit for a club platform.
- **SQLite for simplicity:** Rejected — no native JSON support for flexible milestone schemas, poor concurrency for a hosted platform, and no production-grade managed hosting on Render.

## Consequences

- All Mongoose models, `_id` ObjectId references, and `$lookup` pipelines are removed.
- Prisma schema is the single source of truth for the data model.
- The existing seeder (`seedAll.js`) must be rewritten for Prisma.
- `_id` becomes `id` (UUID) across all API responses — a breaking change to any existing frontend code consuming the API.
- Foreign key constraints and unique indexes are enforced at the database level, not in application middleware.
