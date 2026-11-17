import * as inductionService from "./induction.service.js";

export const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await inductionService.computeBootcampLeaderboard(req.params.bootcampId);
    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    return next(error);
  }
};

export const recordDecision = async (req, res, next) => {
  try {
    const adminId = req.user.id || req.user.userId;
    const { enrollmentId, decision, overrideNote } = req.body;
    const result = await inductionService.recordDecisionAction({
      enrollmentId,
      decision,
      adminId,
      overrideNote,
    });
    return res.status(200).json({
      success: true,
      message: `Induction decision recorded: ${decision}`,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

