import { Router } from "express";
import {
  getCustomerInvoiceByIdController,
  listCustomerInvoicesController,
} from "../controllers/customer-invoices.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireOwnContactRecord } from "../middlewares/ownership.middleware";
import { validate } from "../middlewares/validate.middleware";
import { listCustomerInvoicesQuerySchema } from "../validators/customer-invoices.validator";

export const customerInvoicesRouter = Router();

customerInvoicesRouter.use(authenticate);

customerInvoicesRouter.get(
  "/",
  validate(listCustomerInvoicesQuerySchema, "query"),
  listCustomerInvoicesController
);
customerInvoicesRouter.get(
  "/:id",
  requireOwnContactRecord("customerId", "customer-invoices"),
  getCustomerInvoiceByIdController
);
