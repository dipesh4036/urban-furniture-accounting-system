import type { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadFileController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(422, "No file was uploaded", "NO_FILE");
  }

  // The file is already saved to disk by multer at this point (see
  // upload.middleware.ts) - we just hand back the URL it's reachable at.
  // Static files are served from /uploads (see index.ts).
  const url = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: { url },
    timestamp: new Date().toISOString(),
  });
});
