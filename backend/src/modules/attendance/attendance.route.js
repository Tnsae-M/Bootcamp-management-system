import { Router } from "express";
import {
  openWindow,
  submitCode,
  overrideAttendance,
  getSessionAttendance,
  getMyAttendance,
} from "./attendance.controller.js";
import { authGuard } from "../../middleware/role.guard.js";
import { scopeGuard } from "../../middleware/scope.guard.js";
import prisma from "../../config/prisma.js";

const router = Router();

// Student submits code (requires login)
router.post("/submit", authGuard, submitCode);
router.post("/", authGuard, submitCode);

// Student views own attendance
router.get("/me", authGuard, getMyAttendance);

// Instructor opens attendance window
router.post(
  "/open-window",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: async (req) => {
      const session = await prisma.session.findUnique({
        where: { id: req.body.sessionId },
        select: { bootcampId: true },
      });
      return session?.bootcampId;
    },
  }),
  openWindow
);

// Override attendance record (Instructor or Admin)
router.post(
  "/override",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: async (req) => {
      const session = await prisma.session.findUnique({
        where: { id: req.body.sessionId },
        select: { bootcampId: true },
      });
      return session?.bootcampId;
    },
  }),
  overrideAttendance
);

// View attendance summary for session
router.get("/session/:sessionId", authGuard, getSessionAttendance);

export default router;
