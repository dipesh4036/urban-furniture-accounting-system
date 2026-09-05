import type { NextFunction, Request, RequestHandler, Response } from "express";

// Wrap every async controller with this so we never have to write
// try/catch in the controller itself. If the controller's promise
// rejects (throws), this catches it and passes the error to next(),
// which sends it straight to our error middleware.
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
