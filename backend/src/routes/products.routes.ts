import { Router } from "express";
import {
  createProductController,
  getProductByIdController,
  listProductsController,
  updateProductController,
} from "../controllers/products.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createProductSchema, listProductsQuerySchema, updateProductSchema } from "../validators/products.validator";

export const productsRouter = Router();

// Every route here needs a logged-in Admin or Accountant.
productsRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

productsRouter.post("/", validate(createProductSchema), createProductController);
productsRouter.get("/", validate(listProductsQuerySchema, "query"), listProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.patch("/:id", validate(updateProductSchema), updateProductController);
