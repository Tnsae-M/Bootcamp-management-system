import { describe, test, expect } from "vitest";
import { scopeGuard } from "../src/middleware/scope.guard.js";

// Helper to run middleware and return error passed to next()
const runGuard = (guard, req) =>
  new Promise((resolve) => guard(req, {}, (err) => resolve(err)));

describe("scopeGuard", () => {
  test("SUPER_ADMIN passes any scope check unconditionally", async () => {
    const req = {
      user: {
        userId: "u-super",
        roleAssignments: [
          { role: "SUPER_ADMIN", scopeType: "GLOBAL", scopeId: null }
        ]
      },
      params: { divisionId: "div-dev-999" }
    };

    const guard = scopeGuard({
      requiredRole: "DIVISION_ADMIN",
      scopeType: "DIVISION",
      resolveScopeId: (r) => r.params.divisionId
    });

    const err = await runGuard(guard, req);
    expect(err).toBeUndefined();
  });

  test("DIVISION_ADMIN passes access to their own division but is rejected for another division", async () => {
    const user = {
      userId: "u-admin",
      roleAssignments: [
        { role: "DIVISION_ADMIN", scopeType: "DIVISION", scopeId: "div-dev-123" }
      ]
    };

    const guard = scopeGuard({
      requiredRole: "DIVISION_ADMIN",
      scopeType: "DIVISION",
      resolveScopeId: (r) => r.params.divisionId
    });

    // Case 1: Accessing own division -> Passes
    const allowedReq = { user, params: { divisionId: "div-dev-123" } };
    const allowedErr = await runGuard(guard, allowedReq);
    expect(allowedErr).toBeUndefined();

    // Case 2: Accessing another division -> 403 Forbidden
    const forbiddenReq = { user, params: { divisionId: "div-cyber-777" } };
    const forbiddenErr = await runGuard(guard, forbiddenReq);
    expect(forbiddenErr).toBeDefined();
    expect(forbiddenErr.status).toBe(403);
  });

  test("INSTRUCTOR and STUDENT access is strictly scoped to their enrolled/assigned Bootcamp", async () => {
    const instructorUser = {
      userId: "u-inst",
      roleAssignments: [
        { role: "INSTRUCTOR", scopeType: "BOOTCAMP", scopeId: "bootcamp-web-101" }
      ]
    };

    const instructorGuard = scopeGuard({
      requiredRole: "INSTRUCTOR",
      scopeType: "BOOTCAMP",
      resolveScopeId: (r) => r.params.bootcampId
    });

    // Access own bootcamp -> allowed
    const instAllowed = await runGuard(instructorGuard, {
      user: instructorUser,
      params: { bootcampId: "bootcamp-web-101" }
    });
    expect(instAllowed).toBeUndefined();

    // Access unassigned bootcamp -> 403
    const instDenied = await runGuard(instructorGuard, {
      user: instructorUser,
      params: { bootcampId: "bootcamp-ai-202" }
    });
    expect(instDenied.status).toBe(403);
  });

  test("DIVISION_ADMIN does not imply INSTRUCTOR (ADR-0002 preserved)", async () => {
    const adminUser = {
      userId: "u-head",
      roleAssignments: [
        { role: "DIVISION_ADMIN", scopeType: "DIVISION", scopeId: "div-dev-123" }
      ]
    };

    const instructorOnlyGuard = scopeGuard({
      requiredRole: "INSTRUCTOR",
      scopeType: "BOOTCAMP",
      resolveScopeId: (r) => r.params.bootcampId
    });

    const err = await runGuard(instructorOnlyGuard, {
      user: adminUser,
      params: { bootcampId: "bootcamp-web-101" }
    });

    expect(err).toBeDefined();
    expect(err.status).toBe(403);
  });

  test("rejects unauthenticated requests or requests missing roleAssignments with 401", async () => {
    const guard = scopeGuard({ requiredRole: "STUDENT" });

    const noUserErr = await runGuard(guard, {});
    expect(noUserErr.status).toBe(401);

    const emptyAssignmentsErr = await runGuard(guard, { user: {} });
    expect(emptyAssignmentsErr.status).toBe(401);
  });
});
