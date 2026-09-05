import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as budgetsService from "../services/budgets.service";

export const createBudgetController = asyncHandler(async (req: Request, res: Response) => {
  const budget = await budgetsService.createBudget(req.body);

  res.status(201).json({
    success: true,
    message: "Budget created successfully",
    data: { budget },
    timestamp: new Date().toISOString(),
  });
});

export const listBudgetsController = asyncHandler(async (req: Request, res: Response) => {
  const { budgets, meta } = await budgetsService.listBudgets(req.query);

  res.status(200).json({
    success: true,
    message: "Budgets retrieved successfully",
    data: { budgets, meta },
    timestamp: new Date().toISOString(),
  });
});
