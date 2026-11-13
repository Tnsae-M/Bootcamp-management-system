import { describe, test, expect } from "vitest";
import {
  buildRankedLeaderboard,
  recordInductionDecision
} from "../src/modules/induction/induction.service.js";

describe("induction.service - buildRankedLeaderboard", () => {
  test("computes scores and ranks students in descending order", () => {
    const weights = {
      attendanceWeight: 20,
      individualTaskWeight: 40,
      groupMilestoneWeight: 30,
      peerReviewWeight: 10
    };

    const students = [
      {
        userId: "u-bob",
        fullName: "Bob Smith",
        signals: {
          attendanceRate: 70,       // 14
          avgIndividualScore: 60,    // 24
          avgMilestoneScore: 70,     // 21
          avgPeerReviewScore: 3.0    // (3/5)*100 = 60 -> 6
          // Total Bob = 14 + 24 + 21 + 6 = 65.0
        }
      },
      {
        userId: "u-alice",
        fullName: "Alice Doe",
        signals: {
          attendanceRate: 100,       // 20
          avgIndividualScore: 90,    // 36
          avgMilestoneScore: 90,     // 27
          avgPeerReviewScore: 4.5    // (4.5/5)*100 = 90 -> 9
          // Total Alice = 20 + 36 + 27 + 9 = 92.0
        }
      }
    ];

    const leaderboard = buildRankedLeaderboard({ students, weights });

    expect(leaderboard).toHaveLength(2);

    // Alice should be rank 1
    expect(leaderboard[0].userId).toBe("u-alice");
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].computedScore).toBe(92.0);

    // Bob should be rank 2
    expect(leaderboard[1].userId).toBe("u-bob");
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].computedScore).toBe(65.0);
  });

  test("attaches recommendation flag when cutoffThreshold is specified", () => {
    const weights = {
      attendanceWeight: 25,
      individualTaskWeight: 25,
      groupMilestoneWeight: 25,
      peerReviewWeight: 25
    };

    const students = [
      {
        userId: "u-pass",
        fullName: "Passing Student",
        signals: {
          attendanceRate: 80,
          avgIndividualScore: 80,
          avgMilestoneScore: 80,
          avgPeerReviewScore: 4.0 // (4/5)*100 = 80 -> Score: 80.0
        }
      },
      {
        userId: "u-fail",
        fullName: "Failing Student",
        signals: {
          attendanceRate: 50,
          avgIndividualScore: 50,
          avgMilestoneScore: 50,
          avgPeerReviewScore: 2.5 // (2.5/5)*100 = 50 -> Score: 50.0
        }
      }
    ];

    const cutoff = 70.0;
    const leaderboard = buildRankedLeaderboard({
      students,
      weights,
      cutoffThreshold: cutoff
    });

    expect(leaderboard[0].recommendation).toBe("RECOMMENDED_PASS");
    expect(leaderboard[1].recommendation).toBe("RECOMMENDED_FAIL");
  });
});

describe("induction.service - recordInductionDecision", () => {
  const completedBootcamp = {
    id: "bc-dev-2026",
    divisionId: "div-dev-123",
    status: "COMPLETED"
  };

  const student = {
    userId: "u-student-1",
    enrollmentId: "enr-999",
    computedScore: 84.5
  };

  test("rejects induction decision if bootcamp is not in COMPLETED status (422)", () => {
    const activeBootcamp = { ...completedBootcamp, status: "ACTIVE" };

    expect(() =>
      recordInductionDecision({
        bootcamp: activeBootcamp,
        student,
        decision: "INDUCTED",
        decidedBy: "u-admin-head"
      })
    ).toThrow("Cannot record induction decision: Bootcamp must be COMPLETED");
  });

  test("promotes student to DIVISION_MEMBER scoped to division when INDUCTED", () => {
    const result = recordInductionDecision({
      bootcamp: completedBootcamp,
      student,
      decision: "INDUCTED",
      decidedBy: "u-admin-head",
      overrideNote: "Outstanding project leadership"
    });

    expect(result.decisionRecord.decision).toBe("INDUCTED");
    expect(result.decisionRecord.enrollmentId).toBe("enr-999");
    expect(result.decisionRecord.computedScoreAtDecision).toBe(84.5);
    expect(result.decisionRecord.overrideNote).toBe("Outstanding project leadership");
    expect(result.decisionRecord.decidedBy).toBe("u-admin-head");

    // Role promotion verification
    expect(result.promotedRoleAssignment).toEqual({
      userId: "u-student-1",
      role: "DIVISION_MEMBER",
      scopeType: "DIVISION",
      scopeId: "div-dev-123"
    });
  });

  test("does not generate role promotion when NOT_INDUCTED", () => {
    const result = recordInductionDecision({
      bootcamp: completedBootcamp,
      student,
      decision: "NOT_INDUCTED",
      decidedBy: "u-admin-head"
    });

    expect(result.decisionRecord.decision).toBe("NOT_INDUCTED");
    expect(result.promotedRoleAssignment).toBeNull();
  });

  test("allows admin to induct student below cutoff (human override freedom)", () => {
    const lowScoringStudent = {
      userId: "u-low-grower",
      enrollmentId: "enr-low",
      computedScore: 62.0 // Below 70% threshold
    };

    const result = recordInductionDecision({
      bootcamp: completedBootcamp,
      student: lowScoringStudent,
      decision: "INDUCTED",
      decidedBy: "u-admin-head",
      overrideNote: "Demonstrated massive growth in capstone demo"
    });

    expect(result.decisionRecord.decision).toBe("INDUCTED");
    expect(result.decisionRecord.overrideNote).toBe("Demonstrated massive growth in capstone demo");
    expect(result.promotedRoleAssignment).toBeDefined();
    expect(result.promotedRoleAssignment.role).toBe("DIVISION_MEMBER");
  });

  test("allows admin override without an override note (note is optional)", () => {
    const studentNoNote = {
      userId: "u-any",
      enrollmentId: "enr-any",
      computedScore: 75.0
    };

    const result = recordInductionDecision({
      bootcamp: completedBootcamp,
      student: studentNoNote,
      decision: "INDUCTED",
      decidedBy: "u-admin-head"
      // No overrideNote passed
    });

    expect(result.decisionRecord.overrideNote).toBeNull();
    expect(result.decisionRecord.decision).toBe("INDUCTED");
  });
});
