import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as salesOrdersService from "../services/sales-orders.service";

export const createSalesOrderController = asyncHandler(async (req: Request, res: Response) => {
  const so = await salesOrdersService.createSalesOrder(req.body);

  res.status(201).json({
    success: true,
    message: "Sales order created successfully",
    data: { salesOrder: so },
    timestamp: new Date().toISOString(),
  });
});

export const listSalesOrdersController = asyncHandler(async (req: Request, res: Response) => {
  const { orders, meta } = await salesOrdersService.listSalesOrders(req.query);

  res.status(200).json({
    success: true,
    message: "Sales orders retrieved successfully",
    data: { salesOrders: orders, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getSalesOrderByIdController = asyncHandler(async (req: Request, res: Response) => {
  const so = await salesOrdersService.getSalesOrderById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Sales order retrieved successfully",
    data: { salesOrder: so },
    timestamp: new Date().toISOString(),
  });
});

export const generateInvoiceFromSalesOrderController = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await salesOrdersService.generateInvoiceFromSalesOrder(req.params.id, req.body);

  res.status(201).json({
    success: true,
    message: "Invoice generated from sales order and email sent successfully",
    data: { customerInvoice: invoice },
    timestamp: new Date().toISOString(),
  });
});
