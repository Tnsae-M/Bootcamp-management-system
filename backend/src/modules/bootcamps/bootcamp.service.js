// Bootcamps Service - BMS Core Domain Logic
import prisma from "../../config/prisma.js";

export const BOOTCAMP_STATUSES = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  SCREENING: "SCREENING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
};

const ALLOWED_TRANSITIONS = {
  DRAFT: ["OPEN", "ARCHIVED"],
  OPEN: ["SCREENING", "ARCHIVED"],
  SCREENING: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["COMPLETED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

export const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Validates bootcamp schedule dates
 */
export const validateBootcampDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw buildError("Start date and end date are required.", 400);
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw buildError("Invalid date format.", 400);
  }
  if (start >= end) {
    throw buildError("Start date must be before end date.", 400);
  }
  return true;
};

/**
 * Validates that scoring weights are non-negative and sum to exactly 100
 */
export const validateScoringWeights = (weights) => {
  if (!weights || typeof weights !== "object") {
    throw buildError("Scoring weights object is required.", 400);
  }
  const { attendance, individualTask, groupMilestone, peerReview } = weights;
  const values = [attendance, individualTask, groupMilestone, peerReview];

  for (const val of values) {
    if (typeof val !== "number" || isNaN(val) || val < 0) {
      throw buildError("Each scoring weight must be non-negative.", 400);
    }
  }

  const sum = attendance + individualTask + groupMilestone + peerReview;
  if (sum !== 100) {
    throw buildError(`Scoring weights must sum to 100 (current sum: ${sum}).`, 400);
  }
  return true;
};

/**
 * Transitions bootcamp status according to the domain state machine
 */
export const transitionBootcampStatus = (bootcamp, nextStatus) => {
  if (!bootcamp) throw buildError("Bootcamp is required.", 400);
  const currentStatus = bootcamp.status || BOOTCAMP_STATUSES.DRAFT;

  const validNext = ALLOWED_TRANSITIONS[currentStatus];
  if (!validNext || !validNext.includes(nextStatus)) {
    throw buildError(
      `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
      400
    );
  }

  // Preconditions on transition
  if (nextStatus === BOOTCAMP_STATUSES.OPEN) {
    validateBootcampDates(bootcamp.startDate, bootcamp.endDate);
    if (bootcamp.weights) {
      validateScoringWeights(bootcamp.weights);
    }
  }

  return {
    ...bootcamp,
    status: nextStatus,
    updatedAt: new Date(),
  };
};

/**
 * Updates scoring weights with locking when bootcamp is ACTIVE or later
 */
export const updateBootcampWeights = (bootcamp, weights) => {
  if (!bootcamp) throw buildError("Bootcamp is required.", 400);

  if (
    bootcamp.status === BOOTCAMP_STATUSES.ACTIVE ||
    bootcamp.status === BOOTCAMP_STATUSES.COMPLETED ||
    bootcamp.status === BOOTCAMP_STATUSES.ARCHIVED
  ) {
    throw buildError(
      "Cannot modify scoring weights of an active or completed bootcamp.",
      409
    );
  }

  validateScoringWeights(weights);

  return {
    ...bootcamp,
    weights: { ...weights },
    updatedAt: new Date(),
  };
};

/**
 * Screens an applicant into ENROLLED (accepted) or REJECTED
 */
export const screenApplicant = ({ enrollment, decision, adminId, reason }) => {
  if (!enrollment) throw buildError("Enrollment is required.", 400);
  if (enrollment.status !== "APPLIED") {
    throw buildError("Only APPLIED enrollments can be screened.", 400);
  }

  if (decision === "ACCEPT") {
    return {
      ...enrollment,
      status: "ENROLLED",
      screenedBy: adminId,
      screenedAt: new Date(),
    };
  } else if (decision === "REJECT") {
    return {
      ...enrollment,
      status: "REJECTED",
      rejectionReason: reason || "Application not accepted",
      screenedBy: adminId,
      screenedAt: new Date(),
    };
  } else {
    throw buildError(`Invalid screening decision: ${decision}. Must be ACCEPT or REJECT.`, 400);
  }
};

/**
 * Prisma Database operations for Bootcamps
 */
export const createBootcamp = async (divisionId, payload, startDate, endDate, createdBy) => {
  validateBootcampDates(startDate, endDate);

  const division = await prisma.division.findUnique({ where: { id: divisionId } });
  if (!division) throw buildError("Division not found.", 404);

  const weights = {
    attendance: payload.attendanceWeight ?? 20,
    individualTask: payload.individualTaskWeight ?? 40,
    groupMilestone: payload.groupMilestoneWeight ?? 30,
    peerReview: payload.peerReviewWeight ?? 10,
  };
  validateScoringWeights(weights);

  return await prisma.bootcamp.create({
    data: {
      divisionId,
      title: payload.title || payload.name,
      description: payload.description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      attendanceWeight: weights.attendance,
      individualTaskWeight: weights.individualTask,
      groupMilestoneWeight: weights.groupMilestone,
      peerReviewWeight: weights.peerReview,
      status: "DRAFT",
    },
    include: {
      division: true,
    },
  });
};

export const getBootcamps = async (filters = {}) => {
  return await prisma.bootcamp.findMany({
    where: filters,
    include: {
      division: true,
      _count: {
        select: { enrollments: true, sessions: true, tasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getBootcampById = async (id) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id },
    include: {
      division: true,
      sessions: { orderBy: { startTime: "asc" } },
      tasks: { orderBy: { deadline: "asc" } },
      groups: { include: { members: { include: { user: true } } } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!bootcamp) throw buildError("Bootcamp not found.", 404);
  return bootcamp;
};

export const updateBootcampStatus = async (id, status) => {
  const bootcamp = await prisma.bootcamp.findUnique({ where: { id } });
  if (!bootcamp) throw buildError("Bootcamp not found.", 404);

  const transitioned = transitionBootcampStatus(bootcamp, status);

  return await prisma.bootcamp.update({
    where: { id },
    data: { status: transitioned.status },
    include: { division: true },
  });
};

export const updateWeights = async (id, weights) => {
  const bootcamp = await prisma.bootcamp.findUnique({ where: { id } });
  if (!bootcamp) throw buildError("Bootcamp not found.", 404);

  const currentWeights = {
    attendance: bootcamp.attendanceWeight,
    individualTask: bootcamp.individualTaskWeight,
    groupMilestone: bootcamp.groupMilestoneWeight,
    peerReview: bootcamp.peerReviewWeight,
  };

  updateBootcampWeights({ ...bootcamp, weights: currentWeights }, weights);

  return await prisma.bootcamp.update({
    where: { id },
    data: {
      attendanceWeight: weights.attendance,
      individualTaskWeight: weights.individualTask,
      groupMilestoneWeight: weights.groupMilestone,
      peerReviewWeight: weights.peerReview,
    },
  });
};

export const screenApplicantAction = async (enrollmentId, decision, adminId, reason) => {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw buildError("Enrollment not found.", 404);

  // Map to screening domain model
  const screened = screenApplicant({
    enrollment: {
      ...enrollment,
      status: enrollment.status === "APPLICANT" ? "APPLIED" : enrollment.status,
    },
    decision,
    adminId,
    reason,
  });

  const nextStatus = screened.status === "ENROLLED" ? "STUDENT" : "APPLICANT_REJECTED";

  return await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: nextStatus,
    },
    include: {
      user: true,
      bootcamp: true,
    },
  });
};
