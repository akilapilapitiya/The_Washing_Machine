import { Router } from "express";
import {
  createVehicle,
  getCustomerVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const vehicleRouter = Router();

vehicleRouter.use(authMiddleware, restrictTo("customer"));
vehicleRouter.get("/:vehid", getVehicle);
vehicleRouter.post("/", createVehicle);
vehicleRouter.get("/", getCustomerVehicles);
vehicleRouter.put("/:vehid", updateVehicle);
vehicleRouter.delete("/:vehid", deleteVehicle);

export default vehicleRouter;
