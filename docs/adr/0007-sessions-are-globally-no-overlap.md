# 0007 — Sessions are globally no-overlap across all Divisions

Status: accepted

We decided that the session scheduling conflict rule is **global**: no two Sessions may share any overlapping time window, regardless of which Division or Bootcamp they belong to. Conflict detection is enforced at proposal time, not just at publish time.

## Considered Options

- **Per-Division no-overlap only (v1 model):** Sessions in different Divisions could overlap freely. Rejected — CSEC-ASTU operates on a shared campus with shared physical spaces and a shared student body. Students who participate in multiple contexts (e.g. a Division Member who also mentors in another Division's Bootcamp) cannot attend two simultaneous sessions.
- **Per-Instructor no-overlap only:** Conflict only when the same Instructor is double-booked. Rejected — this misses the shared venue and shared student constraints.
- **Resource/room booking system:** Model physical rooms as bookable resources and block on room, not time. Rejected as over-engineered for a club; the simpler invariant (no two sessions at the same time, club-wide) is sufficient and enforceable with a single DB query.

## Consequences

- Session creation/proposal runs a global overlap query: `SELECT 1 FROM sessions WHERE status IN ('PENDING','APPROVED') AND startTime < :end AND endTime > :start LIMIT 1`.
- Division Admins approving a session must be shown if a conflict has appeared between proposal and approval time.
- This is a tighter constraint than most scheduling systems — it means only one session can run across the entire club at any moment. This is intentional and reflects the physical reality of the club's setup.
