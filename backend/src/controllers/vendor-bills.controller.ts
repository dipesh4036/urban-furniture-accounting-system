import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as vendorBillsService from "../services/vendor-bills.service";

export const listVendorBillsController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  const vendorId = (req as any).user?.role === "CONTACT" ? (req as any).user?.id : query.vendorId;

  const { bills, meta } = await vendorBillsService.listVendorBills({
    status: query.status as string | undefined,
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    vendorId: vendorId as string | undefined,
  });

  res.status(200).json({
    success: true,
    message: "Vendor bills retrieved successfully",
    data: { vendorBills: bills, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getVendorBillByIdController = asyncHandler(async (req: Request, res: Response) => {
  const bill = await vendorBillsService.getVendorBillById(req.params.id);

  const user = (req as any).user;
  if (user.role === "CONTACT" && bill.vendorId !== user.id) {
    throw new Error("Unauthorized");
  }

  res.status(200).json({
    success: true,
    message: "Vendor bill retrieved successfully",
    data: { vendorBill: bill },
    timestamp: new Date().toISOString(),
  });
});
