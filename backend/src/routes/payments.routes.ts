import { Router } from "express";
import {
  payCustomerInvoiceController,
  payVendorBillController,
} from "../controllers/payments.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireOwnContactRecord } from "../middlewares/ownership.middleware";
import { validate } from "../middlewares/validate.middleware";
import { payCustomerInvoiceSchema, payVendorBillSchema } from "../validators/payments.validator";

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

paymentsRouter.post(
  "/vendor-bill/:billId",
  requireOwnContactRecord("vendorId", "vendor-bills"),
  validate(payVendorBillSchema),
  payVendorBillController
);
paymentsRouter.post(
  "/invoice/:invoiceId",
  requireOwnContactRecord("customerId", "customer-invoices"),
  validate(payCustomerInvoiceSchema),
  payCustomerInvoiceController
);
