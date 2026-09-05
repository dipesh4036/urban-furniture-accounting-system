import { Router } from "express";
import { payCustomerInvoiceController, payVendorBillController } from "../controllers/payments.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { payCustomerInvoiceSchema, payVendorBillSchema } from "../validators/payments.validator";

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

paymentsRouter.post(
  "/vendor-bill/:billId",
  validate(payVendorBillSchema),
  payVendorBillController
);
paymentsRouter.post(
  "/invoice/:invoiceId",
  validate(payCustomerInvoiceSchema),
  payCustomerInvoiceController
);
