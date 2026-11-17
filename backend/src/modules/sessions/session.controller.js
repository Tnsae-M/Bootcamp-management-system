import * as sessionService from "./session.service.js";

export const propose = async (req, res, next) => {
  try {
    const instructorId = req.user.id || req.user.userId;
    const session = await sessionService.proposeSession({
      ...req.body,
      instructorId,
    });
    return res.status(201).json({
      success: true,
      message: "Session proposed successfully. Awaiting Division Admin approval.",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

export const approve = async (req, res, next) => {
  try {
    const adminId = req.user.id || req.user.userId;
    const session = await sessionService.approveSession(req.params.id, adminId);
    return res.status(200).json({
      success: true,
      message: "Session approved successfully",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

export const reject = async (req, res, next) => {
  try {
    const adminId = req.user.id || req.user.userId;
    const { note } = req.body;
    const session = await sessionService.rejectSession(req.params.id, adminId, note);
    return res.status(200).json({
      success: true,
      message: "Session rejected",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.bootcampId) filters.bootcampId = req.query.bootcampId;
    if (req.query.status) filters.status = req.query.status;

    const sessions = await sessionService.getSessions(filters);
    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessionsByBootcamp = async (req, res, next) => {
  try {
    const sessions = await sessionService.getSessionsByBootcamp(req.params.bootcampId);
    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    return next(error);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const session = await sessionService.cancelSession(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Session cancelled",
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};
