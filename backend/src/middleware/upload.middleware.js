import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const uploadDir = "uploads/profiles";
const serviceUploadDir = "uploads/services";
const adUploadDir = "uploads/ads";

[uploadDir, serviceUploadDir, adUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save as profile-cusid-timestamp.ext
    const { cusid } = req.params;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `profile-${cusid}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

export const uploadProfilePicture = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, serviceUploadDir);
  },
  filename: (req, file, cb) => {
    // Save as service-timestamp-random.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `service-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadServiceImage = multer({
  storage: serviceStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

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
