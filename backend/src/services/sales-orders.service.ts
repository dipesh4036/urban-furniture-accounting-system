import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { CreateSalesOrderInput } from "../validators/sales-orders.validator";

function generateSoNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `SO-${timestamp}-${random}`;
}

export async function createSalesOrder(input: CreateSalesOrderInput) {
  const customer = await prisma.contact.findUnique({
    where: { id: input.customerId },
    select: { id: true, type: true },
  });
  if (!customer) {
    throw new AppError(404, "Customer not found", "CUSTOMER_NOT_FOUND");
  }
  if (customer.type !== "CUSTOMER" && customer.type !== "BOTH") {
    throw new AppError(
      422,
      "Contact must be a customer or both customer and vendor",
      "INVALID_CONTACT_TYPE"
    );
  }

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const foundProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  if (foundProducts.length !== productIds.length) {
    throw new AppError(404, "One or more products were not found", "PRODUCT_NOT_FOUND");
  }

  let soNumber: string;
  let attempts = 0;
  while (attempts < 10) {
    soNumber = generateSoNumber();
    const existing = await prisma.salesOrder.findUnique({ where: { soNumber } });
    if (!existing) break;
    attempts++;
  }
  if (attempts === 10) {
    throw new AppError(500, "Failed to generate unique SO number", "SO_NUMBER_GENERATION_FAILED");
  }

  return prisma.$transaction(async (tx) => {
    const so = await tx.salesOrder.create({
      data: {
        soNumber,
        customerId: input.customerId,
        date: input.date,
      },
    });

    await tx.salesOrderItem.createMany({
      data: input.items.map((item) => ({
        salesOrderId: so.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        tax: new Prisma.Decimal(item.tax),
      })),
    });

    return tx.salesOrder.findUniqueOrThrow({
      where: { id: so.id },
      include: { items: true, customer: true },
    });
  });
}

interface ListSalesOrdersOptions {
  page?: number;
  limit?: number;
}

export async function listSalesOrders(options: ListSalesOrdersOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const [orders, total] = await prisma.$transaction([
    prisma.salesOrder.findMany({
      include: { items: true, customer: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.salesOrder.count(),
  ]);

  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getSalesOrderById(id: string) {
  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!so) {
    throw new AppError(404, "Sales order not found", "SALES_ORDER_NOT_FOUND");
  }
  return so;
}
