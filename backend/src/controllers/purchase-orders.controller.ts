import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as purchaseOrdersService from "../services/purchase-orders.service";

export const createPurchaseOrderController = asyncHandler(async (req: Request, res: Response) => {
  const po = await purchaseOrdersService.createPurchaseOrder(req.body);

  res.status(201).json({
    success: true,
    message: "Purchase order created successfully",
    data: { purchaseOrder: po },
    timestamp: new Date().toISOString(),
  });
});

export const listPurchaseOrdersController = asyncHandler(async (req: Request, res: Response) => {
  const { orders, meta } = await purchaseOrdersService.listPurchaseOrders(req.query);

  res.status(200).json({
    success: true,
    message: "Purchase orders retrieved successfully",
    data: { purchaseOrders: orders, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getPurchaseOrderByIdController = asyncHandler(async (req: Request, res: Response) => {
  const po = await purchaseOrdersService.getPurchaseOrderById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Purchase order retrieved successfully",
    data: { purchaseOrder: po },
    timestamp: new Date().toISOString(),
  });
});

export const convertPurchaseOrderToBillController = asyncHandler(async (req: Request, res: Response) => {
  const bill = await purchaseOrdersService.convertPurchaseOrderToBill(req.params.id, req.body);

  res.status(201).json({
    success: true,
    message: "Purchase order converted to vendor bill successfully",
    data: { vendorBill: bill },
    timestamp: new Date().toISOString(),
  });
});
