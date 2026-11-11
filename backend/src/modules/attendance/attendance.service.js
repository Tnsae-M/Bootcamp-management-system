import Attendance from "./attendance.model.js";
import Session from "../sessions/session.model.js";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Determines a student's attendance status based on the submission timestamp
 * relative to the window open time and expiry.
 *
 * @param {Object} params
 * @param {Date} params.submittedAt
 * @param {Date} params.openedAt
 * @param {number} [params.windowMinutes=30]
 * @param {Date} params.expiresAt
 * @returns {'PRESENT' | 'LATE'}
 */
export const determineAttendanceStatus = ({
  submittedAt,
  openedAt,
  windowMinutes = 30,
  expiresAt
}) => {
  const submitTime = new Date(submittedAt).getTime();
  const openTime = new Date(openedAt).getTime();
  const expireTime = new Date(expiresAt).getTime();

  if (submitTime > expireTime) {
    const error = new Error("Attendance window has closed");
    error.statusCode = 422;
    throw error;
  }

  const windowLimit = openTime + windowMinutes * 60 * 1000;
  if (submitTime <= windowLimit) {
    return "PRESENT";
  }

  return "LATE";
};

/**
 * Validates student code entry and creates an attendance record object.
 *
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string} params.userId
 * @param {string} params.code - Entered code
 * @param {Date} params.submittedAt
 * @param {Object} params.activeCode - Active code record
 * @param {Object} [params.existingRecord] - Prior attendance record if one exists
 * @returns {Object} Prepared attendance record
 */
export const verifyAndRecordAttendance = ({
  sessionId,
  userId,
  code,
  submittedAt,
  activeCode,
  existingRecord = null
}) => {
  if (existingRecord) {
    const error = new Error("Attendance already recorded for this session");
    error.statusCode = 409;
    throw error;
  }

  if (
    !activeCode ||
    !activeCode.code ||
    activeCode.code.trim().toUpperCase() !== String(code).trim().toUpperCase()
  ) {
    const error = new Error("Invalid attendance code");
    error.statusCode = 400;
    throw error;
  }

  const status = determineAttendanceStatus({
    submittedAt,
    openedAt: activeCode.openedAt,
    windowMinutes: activeCode.windowMinutes,
    expiresAt: activeCode.expiresAt
  });

  return {
    sessionId,
    userId,
    status,
    submittedAt: new Date(submittedAt)
  };
};

/**
 * Manually overrides an attendance record's status.
 *
 * @param {Object} params
 * @param {Object} params.record - Existing attendance record
 * @param {string} params.newStatus - PRESENT, LATE, ABSENT, or EXCUSED
 * @param {string} [params.note] - Explanation note (mandatory for EXCUSED)
 * @returns {Object} Updated record
 */
export const overrideAttendanceRecord = ({ record, newStatus, note = "" }) => {
  const normalizedStatus = String(newStatus).toUpperCase();

  if (normalizedStatus === "EXCUSED" && (!note || note.trim().length === 0)) {
    const error = new Error("A note is required when marking attendance as EXCUSED");
    error.statusCode = 400;
    throw error;
  }

  return {
    ...record,
    status: normalizedStatus,
    overrideNote: note ? note.trim() : null
  };
};

export const markAttendance = async (data) => {
  const { sessionId, userId, status } = data;

  if (!sessionId || !userId || !status) {
    throw buildError("Session ID, User ID, and Status are required", 400);
  }

  // 1. Prevent Duplicates
  const existing = await Attendance.findOne({ sessionId, userId });
  if (existing) {
    throw buildError("Attendance record already exists for this student in this session", 409);
  }

  // 2. Automated "Late" logic if status is 'present'
  if (status.toLowerCase() === 'present') {
    const session = await Session.findById(sessionId);
    if (session) {
      const tenMinsAfterStart = new Date(session.startTime.getTime() + 10 * 60 * 1000);
      if (Date.now() > tenMinsAfterStart.getTime()) {
        data.status = 'late';
      }
    }
  }

  return await Attendance.create(data);
};

export const updateAttendance = async (id, data) => {
  const attendance = await Attendance.findById(id);
  if (!attendance) throw buildError("Record not found", 404);

  // 3. 24-hour edit window
  const oneDayInMs = 24 * 60 * 60 * 1000;
  if (Date.now() - attendance.createdAt.getTime() > oneDayInMs) {
    throw buildError("Attendance records cannot be modified after 24 hours", 403);
  }

  return await Attendance.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

export const getAttendanceBySession = async (sessionId) => {
  return await Attendance.find({ sessionId })
    .populate("userId", "name email")
    .populate("markedBy", "name role");
};

export const getUserAttendance = async (userId) => {
  return await Attendance.find({ userId })
    .populate("sessionId", "title startTime")
    .populate("bootcampId", "name");
};