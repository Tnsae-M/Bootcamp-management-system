import { Router } from "express";
import {
  apply,
  getBootcampEnrollments,
  getMyEnrollments,
} from "./enrollment.controller.js";
import { authGuard } from "../../middleware/role.guard.js";
import { scopeGuard } from "../../middleware/scope.guard.js";
import prisma from "../../config/prisma.js";

const router = Router();

// Guest applies to bootcamp
router.post("/apply", authGuard, apply);
router.post("/", authGuard, apply);

// Student views own enrollments
router.get("/me", authGuard, getMyEnrollments);

// Division Admin views applicants and enrolled students for bootcamp
router.get(
  "/bootcamp/:id",
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
  getBootcampEnrollments
);

export default router;
