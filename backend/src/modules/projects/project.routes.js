import { Router } from "express";
import { getProjectsByBootcamp, createProject } from "./project.controller.js";
import { authGuard, roleGuard } from "../../middleware/role.guard.js";

const router = Router();

router.get("/bootcamp/:bootcampId", authGuard, getProjectsByBootcamp);
router.post("/", authGuard, roleGuard(["ADMIN", "INSTRUCTOR", "STUDENT"]), createProject);

export default router;
