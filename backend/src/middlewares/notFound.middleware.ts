import type { Request, Response } from "express";

// Runs when a request doesn't match any route we defined.
// Must be registered AFTER all real routes, and BEFORE the error middleware.
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
    errors: {},
    timestamp: new Date().toISOString(),
  });
}
