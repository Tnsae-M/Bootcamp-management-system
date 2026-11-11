import { describe, test, expect } from "vitest";
import {
  determineAttendanceStatus,
  verifyAndRecordAttendance,
  overrideAttendanceRecord
} from "../src/modules/attendance/attendance.service.js";

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

  test("classifies attendance as LATE when submitted after windowMinutes but before expiry", () => {
    const openedAt = new Date("2026-11-12T10:00:00.000Z");
    const expiresAt = new Date("2026-11-12T11:00:00.000Z");
    const windowMinutes = 30;

    // Student submits at 35 minutes -> LATE
    const submittedAt = new Date("2026-11-12T10:35:00.000Z");

    const status = determineAttendanceStatus({
      submittedAt,
      openedAt,
      windowMinutes,
      expiresAt
    });

    expect(status).toBe("LATE");
  });

  test("throws 422 when submission is attempted after the code has expired", () => {
    const openedAt = new Date("2026-11-12T10:00:00.000Z");
    const expiresAt = new Date("2026-11-12T11:00:00.000Z");
    const windowMinutes = 30;

    // Student submits after expiry at 11:05
    const submittedAt = new Date("2026-11-12T11:05:00.000Z");

    expect(() =>
      determineAttendanceStatus({
        submittedAt,
        openedAt,
        windowMinutes,
        expiresAt
      })
    ).toThrow("Attendance window has closed");
  });
});

describe("attendance.service - verifyAndRecordAttendance", () => {
  const activeCode = {
    code: "A7X9Q",
    openedAt: new Date("2026-11-12T10:00:00.000Z"),
    windowMinutes: 30,
    expiresAt: new Date("2026-11-12T11:00:00.000Z")
  };

  test("rejects mismatched attendance code (400)", () => {
    expect(() =>
      verifyAndRecordAttendance({
        sessionId: "s-1",
        userId: "u-1",
        code: "WRONG9",
        submittedAt: new Date("2026-11-12T10:10:00.000Z"),
        activeCode
      })
    ).toThrow("Invalid attendance code");
  });

  test("rejects duplicate attendance record for same session and user (409)", () => {
    expect(() =>
      verifyAndRecordAttendance({
        sessionId: "s-1",
        userId: "u-1",
        code: "A7X9Q",
        submittedAt: new Date("2026-11-12T10:10:00.000Z"),
        activeCode,
        existingRecord: { id: "rec-123", status: "PRESENT" }
      })
    ).toThrow("Attendance already recorded");
  });

  test("successfully records attendance record with computed status and timestamp", () => {
    const record = verifyAndRecordAttendance({
      sessionId: "s-1",
      userId: "u-1",
      code: "a7x9q", // case-insensitive match
      submittedAt: new Date("2026-11-12T10:10:00.000Z"),
      activeCode,
      existingRecord: null
    });

    expect(record.sessionId).toBe("s-1");
    expect(record.userId).toBe("u-1");
    expect(record.status).toBe("PRESENT");
    expect(record.submittedAt).toEqual(new Date("2026-11-12T10:10:00.000Z"));
  });
});

describe("attendance.service - overrideAttendanceRecord", () => {
  const existingRecord = {
    id: "rec-1",
    sessionId: "s-1",
    userId: "u-1",
    status: "ABSENT",
    overrideNote: null
  };

  test("requires a note when overriding status to EXCUSED (400)", () => {
    expect(() =>
      overrideAttendanceRecord({
        record: existingRecord,
        newStatus: "EXCUSED",
        note: ""
      })
    ).toThrow("A note is required when marking attendance as EXCUSED");
  });

  test("successfully updates status and applies override note", () => {
    const updated = overrideAttendanceRecord({
      record: existingRecord,
      newStatus: "EXCUSED",
      note: "Medical letter submitted to division lead"
    });

    expect(updated.status).toBe("EXCUSED");
    expect(updated.overrideNote).toBe("Medical letter submitted to division lead");
  });
});
