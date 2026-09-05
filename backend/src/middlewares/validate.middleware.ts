import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type ValidationTarget = "body" | "query" | "params";

// Takes a Zod schema and returns middleware that checks req[target]
// against it (defaults to "body"). If it's valid, req[target] is
// replaced with the parsed (cleaned) version, so the controller/service
// never has to re-check the shape. If it's invalid, schema.parse()
// throws a ZodError, which Express automatically catches (this function
// is synchronous) and sends to our error middleware, which turns it
// into a 422 with field errors.
export function validate(schema: ZodType, target: ValidationTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req[target] = schema.parse(req[target]);
    next();
  };
}
