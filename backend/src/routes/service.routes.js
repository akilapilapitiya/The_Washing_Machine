import { Router } from "express";
import {
  createService,
  getAllServices,
  getService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { serviceValidator } from "../validators/index.js";

const serviceRouter = Router();

// GET services (public - no auth required)
serviceRouter.get("/", getAllServices);
serviceRouter.get("/:serviceid", getService);

// POST, PUT, DELETE - only managers and owners can manage services
serviceRouter.use(authMiddleware, restrictTo("manager", "owner"));

// PROTECTED ROUTE - Manager/Owner only
serviceRouter.post("/", validateSchema(serviceValidator.createService), createService);
serviceRouter.put("/:serviceid", validateSchema(serviceValidator.updateService), updateService);
serviceRouter.delete("/:serviceid", deleteService);

export default serviceRouter;
