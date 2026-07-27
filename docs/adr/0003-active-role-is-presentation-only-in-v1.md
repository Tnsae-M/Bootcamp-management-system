# 0003 — Active Role is presentation-only in v1; division-scoped roles deferred to v2

Active Role was invented for a real domain situation: a person can be an ADMIN of one Division
and a STUDENT in another, and should be able to switch hats. But the v1 data model cannot
express this — `roles` is a flat global array and a User has a single `divisionId`. No handler
checks that an admin's Division matches the resource's Division, and the JWT carries the full
role set, so a User holding ADMIN can reach every admin endpoint regardless of which role they
are "acting as" client-side.

We decided to keep it that way for v1 and say so out loud: **Active Role selects a dashboard,
nothing more. The backend authorizes against the full `roles` set, globally.** Division-scoped
role assignment and a backend-enforced Active Role are v2 work, to be done by hand.

## Considered Options

- **Model it properly now** — per-division memberships (`[{divisionId, role}]`), scope-aware
  guards, JWT and sanitizer changes. Honest to the domain, but a schema migration on the scale
  of ADR-0001 touching the guard, auth, and every admin page. Rejected for v1: portfolio scope,
  no real users.
- **Half-enforce in handlers** — keep global roles but add "same division?" checks inside admin
  handlers. Rejected: encodes the rule in N places without the data model to back it, and
  SUPER ADMIN / cross-division cases breed ad-hoc exceptions.
- **Presentation-only, documented (chosen)** — zero code change; the glossary and this ADR
  carry the truth so nobody designs against an enforcement that isn't there.

## Consequences

- Anyone holding ADMIN is an admin *everywhere*, whatever their Active Role — assign roles
  accordingly in v1.
- The frontend must not present Active Role as a security boundary, only as a view switch.
- v2's remodel has its requirements written down: role scoped to Division, Active Role enforced
  server-side, and an enrollment flow that doesn't assume one Division per User (today
  `enrollment.service.js` overwrites a User's `divisionId` with the bootcamp's Division on
  cross-division enrollment — that assumption must fall in v2).
