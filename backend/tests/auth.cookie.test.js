import { describe, test, expect } from "vitest";
import jwt from "jsonwebtoken";
import { refreshAccessToken } from "../src/modules/auth/auth.service.js";

const SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "fallback-secret";

describe("Hybrid Auth - Refresh Token Service", () => {
  test("issues new accessToken when valid refresh token is supplied", async () => {
    const mockUser = {
      id: "usr_mock_123",
      email: "test@astu.edu.et",
      roleAssignments: [{ role: "STUDENT", scopeType: "BOOTCAMP", scopeId: "b-1" }],
    };

    const refreshToken = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      SECRET,
      { expiresIn: "7d" }
    );

    const result = await refreshAccessToken(refreshToken, {
      db: [mockUser],
    });

    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    const decoded = jwt.decode(result.accessToken);
    expect(decoded.userId).toBe(mockUser.id);
    expect(decoded.roles).toContain("STUDENT");
  });

  test("rejects missing refresh token with 401", async () => {
    await expect(refreshAccessToken(null)).rejects.toThrow("Refresh token required");
  });

  test("rejects malformed or expired refresh token with 401", async () => {
    await expect(refreshAccessToken("invalid.token.here")).rejects.toThrow("Invalid or expired refresh token");
  });
});

