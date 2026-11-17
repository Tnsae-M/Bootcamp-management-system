import { Router } from "express";
import {
  createBootcamp,
  getBootcamps,
  getBootcampById,
  updateStatus,
  updateWeights,
  screenApplicant,
} from "./bootcamp.controller.js";
import { authGuard } from "../../middleware/role.guard.js";
import { scopeGuard } from "../../middleware/scope.guard.js";
import prisma from "../../config/prisma.js";

const router = Router();

// Public: Guests can browse open bootcamps
router.get("/", getBootcamps);
router.get("/:id", getBootcampById);

// Create bootcamp: Requires DIVISION_ADMIN for target division
router.post(
  "/",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: (req) => req.body.divisionId,
  }),
  createBootcamp
);

// Status transition: Requires DIVISION_ADMIN for bootcamp's division
router.put(
  "/:id/status",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: async (req) => {
      const bc = await prisma.bootcamp.findUnique({
        where: { id: req.params.id },
        select: { divisionId: true },
      });
      return bc?.divisionId;
    },
  }),
  updateStatus
);

// Weights update: Requires DIVISION_ADMIN
router.put(
  "/:id/weights",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: async (req) => {
      const bc = await prisma.bootcamp.findUnique({
        where: { id: req.params.id },
        select: { divisionId: true },
      });
      return bc?.divisionId;
    },
  }),
  updateWeights
);

// Screening applicant: Requires DIVISION_ADMIN
router.post(
  "/:id/screen",
  authGuard,
  scopeGuard({
    requiredRole: "DIVISION_ADMIN",
    scopeType: "DIVISION",
    resolveScopeId: async (req) => {
      const bc = await prisma.bootcamp.findUnique({
        where: { id: req.params.id },
        select: { divisionId: true },
      });
      return bc?.divisionId;
    },
  }),
  screenApplicant
);

export default router;
