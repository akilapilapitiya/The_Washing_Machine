import { Router } from "express";
import {
  getCatalog,
  addToCatalog,
  removeFromCatalog,
} from "../controllers/vehicleCatalog.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";

const catalogRouter = Router();

// Protected routes
catalogRouter.use(authMiddleware);

catalogRouter.get("/", cacheMiddleware(3600), getCatalog);

catalogRouter.post("/", restrictTo("owner"), addToCatalog);
catalogRouter.delete("/:id", restrictTo("owner"), removeFromCatalog);

export default catalogRouter;
