import * as enrollmentService from "./enrollment.service.js";

export const apply = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { bootcampId, motivation, experience, portfolioUrl } = req.body;
    const result = await enrollmentService.applyToBootcamp({
      userId,
      bootcampId,
      motivation,
      experience,
      portfolioUrl,
    });
    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBootcampEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getBootcampEnrollments(
      req.params.id,
      req.query.status
    );
    return res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const enrollments = await enrollmentService.getMyEnrollments(userId);
    return res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return next(error);
  }
};
