import prisma from "../../config/prisma.js";
import User from "../users/user.model.js";
import Bootcamp from "../bootcamps/bootcamp.model.js";
import Enrollment from "./enrollment.model.js";
import mongoose from "mongoose";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

export const enrollUser = async (userId, bootcampId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw buildError("User not found", 404);

    const bootcamp = await Bootcamp.findById(bootcampId).session(session);
    if (!bootcamp) throw buildError("Bootcamp not found", 404);

    const existing = await Enrollment.findOne({ userId, bootcampId }).session(session);
    if (existing) throw buildError("Already enrolled", 409);

    if (bootcamp.divisionId && !user.divisionId) {
      user.divisionId = bootcamp.divisionId;
      await user.save({ session });
    }

    const enrollment = await Enrollment.create(
      [{ userId, bootcampId }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return enrollment[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
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
