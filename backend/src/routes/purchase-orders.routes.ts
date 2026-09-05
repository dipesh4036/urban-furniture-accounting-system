import { Router } from "express";
import {
  convertPurchaseOrderToBillController,
  createPurchaseOrderController,
  getPurchaseOrderByIdController,
  listPurchaseOrdersController,
} from "../controllers/purchase-orders.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  convertPurchaseOrderToBillSchema,
  createPurchaseOrderSchema,
  listPurchaseOrdersQuerySchema,
} from "../validators/purchase-orders.validator";

export const purchaseOrdersRouter = Router();

purchaseOrdersRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

purchaseOrdersRouter.post("/", validate(createPurchaseOrderSchema), createPurchaseOrderController);
purchaseOrdersRouter.get("/", validate(listPurchaseOrdersQuerySchema, "query"), listPurchaseOrdersController);
purchaseOrdersRouter.post(
  "/:id/convert-to-bill",
  validate(convertPurchaseOrderToBillSchema),
  convertPurchaseOrderToBillController
);
purchaseOrdersRouter.get("/:id", getPurchaseOrderByIdController);
