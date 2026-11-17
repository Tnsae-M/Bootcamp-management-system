import * as feedbackService from "./feedback.service.js";

export const submitSessionFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { sessionId, rating, comment } = req.body;
    const feedback = await feedbackService.submitSessionFeedback({
      sessionId,
      userId,
      rating,
      comment,
    });
    return res.status(201).json({
      success: true,
      message: "Session feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    return next(error);
  }
};

export const submitPeerReview = async (req, res, next) => {
  try {
    const reviewerId = req.user.id || req.user.userId;
    const { submissionId, revieweeId, rating, comment } = req.body;
    const review = await feedbackService.submitPeerReview({
      submissionId,
      reviewerId,
      revieweeId,
      rating,
      comment,
    });
    return res.status(201).json({
      success: true,
      message: "Peer review submitted successfully",
      data: review,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSessionFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await feedbackService.getSessionFeedbacks(req.params.sessionId);
    return res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    return next(error);
  }
};
