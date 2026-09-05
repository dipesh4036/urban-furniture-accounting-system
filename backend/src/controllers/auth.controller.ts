import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";

// Both cookies use the same base options. `secure` is only turned on in
// production because local dev runs over plain http, and browsers won't
// send/accept a `secure` cookie over http.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { loginId, password } = req.body;
  const result = await authService.login(loginId, password);

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { user: result.user },
    timestamp: new Date().toISOString(),
  });
});

export const logoutController = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
    data: {},
    timestamp: new Date().toISOString(),
  });
});

export const meController = asyncHandler(async (req: Request, res: Response) => {
  // req.user is always set here - this route is always run after the
  // `authenticate` middleware, which either sets it or stops the request.
  const user = await authService.getCurrentUser(req.user!.sub);

  res.status(200).json({
    success: true,
    message: "Current session",
    data: { user },
    timestamp: new Date().toISOString(),
  });
});
