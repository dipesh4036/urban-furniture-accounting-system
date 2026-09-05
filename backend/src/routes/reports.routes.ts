import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/auth.middleware";
import { getBalanceSheetController, getProfitLossController, getBudgetReportController } from "../controllers/reports.controller";

export const reportsRouter = Router();

reportsRouter.get(
  "/balance-sheet",
  authenticate,
  authorize("ADMIN", "ACCOUNTANT"),
  getBalanceSheetController
);

reportsRouter.get(
  "/profit-loss",
  authenticate,
  authorize("ADMIN", "ACCOUNTANT"),
  getProfitLossController
);

reportsRouter.get(
  "/budget-report",
  authenticate,
  authorize("ADMIN", "ACCOUNTANT"),
  getBudgetReportController
);
