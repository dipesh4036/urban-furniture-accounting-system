import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as customerInvoicesService from "../services/customer-invoices.service";

export const listCustomerInvoicesController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  const user = (req as any).user;

  // When the caller is a Contact, auto-filter to only their customer invoices
  const customerId = user.role === "CONTACT" ? user.id : (query.customerId as string | undefined);

  const { invoices, meta } = await customerInvoicesService.listCustomerInvoices({
    status: query.status as string | undefined,
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    customerId,
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

  res.status(200).json({
    success: true,
    message: "Customer invoice retrieved successfully",
    data: { customerInvoice: invoice },
    timestamp: new Date().toISOString(),
  });
});
