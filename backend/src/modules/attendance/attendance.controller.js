import * as attendanceService from "./attendance.service.js";

export const openWindow = async (req, res, next) => {
  try {
    const { sessionId, windowMinutes } = req.body;
    const instructorId = req.user.id || req.user.userId;
    const result = await attendanceService.openWindow(
      sessionId,
      instructorId,
      windowMinutes || 30
    );
    return res.status(200).json({
      success: true,
      message: "Attendance window opened successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const submitCode = async (req, res, next) => {
  try {
    const { sessionId, code } = req.body;
    const userId = req.user.id || req.user.userId;
    const record = await attendanceService.submitCode(sessionId, userId, code);
    return res.status(200).json({
      success: true,
      message: `Attendance marked successfully: ${record.status}`,
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

export const overrideAttendance = async (req, res, next) => {
  try {
    const { sessionId, userId, status, note } = req.body;
    const actorId = req.user.id || req.user.userId;
    const record = await attendanceService.overrideAttendance(
      sessionId,
      userId,
      actorId,
      status,
      note
    );
    return res.status(200).json({
      success: true,
      message: "Attendance record updated",
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessionAttendance = async (req, res, next) => {
  try {
    const summary = await attendanceService.getAttendanceSummary(req.params.sessionId);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const records = await attendanceService.getUserAttendance(userId);
    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    return next(error);
  }
};
