import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./task.controller.js";
import { authGuard } from "../../middleware/role.guard.js";
import { scopeGuard } from "../../middleware/scope.guard.js";
import prisma from "../../config/prisma.js";

const router = Router();

// Enrolled students and instructors can read tasks
router.get("/", authGuard, getTasks);
router.get("/:id", authGuard, getTaskById);

// Instructor creates task for bootcamp
router.post(
  "/",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: (req) => req.body.bootcampId,
  }),
  createTask
);

// Instructor updates task
router.put(
  "/:id",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: async (req) => {
      const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        select: { bootcampId: true },
      });
      return task?.bootcampId;
    },
  }),
  updateTask
);

// Instructor deletes task
router.delete(
  "/:id",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: async (req) => {
      const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        select: { bootcampId: true },
      });
      return task?.bootcampId;
    },
  }),
  deleteTask
);

export default router;
