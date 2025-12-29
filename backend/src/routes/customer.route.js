import { Router } from "express";
import {
  deleteCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
} from "../controllers/customer.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { customerValidator } from "../validators/index.js";

const customerRouter = Router();

// Protect all customer routes; employees only
customerRouter.use(authMiddleware, restrictTo("employee"));

customerRouter.get("/", getAllCustomers);
customerRouter.get("/:cusid", getCustomer);
customerRouter.put("/:cusid", validateSchema(customerValidator.updateCustomer), updateCustomer);
customerRouter.delete("/:cusid", deleteCustomer);

export default customerRouter;
