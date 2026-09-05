import { Router } from "express";
import { uploadFileController } from "../controllers/uploads.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

export const uploadsRouter = Router();

// Staff-only for now - the only thing that uploads a file today is
// Contact Master's profile image, which only Admin/Accountant can set.
uploadsRouter.post("/", authenticate, authorize("ADMIN", "ACCOUNTANT"), upload.single("file"), uploadFileController);
