import { Router } from "express";
import {
  createIncident,
  getIncidents,
  updateIncidentStatus,
} from "../controllers/incident.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const incidentRouter = Router();

// Employee: Report incident
incidentRouter.post(
  "/",
  authMiddleware,
  restrictTo("employee", "cashier", "owner"),
  createIncident,
);

// Owner: View/Manage
incidentRouter.get("/", authMiddleware, restrictTo("owner"), getIncidents);
incidentRouter.patch(
  "/:id",
  authMiddleware,
  restrictTo("owner"),
  updateIncidentStatus,
);

export default incidentRouter;
