import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
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

function sendNotAuthenticated(res: Response, message: string): void {
  res.status(401).json({
    success: false,
    message,
    code: "NOT_AUTHENTICATED",
    errors: {},
    timestamp: new Date().toISOString(),
  });
}

// Reads the access token from the httpOnly cookie, checks it's valid,
// and attaches the payload to req.user. If there's no token or it's
// invalid/expired, this stops the request with 401 - it never lets a
// request through without a user attached.
//
// It also re-checks isActive against the database on every request -
// the JWT itself has no idea if an Admin deactivated this account a
// second ago, so trusting the token alone would let a deactivated
// account keep working for up to 15 minutes (until the access token
// expires) instead of being logged out immediately.
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.accessToken;

  if (!token) {
    sendNotAuthenticated(res, "You must be logged in to do this");
    return;
  }

  let payload: TokenPayload;
  try {
    payload = verifyToken(token, env.JWT_ACCESS_SECRET);
  } catch {
    sendNotAuthenticated(res, "Your session has expired. Please log in again");
    return;
  }

  // Not wrapped in asyncHandler like controllers are (this runs before
  // any route, so there's no single controller to wrap) - a DB error
  // here is caught by hand instead, so it can't become an unhandled
  // promise rejection.
  try {
    const isStillActive =
      payload.role === "CONTACT"
        ? (await prisma.contact.findUnique({ where: { id: payload.sub }, select: { isActive: true } }))?.isActive
        : (await prisma.user.findUnique({ where: { id: payload.sub }, select: { isActive: true } }))?.isActive;

    if (!isStillActive) {
      sendNotAuthenticated(res, "This account has been deactivated");
      return;
    }
  } catch {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
      code: "INTERNAL_SERVER_ERROR",
      errors: {},
      timestamp: new Date().toISOString(),
    });
    return;
  }

  req.user = payload;
  next();
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
