import Session from "./session.model.js";
import Bootcamp from "../bootcamps/bootcamp.model.js";
import User from "../users/user.model.js";
import * as notificationService from "../notification/notification.service.js";

/**
 * Validates session scheduling rules per ADR-0007 and SRS v2.0:
 * 1. Minimum duration: 30 minutes
 * 2. Advance scheduling requirement: >= 1 hour in advance
 * 3. Global no-overlap: no two sessions across ANY division may share any time window
 *
 * @param {Object} params
 * @param {Date} params.startTime
 * @param {Date} params.endTime
 * @param {boolean} [params.isNew=false]
 * @param {string} [params.currentSessionId]
 * @param {Array<Object>} [params.existingSessions=[]]
 */
export const validateSessionTiming = ({
  startTime,
  endTime,
  isNew = false,
  currentSessionId = null,
  existingSessions = []
}) => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  // 1. Minimum duration: 30 minutes
  const durationMs = end - start;
  if (durationMs < 30 * 60 * 1000) {
    const error = new Error("Minimum session duration is 30 minutes");
    error.statusCode = 400;
    throw error;
  }

  // 2. Must be scheduled at least 1 hour in advance (for new sessions)
  if (isNew && start < Date.now() + 60 * 60 * 1000) {
    const error = new Error("Sessions must be scheduled at least 1 hour in advance");
    error.statusCode = 400;
    throw error;
  }

  // 3. Global no-overlap enforcement (ADR-0007)
  // Two sessions overlap iff: start < existing.end AND end > existing.start
  for (const session of existingSessions) {
    if (currentSessionId && String(session.id) === String(currentSessionId)) {
      continue;
    }

    const sessStart = new Date(session.startTime).getTime();
    const sessEnd = new Date(session.endTime).getTime();

    if (start < sessEnd && end > sessStart) {
      const error = new Error(
        `Schedule Conflict: global session overlap with "${session.title || 'existing session'}"`
      );
      error.statusCode = 409;
      throw error;
    }
  }
};

const validateSessionConstraints = async (bootcampId, instructorId, startTime, endTime, sessionId = null) => {
  // 1. Minimum duration: 30 minutes
  const durationMs = endTime.getTime() - startTime.getTime();
  if (durationMs < 30 * 60 * 1000) {
    throw Object.assign(new Error("Minimum session duration is 30 minutes"), { statusCode: 400 });
  }

  // 2. Must be scheduled at least 1 hour in advance (for new sessions)
  if (!sessionId && startTime.getTime() < Date.now() + 60 * 60 * 1000) {
    throw Object.assign(new Error("Sessions must be scheduled at least 1 hour in advance"), { statusCode: 400 });
  }

  // 3. Overlap Check (Same Division/Bootcamp OR Same Instructor)
  const query = {
    $or: [
      { bootcamp: bootcampId },
      { instructor: instructorId }
    ],
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  if (sessionId) {
    query._id = { $ne: sessionId };
  }

  const overlappingSessions = await Session.find(query).populate('bootcamp instructor');

  if (overlappingSessions.length > 0) {
    const conflict = overlappingSessions[0];
    const type = conflict.bootcamp.toString() === bootcampId.toString() ? "division overlap" : "instructor double-booking";
    throw Object.assign(new Error(`Schedule Conflict: ${type} with "${conflict.title}"`), { statusCode: 409 });
  }
};


export const createSession = async (data, creatorId) => {
  const { bootcamp, date, startTime, durationH, ...rest } = data;

  const foundBootcamp = await Bootcamp.findById(bootcamp);
  if (!foundBootcamp) {
    throw Object.assign(new Error("Bootcamp not found"), { statusCode: 404 });
  }

  // Parse startTime and calculate endTime
  const startDateTime = new Date(`${date}T${startTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + (durationH || 1) * 60 * 60 * 1000);

  // Enforce Constraints
  await validateSessionConstraints(bootcamp, rest.instructor, startDateTime, endDateTime);

  const session = await Session.create({
    ...rest,
    bootcamp,
    startTime: startDateTime,
    endTime: endDateTime,
  });

  return session;
};


export const getSessions = async () => {
  return await Session.find()
    .populate("bootcamp")
    .populate("instructor");
};

export const getSessionsByBootcamp = async (bootcampId) => {
  return await Session.find({ bootcamp: bootcampId });
};

export const updateSession = async (id, data, creatorId) => {
  const { date, startTime, durationH, ...rest } = data;

  let updateData = { ...rest };

  if (date && startTime) {
    const startDateTime = new Date(`${date}T${startTime}:00`);
    updateData.startTime = startDateTime;

    if (durationH) {
      updateData.endTime = new Date(startDateTime.getTime() + durationH * 60 * 60 * 1000);
    }
    
    // If time changed, check for overlap
    const currentSession = await Session.findById(id);
    const bootcampId = updateData.bootcamp || currentSession.bootcamp;
    const instructorId = updateData.instructor || currentSession.instructor;
    
    await validateSessionConstraints(bootcampId, instructorId, updateData.startTime, updateData.endTime, id);
  }

  return await Session.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
};


export const deleteSession = async (id) => {
  return await Session.findByIdAndDelete(id);
};