import express from "express";
import {
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getAvailableEmployees,
  updateProfilePicture,
  changePassword,
  getRoles,
} from "../controllers/employee.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { uploadProfilePicture } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  restrictTo("manager", "owner", "customer", "employee", "cashier"),
  getAllEmployees,
);
router.get("/roles", restrictTo("manager", "owner", "cashier"), getRoles);
router.get(
  "/available",
  restrictTo("manager", "owner", "customer"),
  getAvailableEmployees,
); // /api/employee/available
router.get(
  "/:id",
  restrictTo("manager", "owner", "customer", "employee", "cashier"),
  getEmployee,
);
router.patch(
  "/:id/profile-picture",
  restrictTo("manager", "owner", "employee", "cashier"),
  uploadProfilePicture.single("profile_picture"),
  updateProfilePicture,
);
router.patch(
  "/:id/change-password",
  restrictTo("manager", "owner", "employee", "cashier"),
  changePassword,
);
router.put(
  "/:id",
  restrictTo("manager", "owner", "employee", "cashier"),
  updateEmployee,
);
router.delete("/:id", restrictTo("manager", "owner"), deleteEmployee);

export default router;
