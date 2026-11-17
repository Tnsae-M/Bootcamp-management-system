import prisma from "../../config/prisma.js";
import crypto from "crypto";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Determines a student's attendance status based on submission timestamp
 */
export const determineAttendanceStatus = ({
  submittedAt,
  openedAt,
  windowMinutes = 30,
  expiresAt,
}) => {
  const submitTime = new Date(submittedAt).getTime();
  const openTime = new Date(openedAt).getTime();
  const expireTime = new Date(expiresAt).getTime();

  if (submitTime > expireTime) {
    throw buildError("Attendance window has closed", 422);
  }

  const windowLimit = openTime + windowMinutes * 60 * 1000;
  if (submitTime <= windowLimit) {
    return "PRESENT";
  }

  return "LATE";
};

/**
 * Validates student code entry and creates an attendance record object.
 */
export const validateAttendanceCodeEntry = ({
  sessionId,
  code,
  activeCode,
  studentId,
  userId,
  existingRecord = null,
  submittedAt = new Date(),
}) => {
  const effectiveUserId = studentId || userId;
  const effectiveSessionId = sessionId || activeCode?.sessionId;

  if (existingRecord) {
    throw buildError("Attendance already recorded", 409);
  }

  if (!activeCode || !activeCode.code) {
    throw buildError("No active attendance window for this session", 422);
  }

  const normalizedInput = String(code).trim().toUpperCase();
  const expectedCode = String(activeCode.code).trim().toUpperCase();

  if (normalizedInput !== expectedCode) {
    throw buildError("Invalid attendance code", 400);
  }

  const status = determineAttendanceStatus({
    submittedAt,
    openedAt: activeCode.openedAt,
    windowMinutes: activeCode.windowMinutes || 30,
    expiresAt: activeCode.expiresAt,
  });

  return {
    sessionId: effectiveSessionId,
    userId: effectiveUserId,
    status,
    submittedAt: new Date(submittedAt),
  };
};

export const verifyAndRecordAttendance = validateAttendanceCodeEntry;

/**
 * Overrides an attendance record (Admin or Instructor manual adjustment)
 */
export const overrideAttendanceRecord = ({ record, newStatus, note = "" }) => {
  const normalizedStatus = String(newStatus).toUpperCase();

  if (normalizedStatus === "EXCUSED" && (!note || note.trim().length === 0)) {
    throw buildError("A note is required when marking attendance as EXCUSED", 400);
  }

  return {
    ...record,
    status: normalizedStatus,
    overrideNote: note ? note.trim() : null,
  };
};

// ─── Prisma Database Operations ──────────────────────────────────────────────

export const openWindow = async (sessionId, instructorId, windowMinutes = 30) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw buildError("Session not found", 404);

  // Generate 5-character alphanumeric code
  const code = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 5);
  const openedAt = new Date();
  const expiresAt = new Date(openedAt.getTime() + windowMinutes * 60 * 1000);

  const attendanceCode = await prisma.attendanceCode.upsert({
    where: { sessionId },
    update: {
      code,
      windowMinutes,
      openedAt,
      expiresAt,
    },
    create: {
      sessionId,
      code,
      windowMinutes,
      openedAt,
      expiresAt,
    },
  });

  return {
    code: attendanceCode.code,
    windowMinutes: attendanceCode.windowMinutes,
    expiresAt: attendanceCode.expiresAt,
  };
};

export const submitCode = async (sessionId, userId, code) => {
  const activeCode = await prisma.attendanceCode.findUnique({
    where: { sessionId },
  });

  const existingRecord = await prisma.attendanceRecord.findUnique({
    where: {
      sessionId_userId: { sessionId, userId },
    },
  });

  const validated = validateAttendanceCodeEntry({
    code,
    activeCode,
    studentId: userId,
    existingRecord,
    submittedAt: new Date(),
  });

  return await prisma.attendanceRecord.create({
    data: {
      sessionId,
      userId,
      status: validated.status,
      submittedAt: validated.submittedAt,
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });
};

export const overrideAttendance = async (sessionId, userId, actorId, newStatus, note) => {
  const record = await prisma.attendanceRecord.findUnique({
    where: { sessionId_userId: { sessionId, userId } },
  });

  const updated = overrideAttendanceRecord({
    record: record || { sessionId, userId },
    newStatus,
    note,
  });

  return await prisma.attendanceRecord.upsert({
    where: { sessionId_userId: { sessionId, userId } },
    update: {
      status: updated.status,
      overrideNote: updated.overrideNote,
    },
    create: {
      sessionId,
      userId,
      status: updated.status,
      overrideNote: updated.overrideNote,
    },
  });
};

export const getAttendanceSummary = async (sessionId) => {
  const records = await prisma.attendanceRecord.findMany({
    where: { sessionId },
    include: {
      user: { select: { id: true, fullName: true, email: true, universityId: true } },
    },
  });

  const counts = {
    total: records.length,
    present: records.filter((r) => r.status === "PRESENT").length,
    late: records.filter((r) => r.status === "LATE").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    excused: records.filter((r) => r.status === "EXCUSED").length,
  };

  return {
    counts,
    records,
  };
};

export const getUserAttendance = async (userId) => {
  return await prisma.attendanceRecord.findMany({
    where: { userId },
    include: {
      session: {
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          bootcamp: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
