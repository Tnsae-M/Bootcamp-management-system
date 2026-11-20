import { describe, test, expect, vi, beforeEach } from "vitest";

const mockUser = {
  findUnique: vi.fn(),
  update: vi.fn(),
};
const mockBootcamp = {
  findUnique: vi.fn(),
};
const mockEnrollment = {
  findUnique: vi.fn(),
  create: vi.fn(),
};

vi.mock("../src/config/prisma.js", () => ({
  default: {
    $transaction: vi.fn(async (cb) => {
      return cb({
        user: mockUser,
        bootcamp: mockBootcamp,
        enrollment: mockEnrollment,
      });
    }),
  },
}));

const { enrollUser } = await import("../src/modules/enrollments/enrollment.service.js");

const setup = ({ userDivision }) => {
  const user = {
    id: "u1",
    department: userDivision,
  };
  mockUser.findUnique.mockResolvedValue(user);
  mockBootcamp.findUnique.mockResolvedValue({ id: "b1", divisionId: "division-B" });
  mockEnrollment.findUnique.mockResolvedValue(null);
  mockEnrollment.create.mockResolvedValue({ id: "e1", userId: "u1", bootcampId: "b1", status: "STUDENT" });
  mockUser.update.mockResolvedValue({ ...user, department: "division-B" });
  return user;
};

describe("enrollUser division rule (assign-if-empty)", () => {
  beforeEach(() => vi.clearAllMocks());

  test("keeps the user's existing division when enrolling cross-division", async () => {
    const user = setup({ userDivision: "division-A" });
    await enrollUser("u1", "b1");
    expect(user.department).toBe("division-A");
    expect(mockUser.update).not.toHaveBeenCalled();
  });

  test("adopts the bootcamp's division when the user has none", async () => {
    const user = setup({ userDivision: null });
    await enrollUser("u1", "b1");
    expect(mockUser.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { department: "division-B" },
    });
    expect(user.department).toBe("division-B");
  });
});
