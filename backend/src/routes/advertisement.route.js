import express from "express";
import * as adController from "../controllers/advertisement.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { uploadAdvertisementImage } from "../middleware/upload.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";

const router = express.Router();

// Public routes
router.get("/", cacheMiddleware(3600), adController.getAdvertisements);

router.post("/request", adController.requestAdvertisement);

// Protected routes
router.use(authMiddleware);
router.use(restrictTo("owner"));

router.get("/admin", adController.getAdminAdvertisements);

router.post(
  "/",
  uploadAdvertisementImage.single("image"),
  adController.createAdvertisement,
);

router.put(
  "/:id",
  uploadAdvertisementImage.single("image"),
  adController.updateAdvertisement,
);

router.delete("/:id", adController.deleteAdvertisement);

export default router;
