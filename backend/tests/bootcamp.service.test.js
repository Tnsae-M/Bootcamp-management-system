import { describe, test, expect } from "vitest";
import {
  validateBootcampDates,
  validateScoringWeights,
  transitionBootcampStatus,
  updateBootcampWeights,
  screenApplicant,
  BOOTCAMP_STATUSES
} from "../src/modules/bootcamps/bootcamp.service.js";

describe("bootcamps.service - Date & Weight Validation", () => {
  test("validates startDate is before endDate (400 if invalid)", () => {
    const validStart = new Date(Date.now() + 100000).toISOString();
    const validEnd = new Date(Date.now() + 5000000).toISOString();
    expect(validateBootcampDates(validStart, validEnd)).toBe(true);

    expect(() => validateBootcampDates(validEnd, validStart)).toThrow(/Start date must be before end date/i);
    expect(() => validateBootcampDates(null, validEnd)).toThrow(/Start date and end date are required/i);
  });

  test("validates that scoring weights sum exactly to 100", () => {
    expect(
      validateScoringWeights({
        attendance: 20,
        individualTask: 30,
        groupMilestone: 35,
        peerReview: 15,
      })
    ).toBe(true);

    expect(() =>
      validateScoringWeights({
        attendance: 20,
        individualTask: 20,
        groupMilestone: 20,
        peerReview: 20,
      })
    ).toThrow(/Scoring weights must sum to 100/i);

    expect(() =>
      validateScoringWeights({
        attendance: -10,
        individualTask: 50,
        groupMilestone: 50,
        peerReview: 10,
      })
    ).toThrow(/Each scoring weight must be non-negative/i);
  });
});

describe("bootcamps.service - Status Transitions", () => {
  test("allows valid sequential transitions (DRAFT -> OPEN -> SCREENING -> ACTIVE -> COMPLETED -> ARCHIVED)", () => {
    const bootcamp = {
      id: "bc-1",
      status: "DRAFT",
      startDate: new Date(Date.now() + 10000).toISOString(),
      endDate: new Date(Date.now() + 500000).toISOString(),
      weights: { attendance: 20, individualTask: 30, groupMilestone: 30, peerReview: 20 },
    };

    const openBc = transitionBootcampStatus(bootcamp, "OPEN");
    expect(openBc.status).toBe("OPEN");

    const screeningBc = transitionBootcampStatus(openBc, "SCREENING");
    expect(screeningBc.status).toBe("SCREENING");

    const activeBc = transitionBootcampStatus(screeningBc, "ACTIVE");
    expect(activeBc.status).toBe("ACTIVE");

    const completedBc = transitionBootcampStatus(activeBc, "COMPLETED");
    expect(completedBc.status).toBe("COMPLETED");

    const archivedBc = transitionBootcampStatus(completedBc, "ARCHIVED");
    expect(archivedBc.status).toBe("ARCHIVED");
  });

  test("rejects illegal transitions (400)", () => {
    const bootcamp = {
      id: "bc-1",
      status: "ACTIVE",
    };

    // Cannot regress from ACTIVE back to DRAFT or OPEN
    expect(() => transitionBootcampStatus(bootcamp, "DRAFT")).toThrow(/Invalid status transition/i);
    expect(() => transitionBootcampStatus(bootcamp, "OPEN")).toThrow(/Invalid status transition/i);
  });

  test("locks scoring weights once bootcamp is ACTIVE (409)", () => {
    const activeBootcamp = {
      id: "bc-1",
      status: "ACTIVE",
      weights: { attendance: 25, individualTask: 25, groupMilestone: 25, peerReview: 25 },
    };

    expect(() =>
      updateBootcampWeights(activeBootcamp, {
        attendance: 30,
        individualTask: 30,
        groupMilestone: 20,
        peerReview: 20,
      })
    ).toThrow(/Cannot modify scoring weights of an active or completed bootcamp/i);

    // DRAFT bootcamp can freely update weights
    const draftBootcamp = {
      id: "bc-2",
      status: "DRAFT",
      weights: { attendance: 25, individualTask: 25, groupMilestone: 25, peerReview: 25 },
    };

    const updated = updateBootcampWeights(draftBootcamp, {
      attendance: 30,
      individualTask: 30,
      groupMilestone: 20,
      peerReview: 20,
    });
    expect(updated.weights.attendance).toBe(30);
  });
});

describe("bootcamps.service - Applicant Screening", () => {
  const enrollment = {
    id: "enr-1",
    bootcampId: "bc-1",
    userId: "usr-guest-1",
    status: "APPLIED",
  };

  test("screenApplicant accepts APPLIED candidate into ENROLLED status", () => {
    const accepted = screenApplicant({
      enrollment,
      decision: "ACCEPT",
      adminId: "admin-1",
    });

    expect(accepted.status).toBe("ENROLLED");
    expect(accepted.screenedBy).toBe("admin-1");
    expect(accepted.screenedAt).toBeDefined();
  });

  test("screenApplicant rejects APPLIED candidate with reason into REJECTED status", () => {
    const rejected = screenApplicant({
      enrollment,
      decision: "REJECT",
      adminId: "admin-1",
      reason: "Prerequisite programming experience not met",
    });

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.screenedBy).toBe("admin-1");
    expect(rejected.rejectionReason).toBe("Prerequisite programming experience not met");
  });

  test("rejects screening non-APPLIED enrollment (400)", () => {
    expect(() =>
      screenApplicant({
        enrollment: { ...enrollment, status: "ENROLLED" },
        decision: "ACCEPT",
        adminId: "admin-1",
      })
    ).toThrow(/Only APPLIED enrollments can be screened/i);
  });
});

