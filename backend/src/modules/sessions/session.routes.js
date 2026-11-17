import express from "express";
import * as sessionController from "./session.controller.js";
import { authGuard } from "../../middleware/role.guard.js";
import { scopeGuard } from "../../middleware/scope.guard.js";
import prisma from "../../config/prisma.js";

const router = express.Router();

// List sessions (enrolled students, instructors, admins)
router.get("/", authGuard, sessionController.getSessions);
router.get("/:id", authGuard, sessionController.getSessionById);
router.get("/bootcamp/:bootcampId", authGuard, sessionController.getSessionsByBootcamp);

// Propose session: Requires INSTRUCTOR for target bootcamp
router.post(
  "/propose",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: (req) => req.body.bootcampId,
  }),
  sessionController.propose
);

// Approve session: Requires DIVISION_ADMIN for the session's bootcamp division
router.put(
  "/:id/approve",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: async (req) => {
      const session = await prisma.session.findUnique({
        where: { id: req.params.id },
        include: { bootcamp: true },
      });
      return session?.bootcamp?.divisionId;
    },
  }),
  sessionController.approve
);

// Reject session: Requires DIVISION_ADMIN
router.put(
  "/:id/reject",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: async (req) => {
      const session = await prisma.session.findUnique({
        where: { id: req.params.id },
        include: { bootcamp: true },
      });
      return session?.bootcamp?.divisionId;
    },
  }),
  sessionController.reject
);

// Cancel session: Requires INSTRUCTOR or DIVISION_ADMIN
router.put("/:id/cancel", authGuard, sessionController.cancel);

export default router;
