// Submissions Service - BMS Core Domain Logic

export const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

/**
 * Validates whether a given URL is a valid GitHub URL (repo, PR, commit, tree, etc.)
 * @param {string} url 
 * @returns {boolean}
 */
export const validateGitHubUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") return false;
    
    // Path should have at least /owner/repo
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    return pathParts.length >= 2;
  } catch {
    return false;
  }
};

/**
 * Validates and prepares submission input for persistence
 * Enforces submissionType payload constraints, deadline/late policy, and versioning rules.
 */
export const prepareSubmission = ({
  task,
  payload = {},
  userId,
  groupId,
  existingSubmissions = [],
  now = new Date(),
}) => {
  if (!task) {
    throw buildError("Task is required", 400);
  }

  // Target ownership check
  if (task.type === "INDIVIDUAL" && !userId) {
    throw buildError("User ID is required for individual tasks", 400);
  }
  if (task.type === "GROUP_MILESTONE" && !groupId) {
    throw buildError("Group ID is required for group milestone tasks", 400);
  }

  // Payload content validation matching submissionType
  const { fileUrl, githubUrl } = payload;
  if (task.submissionType === "FILE") {
    if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.trim()) {
      throw buildError("File upload is required for this task", 400);
    }
  } else if (task.submissionType === "GITHUB_LINK") {
    if (!githubUrl || !validateGitHubUrl(githubUrl)) {
      if (!githubUrl) throw buildError("GitHub URL is required for this task", 400);
      throw buildError("Invalid GitHub URL format", 400);
    }
  } else if (task.submissionType === "BOTH") {
    if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.trim()) {
      throw buildError("File upload is required for this task", 400);
    }
    if (!githubUrl || !validateGitHubUrl(githubUrl)) {
      if (!githubUrl) throw buildError("GitHub URL is required for this task", 400);
      throw buildError("Invalid GitHub URL format", 400);
    }
  }

  // Deadline & Late policy check
  const dueDate = new Date(task.dueDate);
  const currentTime = new Date(now);
  let isLate = false;

  if (currentTime > dueDate) {
    if (!task.allowLateSubmission) {
      throw buildError("Late submissions are not accepted for this task", 422);
    }
    isLate = true;
  }

  // Versioning and Resubmission policy
  let version = 1;
  if (existingSubmissions && existingSubmissions.length > 0) {
    if (!task.allowResubmission) {
      throw buildError("Resubmissions are not permitted for this task", 409);
    }
    const maxVersion = Math.max(...existingSubmissions.map((s) => s.version || 1));
    version = maxVersion + 1;
  }

  return {
    taskId: task.id,
    userId: userId || null,
    groupId: groupId || null,
    fileUrl: fileUrl || null,
    githubUrl: githubUrl || null,
    version,
    isLate,
    status: "SUBMITTED",
    submittedAt: currentTime,
  };
};

/**
 * Evaluates grading input and applies qualitative flag
 */
export const evaluateGrading = ({ submission, task, gradingData, instructorId }) => {
  if (!submission) throw buildError("Submission is required", 400);
  if (!task) throw buildError("Task is required", 400);

  const { score, feedback, qualFlag } = gradingData || {};

  if (typeof score !== "number" || score < 0 || score > task.maxScore) {
    throw buildError(`Score must be between 0 and ${task.maxScore}`, 400);
  }

  let computedFlag = qualFlag;
  if (!computedFlag) {
    const ratio = score / task.maxScore;
    if (ratio >= 0.85) {
      computedFlag = "EXCELLENT";
    } else if (ratio >= 0.60) {
      computedFlag = "SATISFACTORY";
    } else {
      computedFlag = "NEEDS_IMPROVEMENT";
    }
  }

  return {
    ...submission,
    score,
    feedback: feedback || null,
    qualFlag: computedFlag,
    status: "GRADED",
    gradedBy: instructorId,
    gradedAt: new Date(),
  };
};

/**
 * Returns a submission for revision
 */
export const returnSubmission = ({ submission, feedback, instructorId }) => {
  if (!submission) throw buildError("Submission is required", 400);

  return {
    ...submission,
    feedback: feedback || null,
    status: "RETURNED",
    gradedBy: instructorId,
    gradedAt: new Date(),
  };
};
