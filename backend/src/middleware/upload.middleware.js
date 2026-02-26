import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const adUploadDir = "uploads/ads";

[uploadDir, serviceUploadDir, adUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  // ... existing storage logic used by others if needed, but we'll use specific ones
});

// ... (previous uploadProfilePicture and uploadServiceImage exports)

const adStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, adUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `ad-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadAdvertisementImage = multer({
  storage: adStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for high-quality ads
  fileFilter: fileFilter,
});
