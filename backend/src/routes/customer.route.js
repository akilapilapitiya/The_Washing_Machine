import { Router } from "express";
import { deleteCustomer, getAllCustomers, getCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const customerRouter = Router();

// Protect all customer routes; employees only
customerRouter.use(authMiddleware, restrictTo("employee"));

customerRouter.get("/", getAllCustomers);
customerRouter.get("/:cusid", getCustomer);
customerRouter.put("/:cusid", updateCustomer);
customerRouter.delete("/:cusid", deleteCustomer);

export default customerRouter;
