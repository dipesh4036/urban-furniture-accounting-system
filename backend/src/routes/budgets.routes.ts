import { Router } from "express";
import { createBudgetController, listBudgetsController } from "../controllers/budgets.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createBudgetSchema, listBudgetsQuerySchema } from "../validators/budgets.validator";

export const budgetsRouter = Router();

budgetsRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

budgetsRouter.post("/", validate(createBudgetSchema), createBudgetController);
budgetsRouter.get("/", validate(listBudgetsQuerySchema, "query"), listBudgetsController);
