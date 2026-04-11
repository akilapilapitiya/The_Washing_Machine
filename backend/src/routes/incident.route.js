import { Router } from "express";
import {
  createIncident,
  getIncidents,
  updateIncidentStatus,
} from "../controllers/incident.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const incidentRouter = Router();

// Protected routes
incidentRouter.use(authMiddleware);

incidentRouter.post(
  "/",
  restrictTo("employee", "cashier", "owner"),
  createIncident,
);

incidentRouter.get(
  "/",
  restrictTo("owner", "cashier", "manager", "employee"),
  getIncidents,
);
incidentRouter.patch(
  "/:id",
  restrictTo("owner", "cashier", "manager"),
  updateIncidentStatus,
);

export default incidentRouter;
