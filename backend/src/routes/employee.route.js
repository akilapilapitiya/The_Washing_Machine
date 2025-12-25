import { Router } from "express";
import {
  deleteEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
} from "../controllers/employee.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const employeeRouter = Router();

// Protect all employee routes; employees only
employeeRouter.use(authMiddleware, restrictTo("employee"));

employeeRouter.get("/", getAllEmployees);
employeeRouter.get("/:empid", getEmployee);
employeeRouter.put("/:empid", updateEmployee);
employeeRouter.delete("/:empid", deleteEmployee);

export default employeeRouter;
