import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getBalanceSheet } from "../services/reports/balance-sheet.service";
import { getProfitLoss } from "../services/reports/profit-loss.service";
import { getBudgetReport } from "../services/reports/budget-report.service";

export const getBalanceSheetController = asyncHandler(async (req: Request, res: Response) => {
  const asOf = new Date(req.query.asOf as string);
  const report = await getBalanceSheet(asOf);

  res.status(200).json({
    success: true,
    message: "Balance sheet retrieved successfully",
    data: report,
    timestamp: new Date().toISOString(),
  });
});

export const getProfitLossController = asyncHandler(async (req: Request, res: Response) => {
  const from = new Date(req.query.from as string);
  const to = new Date(req.query.to as string);
  const report = await getProfitLoss(from, to);

  res.status(200).json({
    success: true,
    message: "Profit and loss report retrieved successfully",
    data: report,
    timestamp: new Date().toISOString(),
  });
});

export const getBudgetReportController = asyncHandler(async (req: Request, res: Response) => {
  const period = req.query.period as string;
  const report = await getBudgetReport(period);

  res.status(200).json({
    success: true,
    message: "Budget report retrieved successfully",
    data: report,
    timestamp: new Date().toISOString(),
  });
});
