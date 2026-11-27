import { Router } from "express";
import {
  createGroup,
  getGroupsByBootcamp,
  assignLeader,
  addMember,
  removeMember,
} from "./group.controller.js";
import { authGuard } from "../../middleware/role.guard.js";

const router = Router();

// Student creates group in bootcamp
router.post("/", authGuard, createGroup);

// View groups in bootcamp
router.get("/bootcamp/:bootcampId", authGuard, getGroupsByBootcamp);

// Assign or transfer group leader
router.put("/:id/leader", authGuard, assignLeader);

// Add member to group
router.post("/:id/members", authGuard, addMember);

// Remove member from group
router.delete("/:id/members/:userId", authGuard, removeMember);

export default router;
