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
import { uploadServiceImage } from "../middleware/upload.middleware.js";
import { parseServiceFormData } from "../middleware/transform.middleware.js";

import { cacheMiddleware } from "../middleware/cache.middleware.js";

const serviceRouter = Router();

// Public routes
serviceRouter.get("/", cacheMiddleware(3600), getAllServices);
serviceRouter.get("/:serviceid", cacheMiddleware(3600), getService);

// Protected routes
serviceRouter.use(authMiddleware, restrictTo("manager", "owner"));

serviceRouter.post(
  "/",
  uploadServiceImage.single("image"),
  parseServiceFormData,
  validateSchema(serviceValidator.createService),
  createService,
);

serviceRouter.put(
  "/:serviceid",
  uploadServiceImage.single("image"),
  parseServiceFormData,
  validateSchema(serviceValidator.updateService),
  updateService,
);

serviceRouter.delete("/:serviceid", deleteService);

export default serviceRouter;
