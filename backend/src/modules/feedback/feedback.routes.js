import { Router } from "express";
import {
  submitSessionFeedback,
  submitPeerReview,
  getSessionFeedbacks,
} from "./feedback.controller.js";
import { authGuard } from "../../middleware/role.guard.js";

const router = Router();

// Student submits session feedback (window: 48h post-session)
router.post("/session", authGuard, submitSessionFeedback);

// Student submits peer review for group teammate (window: 72h post-milestone)
router.post("/peer-review", authGuard, submitPeerReview);

// Instructors/Admins view anonymous session feedback
router.get("/session/:sessionId", authGuard, getSessionFeedbacks);

export default router;
