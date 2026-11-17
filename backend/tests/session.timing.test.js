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
    const baseTime = Date.now() + 24 * 60 * 60 * 1000; // Tomorrow

    // Existing session in another division/bootcamp from +24h to +26h
    const existingSessions = [
      {
        id: "sess-cyber-1",
        title: "Network Defense Workshop",
        startTime: new Date(baseTime),
        endTime: new Date(baseTime + 2 * 60 * 60 * 1000)
      }
    ];

    // Proposing new session from +25h to +27h -> Overlap!
    const candidateStart = new Date(baseTime + 1 * 60 * 60 * 1000);
    const candidateEnd = new Date(baseTime + 3 * 60 * 60 * 1000);

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
    const baseTime = Date.now() + 48 * 60 * 60 * 1000;

    const existingSessions = [
      {
        id: "sess-edit-me",
        title: "Web Dev Lecture 1",
        startTime: new Date(baseTime),
        endTime: new Date(baseTime + 2 * 60 * 60 * 1000)
      }
    ];

    // Updating same session with slightly modified duration
    expect(() =>
      validateSessionTiming({
        startTime: new Date(baseTime),
        endTime: new Date(baseTime + 2.5 * 60 * 60 * 1000),
        isNew: false,
        currentSessionId: "sess-edit-me",
        existingSessions
      })
    ).not.toThrow();
  });

  test("allows back-to-back adjacent sessions without triggering overlap", () => {
    const baseTime = Date.now() + 72 * 60 * 60 * 1000;

    const existingSessions = [
      {
        id: "sess-1",
        title: "Morning Session",
        startTime: new Date(baseTime),
        endTime: new Date(baseTime + 2 * 60 * 60 * 1000)
      }
    ];

    // Afternoon session starts exactly when morning session ends
    expect(() =>
      validateSessionTiming({
        startTime: new Date(baseTime + 2 * 60 * 60 * 1000),
        endTime: new Date(baseTime + 4 * 60 * 60 * 1000),
        isNew: true,
        existingSessions
      })
    ).not.toThrow();
  });
});
