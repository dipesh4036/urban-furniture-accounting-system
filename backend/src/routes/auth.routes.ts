import { Router } from "express";
import { loginController, logoutController, meController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", authenticate, meController);
