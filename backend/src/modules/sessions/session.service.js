import prisma from "../../config/prisma.js";

const buildError = (msg, statusCode = 400) => {
  const err = new Error(msg);
  err.statusCode = statusCode;
  return err;
};

/**
 * Validates session scheduling rules per ADR-0007 and SRS v2.0:
 * 1. Minimum duration: 30 minutes
 * 2. Advance scheduling requirement: >= 1 hour in advance
 * 3. Global no-overlap: no two sessions across ANY division may share any time window
 */
export const validateSessionTiming = ({
  startTime,
  endTime,
  isNew = false,
  currentSessionId = null,
  existingSessions = [],
}) => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  // 1. Minimum duration: 30 minutes
  const durationMs = end - start;
  if (durationMs < 30 * 60 * 1000) {
    throw buildError("Minimum session duration is 30 minutes", 400);
  }

  // 2. Must be scheduled at least 1 hour in advance (for new sessions)
  if (isNew && start < Date.now() + 60 * 60 * 1000) {
    throw buildError("Sessions must be scheduled at least 1 hour in advance", 400);
  }

  // 3. Global no-overlap enforcement (ADR-0007)
  for (const session of existingSessions) {
    if (currentSessionId && String(session.id) === String(currentSessionId)) {
      continue;
    }

    const sessStart = new Date(session.startTime).getTime();
    const sessEnd = new Date(session.endTime).getTime();

    if (start < sessEnd && end > sessStart) {
      throw buildError(
        `Schedule Conflict: global session overlap with "${session.title || "existing session"}"`,
        409
      );
    }
  }

  return true;
};

export const proposeSession = async ({
  bootcampId,
  instructorId,
  title,
  description,
  location,
  startTime,
  endTime,
}) => {
  if (!bootcampId || !title || !startTime || !endTime) {
    throw buildError("Bootcamp ID, title, start time, and end time are required", 400);
  }

  // Fetch all pending/approved sessions across the entire system for global no-overlap
  const existingSessions = await prisma.session.findMany({
    where: {
      status: { in: ["PENDING", "APPROVED"] },
    },
    select: { id: true, title: true, startTime: true, endTime: true },
  });

  validateSessionTiming({
    startTime,
    endTime,
    isNew: true,
    existingSessions,
  });

  return await prisma.session.create({
    data: {
      bootcampId,
      instructorId,
      title,
      description,
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "PENDING",
    },
    include: {
      instructor: true,
      bootcamp: true,
    },
  });
};

export const approveSession = async (sessionId, adminId) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw buildError("Session not found", 404);

  // Re-verify global overlap at approval time per ADR-0007
  const approvedSessions = await prisma.session.findMany({
    where: {
      status: "APPROVED",
      id: { not: sessionId },
    },
    select: { id: true, title: true, startTime: true, endTime: true },
  });

  validateSessionTiming({
    startTime: session.startTime,
    endTime: session.endTime,
    isNew: false,
    currentSessionId: sessionId,
    existingSessions: approvedSessions,
  });

  return await prisma.session.update({
    where: { id: sessionId },
    data: { status: "APPROVED" },
    include: {
      instructor: true,
      bootcamp: true,
    },
  });
};

export const rejectSession = async (sessionId, adminId, note) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw buildError("Session not found", 404);

  return await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: "REJECTED",
      rejectionNote: note || "Session proposal rejected by admin",
    },
  });
};

export const getSessions = async (filters = {}) => {
  return await prisma.session.findMany({
    where: filters,
    include: {
      bootcamp: { select: { id: true, title: true, division: true } },
      instructor: { select: { id: true, fullName: true, email: true } },
      attendanceCode: true,
    },
    orderBy: { startTime: "asc" },
  });
};

export const getSessionsByBootcamp = async (bootcampId) => {
  return await getSessions({ bootcampId });
};

export const getSessionById = async (id) => {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      bootcamp: true,
      instructor: true,
      attendanceCode: true,
      attendanceRecords: { include: { user: true } },
      sessionFeedbacks: true,
    },
  });
  if (!session) throw buildError("Session not found", 404);
  return session;
};

export const cancelSession = async (sessionId) => {
  return await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });
};
