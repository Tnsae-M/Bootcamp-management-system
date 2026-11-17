import { describe, test, expect } from "vitest";
import { validateTaskDefinition } from "../src/modules/tasks/task.service.js";

describe("tasks.service - validateTaskDefinition", () => {
  test("creates a valid INDIVIDUAL task definition", () => {
    const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const taskData = {
      bootcampId: "bc-dev-2026",
      type: "INDIVIDUAL",
      title: "Express Middleware Assignment",
      submissionType: "GITHUB_LINK",
      deadline: futureDeadline,
      maxScore: 100,
      allowResubmission: true
    };

    const validated = validateTaskDefinition(taskData);

    expect(validated.title).toBe("Express Middleware Assignment");
    expect(validated.type).toBe("INDIVIDUAL");
    expect(validated.maxScore).toBe(100);
    expect(validated.milestoneNumber).toBeNull();
    expect(validated.peerReviewRequired).toBe(false);
  });

  test("validates and creates a GROUP_MILESTONE task with milestone numbering and peer review flag", () => {
    const futureDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const milestoneData = {
      bootcampId: "bc-dev-2026",
      type: "GROUP_MILESTONE",
      title: "Capstone Milestone 1 - Architecture & Database",
      submissionType: "BOTH",
      deadline: futureDeadline,
      maxScore: 100,
      milestoneNumber: 1,
      peerReviewRequired: true
    };

    const validated = validateTaskDefinition(milestoneData);

    expect(validated.type).toBe("GROUP_MILESTONE");
    expect(validated.milestoneNumber).toBe(1);
    expect(validated.peerReviewRequired).toBe(true);
  });

  test("rejects GROUP_MILESTONE tasks missing a valid positive milestoneNumber (400)", () => {
    const futureDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "GROUP_MILESTONE",
        title: "Invalid Milestone",
        submissionType: "GITHUB_LINK",
        deadline: futureDeadline,
        maxScore: 100,
        milestoneNumber: null // Missing!
      })
    ).toThrow("milestoneNumber is required for GROUP_MILESTONE tasks");

    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "GROUP_MILESTONE",
        title: "Invalid Milestone Zero",
        submissionType: "GITHUB_LINK",
        deadline: futureDeadline,
        maxScore: 100,
        milestoneNumber: 0 // Non-positive!
      })
    ).toThrow("milestoneNumber must be a positive integer");
  });

  test("rejects deadlines that are in the past or right now (400)", () => {
    const pastDeadline = new Date(Date.now() - 60 * 1000); // 1 minute in the past

    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "INDIVIDUAL",
        title: "Past Due Task",
        submissionType: "FILE",
        deadline: pastDeadline,
        maxScore: 100
      })
    ).toThrow("Deadline must be in the future");
  });

  test("validates late penalty bounds (0-100) when late submission is allowed", () => {
    const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Negative penalty -> 400
    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "INDIVIDUAL",
        title: "Bad Penalty Task",
        submissionType: "FILE",
        deadline: futureDeadline,
        maxScore: 100,
        allowLateSubmission: true,
        latePenaltyPercent: -10
      })
    ).toThrow("latePenaltyPercent must be between 0 and 100");

    // Over 100% penalty -> 400
    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "INDIVIDUAL",
        title: "Excessive Penalty Task",
        submissionType: "FILE",
        deadline: futureDeadline,
        maxScore: 100,
        allowLateSubmission: true,
        latePenaltyPercent: 120
      })
    ).toThrow("latePenaltyPercent must be between 0 and 100");

    // Valid 20% penalty -> passes
    const valid = validateTaskDefinition({
      bootcampId: "bc-dev-2026",
      type: "INDIVIDUAL",
      title: "Fair Penalty Task",
      submissionType: "FILE",
      deadline: futureDeadline,
      maxScore: 100,
      allowLateSubmission: true,
      latePenaltyPercent: 20
    });
    expect(valid.latePenaltyPercent).toBe(20);
    expect(valid.allowLateSubmission).toBe(true);
  });

  test("rejects non-positive maxScore and invalid submissionTypes (400)", () => {
    const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Zero maxScore -> 400
    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "INDIVIDUAL",
        title: "Zero Score Task",
        submissionType: "FILE",
        deadline: futureDeadline,
        maxScore: 0
      })
    ).toThrow("maxScore must be a positive number");

    // Negative maxScore -> 400
    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "INDIVIDUAL",
        title: "Negative Score Task",
        submissionType: "FILE",
        deadline: futureDeadline,
        maxScore: -50
      })
    ).toThrow("maxScore must be a positive number");

    // Invalid submissionType -> 400
    expect(() =>
      validateTaskDefinition({
        bootcampId: "bc-dev-2026",
        type: "INDIVIDUAL",
        title: "Bad Submission Type",
        submissionType: "CARRIER_PIGEON",
        deadline: futureDeadline,
        maxScore: 100
      })
    ).toThrow("Submission type must be FILE, GITHUB_LINK, or BOTH");
  });
});
