// Canonical User wire shape — see docs/adr/0001-canonical-user-wire-shape.md
// This allowlist is the ONLY path for a User to cross the API boundary.
// Secrets (password, refreshToken, reset/verification tokens) are structurally
// absent: fields not listed here never leave the backend.

const sanitizeRef = (ref) => {
  if (!ref) return null;
  // Populated document → allowlisted object; bare ObjectId → its string
  if (ref._id) {
    const out = { _id: ref._id.toString(), name: ref.name };
    if (ref.title !== undefined) out.title = ref.title;
    return out;
  }
  return { _id: ref.toString(), name: undefined };
};

export const sanitizeUser = (user) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  roles: (user.roles || []).map((r) => String(r).toUpperCase()),
  status: user.status,
  divisionId: sanitizeRef(user.divisionId),
  bootcamps: (user.bootcamps || []).map((b) => ({
    bootcampId: sanitizeRef(b.bootcampId),
  })),
  isEmailVerified: user.isEmailVerified ?? false,
  createdAt: user.createdAt,
});

// Populate spec matching the canonical shape — use wherever a user is
// fetched for the wire so divisionId/bootcamps arrive as {_id, name}.
export const USER_POPULATE = [
  { path: "divisionId", select: "name" },
  { path: "bootcamps.bootcampId", select: "name title" },
];
