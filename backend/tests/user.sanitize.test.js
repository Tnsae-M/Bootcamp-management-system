import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeUser } from "../src/modules/users/user.sanitize.js";

// A raw user doc as it would come off Mongoose, secrets included.
const rawUser = () => ({
  _id: { toString: () => "64b000000000000000000001" },
  name: "Abebe Bikila",
  email: "abebe@astu.edu.et",
  password: "$2b$10$hashhashhash",
  roles: ["ADMIN", "INSTRUCTOR"],
  status: "active",
  divisionId: null,
  bootcamps: [],
  refreshToken: "some.jwt.refresh",
  passwordResetToken: "abc123",
  passwordResetExpires: new Date(),
  emailVerificationToken: "def456",
  emailVerificationExpires: new Date(),
  isEmailVerified: true,
  createdAt: new Date("2026-01-15T00:00:00Z"),
});

test("sanitizeUser strips every secret field", () => {
  const out = sanitizeUser(rawUser());

  assert.ok(!("password" in out));
  assert.ok(!("refreshToken" in out));
  assert.ok(!("passwordResetToken" in out));
  assert.ok(!("passwordResetExpires" in out));
  assert.ok(!("emailVerificationToken" in out));
  assert.ok(!("emailVerificationExpires" in out));
});

test("sanitizeUser keeps populated division and bootcamp refs, allowlisted", () => {
  const user = rawUser();
  user.divisionId = {
    _id: { toString: () => "64b000000000000000000d01" },
    name: "Development",
    secretField: "must not pass",
  };
  user.bootcamps = [
    {
      bootcampId: {
        _id: { toString: () => "64b000000000000000000b01" },
        name: "Web Dev",
        title: "Web Development Bootcamp",
        internalNotes: "must not pass",
      },
    },
  ];

  const out = sanitizeUser(user);

  assert.deepEqual(out.divisionId, {
    _id: "64b000000000000000000d01",
    name: "Development",
  });
  assert.deepEqual(out.bootcamps, [
    {
      bootcampId: {
        _id: "64b000000000000000000b01",
        name: "Web Dev",
        title: "Web Development Bootcamp",
      },
    },
  ]);
});

test("sanitizeUser emits the canonical wire shape (ADR-0001)", () => {
  const out = sanitizeUser(rawUser());

  assert.deepEqual(out, {
    _id: "64b000000000000000000001",
    name: "Abebe Bikila",
    email: "abebe@astu.edu.et",
    roles: ["ADMIN", "INSTRUCTOR"],
    status: "active",
    divisionId: null,
    bootcamps: [],
    isEmailVerified: true,
    createdAt: new Date("2026-01-15T00:00:00Z"),
  });
});
