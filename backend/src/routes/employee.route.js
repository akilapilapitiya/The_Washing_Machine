import { Router } from "express";
import {
  deleteEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
} from "../controllers/employee.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { employeeValidator } from "../validators/index.js";

const employeeRouter = Router();

// Protect all employee routes
employeeRouter.use(authMiddleware);

employeeRouter.get("/:empid", restrictTo("employee", "owner"), getEmployee);
employeeRouter.put(
  "/:empid",
  restrictTo("employee", "owner"),
  validateSchema(employeeValidator.updateEmployee),
  updateEmployee,
);

// VIEW ALL: Accessible to all authenticated users (needed for booking flow)
employeeRouter.get("/", getAllEmployees);

// DELETE: Owner only
employeeRouter.delete("/:empid", restrictTo("owner"), deleteEmployee);
export default employeeRouter;

/*STRUCTURRE OF EMPLOYEE ROUTES
Only the owner can view all employees and delete employees
*/
