import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as customerInvoicesService from "../services/customer-invoices.service";

export const listCustomerInvoicesController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  const customerId = (req as any).user?.role === "CONTACT" ? (req as any).user?.id : query.customerId;

  const { invoices, meta } = await customerInvoicesService.listCustomerInvoices({
    status: query.status as string | undefined,
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    customerId: customerId as string | undefined,
  });

  res.status(200).json({
    success: true,
    message: "Customer invoices retrieved successfully",
    data: { customerInvoices: invoices, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getCustomerInvoiceByIdController = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await customerInvoicesService.getCustomerInvoiceById(req.params.id);

  const user = (req as any).user;
  if (user.role === "CONTACT" && invoice.customerId !== user.id) {
    throw new Error("Unauthorized");
  }

  res.status(200).json({
    success: true,
    message: "Customer invoice retrieved successfully",
    data: { customerInvoice: invoice },
    timestamp: new Date().toISOString(),
  });
});
