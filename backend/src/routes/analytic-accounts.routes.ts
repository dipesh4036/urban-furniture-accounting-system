import { Router } from "express";
import {
  createAnalyticAccountController,
  listAnalyticAccountsController,
} from "../controllers/analytic-accounts.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createAnalyticAccountSchema,
  listAnalyticAccountsQuerySchema,
} from "../validators/analytic-accounts.validator";

export const analyticAccountsRouter = Router();

analyticAccountsRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

analyticAccountsRouter.post("/", validate(createAnalyticAccountSchema), createAnalyticAccountController);
analyticAccountsRouter.get(
  "/",
  validate(listAnalyticAccountsQuerySchema, "query"),
  listAnalyticAccountsController
);
