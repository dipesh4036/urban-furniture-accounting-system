import { Router } from "express";
import {
  createAccountController,
  listAccountsController,
  updateAccountController,
} from "../controllers/accounts.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createAccountSchema, listAccountsQuerySchema, updateAccountSchema } from "../validators/accounts.validator";

export const accountsRouter = Router();

// Every route here needs a logged-in Admin or Accountant.
accountsRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

accountsRouter.post("/", validate(createAccountSchema), createAccountController);
accountsRouter.get("/", validate(listAccountsQuerySchema, "query"), listAccountsController);
accountsRouter.patch("/:id", validate(updateAccountSchema), updateAccountController);
