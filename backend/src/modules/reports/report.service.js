import prisma from "../../config/prisma.js";

// In-memory backing for administrative reporting documents
let memoryReports = [];

export const createReport = async (data) => {
  const report = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: data.title,
    content: data.content,
    author: data.author,
    meta: data.meta || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryReports.unshift(report);
  return report;
};

export const getReports = async (filter = {}, options = {}) => {
  return memoryReports;
};

export const getReportById = async (id) => {
  return memoryReports.find((r) => r.id === id) || null;
};

export const updateReport = async (id, data) => {
  const index = memoryReports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  memoryReports[index] = { ...memoryReports[index], ...data, updatedAt: new Date() };
  return memoryReports[index];
};

export const deleteReport = async (id) => {
  const index = memoryReports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const deleted = memoryReports.splice(index, 1);
  return deleted[0];
};

export const getGlobalAnalytics = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentAttendanceCount = await prisma.attendanceRecord.count({
    where: {
      createdAt: { gte: oneWeekAgo },
    },
  });

  const totalTasks = await prisma.task.count();
  const totalStudents = await prisma.userRoleAssignment.count({
    where: { role: "STUDENT" },
  });
  const totalSubmissions = await prisma.submission.count();

  let submissionRate = 0;
  if (totalTasks > 0 && totalStudents > 0) {
    submissionRate = Math.min(
      Math.round((totalSubmissions / (totalTasks * totalStudents)) * 100),
      100
    );
  } else if (totalSubmissions > 0) {
    submissionRate = 100;
  }

  return {
    recentAttendanceCount,
    totalTasks,
    totalStudents,
    totalSubmissions,
    submissionRate,
  };
};
