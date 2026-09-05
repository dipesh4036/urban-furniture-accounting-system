import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as productsService from "../services/products.service";

export const createProductController = asyncHandler(async (req: Request, res: Response) => {
  const product = await productsService.createProduct(req.body);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product },
    timestamp: new Date().toISOString(),
  });
});

export const listProductsController = asyncHandler(async (req: Request, res: Response) => {
  const { products, meta } = await productsService.listProducts(req.query);

  res.status(200).json({
    success: true,
    message: "Products retrieved successfully",
    data: { products, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getProductByIdController = asyncHandler(async (req: Request, res: Response) => {
  const product = await productsService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product retrieved successfully",
    data: { product },
    timestamp: new Date().toISOString(),
  });
});

export const updateProductController = asyncHandler(async (req: Request, res: Response) => {
  const product = await productsService.updateProduct(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: { product },
    timestamp: new Date().toISOString(),
  });
});
