# 0008 — Induction is a human decision, score is a recommendation

Status: accepted

We decided that the system **never automatically inducts or rejects** a Student. The Weighted Score and configurable cutoff threshold are presented to the Division Admin as a ranked recommendation; the Division Admin holds absolute authority to accept or reject any individual Student regardless of their score.

Override decisions are recorded with an optional note for accountability but the note is not required — override freedom is unconditional.

## Considered Options

- **Auto-induction above threshold:** Any Student above the configured cutoff is automatically inducted; below is automatically rejected. Rejected — the Division Heads explicitly need the ability to override for edge cases (e.g. a Student who scored 68% but showed exceptional late growth, or a Student who gamed attendance metrics). Automatic decisions remove this accountability.
- **Score tracking only, fully manual decision outside the system:** System collects data, Admin exports CSV and decides externally. Rejected — the leaderboard and induction decision UI are the primary value-add of the system for Division Heads.
- **Score + mandatory override justification:** Override is allowed but requires a written note. Rejected — mandatory notes create friction that discourages legitimate overrides and implies the system's authority over human judgment.

## Consequences

- The `InductionDecision` table stores: `enrollmentId`, `decision` (`INDUCTED` | `NOT_INDUCTED`), `computedScoreAtDecision`, `overrideNote` (nullable), `decidedBy`, `decidedAt`.
- The system must never surface an auto-induction action — only a recommendation indicator (e.g. colour coding above/below threshold on the leaderboard).
- Audit Log records every induction decision for accountability, regardless of whether a note was provided.
