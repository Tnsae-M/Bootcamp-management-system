import prisma from "../../config/prisma.js";

const buildError = (msg, code = 400) => {
  const err = new Error(msg);
  err.statusCode = code;
  return err;
};

export const getMyProgress = async (userId, bootcampId) => {
  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_bootcampId: { userId, bootcampId } },
  });
  if (!enrollment) {
    throw buildError("Not enrolled in this bootcamp", 403);
  }

  // ATTENDANCE
  const totalSessions = await prisma.session.count({
    where: { bootcampId, status: "APPROVED" },
  });

  const attendedRecords = await prisma.attendanceRecord.count({
    where: {
      userId,
      session: { bootcampId },
      status: { in: ["PRESENT", "LATE"] },
    },
  });

  const attendanceRate =
    totalSessions === 0 ? 0 : (attendedRecords / totalSessions) * 100;

  // TASKS
  const totalTasks = await prisma.task.count({
    where: { bootcampId },
  });

  const submissions = await prisma.submission.findMany({
    where: {
      userId,
      task: { bootcampId },
    },
  });

  const submittedTasks = submissions.length;
  const taskCompletionRate =
    totalTasks === 0 ? 0 : (submittedTasks / totalTasks) * 100;

  // SCORES
  const graded = submissions.filter((s) => s.score !== null && s.score !== undefined);
  const totalScore = graded.reduce((acc, s) => acc + (s.score || 0), 0);
  const avgScore = graded.length === 0 ? 0 : totalScore / graded.length;

  // FINAL PROGRESS SCORE
  const overallProgress =
    attendanceRate * 0.3 + taskCompletionRate * 0.4 + avgScore * 0.3;

  return {
    attendanceRate: Math.round(attendanceRate),
    taskCompletionRate: Math.round(taskCompletionRate),
    avgScore: Math.round(avgScore),
    overallProgress: Math.round(overallProgress),
  };
};
