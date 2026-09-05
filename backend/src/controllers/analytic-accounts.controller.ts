import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as analyticAccountsService from "../services/analytic-accounts.service";

export const createAnalyticAccountController = asyncHandler(async (req: Request, res: Response) => {
  const analyticAccount = await analyticAccountsService.createAnalyticAccount(req.body);

  res.status(201).json({
    success: true,
    message: "Analytic account created successfully",
    data: { analyticAccount },
    timestamp: new Date().toISOString(),
  });
});

export const listAnalyticAccountsController = asyncHandler(async (req: Request, res: Response) => {
  const { analyticAccounts, meta } = await analyticAccountsService.listAnalyticAccounts(req.query);

  res.status(200).json({
    success: true,
    message: "Analytic accounts retrieved successfully",
    data: { analyticAccounts, meta },
    timestamp: new Date().toISOString(),
  });
});
