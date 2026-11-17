import * as submissionService from "./submission.service.js";

export const submitTask = async (req, res, next) => {
  try {
    const { taskId, groupId, githubUrl } = req.body;
    const userId = req.user.id || req.user.userId;

    let fileUrl = null;
    if (req.file) {
      fileUrl = req.file.path.replace(/\\/g, "/");
    }

    const result = await submissionService.submitTask({
      taskId,
      userId,
      groupId,
      payload: {
        fileUrl: fileUrl || req.body.fileUrl,
        githubUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task submitted successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const instructorId = req.user.id || req.user.userId;
    const { score, feedback, qualFlag } = req.body;
    const result = await submissionService.gradeSubmission(
      req.params.id,
      { score: Number(score), feedback, qualFlag },
      instructorId
    );
    return res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const returnSubmission = async (req, res, next) => {
  try {
    const instructorId = req.user.id || req.user.userId;
    const { feedback } = req.body;
    const result = await submissionService.returnSubmissionForRevision(
      req.params.id,
      feedback,
      instructorId
    );
    return res.status(200).json({
      success: true,
      message: "Submission returned for revision",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSubmissionsByTask = async (req, res, next) => {
  try {
    const submissions = await submissionService.getSubmissionsByTask(req.params.taskId);
    return res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMySubmissions = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const submissions = await submissionService.getMySubmissions(userId);
    return res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    return next(error);
  }
};
