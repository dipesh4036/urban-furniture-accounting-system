// Imported from this exact path (not "@prisma/client") because that error
// class is only generated onto the main "Prisma" namespace once the schema
// has at least one model. This path always has it, schema or no schema.
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

// This is the ONE place in the whole app that turns any thrown error
// into an HTTP response. It must be registered LAST, after all routes,
// per backend-express SKILL.md.
//
// Express only treats a middleware as an "error handler" if it takes
// exactly 4 arguments (err, req, res, next) - so even though we don't
// use req/next here, we have to keep them in the function signature.
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const timestamp = new Date().toISOString();

  // 1) An error we threw on purpose (e.g. new AppError(409, "...", "EMAIL_TAKEN"))
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: {},
      timestamp,
    });
    return;
  }

  // 2) Zod validation failed - send back which field failed and why
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const fieldName = issue.path.join(".") || "root";
      fieldErrors[fieldName] = issue.message;
    }
    res.status(422).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: fieldErrors,
      timestamp,
    });
    return;
  }

  // 3) A known Prisma database error
  if (err instanceof PrismaClientKnownRequestError) {
    // P2002 = "unique constraint failed" (e.g. email already exists)
    if (err.code === "P2002") {
      const duplicateField = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      res.status(409).json({
        success: false,
        message: `A record with this ${duplicateField} already exists`,
        code: "DUPLICATE_RECORD",
        errors: {},
        timestamp,
      });
      return;
    }

    // P2025 = "record not found" (e.g. update/delete on an id that doesn't exist)
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
        code: "RECORD_NOT_FOUND",
        errors: {},
        timestamp,
      });
      return;
    }

    // P2000 = a value was too long for its column (e.g. a schema/column
    // size mismatch we didn't catch in Zod validation).
    if (err.code === "P2000") {
      const columnName = (err.meta?.column_name as string | undefined) ?? "field";
      res.status(422).json({
        success: false,
        message: `The value provided for ${columnName} is too long`,
        code: "VALUE_TOO_LONG",
        errors: {},
        timestamp,
      });
      return;
    }
  }

  // 4) The request body was bigger than express.json()'s limit (e.g. a
  // large profile image). body-parser throws a plain error object with
  // type "entity.too.large" for this - not a class we can use
  // `instanceof` on, so it's checked by that field instead.
  if (typeof err === "object" && err !== null && "type" in err && err.type === "entity.too.large") {
    res.status(413).json({
      success: false,
      message: "That request is too large. Please use a smaller file.",
      code: "PAYLOAD_TOO_LARGE",
      errors: {},
      timestamp,
    });
    return;
  }

  // 5) Anything else is unexpected - log the full error for us to debug,
  // but never send the stack trace or internal details to the client.
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
    errors: {},
    timestamp,
  });
}
