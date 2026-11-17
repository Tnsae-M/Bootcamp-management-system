import prisma from "../../config/prisma.js";

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createDivision = async (payload) => {
  const existingDivision = await prisma.division.findUnique({
    where: { name: payload.name },
  });

  if (existingDivision) {
    throw buildError("Division name already exists.", 409);
  }

  const slug = payload.slug || payload.name.toLowerCase().replace(/\s+/g, "-");

  return await prisma.division.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description || null,
    },
  });
};

export const getDivisions = async () => {
  return await prisma.division.findMany({
    where: { isArchived: false },
    include: {
      _count: { select: { bootcamps: true } },
    },
    orderBy: { name: "asc" },
  });
};

export const getDivisionById = async (divisionId) => {
  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    include: {
      bootcamps: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!division) throw buildError("Division not found.", 404);
  return division;
};

export const updateDivision = async (divisionId, payload) => {
  const existing = await prisma.division.findUnique({ where: { id: divisionId } });
  if (!existing) throw buildError("Division not found.", 404);

  return await prisma.division.update({
    where: { id: divisionId },
    data: payload,
  });
};

export const deleteDivision = async (divisionId) => {
  return await prisma.division.update({
    where: { id: divisionId },
    data: { isArchived: true },
  });
};
