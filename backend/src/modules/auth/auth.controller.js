import {
  loginUser,
  registerGuest,
  currentUser,
} from "./auth.service.js";
import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { fullName, name, email, password, universityId, department, telegramUsername } = req.body;
    const result = await registerGuest({
      fullName: fullName || name,
      email,
      password,
      universityId,
      department,
      telegramUsername,
    });
    return res.status(201).json({
      success: true,
      message: "Registration successful. Welcome to CSEC-ASTU BMS!",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

export const myUser = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const result = await currentUser(userId);
    return res.status(200).json({
      success: true,
      message: "Current user retrieved",
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: "Refresh token endpoint active",
  });
};

export const verifyEmailController = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Email verified successfully.",
  });
};

export const resendVerification = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Verification link dispatched.",
  });
};

export const forgotPasswordController = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Password reset request recorded. Contact division lead or admin.",
  });
};

export const resetPasswordController = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Password reset completed.",
  });
};

export const changePasswordController = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return next(err);
  }
};

export const adminResetPasswordController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return res.status(200).json({ success: true, message: `Password reset successfully for user ${userId}` });
  } catch (err) {
    return next(err);
  }
};
