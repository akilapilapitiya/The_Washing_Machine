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

// Protected routes
customerRouter.use(authMiddleware);

customerRouter.get(
  "/:cusid",
  restrictTo("owner", "cashier", "customer"),
  getCustomer,
);
customerRouter.put(
  "/:cusid",
  restrictTo("owner", "customer"),
  validateSchema(customerValidator.updateCustomer),
  updateCustomer,
);
customerRouter.patch(
  "/:cusid/profile-picture",
  restrictTo("owner", "customer"),
  uploadProfilePicture.single("profile_picture"),
  updateProfilePicture,
);
customerRouter.patch(
  "/:cusid/change-password",
  restrictTo("owner", "customer"),
  changePassword,
);
customerRouter.get("/", restrictTo("owner", "cashier"), getAllCustomers);
customerRouter.delete("/:cusid", restrictTo("customer"), deleteCustomer);

export default customerRouter;
