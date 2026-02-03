import { Router } from "express";
import {
  deleteCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  updateProfilePicture,
  changePassword,
} from "../controllers/customer.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { customerValidator } from "../validators/index.js";
import { uploadProfilePicture } from "../middleware/upload.middleware.js";

const customerRouter = Router();

// Public/Shared routes (Own profile access or restricted roles)
customerRouter.get(
  "/:cusid",
  authMiddleware,
  restrictTo("owner", "cashier", "customer"),
  getCustomer,
);
customerRouter.put(
  "/:cusid",
  authMiddleware,
  restrictTo("owner", "customer"),
  validateSchema(customerValidator.updateCustomer),
  updateCustomer,
);
customerRouter.patch(
  "/:cusid/profile-picture",
  authMiddleware,
  restrictTo("owner", "customer"),
  uploadProfilePicture.single("profile_picture"),
  updateProfilePicture,
);
customerRouter.patch(
  "/:cusid/change-password",
  authMiddleware,
  restrictTo("owner", "customer"),
  changePassword,
);

// Administrative only
customerRouter.get(
  "/",
  authMiddleware,
  restrictTo("owner", "cashier"),
  getAllCustomers,
);
customerRouter.delete(
  "/:cusid",
  authMiddleware,
  restrictTo("customer"),
  deleteCustomer,
); // Only self-deletion or remove completely if handled by blocking

export default customerRouter;
