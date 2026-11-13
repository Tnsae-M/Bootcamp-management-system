import { computeWeightedScore } from "../scoring/scoring.service.js";

/**
 * Compiles a ranked leaderboard of enrolled students based on their signals and bootcamp weights.
 *
 * @param {Object} params
 * @param {Array<Object>} params.students
 * @param {Object} params.weights
 * @param {number} [params.cutoffThreshold]
 * @returns {Array<Object>} Ranked students in descending order
 */
export const buildRankedLeaderboard = ({
  students,
  weights,
  cutoffThreshold = null
}) => {
  const scored = students.map((student) => {
    const computedScore = computeWeightedScore(student.signals, weights);
    return {
      userId: student.userId,
      fullName: student.fullName,
      computedScore,
      signals: student.signals
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.computedScore - a.computedScore);

  // Assign ranks and optional recommendations
  return scored.map((item, index) => {
    const result = {
      ...item,
      rank: index + 1
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
 *
 * Grounded in:
 * - ADR-0008 (Induction is a human decision; score is a recommendation)
 * - ADR-0005 (Roles are context-scoped)
 *
 * @param {Object} params
 * @param {Object} params.bootcamp
 * @param {string} params.bootcamp.id
 * @param {string} params.bootcamp.divisionId
 * @param {string} params.bootcamp.status
 * @param {Object} params.student
 * @param {string} params.student.userId
 * @param {string} params.student.enrollmentId
 * @param {number} params.student.computedScore
 * @param {'INDUCTED' | 'NOT_INDUCTED'} params.decision
 * @param {string} params.decidedBy - userId of the deciding Division Admin
 * @param {string} [params.overrideNote] - optional accountability note
 * @returns {Object} { decisionRecord, promotedRoleAssignment }
 */
export const recordInductionDecision = ({
  bootcamp,
  student,
  decision,
  decidedBy,
  overrideNote = null
}) => {
  if (!bootcamp || bootcamp.status !== "COMPLETED") {
    const error = new Error("Cannot record induction decision: Bootcamp must be COMPLETED");
    error.statusCode = 422;
    throw error;
  }

  const decisionRecord = {
    enrollmentId: student.enrollmentId,
    decision,
    computedScoreAtDecision: student.computedScore,
    overrideNote: overrideNote ? overrideNote.trim() : null,
    decidedBy,
    decidedAt: new Date()
  };

  let promotedRoleAssignment = null;
  if (decision === "INDUCTED") {
    promotedRoleAssignment = {
      userId: student.userId,
      role: "DIVISION_MEMBER",
      scopeType: "DIVISION",
      scopeId: bootcamp.divisionId
    };
  }

  return {
    decisionRecord,
    promotedRoleAssignment
  };
};
