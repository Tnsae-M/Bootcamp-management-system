import prisma from "../../config/prisma.js";

export const logActivity = async (data) => {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: data.actorId || data.userId || data.user,
        action: data.action || data.type || "ACTIVITY",
        targetType: data.targetType || "SYSTEM",
        targetId: data.targetId || "none",
        metadata: data.metadata || data.details || {},
      },
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
};

export const getActivities = async (limit = 20) => {
  return await prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          email: true,
          department: true,
        },
      },
    },
  });
};
