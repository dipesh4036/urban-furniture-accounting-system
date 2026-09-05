import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { verifyToken, type TokenPayload } from "../services/auth.service";

// Adds `req.user` so later middleware/controllers can read who's logged
// in. Declared here once instead of everywhere it's used.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// Reads the access token from the httpOnly cookie, checks it's valid,
// and attaches the payload to req.user. If there's no token or it's
// invalid/expired, this stops the request with 401 - it never lets a
// request through without a user attached.
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "You must be logged in to do this",
      code: "NOT_AUTHENTICATED",
      errors: {},
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    req.user = verifyToken(token, env.JWT_ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again",
      code: "NOT_AUTHENTICATED",
      errors: {},
      timestamp: new Date().toISOString(),
    });
  }
}

// Use AFTER authenticate(). Only lets the request through if req.user's
// role is one of the allowed roles. Works for staff roles (ADMIN,
// ACCOUNTANT) and, later, CONTACT - it just reads whatever role string
// is in the token, without caring which kind of account it came from.
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to do this",
        code: "NOT_AUTHORIZED",
        errors: {},
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
