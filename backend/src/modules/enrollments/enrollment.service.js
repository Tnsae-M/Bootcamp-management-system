import prisma from "../../config/prisma.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Enrolls a user into a bootcamp using Prisma transaction
 */
export const enrollUser = async (userId, bootcampId, deps = {}) => {
  const client = deps.prisma || prisma;

  return await client.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw buildError("User not found", 404);

    const bootcamp = await tx.bootcamp.findUnique({ where: { id: bootcampId } });
    if (!bootcamp) throw buildError("Bootcamp not found", 404);

    const existing = await tx.enrollment.findUnique({
      where: { userId_bootcampId: { userId, bootcampId } },
    });
    if (existing) throw buildError("Already enrolled", 409);

    if (bootcamp.divisionId && !user.department) {
      await tx.user.update({
        where: { id: userId },
        data: { department: bootcamp.divisionId },
      });
      user.department = bootcamp.divisionId;
    }

    const enrollment = await tx.enrollment.create({
      data: {
        userId,
        bootcampId,
        status: "STUDENT",
      },
    });

    return enrollment;
  });
};

/**
 * Guest applies to an OPEN bootcamp
 */
export const applyToBootcamp = async ({
  userId,
  bootcampId,
  motivation,
  experience,
  portfolioUrl,
}) => {
  const bootcamp = await prisma.bootcamp.findUnique({ where: { id: bootcampId } });
  if (!bootcamp) throw buildError("Bootcamp not found", 404);

  if (bootcamp.status !== "OPEN") {
    throw buildError("Applications are not currently open for this bootcamp", 422);
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_bootcampId: { userId, bootcampId } },
  });
  if (existing) throw buildError("You have already applied to this bootcamp", 409);

  return await prisma.enrollment.create({
    data: {
      userId,
      bootcampId,
      status: "APPLICANT",
      motivation: motivation || null,
      experience: experience || null,
      portfolioUrl: portfolioUrl || null,
    },
    include: {
      bootcamp: { select: { id: true, title: true, division: true } },
    },
  });
};

export const getBootcampEnrollments = async (bootcampId, status) => {
  const where = { bootcampId };
  if (status) where.status = status;

  return await prisma.enrollment.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          universityId: true,
          department: true,
          telegramUsername: true,
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });
};

export const getMyEnrollments = async (userId) => {
  return await prisma.enrollment.findMany({
    where: { userId },
    include: {
      bootcamp: {
        include: {
          division: true,
          _count: { select: { sessions: true, tasks: true } },
        },
      },
      inductionDecision: true,
    },
    orderBy: { appliedAt: "desc" },
  });
};

export const updateEnrollmentStatus = async (enrollmentId, status) => {
  return await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status },
  });
};
