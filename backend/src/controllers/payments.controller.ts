import type { Request, Response } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import * as paymentsService from "../services/payments.service";

export const payVendorBillController = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role === "CONTACT") {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: req.params.billId },
      select: { vendorId: true },
    });
    if (!bill || bill.vendorId !== user.id) {
      throw new AppError(403, "You do not have access to this vendor bill", "FORBIDDEN");
    }
  }

  const { payment, updatedBill } = await paymentsService.payVendorBill(req.params.billId, req.body);

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: { payment, vendorBill: updatedBill },
    timestamp: new Date().toISOString(),
  });
});

export const payCustomerInvoiceController = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role === "CONTACT") {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: req.params.invoiceId },
      select: { customerId: true },
    });
    if (!invoice || invoice.customerId !== user.id) {
      throw new AppError(403, "You do not have access to this customer invoice", "FORBIDDEN");
    }
  }

  const { payment, updatedInvoice } = await paymentsService.payCustomerInvoice(
    req.params.invoiceId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: { payment, customerInvoice: updatedInvoice },
    timestamp: new Date().toISOString(),
  });
});
