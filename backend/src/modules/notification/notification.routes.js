import { Router } from "express";
import { getMyNotifications, markRead } from "./notification.controllers.js";
import { authGuard } from "../../middleware/role.guard.js";

const router = Router();

// User views own notifications
router.get("/", authGuard, getMyNotifications);

// Mark notification as read
router.put("/:id/read", authGuard, markRead);

export default router;
