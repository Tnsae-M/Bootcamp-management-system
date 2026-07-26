import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-guard";
const { roleGuard } = await import("../src/middleware/role.guard.js");

const SECRET = process.env.JWT_SECRET;

const requestWithToken = (payload) => ({
  headers: { authorization: `Bearer ${jwt.sign(payload, SECRET)}` },
});

// Runs the guard, returns what it passed to next()
const runGuard = (guard, req) =>
  new Promise((resolve) => guard(req, {}, (err) => resolve(err)));

test("allows a user whose roles include an allowed role", async () => {
  const req = requestWithToken({ userId: "u1", roles: ["ADMIN"] });
  const err = await runGuard(roleGuard(["ADMIN", "SUPER ADMIN"]), req);
  assert.equal(err, undefined);
});

test("rejects a user with only insufficient roles (403)", async () => {
  const req = requestWithToken({ userId: "u2", roles: ["STUDENT"] });
  const err = await runGuard(roleGuard(["ADMIN"]), req);
  assert.equal(err.status, 403);
});

test("rejects a token carrying no roles array (401) — legacy `role` payloads are dead", async () => {
  // Pre-fix tokens carried a singular `role`; the guard no longer honors it.
  const req = requestWithToken({ userId: "u3", role: "ADMIN" });
  const err = await runGuard(roleGuard(["ADMIN"]), req);
  assert.equal(err.status, 401);
});

test("rejects a missing token (401)", async () => {
  const err = await runGuard(roleGuard(["ADMIN"]), { headers: {} });
  assert.equal(err.status, 401);
});

test("role match is case-insensitive at the guard boundary", async () => {
  const req = requestWithToken({ userId: "u4", roles: ["admin"] });
  const err = await runGuard(roleGuard(["ADMIN"]), req);
  assert.equal(err, undefined);
});
