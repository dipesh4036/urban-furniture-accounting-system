import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as paymentsService from "../services/payments.service";

export const payVendorBillController = asyncHandler(async (req: Request, res: Response) => {
  const { payment, updatedBill } = await paymentsService.payVendorBill(req.params.billId, req.body);

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data: { payment, vendorBill: updatedBill },
    timestamp: new Date().toISOString(),
  });
});

export const payCustomerInvoiceController = asyncHandler(async (req: Request, res: Response) => {
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
