import { Prisma, type OrderStatus, type DocStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { sendInvoiceEmail } from "./email.service";
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

function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `INV-${timestamp}-${random}`;
}

export async function generateInvoiceFromSalesOrder(
  soId: string,
  input: { invoiceDate: Date; dueDate: Date }
) {
  const so = await prisma.salesOrder.findUnique({
    where: { id: soId },
    include: { items: true, customer: true },
  });
  if (!so) {
    throw new AppError(404, "Sales order not found", "SALES_ORDER_NOT_FOUND");
  }

  if (so.status !== "CONFIRMED") {
    throw new AppError(
      422,
      `Sales order status must be CONFIRMED, but is ${so.status}`,
      "INVALID_SO_STATUS"
    );
  }

  if (so.invoice) {
    throw new AppError(409, "This sales order has already been converted to an invoice", "INVOICE_ALREADY_EXISTS");
  }

  const totalAmount = so.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity + Number(item.tax),
    0
  );

  let invoiceNumber: string;
  let attempts = 0;
  while (attempts < 10) {
    invoiceNumber = generateInvoiceNumber();
    const existing = await prisma.customerInvoice.findUnique({ where: { invoiceNumber } });
    if (!existing) break;
    attempts++;
  }
  if (attempts === 10) {
    throw new AppError(500, "Failed to generate unique invoice number", "INVOICE_NUMBER_GENERATION_FAILED");
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.customerInvoice.create({
      data: {
        invoiceNumber,
        salesOrderId: soId,
        customerId: so.customerId,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        totalAmount: new Prisma.Decimal(totalAmount),
        status: "UNPAID" as DocStatus,
      },
    });

    await tx.salesOrder.update({
      where: { id: soId },
      data: { status: "BILLED" as OrderStatus },
    });

    return tx.customerInvoice.findUniqueOrThrow({
      where: { id: inv.id },
      include: { salesOrder: { include: { items: true } }, customer: true, payments: true },
    });
  });

  sendInvoiceEmail({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: invoice.totalAmount.toString(),
    customerEmail: invoice.customer.email,
    customerName: invoice.customer.name,
  }).catch((error) => {
    console.error(`Failed to send invoice email for invoice ${invoiceNumber}:`, error);
  });

  return invoice;
}
