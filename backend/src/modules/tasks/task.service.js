import prisma from "../../config/prisma.js";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Validates and normalizes task definitions per SRS v2.0 Section 4.8.
 *
 * @param {Object} data
 * @param {string} data.bootcampId
 * @param {'INDIVIDUAL' | 'GROUP_MILESTONE'} data.type
 * @param {string} data.title
 * @param {'FILE' | 'GITHUB_LINK' | 'BOTH'} data.submissionType
 * @param {Date|string} data.deadline
 * @param {number} data.maxScore
 * @param {number} [data.milestoneNumber]
 * @param {boolean} [data.peerReviewRequired=false]
 * @param {boolean} [data.allowLateSubmission=false]
 * @param {number} [data.latePenaltyPercent]
 * @param {boolean} [data.allowResubmission=true]
 * @returns {Object} Validated task definition
 */
export const validateTaskDefinition = (data) => {
  const {
    bootcampId,
    type,
    title,
    submissionType,
    deadline,
    maxScore,
    milestoneNumber = null,
    peerReviewRequired = false,
    allowLateSubmission = false,
    latePenaltyPercent = null,
    allowResubmission = true,
    description = null,
    instructions = null
  } = data;

  if (!bootcampId || !title) {
    throw buildError("bootcampId and title are required", 400);
  }

  const normalizedType = String(type).toUpperCase();
  if (!["INDIVIDUAL", "GROUP_MILESTONE"].includes(normalizedType)) {
    throw buildError("Task type must be INDIVIDUAL or GROUP_MILESTONE", 400);
  }

  if (normalizedType === "GROUP_MILESTONE") {
    if (milestoneNumber === null || milestoneNumber === undefined) {
      throw buildError("milestoneNumber is required for GROUP_MILESTONE tasks", 400);
    }
    if (typeof milestoneNumber !== "number" || milestoneNumber <= 0 || !Number.isInteger(milestoneNumber)) {
      throw buildError("milestoneNumber must be a positive integer", 400);
    }
  }

  const normalizedSub = String(submissionType).toUpperCase();
  if (!["FILE", "GITHUB_LINK", "BOTH"].includes(normalizedSub)) {
    throw buildError("Submission type must be FILE, GITHUB_LINK, or BOTH", 400);
  }

  const due = new Date(deadline);
  if (isNaN(due.getTime()) || due.getTime() <= Date.now()) {
    throw buildError("Deadline must be in the future", 400);
  }

  if (typeof maxScore !== "number" || maxScore <= 0) {
    throw buildError("maxScore must be a positive number", 400);
  }

  if (allowLateSubmission && latePenaltyPercent !== null && latePenaltyPercent !== undefined) {
    if (typeof latePenaltyPercent !== "number" || latePenaltyPercent < 0 || latePenaltyPercent > 100) {
      throw buildError("latePenaltyPercent must be between 0 and 100", 400);
    }
  }

  return {
    bootcampId,
    type: normalizedType,
    title: title.trim(),
    description,
    instructions,
    submissionType: normalizedSub,
    deadline: due,
    maxScore,
    milestoneNumber: normalizedType === "GROUP_MILESTONE" ? milestoneNumber : null,
    peerReviewRequired: normalizedType === "GROUP_MILESTONE" ? Boolean(peerReviewRequired) : false,
    allowLateSubmission: Boolean(allowLateSubmission),
    latePenaltyPercent,
    allowResubmission: Boolean(allowResubmission)
  };
};

export const createTask = async (data) => {
  const validated = validateTaskDefinition(data);

  return await prisma.task.create({
    data: {
      bootcampId: validated.bootcampId,
      type: validated.type,
      title: validated.title,
      description: validated.description,
      instructions: validated.instructions,
      submissionType: validated.submissionType,
      deadline: new Date(validated.deadline),
      maxScore: validated.maxScore,
      milestoneNumber: validated.milestoneNumber,
      peerReviewRequired: validated.peerReviewRequired,
      allowLateSubmission: validated.allowLateSubmission,
      latePenaltyPercent: validated.latePenaltyPercent,
      allowResubmission: validated.allowResubmission,
    },
    include: {
      bootcamp: { select: { id: true, title: true } },
    },
  });
};

export const getTasks = async (filters = {}) => {
  return await prisma.task.findMany({
    where: filters,
    include: {
      bootcamp: { select: { id: true, title: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { deadline: "asc" },
  });
};

export const getTasksByBootcamp = async (bootcampId) => {
  return await getTasks({ bootcampId });
};

export const getTaskById = async (id) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      bootcamp: true,
      submissions: {
        include: { user: true, group: true },
      },
    },
  });
  if (!task) throw buildError("Task not found", 404);
  return task;
};

export const updateTask = async (id, data) => {
  return await prisma.task.update({
    where: { id },
    data,
  });
};

export const deleteTask = async (id) => {
  return await prisma.task.delete({
    where: { id },
  });
};