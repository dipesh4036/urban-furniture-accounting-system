import { Router } from "express";
import {
  activateAccountController,
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  resetPasswordController,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", authenticate, meController);
authRouter.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);
authRouter.post("/reset-password", validate(resetPasswordSchema), resetPasswordController);
// {token, newPassword} is the same shape as reset-password, so it reuses resetPasswordSchema.
authRouter.post("/activate-account", validate(resetPasswordSchema), activateAccountController);
