import { Router } from "express";
import {
  getCatalog,
  addToCatalog,
  removeFromCatalog,
} from "../controllers/vehicleCatalog.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";

const catalogRouter = Router();

// Public/Auth: Get catalog
catalogRouter.get("/", authMiddleware, cacheMiddleware(3600), getCatalog);

// Owner Only: Manage catalog
catalogRouter.post("/", authMiddleware, restrictTo("owner"), addToCatalog);
catalogRouter.delete(
  "/:id",
  authMiddleware,
  restrictTo("owner"),
  removeFromCatalog,
);

export default catalogRouter;
