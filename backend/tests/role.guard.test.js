import { describe, test, expect } from "vitest";
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

describe("roleGuard", () => {
  test("allows a user whose roles include an allowed role", async () => {
    const req = requestWithToken({ userId: "u1", roles: ["ADMIN"] });
    const err = await runGuard(roleGuard(["ADMIN", "SUPER ADMIN"]), req);
    expect(err).toBeUndefined();
  });

  test("rejects a user with only insufficient roles (403)", async () => {
    const req = requestWithToken({ userId: "u2", roles: ["STUDENT"] });
    const err = await runGuard(roleGuard(["ADMIN"]), req);
    expect(err.status).toBe(403);
  });

  test("rejects a token carrying no roles array (401) — legacy `role` payloads are dead", async () => {
    const req = requestWithToken({ userId: "u3", role: "ADMIN" });
    const err = await runGuard(roleGuard(["ADMIN"]), req);
    expect(err.status).toBe(401);
  });

  test("rejects a missing token (401)", async () => {
    const err = await runGuard(roleGuard(["ADMIN"]), { headers: {} });
    expect(err.status).toBe(401);
  });

  test("role match is case-insensitive at the guard boundary", async () => {
    const req = requestWithToken({ userId: "u4", roles: ["admin"] });
    const err = await runGuard(roleGuard(["ADMIN"]), req);
    expect(err).toBeUndefined();
  });

  // Role hierarchy (ADR-0002): SUPER ADMIN ⊇ ADMIN, and that is the only edge.
  test("SUPER ADMIN passes a guard that only lists ADMIN", async () => {
    const req = requestWithToken({ userId: "u5", roles: ["SUPER ADMIN"] });
    const err = await runGuard(roleGuard(["ADMIN"]), req);
    expect(err).toBeUndefined();
  });

  test("ADMIN does not pass a guard that lists only SUPER ADMIN (403)", async () => {
    const req = requestWithToken({ userId: "u6", roles: ["ADMIN"] });
    const err = await runGuard(roleGuard(["SUPER ADMIN"]), req);
    expect(err.status).toBe(403);
  });

  test("ADMIN does not imply INSTRUCTOR (403)", async () => {
    const req = requestWithToken({ userId: "u7", roles: ["ADMIN"] });
    const err = await runGuard(roleGuard(["INSTRUCTOR"]), req);
    expect(err.status).toBe(403);
  });

  test("SUPER ADMIN does not imply INSTRUCTOR (403)", async () => {
    const req = requestWithToken({ userId: "u8", roles: ["SUPER ADMIN"] });
    const err = await runGuard(roleGuard(["INSTRUCTOR"]), req);
    expect(err.status).toBe(403);
  });
});
