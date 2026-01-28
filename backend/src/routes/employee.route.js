import express from "express";
import {
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getAvailableEmployees,
} from "../controllers/employee.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.use(authMiddleware);

router.get("/", restrictTo("manager", "owner", "customer"), getAllEmployees);
router.get(
  "/available",
  restrictTo("manager", "owner", "customer"),
  getAvailableEmployees,
); // /api/employee/available
router.get("/:id", restrictTo("manager", "owner", "customer"), getEmployee);
router.put("/:id", restrictTo("manager", "owner"), updateEmployee);
router.delete("/:id", restrictTo("manager", "owner"), deleteEmployee);

export default router;
