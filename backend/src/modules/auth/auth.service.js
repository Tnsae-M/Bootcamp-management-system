import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "2h";
const REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Registers a new user via public sign-up with default GUEST role.
 */
export const registerGuest = async (input, deps = {}) => {
  const { fullName, email, password, universityId, department, telegramUsername } = input;

  if (!fullName || !email || !password) {
    const error = new Error("Full name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (!validateEmail(email)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters long");
    error.statusCode = 400;
    throw error;
  }

  if (!/\d/.test(password)) {
    const error = new Error("Password must contain at least one number");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate
  if (deps.db) {
    const existing = deps.db.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }
  } else if (prisma) {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const defaultRoleAssignments = [
    { role: "GUEST", scopeType: "GLOBAL", scopeId: null },
  ];

  let newUser;

  if (deps.db) {
    const userId = `usr_${Date.now()}`;
    newUser = {
      id: userId,
      fullName,
      email: normalizedEmail,
      universityId: universityId || null,
      department: department || null,
      telegramUsername: telegramUsername || null,
      roleAssignments: defaultRoleAssignments,
      createdAt: new Date(),
    };
    deps.db.push({ ...newUser, passwordHash });
  } else {
    newUser = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        passwordHash,
        universityId: universityId || null,
        department: department || null,
        telegramUsername: telegramUsername || null,
        roleAssignments: {
          create: {
            role: "GUEST",
            scopeType: "GLOBAL",
          },
        },
      },
      include: {
        roleAssignments: true,
      },
    });
  }

  const userId = newUser.id;
  const roleAssignments = newUser.roleAssignments || defaultRoleAssignments;
  const roles = roleAssignments.map((a) => a.role);

  const accessToken = jwt.sign(
    { userId, email: normalizedEmail, roles, roleAssignments },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { userId, email: normalizedEmail, roles, roleAssignments },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  const { passwordHash: _, passwordResetToken: __, ...sanitized } = newUser;

  return {
    user: sanitized,
    tokens: { accessToken, refreshToken },
  };
};

export const registerUser = async (name, email, password, role) => {
  return registerGuest({
    fullName: name,
    email,
    password,
  });
};

/**
 * Authenticates user credentials and returns tokens
 */
export const loginUser = async (email, password, deps = {}) => {
  if (!email || !password) {
    const err = new Error("Email and password are required.");
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user;
  if (deps.db) {
    user = deps.db.find((u) => u.email.toLowerCase() === normalizedEmail);
  } else if (prisma) {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { roleAssignments: true },
    });
  }

  if (!user) {
    const err = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const err = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  const roleAssignments = user.roleAssignments || [];
  const roles = roleAssignments.map((a) => a.role);

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, roles, roleAssignments },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email, roles, roleAssignments },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  const { passwordHash, passwordResetToken, ...sanitized } = user;

  return {
    user: sanitized,
    tokens: { accessToken, refreshToken },
  };
};

/**
 * Retrieves the current logged in user
 */
export const currentUser = async (userId, deps = {}) => {
  if (!userId) {
    const err = new Error("User ID is required");
    err.statusCode = 400;
    throw err;
  }

  let user;
  if (deps.db) {
    user = deps.db.find((u) => u.id === userId);
  } else if (prisma) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roleAssignments: true },
    });
  }

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const { passwordHash, passwordResetToken, ...sanitized } = user;
  return sanitized;
};
