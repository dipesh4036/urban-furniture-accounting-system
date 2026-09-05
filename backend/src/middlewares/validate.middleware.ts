import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// Takes a Zod schema and returns middleware that checks req.body against
// it. If it's valid, req.body is replaced with the parsed (cleaned)
// version, so the controller/service never has to re-check the shape.
// If it's invalid, schema.parse() throws a ZodError, which Express
// automatically catches (this function is synchronous) and sends to
// our error middleware, which turns it into a 422 with field errors.
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}
