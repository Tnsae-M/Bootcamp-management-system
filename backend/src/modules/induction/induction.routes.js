import { Router } from "express";
import { getLeaderboard, recordDecision } from "./induction.controller.js";
import { authGuard } from "../../middleware/role.guard.js";
import { scopeGuard } from "../../middleware/scope.guard.js";
import prisma from "../../config/prisma.js";

const router = Router();

// Get ranked leaderboard: Requires DIVISION_ADMIN
router.get(
  "/leaderboard/:bootcampId",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: async (req) => {
      const bc = await prisma.bootcamp.findUnique({
        where: { id: req.params.bootcampId },
        select: { divisionId: true },
      });
      return bc?.divisionId;
    },
  }),
  getLeaderboard
);

// Record human induction decision: Requires DIVISION_ADMIN
router.post(
  "/decide",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: async (req) => {
      const enr = await prisma.enrollment.findUnique({
        where: { id: req.body.enrollmentId },
        include: { bootcamp: true },
      });
      return enr?.bootcamp?.divisionId;
    },
  }),
  recordDecision
);

export default router;

