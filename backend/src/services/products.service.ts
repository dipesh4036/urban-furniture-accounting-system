import type { ProductType } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { CreateProductInput, UpdateProductInput } from "../validators/products.validator";

export async function createProduct(input: CreateProductInput) {
  return prisma.product.create({ data: input });
}

interface ListProductsOptions {
  type?: ProductType;
  search?: string;
  page?: number;
  limit?: number;
}

// Returns a page of products plus the pagination info the frontend needs
// to render "page 2 of 5" style controls. Caps `limit` at 100 so nobody
// can ask for the whole table in one request, per backend-express
// SKILL.md's pagination rules. `search` matches on name only - Prisma's
// `mode: "insensitive"` isn't supported on MySQL, but MySQL's default
// collation already does case-insensitive `contains` matching.
export async function listProducts(options: ListProductsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where = {
    ...(options.type ? { type: options.type } : {}),
    ...(options.search ? { name: { contains: options.search } } : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  return prisma.product.update({ where: { id }, data: input });
}

// "Archiving" a product just flips isActive to false - we never delete
// one, because past Purchase/Sales Order items may already reference it,
// and deleting it would break that order history.
export async function archiveProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  return prisma.product.update({ where: { id }, data: { isActive: false } });
}
