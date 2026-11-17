import Task from "./task.model.js";
import Bootcamp from "../bootcamps/bootcamp.model.js";
import Session from "../sessions/session.model.js";
import Enrollment from "../enrollments/enrollment.model.js";

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

//  Create Task
export const createTask = async (data, user) => {
  const { bootcampId, sessionId, dueDate } = data;

  const bootcamp = await Bootcamp.findById(bootcampId);
  if (!bootcamp) throw buildError("Bootcamp not found", 404);

  // Optional session validation
  if (sessionId) {
    const session = await Session.findById(sessionId);
    if (!session) throw buildError("Session not found", 404);
  }

  // 🚨 Important rule
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  if (due < now) {
    throw buildError("Due date cannot be in the past");
  }

  return await Task.create({
    ...data,
    createdBy: user.userId,
  });
};

//  Get tasks for bootcamp (ONLY if enrolled)
export const getTasksByBootcamp = async (bootcampId, userId, roles = []) => {
  const userRoles = Array.isArray(roles) ? roles : [roles];
  const isFaculty = userRoles.some(r => 
    ["ADMIN", "SUPER ADMIN", "INSTRUCTOR"].includes(String(r || "").toUpperCase())
  );

  if (!isFaculty) {
    const enrollment = await Enrollment.findOne({
      userId,
      bootcampId,
    });

    if (!enrollment) {
      throw buildError("You are not enrolled in this bootcamp", 403);
    }
  }

  return await Task.find({ bootcampId })
    .populate("sessionId", "title startTime")
    .sort({ dueDate: 1 });
};

//  Get single task
export const getTaskById = async (taskId, userId, roles = []) => {
  const task = await Task.findById(taskId)
    .populate("bootcampId", "name")
    .populate("sessionId", "title");

  if (!task) throw buildError("Task not found", 404);

  const userRoles = Array.isArray(roles) ? roles : [roles];
  const isFaculty = userRoles.some(r => 
    ["ADMIN", "SUPER ADMIN", "INSTRUCTOR"].includes(String(r || "").toUpperCase())
  );

  if (!isFaculty) {
    const enrollment = await Enrollment.findOne({
      userId,
      bootcampId: task.bootcampId._id,
    });

    if (!enrollment) {
      throw buildError("Access denied", 403);
    }
  }

  return task;
};

//  Update task
export const updateTask = async (taskId, data) => {
  const task = await Task.findById(taskId);
  if (!task) throw buildError("Task not found", 404);

  Object.assign(task, data);
  await task.save();

  return task;
};

//  Delete task
export const deleteTask = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw buildError("Task not found", 404);

  await Task.findByIdAndDelete(taskId);
  return { id: taskId };
};

//  Get all tasks relevant to the user
export const getAllTasks = async (userId, roles = []) => {
  const userRoles = (Array.isArray(roles) ? roles : [roles]).map(r => String(r || "").toUpperCase());
  const isSuperAdmin = userRoles.includes('SUPER ADMIN');
  const isAdmin = userRoles.includes('ADMIN');
  const isInstructor = userRoles.includes('INSTRUCTOR');

  if (isSuperAdmin || isAdmin) {
    return await Task.find({})
      .populate("bootcampId", "name")
      .populate("sessionId", "title")
      .sort({ createdAt: -1 });
  }

  if (isInstructor) {
    return await Task.find({ createdBy: userId })
      .populate("bootcampId", "name")
      .populate("sessionId", "title")
      .sort({ createdAt: -1 });
  }

  // For students, find tasks in all enrolled bootcamps
  const enrollments = await Enrollment.find({ userId });
  const bootcampIds = enrollments.map(e => e.bootcampId);

  return await Task.find({ bootcampId: { $in: bootcampIds } })
    .populate("bootcampId", "name")
    .populate("sessionId", "title")
    .sort({ dueDate: 1 });
};