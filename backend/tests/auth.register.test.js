import { describe, test, expect } from "vitest";
import { registerGuest } from "../src/modules/auth/auth.service.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-123";

describe("auth.service - registerGuest", () => {
  test("registers a new user with baseline role assignment GUEST", async () => {
    // In-memory fake user store for the service
    const fakeDb = [];

    const input = {
      fullName: "Natnael Tesfaye",
      email: "natnael@astu.edu.et",
      password: "StrongPassword123!",
      universityId: "ETS0123/15",
      department: "Software Engineering"
    };

    const result = await registerGuest(input, { db: fakeDb });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe("natnael@astu.edu.et");
    expect(result.user.fullName).toBe("Natnael Tesfaye");

    // Must be assigned GUEST role globally
    expect(result.user.roleAssignments).toEqual([
      { role: "GUEST", scopeType: "GLOBAL", scopeId: null }
    ]);

    // Tokens must be returned
    expect(result.tokens).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  test("ensures passwords and secrets are structurally absent from returned user object", async () => {
    const fakeDb = [];
    const input = {
      fullName: "Secret User",
      email: "secret@astu.edu.et",
      password: "StrongSecretPassword123!"
    };

    const result = await registerGuest(input, { db: fakeDb });

    expect(result.user.password).toBeUndefined();
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.user.refreshToken).toBeUndefined();
  });

  test("rejects duplicate email registration with 409 Conflict", async () => {
    const fakeDb = [];
    const input = {
      fullName: "Duplicate User",
      email: "duplicate@astu.edu.et",
      password: "StrongPassword123!"
    };

    await registerGuest(input, { db: fakeDb });

    // Second registration with same email
    await expect(registerGuest(input, { db: fakeDb })).rejects.toThrow("Email already exists");
  });

  test("rejects weak passwords (under 8 chars or missing complexity) with 400", async () => {
    const fakeDb = [];

    // Under 8 characters
    await expect(
      registerGuest(
        { fullName: "Test", email: "test1@astu.edu.et", password: "Short1!" },
        { db: fakeDb }
      )
    ).rejects.toThrow("Password must be at least 8 characters");

    // Missing numbers
    await expect(
      registerGuest(
        { fullName: "Test", email: "test2@astu.edu.et", password: "NoNumbersPassword!" },
        { db: fakeDb }
      )
    ).rejects.toThrow("Password must contain at least one number");
  });
});
