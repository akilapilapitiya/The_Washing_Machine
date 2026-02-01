import { Router } from "express";
import {
  deleteCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  updateProfilePicture,
} from "../controllers/customer.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { customerValidator } from "../validators/index.js";
import { uploadProfilePicture } from "../middleware/upload.middleware.js";

const customerRouter = Router();

// Protect all customer routes; allow employees and customers
customerRouter.use(authMiddleware, restrictTo("employee", "customer"));

customerRouter.get("/", getAllCustomers);
customerRouter.get("/:cusid", getCustomer);
customerRouter.put(
  "/:cusid",
  validateSchema(customerValidator.updateCustomer),
  updateCustomer,
);
customerRouter.patch(
  "/:cusid/profile-picture",
  uploadProfilePicture.single("profile_picture"),
  updateProfilePicture,
);
customerRouter.delete("/:cusid", deleteCustomer);

export default customerRouter;
