import { describe, test, expect } from "vitest";
import { determineAttendanceStatus } from "../src/modules/attendance/attendance.service.js";

describe("attendance.service - determineAttendanceStatus", () => {
  test("classifies attendance as PRESENT when submitted within the active window (<= 30 min)", () => {
    const openedAt = new Date("2026-11-12T10:00:00.000Z");
    const expiresAt = new Date("2026-11-12T11:00:00.000Z");
    const windowMinutes = 30;

    // Student submits 15 minutes after window opens
    const submittedAt = new Date("2026-11-12T10:15:00.000Z");

    const status = determineAttendanceStatus({
      submittedAt,
      openedAt,
      windowMinutes,
      expiresAt
    });

    expect(status).toBe("PRESENT");
  });
});
