import { describe, test, expect, vi, beforeEach } from "vitest";

// Model + mongoose mocks so enrollUser's division rule can be tested without a DB.
vi.mock("../src/modules/enrollments/enrollment.model.js", () => ({
  default: { findOne: vi.fn(), create: vi.fn() },
}));
vi.mock("../src/modules/users/user.model.js", () => ({
  default: { findById: vi.fn() },
}));
vi.mock("../src/modules/bootcamps/bootcamp.model.js", () => ({
  default: { findById: vi.fn() },
}));
vi.mock("mongoose", () => ({
  default: {
    startSession: vi.fn(async () => ({
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    })),
  },
}));

const Enrollment = (await import("../src/modules/enrollments/enrollment.model.js")).default;
const User = (await import("../src/modules/users/user.model.js")).default;
const Bootcamp = (await import("../src/modules/bootcamps/bootcamp.model.js")).default;
const { enrollUser } = await import("../src/modules/enrollments/enrollment.service.js");

const inSession = (doc) => ({ session: vi.fn().mockResolvedValue(doc) });

const setup = ({ userDivision }) => {
  const user = {
    divisionId: userDivision,
    save: vi.fn(),
  };
  User.findById.mockReturnValue(inSession(user));
  Bootcamp.findById.mockReturnValue(inSession({ divisionId: "division-B" }));
  Enrollment.findOne.mockReturnValue(inSession(null));
  Enrollment.create.mockResolvedValue([{ userId: "u1", bootcampId: "b1" }]);
  return user;
};

describe("enrollUser division rule (assign-if-empty)", () => {
  beforeEach(() => vi.clearAllMocks());

  test("keeps the user's existing division when enrolling cross-division", async () => {
    const user = setup({ userDivision: "division-A" });
    await enrollUser("u1", "b1");
    expect(user.divisionId).toBe("division-A");
    expect(user.save).not.toHaveBeenCalled();
  });

  test("adopts the bootcamp's division when the user has none", async () => {
    const user = setup({ userDivision: null });
    await enrollUser("u1", "b1");
    expect(user.divisionId).toBe("division-B");
    expect(user.save).toHaveBeenCalled();
  });
});
