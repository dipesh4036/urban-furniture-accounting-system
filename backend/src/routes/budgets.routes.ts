import { Router } from "express";
import {
  createBudgetController,
  listBudgetsController,
  updateBudgetController,
} from "../controllers/budgets.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createBudgetSchema,
  listBudgetsQuerySchema,
  updateBudgetSchema,
} from "../validators/budgets.validator";

export const budgetsRouter = Router();

budgetsRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

budgetsRouter.post("/", validate(createBudgetSchema), createBudgetController);
budgetsRouter.get("/", validate(listBudgetsQuerySchema, "query"), listBudgetsController);
budgetsRouter.patch("/:id", validate(updateBudgetSchema), updateBudgetController);
