import { describe, test, expect } from "vitest";
import { validateSessionTiming } from "../src/modules/sessions/session.service.js";

describe("session.service - validateSessionTiming", () => {
  test("rejects sessions with duration under 30 minutes (400)", () => {
    const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const endTime = new Date(startTime.getTime() + 20 * 60 * 1000); // 20 minutes duration

    expect(() =>
      validateSessionTiming({
        startTime,
        endTime,
        isNew: true,
        existingSessions: []
      })
    ).toThrow("Minimum session duration is 30 minutes");
  });

  test("rejects new sessions scheduled less than 1 hour in advance (400)", () => {
    // Only 20 minutes from now
    const startTime = new Date(Date.now() + 20 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    expect(() =>
      validateSessionTiming({
        startTime,
        endTime,
        isNew: true,
        existingSessions: []
      })
    ).toThrow("Sessions must be scheduled at least 1 hour in advance");
  });

  test("rejects any session that overlaps with an existing session anywhere in the club (409)", () => {
    // Existing session in another division/bootcamp from 14:00 to 16:00
    const existingSessions = [
      {
        id: "sess-cyber-1",
        title: "Network Defense Workshop",
        startTime: new Date("2026-11-15T14:00:00.000Z"),
        endTime: new Date("2026-11-15T16:00:00.000Z")
      }
    ];

    // Proposing new session from 15:00 to 17:00 in Dev Bootcamp -> Overlap!
    const candidateStart = new Date("2026-11-15T15:00:00.000Z");
    const candidateEnd = new Date("2026-11-15T17:00:00.000Z");

    expect(() =>
      validateSessionTiming({
        startTime: candidateStart,
        endTime: candidateEnd,
        isNew: true,
        existingSessions
      })
    ).toThrow(
      'Schedule Conflict: global session overlap with "Network Defense Workshop"'
    );
  });

  test("excludes self from overlap detection when updating an existing session", () => {
    const existingSessions = [
      {
        id: "sess-edit-me",
        title: "Web Dev Lecture 1",
        startTime: new Date("2026-11-15T14:00:00.000Z"),
        endTime: new Date("2026-11-15T16:00:00.000Z")
      }
    ];

    // Updating same session with slightly modified duration
    expect(() =>
      validateSessionTiming({
        startTime: new Date("2026-11-15T14:00:00.000Z"),
        endTime: new Date("2026-11-15T16:30:00.000Z"),
        isNew: false,
        currentSessionId: "sess-edit-me",
        existingSessions
      })
    ).not.toThrow();
  });

  test("allows back-to-back adjacent sessions without triggering overlap", () => {
    const existingSessions = [
      {
        id: "sess-1",
        title: "Morning Session",
        startTime: new Date("2026-11-15T09:00:00.000Z"),
        endTime: new Date("2026-11-15T11:00:00.000Z")
      }
    ];

    // Afternoon session starts exactly at 11:00:00.000Z
    expect(() =>
      validateSessionTiming({
        startTime: new Date("2026-11-15T11:00:00.000Z"),
        endTime: new Date("2026-11-15T13:00:00.000Z"),
        isNew: true,
        existingSessions
      })
    ).not.toThrow();
  });
});
