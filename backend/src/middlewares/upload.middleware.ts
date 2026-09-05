import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists on disk so multer diskStorage never throws ENOENT
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5mb

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  // Never trust the original filename (could collide with an existing
  // file, or contain path characters) - generate a random one instead,
  // keeping only the original extension.
  filename: (_req, file, callback) => {
    const randomName = crypto.randomBytes(16).toString("hex");
    callback(null, `${randomName}${path.extname(file.originalname)}`);
  },
});

// Only accept actual image files - anything else is rejected before it
// even reaches disk.
function imageFileFilter(_req: unknown, file: Express.Multer.File, callback: multer.FileFilterCallback) {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(new Error("Only image files are allowed"));
  }
}

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});
