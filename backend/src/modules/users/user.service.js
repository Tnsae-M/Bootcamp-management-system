import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import { sanitizeUser } from "./user.sanitize.js";

const buildError = (msg, statusCode = 400) => {
  const err = new Error(msg);
  err.statusCode = statusCode;
  return err;
};

export const createUser = async (userData) => {
  const email = (userData.email || "").toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw buildError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(userData.password || "Password123!", 10);
  const roles = userData.roles || (userData.role ? [userData.role] : ["STUDENT"]);

  const user = await prisma.user.create({
    data: {
      fullName: userData.fullName || userData.name || "Unnamed User",
      email,
      passwordHash,
      department: userData.department || null,
      universityId: userData.universityId || null,
      telegramUsername: userData.telegramUsername || null,
      isEmailVerified: true,
      roleAssignments: {
        create: roles.map((r) => ({
          role: r === "SUPER ADMIN" ? "SUPER_ADMIN" : r,
          scopeType: "GLOBAL",
        })),
      },
    },
    include: { roleAssignments: true },
  });

  const sanitized = sanitizeUser({
    ...user,
    _id: user.id,
    name: user.fullName,
    roles: Array.from(new Set(user.roleAssignments.map((a) => a.role))),
  });

  return {
    ...sanitized,
    id: user.id,
    fullName: user.fullName,
    universityId: user.universityId,
    department: user.department,
    telegramUsername: user.telegramUsername,
  };
};

export const getAllUsers = async (filter = {}) => {
  const users = await prisma.user.findMany({
    include: { roleAssignments: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => {
    const sanitized = sanitizeUser({
      ...u,
      _id: u.id,
      name: u.fullName,
      roles: Array.from(new Set(u.roleAssignments.map((a) => a.role))),
    });
    return {
      ...sanitized,
      id: u.id,
      fullName: u.fullName,
      universityId: u.universityId,
      department: u.department,
      telegramUsername: u.telegramUsername,
    };
  });
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roleAssignments: true },
  });

  if (!user) {
    throw buildError("User not found", 404);
  }

  const sanitized = sanitizeUser({
    ...user,
    _id: user.id,
    name: user.fullName,
    roles: Array.from(new Set(user.roleAssignments.map((a) => a.role))),
  });

  return {
    ...sanitized,
    id: user.id,
    fullName: user.fullName,
    universityId: user.universityId,
    department: user.department,
    telegramUsername: user.telegramUsername,
  };
};

export const updateUser = async (userId, updateData) => {
  const data = {};
  if (updateData.name || updateData.fullName) data.fullName = updateData.name || updateData.fullName;
  if (updateData.department !== undefined) data.department = updateData.department;
  if (updateData.universityId !== undefined) data.universityId = updateData.universityId;
  if (updateData.telegramUsername !== undefined) data.telegramUsername = updateData.telegramUsername;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { roleAssignments: true },
  });

  const sanitized = sanitizeUser({
    ...user,
    _id: user.id,
    name: user.fullName,
    roles: Array.from(new Set(user.roleAssignments.map((a) => a.role))),
  });

  return {
    ...sanitized,
    id: user.id,
    fullName: user.fullName,
    universityId: user.universityId,
    department: user.department,
    telegramUsername: user.telegramUsername,
  };
};

export const deleteUser = async (userId) => {
  const user = await prisma.user.delete({
    where: { id: userId },
    include: { roleAssignments: true },
  });

  const sanitized = sanitizeUser({
    ...user,
    _id: user.id,
    name: user.fullName,
    roles: Array.from(new Set(user.roleAssignments.map((a) => a.role))),
  });

  return {
    ...sanitized,
    id: user.id,
    fullName: user.fullName,
    universityId: user.universityId,
    department: user.department,
    telegramUsername: user.telegramUsername,
  };
};
