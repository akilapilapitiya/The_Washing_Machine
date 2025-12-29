import { Router } from "express";
import {
  createVehicle,
  getCustomerVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { vehicleValidator } from "../validators/index.js";

const vehicleRouter = Router();

vehicleRouter.use(authMiddleware);
vehicleRouter.get("/:vehid", getVehicle);
//Customer only routes
vehicleRouter.post("/", restrictTo("customer"), validateSchema(vehicleValidator.createVehicle), createVehicle);
vehicleRouter.delete("/:vehid", restrictTo("customer"), deleteVehicle);
//Employee only routes - Update mileage
vehicleRouter.put("/:vehid", restrictTo("employee"), validateSchema(vehicleValidator.updateVehicle), updateVehicle);
//Customer owner and Manager Routes
vehicleRouter.get("/", restrictTo("customer", "manager", "owner"), getCustomerVehicles);


export default vehicleRouter;
