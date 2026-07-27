# 0002 — Role hierarchy lives in the guard, routes list the minimum role

The route table had drifted: some routes listed `['ADMIN', 'SUPER ADMIN']`, others just
`['ADMIN']` — so the club's SUPER ADMIN could delete an entire division but not a bootcamp or a
session. Each route author typed whichever roles came to mind; nothing enforced the intended rule.

We decided the hierarchy is encoded **once, inside `role.guard.js`**, as a `ROLE_IMPLIES` map with
exactly one edge: `SUPER ADMIN → ADMIN`. Holding a role grants every role it implies. Routes list
only the *minimum* role a caller needs (`roleGuard(["ADMIN"])` admits SUPER ADMIN automatically);
listing `SUPER ADMIN` alongside `ADMIN` in a route is now redundant and was swept away.

`ADMIN` deliberately does **not** imply `INSTRUCTOR`: admins manage, instructors teach. Routes
that are instructor-work (e.g. marking attendance) stay closed to admins unless they also hold
the INSTRUCTOR role.

## Considered Options

- **Flat guard, fix the route lists by hand** — keep the guard a plain set-intersection and add
  `'super admin'` everywhere `'admin'` appears. Rejected: the drift recurs the first time someone
  writes a new route and forgets, and nothing catches it. This is how the bug happened.
- **Flat guard, current lists intended** — accept that SUPER ADMIN can't touch bootcamps/sessions.
  Rejected: no one designed that; it was accident, not policy.
- **Full linear hierarchy (SUPER ADMIN > ADMIN > INSTRUCTOR > STUDENT)** — rejected: admins
  managing is not the same capability as instructors teaching, and student-only routes
  (e.g. submitting a task) must not silently admit staff.

## Consequences

- New routes can't lock SUPER ADMIN out by omission — the mistake is structurally impossible,
  same drift-prevention philosophy as ADR-0001.
- The one place to read (or change) the hierarchy is the `ROLE_IMPLIES` map in
  `backend/src/middleware/role.guard.js`; the tests in `backend/tests/role.guard.test.js` pin
  both the implication and its limits (ADMIN ⇏ SUPER ADMIN, ADMIN ⇏ INSTRUCTOR).
- Routes where SUPER ADMIN is itself the minimum (division create/delete, report delete) still
  say so explicitly — the hierarchy only ever widens access upward, never restricts it.
- In-handler privilege checks (e.g. user creation rules in `user.controller.js`) are unaffected;
  they express finer-grained policy than route admission and still check roles explicitly.
