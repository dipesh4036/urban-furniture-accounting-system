import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

// A factory middleware that enforces ownership checks for Contacts. When the
// caller's role is CONTACT, it loads the target resource and returns 403 unless
// the resource's specified field (vendorId or customerId) equals req.user.id.
// When the role is ADMIN/ACCOUNTANT, the middleware passes through unchanged.
//
// Usage:
//   router.get(
//     "/:id",
//     requireOwnContactRecord("vendorId", "vendor-bills"),
//     getBillController
//   )
export function requireOwnContactRecord(
  fieldName: "vendorId" | "customerId",
  model: "vendor-bills" | "customer-invoices"
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // Only enforce ownership for Contacts; Admins/Accountants pass through
    if (user.role !== "CONTACT") {
      return next();
    }

    const id = req.params.id;

    try {
      let resource;
      if (model === "vendor-bills") {
        resource = await prisma.vendorBill.findUnique({
          where: { id },
          select: { vendorId: true },
        });
      } else {
        resource = await prisma.customerInvoice.findUnique({
          where: { id },
          select: { customerId: true },
        });
      }

      if (!resource) {
        throw new AppError(404, `${model} not found`, `${model.toUpperCase()}_NOT_FOUND`);
      }

      const ownershipField = fieldName === "vendorId" ? "vendorId" : "customerId";
      if (resource[ownershipField as keyof typeof resource] !== user.id) {
        throw new AppError(403, "You do not have access to this resource", "FORBIDDEN");
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  };
}
