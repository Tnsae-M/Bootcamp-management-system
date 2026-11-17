import * as bootcampService from "./bootcamp.service.js";

export const createBootcamp = async (req, res, next) => {
  try {
    const { divisionId, startDate, endDate, ...payload } = req.body;
    const adminId = req.user.id || req.user.userId;
    const bootcamp = await bootcampService.createBootcamp(
      divisionId || req.params.divisionId,
      payload,
      startDate,
      endDate,
      adminId
    );
    return res.status(201).json({
      success: true,
      message: "Bootcamp created successfully",
      data: bootcamp,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBootcamps = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.divisionId) filters.divisionId = req.query.divisionId;

    const bootcamps = await bootcampService.getBootcamps(filters);
    return res.status(200).json({
      success: true,
      data: bootcamps,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBootcampById = async (req, res, next) => {
  try {
    const bootcamp = await bootcampService.getBootcampById(req.params.id);
    return res.status(200).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await bootcampService.updateBootcampStatus(req.params.id, status);
    return res.status(200).json({
      success: true,
      message: `Bootcamp transitioned to ${status}`,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateWeights = async (req, res, next) => {
  try {
    const updated = await bootcampService.updateWeights(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Scoring weights updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBootcampsByDivision = async (req, res, next) => {
  try {
    const { divisionId } = req.params;
    const bootcamps = await bootcampService.getBootcamps({ divisionId });
    return res.status(200).json({
      success: true,
      data: bootcamps,
    });
  } catch (error) {
    return next(error);
  }
};

export const screenApplicant = async (req, res, next) => {
  try {
    const { enrollmentId, decision, reason } = req.body;
    const adminId = req.user.id || req.user.userId;
    const result = await bootcampService.screenApplicantAction(
      enrollmentId,
      decision,
      adminId,
      reason
    );
    return res.status(200).json({
      success: true,
      message: `Applicant screening complete: ${decision}`,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
