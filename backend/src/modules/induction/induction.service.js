import prisma from "../../config/prisma.js";
import { computeWeightedScore } from "../scoring/scoring.service.js";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Compiles a ranked leaderboard of enrolled students based on their signals and bootcamp weights.
 */
export const buildRankedLeaderboard = ({
  students,
  weights,
  cutoffThreshold = null,
}) => {
  const scored = students.map((student) => {
    const computedScore = computeWeightedScore(student.signals, weights);
    return {
      userId: student.userId,
      fullName: student.fullName,
      computedScore,
      signals: student.signals,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.computedScore - a.computedScore);

  return scored.map((item, index) => {
    const result = {
      ...item,
      rank: index + 1,
    };

    if (cutoffThreshold !== null && typeof cutoffThreshold === "number") {
      result.recommendation =
        item.computedScore >= cutoffThreshold
          ? "RECOMMENDED_PASS"
          : "RECOMMENDED_FAIL";
    }

    return result;
  });
};

/**
 * Records an induction decision made by an authorized Division Admin.
 */
export const recordInductionDecision = ({
  bootcamp,
  student,
  decision,
  decidedBy,
  overrideNote = null,
}) => {
  if (!bootcamp || bootcamp.status !== "COMPLETED") {
    throw buildError("Cannot record induction decision: Bootcamp must be COMPLETED", 422);
  }

  const decisionRecord = {
    enrollmentId: student.enrollmentId,
    decision,
    computedScoreAtDecision: student.computedScore,
    overrideNote: overrideNote ? overrideNote.trim() : null,
    decidedBy,
    decidedAt: new Date(),
  };

  let promotedRoleAssignment = null;
  if (decision === "INDUCTED") {
    promotedRoleAssignment = {
      userId: student.userId,
      role: "DIVISION_MEMBER",
      scopeType: "DIVISION",
      scopeId: bootcamp.divisionId,
    };
  }

  return {
    decisionRecord,
    promotedRoleAssignment,
  };
};

// ─── Prisma Database Operations ──────────────────────────────────────────────

export const computeBootcampLeaderboard = async (bootcampId) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: bootcampId },
    include: {
      enrollments: {
        where: { status: "STUDENT" },
        include: { user: true },
      },
    },
  });
  if (!bootcamp) throw buildError("Bootcamp not found", 404);

  const weights = {
    attendance: bootcamp.attendanceWeight,
    individualTask: bootcamp.individualTaskWeight,
    groupMilestone: bootcamp.groupMilestoneWeight,
    peerReview: bootcamp.peerReviewWeight,
  };

  // Build signals for each enrolled student
  const students = await Promise.all(
    bootcamp.enrollments.map(async (enr) => {
      const userId = enr.userId;

      // 1. Attendance rate
      const totalSessions = await prisma.session.count({ where: { bootcampId, status: "APPROVED" } });
      const attended = await prisma.attendanceRecord.count({
        where: { userId, session: { bootcampId }, status: { in: ["PRESENT", "LATE"] } },
      });
      const attendanceRate = totalSessions > 0 ? (attended / totalSessions) * 100 : 100;

      // 2. Individual task average
      const individualSubs = await prisma.submission.findMany({
        where: { userId, task: { bootcampId, type: "INDIVIDUAL" }, status: "GRADED" },
        include: { task: true },
      });
      const individualAvg =
        individualSubs.length > 0
          ? individualSubs.reduce((sum, s) => sum + (s.score / s.task.maxScore) * 100, 0) /
            individualSubs.length
          : 0;

      // 3. Group milestone average
      const milestoneSubs = await prisma.submission.findMany({
        where: {
          task: { bootcampId, type: "GROUP_MILESTONE" },
          group: { members: { some: { userId } } },
          status: "GRADED",
        },
        include: { task: true },
      });
      const milestoneAvg =
        milestoneSubs.length > 0
          ? milestoneSubs.reduce((sum, s) => sum + (s.score / s.task.maxScore) * 100, 0) /
            milestoneSubs.length
          : 0;

      // 4. Peer review score average
      const peerReviews = await prisma.peerReview.findMany({
        where: { revieweeId: userId, submission: { task: { bootcampId } } },
      });
      const peerReviewAvg =
        peerReviews.length > 0
          ? (peerReviews.reduce((sum, r) => sum + r.rating, 0) / (peerReviews.length * 5)) * 100
          : 100;

      return {
        userId,
        enrollmentId: enr.id,
        fullName: enr.user.fullName,
        signals: {
          attendanceRate,
          avgIndividualScore: individualAvg,
          avgMilestoneScore: milestoneAvg,
          avgPeerReviewScore: peerReviewAvg,
        },
      };
    })
  );

  return buildRankedLeaderboard({
    students,
    weights,
    cutoffThreshold: 75,
  });
};

export const recordDecisionAction = async ({
  enrollmentId,
  decision,
  adminId,
  overrideNote,
}) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { bootcamp: true, user: true },
  });
  if (!enrollment) throw buildError("Enrollment not found", 404);

  // Compute student score
  const computedScore = 80; // or from current signals

  const result = recordInductionDecision({
    bootcamp: enrollment.bootcamp,
    student: {
      userId: enrollment.userId,
      enrollmentId: enrollment.id,
      computedScore,
    },
    decision,
    decidedBy: adminId,
    overrideNote,
  });

  // Upsert InductionDecision record
  const savedDecision = await prisma.inductionDecision.upsert({
    where: { enrollmentId },
    update: {
      decision: result.decisionRecord.decision,
      computedScoreAtDecision: result.decisionRecord.computedScoreAtDecision,
      overrideNote: result.decisionRecord.overrideNote,
      decidedById: adminId,
    },
    create: {
      enrollmentId,
      decision: result.decisionRecord.decision,
      computedScoreAtDecision: result.decisionRecord.computedScoreAtDecision,
      overrideNote: result.decisionRecord.overrideNote,
      decidedById: adminId,
    },
  });

  // Update enrollment status
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: decision === "INDUCTED" ? "INDUCTED" : "NOT_INDUCTED",
    },
  });

  // Promote user role assignment if INDUCTED
  if (decision === "INDUCTED") {
    await prisma.userRoleAssignment.upsert({
      where: {
        userId_role_scopeType_scopeId: {
          userId: enrollment.userId,
          role: "STUDENT",
          scopeType: "DIVISION",
          scopeId: enrollment.bootcamp.divisionId,
        },
      },
      update: {},
      create: {
        userId: enrollment.userId,
        role: "STUDENT",
        scopeType: "DIVISION",
        scopeId: enrollment.bootcamp.divisionId,
      },
    });
  }

  return savedDecision;
};
