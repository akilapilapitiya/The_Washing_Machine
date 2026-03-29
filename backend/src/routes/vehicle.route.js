import { Router } from "express";
import {
  createVehicle,
  getCustomerVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  recordServiceSnapshot,
} from "../controllers/vehicle.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { vehicleValidator } from "../validators/index.js";

const vehicleRouter = Router();

// Protected routes
vehicleRouter.use(authMiddleware);
vehicleRouter.get("/:id", getVehicle);
vehicleRouter.post(
  "/",
  restrictTo("customer"),
  validateSchema(vehicleValidator.createVehicle),
  createVehicle,
);
vehicleRouter.delete("/:id", restrictTo("customer"), deleteVehicle);
vehicleRouter.put(
  "/:id/service-snapshot",
  restrictTo("employee", "cashier", "owner"),
  recordServiceSnapshot,
);
vehicleRouter.put(
  "/:id",
  restrictTo("employee"),
  validateSchema(vehicleValidator.updateVehicle),
  updateVehicle,
);
vehicleRouter.get(
  "/",
  restrictTo("customer", "manager", "owner"),
  getCustomerVehicles,
);

export default vehicleRouter;
