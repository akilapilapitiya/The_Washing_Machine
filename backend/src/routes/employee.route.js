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
employeeRouter.get("/:empid", getEmployee);
employeeRouter.put("/:empid", updateEmployee);

// PROTECTED ROUTES - Owner only
employeeRouter.get("/", restrictTo('owner'), getAllEmployees); 
employeeRouter.delete("/:empid", restrictTo('owner'), deleteEmployee);
export default employeeRouter;


/*STRUCTURRE OF EMPLOYEE ROUTES
Only the owner can view all employees and delete employees
*/