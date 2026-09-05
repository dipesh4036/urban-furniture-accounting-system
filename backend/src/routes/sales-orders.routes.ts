import { Router } from "express";
import {
  createSalesOrderController,
  getSalesOrderByIdController,
  listSalesOrdersController,
} from "../controllers/sales-orders.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createSalesOrderSchema,
  listSalesOrdersQuerySchema,
} from "../validators/sales-orders.validator";

export const salesOrdersRouter = Router();

salesOrdersRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

salesOrdersRouter.post("/", validate(createSalesOrderSchema), createSalesOrderController);
salesOrdersRouter.get("/", validate(listSalesOrdersQuerySchema, "query"), listSalesOrdersController);
salesOrdersRouter.get("/:id", getSalesOrderByIdController);
