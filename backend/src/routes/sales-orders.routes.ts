import { Router } from "express";
import {
  createSalesOrderController,
  generateInvoiceFromSalesOrderController,
  getSalesOrderByIdController,
  listSalesOrdersController,
} from "../controllers/sales-orders.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createSalesOrderSchema,
  generateInvoiceFromSalesOrderSchema,
  listSalesOrdersQuerySchema,
} from "../validators/sales-orders.validator";

export const salesOrdersRouter = Router();

salesOrdersRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

salesOrdersRouter.post("/", validate(createSalesOrderSchema), createSalesOrderController);
salesOrdersRouter.get("/", validate(listSalesOrdersQuerySchema, "query"), listSalesOrdersController);
salesOrdersRouter.post(
  "/:id/generate-invoice",
  validate(generateInvoiceFromSalesOrderSchema),
  generateInvoiceFromSalesOrderController
);
salesOrdersRouter.get("/:id", getSalesOrderByIdController);
