import { Router } from "express";
import {
  getVendorBillByIdController,
  listVendorBillsController,
} from "../controllers/vendor-bills.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireOwnContactRecord } from "../middlewares/ownership.middleware";
import { validate } from "../middlewares/validate.middleware";
import { listVendorBillsQuerySchema } from "../validators/vendor-bills.validator";

export const vendorBillsRouter = Router();

vendorBillsRouter.use(authenticate);

vendorBillsRouter.get("/", validate(listVendorBillsQuerySchema, "query"), listVendorBillsController);
vendorBillsRouter.get(
  "/:id",
  requireOwnContactRecord("vendorId", "vendor-bills"),
  getVendorBillByIdController
);
