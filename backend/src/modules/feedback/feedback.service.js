import prisma from "../../config/prisma.js";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Validates session feedback submission per SRS v2.0 Section 4.10.1:
 * - Only students marked PRESENT or LATE are eligible
 * - Submission window: <= 48 hours post-session
 * - Rating: 1-5
 * - One feedback per student per session
 *
 * @param {Object} params
 * @param {Object} params.session
 * @param {Date|string} params.session.endTime
 * @param {Object} [params.attendanceRecord]
 * @param {string} params.userId
 * @param {number} params.rating
 * @param {string} [params.comment]
 * @param {Date} [params.submittedAt]
 * @param {Object} [params.existingFeedback]
 * @returns {Object} Validated feedback record
 */
export const validateSessionFeedbackSubmission = ({
  session,
  attendanceRecord,
  userId,
  rating,
  comment = null,
  submittedAt = new Date(),
  existingFeedback = null
}) => {
  // 1. Attendance eligibility: must be PRESENT or LATE
  if (
    !attendanceRecord ||
    !attendanceRecord.status ||
    !["PRESENT", "LATE"].includes(String(attendanceRecord.status).toUpperCase())
  ) {
    throw buildError("Feedback restricted to students who attended the session", 403);
  }

  // 2. Prevent duplicate
  if (existingFeedback) {
    throw buildError("Feedback already submitted for this session", 409);
  }

  // 3. Timing: must be after session ends and within 48 hours
  const end = new Date(session.endTime).getTime();
  const now = new Date(submittedAt).getTime();
  const diff = now - end;

  if (diff < 0) {
    throw buildError("Feedback cannot be submitted before session ends", 400);
  }

  if (diff > 48 * 60 * 60 * 1000) {
    throw buildError("Feedback window has closed (48 hours expired)", 403);
  }

  // 4. Rating bounds
  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw buildError("Rating must be an integer between 1 and 5", 400);
  }

  return {
    sessionId: session.id,
    userId,
    rating,
    comment: comment ? comment.trim() : null,
    status: String(attendanceRecord.status).toUpperCase(),
    submittedAt: new Date(submittedAt)
  };
};

/**
 * Formats session feedbacks according to viewer authorization.
 * Anonymizes student identity when viewed by instructors (SRS v2.0 Section 4.10.1).
 *
 * @param {Object} params
 * @param {Array<Object>} params.feedbacks
 * @param {'INSTRUCTOR' | 'DIVISION_ADMIN' | 'SUPER_ADMIN'} params.viewerRole
 * @returns {Array<Object>} Formatted feedbacks
 */
export const formatFeedbackForViewer = ({ feedbacks = [], viewerRole = "INSTRUCTOR" }) => {
  const isAdmin = ["DIVISION_ADMIN", "SUPER_ADMIN", "ADMIN", "SUPER ADMIN"].includes(
    String(viewerRole).toUpperCase()
  );

  return feedbacks.map((fb) => ({
    id: fb.id,
    sessionId: fb.sessionId,
    userId: isAdmin ? fb.userId : null,
    studentName: isAdmin ? fb.studentName : "Anonymous",
    rating: fb.rating,
    comment: fb.comment,
    submittedAt: fb.submittedAt
  }));
};

/**
 * Validates peer review submissions between group members on a capstone milestone.
 *
 * Grounded in:
 * - SRS v2.0 Section 4.10.2 (Peer Review: 1-5, anonymous to peers, prevents free-riding)
 * - CONTEXT.md (Peer Review)
 *
 * @param {Object} params
 * @param {string} params.submissionId
 * @param {string} params.reviewerId
 * @param {string} params.revieweeId
 * @param {Array<Object>} params.groupMembers
 * @param {number} params.rating
 * @param {string} [params.comment]
 * @param {Object} [params.existingPeerReview]
 * @returns {Object} Validated peer review record
 */
export const validatePeerReviewSubmission = ({
  submissionId,
  reviewerId,
  revieweeId,
  groupMembers = [],
  rating,
  comment = null,
  existingPeerReview = null
}) => {
  // 1. Cannot review self
  if (reviewerId === revieweeId) {
    throw buildError("Cannot submit peer review for yourself", 400);
  }

  // 2. Both reviewer and reviewee must be in the group
  const memberIds = groupMembers.map((m) => m.userId);
  if (!memberIds.includes(reviewerId) || !memberIds.includes(revieweeId)) {
    throw buildError("Both users must be members of the same group", 403);
  }

  // 3. Prevent duplicate review for the same milestone submission
  if (existingPeerReview) {
    throw buildError("Peer review already submitted for this teammate", 409);
  }

  // 4. Rating bounds (1 to 5)
  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw buildError("Rating must be an integer between 1 and 5", 400);
  }

  return {
    submissionId,
    reviewerId,
    revieweeId,
    rating,
    comment: comment ? comment.trim() : null,
    submittedAt: new Date()
  };
};

// ─── Prisma Database Operations ──────────────────────────────────────────────

export const submitSessionFeedback = async ({ sessionId, userId, rating, comment }) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw buildError("Session not found", 404);

  const attendanceRecord = await prisma.attendanceRecord.findUnique({
    where: { sessionId_userId: { sessionId, userId } },
  });

  const existingFeedback = await prisma.sessionFeedback.findUnique({
    where: { sessionId_userId: { sessionId, userId } },
  });

  const validated = validateSessionFeedbackSubmission({
    session,
    attendanceRecord,
    userId,
    rating: Number(rating),
    comment,
    existingFeedback,
    submittedAt: new Date(),
  });

  return await prisma.sessionFeedback.create({
    data: {
      sessionId: validated.sessionId,
      userId: validated.userId,
      rating: validated.rating,
      comment: validated.comment,
      submittedAt: validated.submittedAt,
    },
  });
};

export const submitPeerReview = async ({
  submissionId,
  reviewerId,
  revieweeId,
  rating,
  comment,
}) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      group: { include: { members: true } },
    },
  });
  if (!submission) throw buildError("Submission not found", 404);

  const teammates = submission.group?.members?.map((m) => m.userId) || [];

  const existingPeerReview = await prisma.peerReview.findUnique({
    where: {
      submissionId_reviewerId_revieweeId: { submissionId, reviewerId, revieweeId },
    },
  });

  const validated = validatePeerReviewPayload({
    submission,
    reviewerId,
    revieweeId,
    teammates,
    rating: Number(rating),
    comment,
    existingPeerReview,
  });

  return await prisma.peerReview.create({
    data: {
      submissionId: validated.submissionId,
      reviewerId: validated.reviewerId,
      revieweeId: validated.revieweeId,
      rating: validated.rating,
      comment: validated.comment,
      submittedAt: validated.submittedAt,
    },
  });
};

export const getSessionFeedbacks = async (sessionId) => {
  return await prisma.sessionFeedback.findMany({
    where: { sessionId },
    select: {
      id: true,
      sessionId: true,
      rating: true,
      comment: true,
      submittedAt: true,
    },
    orderBy: { submittedAt: "desc" },
  });
};