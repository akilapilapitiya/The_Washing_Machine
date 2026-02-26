import express from "express";
import * as adController from "../controllers/advertisement.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { uploadAdvertisementImage } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public route
router.get("/", adController.getAdvertisements);

// Admin routes
router.use(authMiddleware);
router.use(restrictTo("owner"));

router.get("/admin", adController.getAdminAdvertisements);
router.post("/", uploadAdvertisementImage.single("image"), adController.createAdvertisement);
router.put("/:id", uploadAdvertisementImage.single("image"), adController.updateAdvertisement);
router.delete("/:id", adController.deleteAdvertisement);

export default router;
