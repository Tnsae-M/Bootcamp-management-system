# 0001 — Canonical User wire shape

The frontend and backend had drifted into four competing `User` shapes (two frontend interfaces, two backend response styles), causing ~30 type errors and runtime blanks. We decided the canonical shape follows the **database reality, populated**: `_id` (not `id`), `roles: UserRole[]` (uppercase, plural — the singular `role` field and all four of its compat layers are deleted), `divisionId` and `bootcamps` as populated references, never dropped and never bare ObjectIds.

```json
{
  _id: string,
  name: string,
  email: string,
  roles: ('SUPER ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT')[],
  status: 'active' | 'suspended' | 'graduated',
  divisionId: { _id, name } | null,
  bootcamps: [{ bootcampId: { _id, name, title? } }],
  isEmailVerified: boolean,
  createdAt: string
}
```

## Considered Options

- **`id` on the wire** — cleaner API surface, but requires a rename layer in all 18 backend modules; `_id` requires changing only `sanitizeUser`. Rejected for cost.
- **Bare ObjectId references** — purer REST, but forces every page into client-side fetch-joins for names it always needs. Rejected; populated refs are what the users module already emits.
- **Runtime validation (Zod) at the boundary** — rejected as beyond portfolio scope; a single shared TS type is the contract mirror.

## Consequences

- One allowlist sanitizer, owned by the users module, is the **only** path for a User to cross the API boundary — auth imports it. This also fixes the users endpoints leaking `refreshToken` / `passwordResetToken` / `emailVerificationToken` (they returned raw docs with only `-password` excluded).
- The single frontend type lives in `frontend/src/types/user.ts`; the two slice-local `User` interfaces are deleted.
- Auth queries gain a `.populate()`; the login/me responses grow slightly. Accepted.
- Test data must be re-seeded (`backend/seedAll.js`) after the legacy `role` hooks are removed.
