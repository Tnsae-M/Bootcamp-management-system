import { describe, test, expect } from "vitest";
import {
  validateGitHubUrl,
  prepareSubmission,
  evaluateGrading,
  returnSubmission
} from "../src/modules/submissions/submission.service.js";

describe("submissions.service - validateGitHubUrl", () => {
  test("accepts valid GitHub repository and pull request URLs", () => {
    expect(validateGitHubUrl("https://github.com/csec-astu/bms-project")).toBe(true);
    expect(validateGitHubUrl("https://github.com/torvalds/linux/pull/123")).toBe(true);
    expect(validateGitHubUrl("https://github.com/facebook/react/tree/main/packages")).toBe(true);
  });

  test("rejects invalid, malformed, or non-GitHub URLs (400)", () => {
    expect(validateGitHubUrl("https://gitlab.com/user/project")).toBe(false);
    expect(validateGitHubUrl("http://not-github.org/repo")).toBe(false);
    expect(validateGitHubUrl("just-a-string")).toBe(false);
    expect(validateGitHubUrl("")).toBe(false);
    expect(validateGitHubUrl(null)).toBe(false);
  });
});

describe("submissions.service - prepareSubmission", () => {
  const baseTask = {
    id: "task-101",
    title: "Binary Exploitation Intro",
    type: "INDIVIDUAL",
    submissionType: "GITHUB_LINK",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    maxScore: 100,
    allowLateSubmission: false,
    allowResubmission: true,
  };

  test("validates required fields matching submissionType (400 on missing)", () => {
    // Missing githubUrl for GITHUB_LINK task
    expect(() =>
      prepareSubmission({
        task: baseTask,
        payload: { fileUrl: "uploads/lab1.zip" },
        userId: "student-1",
      })
    ).toThrow(/GitHub URL is required/i);

    // Invalid githubUrl
    expect(() =>
      prepareSubmission({
        task: baseTask,
        payload: { githubUrl: "https://notgithub.com/repo" },
        userId: "student-1",
      })
    ).toThrow(/Invalid GitHub URL/i);

    // Missing fileUrl for FILE task
    expect(() =>
      prepareSubmission({
        task: { ...baseTask, submissionType: "FILE" },
        payload: { githubUrl: "https://github.com/org/repo" },
        userId: "student-1",
      })
    ).toThrow(/File upload is required/i);

    // Missing either for BOTH task
    expect(() =>
      prepareSubmission({
        task: { ...baseTask, submissionType: "BOTH" },
        payload: { githubUrl: "https://github.com/org/repo" },
        userId: "student-1",
      })
    ).toThrow(/File upload is required/i);
  });

  test("enforces deadline & late submission policy (422 if late not allowed)", () => {
    const expiredTask = {
      ...baseTask,
      dueDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      allowLateSubmission: false,
    };

    expect(() =>
      prepareSubmission({
        task: expiredTask,
        payload: { githubUrl: "https://github.com/csec-astu/bms" },
        userId: "student-1",
        now: new Date(),
      })
    ).toThrow(/Late submissions are not accepted/i);

    const allowedLateTask = {
      ...expiredTask,
      allowLateSubmission: true,
    };

    const res = prepareSubmission({
      task: allowedLateTask,
      payload: { githubUrl: "https://github.com/csec-astu/bms" },
      userId: "student-1",
      now: new Date(),
    });

    expect(res.isLate).toBe(true);
    expect(res.status).toBe("SUBMITTED");
  });

  test("enforces versioning and resubmission permissions (409 if resubmission blocked)", () => {
    const noResubmitTask = {
      ...baseTask,
      allowResubmission: false,
    };

    const existingSubmissions = [
      { id: "sub-1", version: 1, userId: "student-1", taskId: "task-101" },
    ];

    expect(() =>
      prepareSubmission({
        task: noResubmitTask,
        payload: { githubUrl: "https://github.com/csec-astu/bms" },
        userId: "student-1",
        existingSubmissions,
      })
    ).toThrow(/Resubmissions are not permitted/i);

    // Allowed resubmission increments version
    const res = prepareSubmission({
      task: baseTask,
      payload: { githubUrl: "https://github.com/csec-astu/bms" },
      userId: "student-1",
      existingSubmissions,
    });

    expect(res.version).toBe(2);
  });

  test("validates target ownership (INDIVIDUAL requires userId, GROUP_MILESTONE requires groupId)", () => {
    expect(() =>
      prepareSubmission({
        task: baseTask,
        payload: { githubUrl: "https://github.com/csec-astu/bms" },
      })
    ).toThrow(/User ID is required/i);

    const groupTask = {
      ...baseTask,
      type: "GROUP_MILESTONE",
    };

    expect(() =>
      prepareSubmission({
        task: groupTask,
        payload: { githubUrl: "https://github.com/csec-astu/bms" },
        userId: "student-1",
      })
    ).toThrow(/Group ID is required/i);

    const groupRes = prepareSubmission({
      task: groupTask,
      payload: { githubUrl: "https://github.com/csec-astu/bms" },
      userId: "student-1",
      groupId: "group-10",
    });
    expect(groupRes.groupId).toBe("group-10");
  });
});

describe("submissions.service - evaluateGrading & returnSubmission", () => {
  const task = {
    id: "task-101",
    maxScore: 100,
  };

  const submission = {
    id: "sub-1",
    taskId: "task-101",
    userId: "student-1",
    status: "SUBMITTED",
  };

  test("rejects invalid score out of bounds (< 0 or > maxScore)", () => {
    expect(() =>
      evaluateGrading({
        submission,
        task,
        gradingData: { score: -5 },
        instructorId: "inst-1",
      })
    ).toThrow(/Score must be between 0 and 100/i);

    expect(() =>
      evaluateGrading({
        submission,
        task,
        gradingData: { score: 120 },
        instructorId: "inst-1",
      })
    ).toThrow(/Score must be between 0 and 100/i);
  });

  test("computes qualitative flag accurately when not explicitly provided", () => {
    const excellent = evaluateGrading({
      submission,
      task,
      gradingData: { score: 92, feedback: "Outstanding!" },
      instructorId: "inst-1",
    });
    expect(excellent.status).toBe("GRADED");
    expect(excellent.qualFlag).toBe("EXCELLENT");
    expect(excellent.gradedBy).toBe("inst-1");

    const satisfactory = evaluateGrading({
      submission,
      task,
      gradingData: { score: 70 },
      instructorId: "inst-1",
    });
    expect(satisfactory.qualFlag).toBe("SATISFACTORY");

    const needsImprovement = evaluateGrading({
      submission,
      task,
      gradingData: { score: 45 },
      instructorId: "inst-1",
    });
    expect(needsImprovement.qualFlag).toBe("NEEDS_IMPROVEMENT");
  });

  test("returnSubmission transitions status to RETURNED with feedback", () => {
    const returned = returnSubmission({
      submission,
      feedback: "Please fix memory leak in task 3 and resubmit",
      instructorId: "inst-1",
    });

    expect(returned.status).toBe("RETURNED");
    expect(returned.feedback).toBe("Please fix memory leak in task 3 and resubmit");
    expect(returned.gradedBy).toBe("inst-1");
  });
});
