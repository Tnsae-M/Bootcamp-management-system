import express from "express";
import * as divisionController from "./division.controller.js";
import {
  validateCreateDivision,
  validateUpdateDivision,
} from "./division.validator.js";
import * as bootcampController from "../bootcamps/bootcamp.controller.js";
import { authGuard, roleGuard } from "../../middleware/role.guard.js";

const router = express.Router();

router.post("/", authGuard, roleGuard("SUPER_ADMIN"), divisionController.createDivision);
//get divisions can be accessed by every role since their will be a division icon on the sidebar for every user to click and view the bootcamps under that division.
router.get("/", authGuard, divisionController.getDivisions);
router.get("/:id", authGuard, divisionController.getDivisionById);
router.put(
  "/:id",
  authGuard,
  roleGuard("SUPER_ADMIN"),
  validateUpdateDivision,
  divisionController.updateDivision,
);
router.delete("/:id", authGuard, roleGuard("SUPER_ADMIN"), divisionController.deleteDivision);
router.get(
  "/:divisionId/bootcamps",
  authGuard,
  bootcampController.getBootcampsByDivision,
);
export default router;
