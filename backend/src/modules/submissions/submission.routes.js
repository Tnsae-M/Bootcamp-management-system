import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  submitTask,
  gradeSubmission,
  returnSubmission,
  getSubmissionsByTask,
  getMySubmissions,
} from "./submission.controller.js";
import { authGuard } from "../../middleware/role.guard.js";
import { scopeGuard } from "../../middleware/scope.guard.js";
import prisma from "../../config/prisma.js";

// Local filesystem upload config (100% free stack)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per SRS
});

const router = Router();

// Student submits task
router.post("/", authGuard, upload.single("file"), submitTask);

// Student views own submissions
router.get("/me", authGuard, getMySubmissions);

// View submissions for a task (Instructor)
router.get("/task/:taskId", authGuard, getSubmissionsByTask);

// Grade submission: Requires INSTRUCTOR
router.post(
  "/:id/grade",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: async (req) => {
      const sub = await prisma.submission.findUnique({
        where: { id: req.params.id },
        include: { task: true },
      });
      return sub?.task?.bootcampId;
    },
  }),
  gradeSubmission
);

// Return submission for revision: Requires INSTRUCTOR
router.post(
  "/:id/return",
  authGuard,
  scopeGuard({
    requiredRole: "INSTRUCTOR",
    scopeType: "BOOTCAMP",
    resolveScopeId: async (req) => {
      const sub = await prisma.submission.findUnique({
        where: { id: req.params.id },
        include: { task: true },
      });
      return sub?.task?.bootcampId;
    },
  }),
  returnSubmission
);

export default router;
