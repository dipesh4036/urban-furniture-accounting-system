import { Prisma, type OrderStatus, type DocStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { CreatePurchaseOrderInput } from "../validators/purchase-orders.validator";

function generatePoNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `PO-${timestamp}-${random}`;
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput) {
  const vendor = await prisma.contact.findUnique({
    where: { id: input.vendorId },
    select: { id: true, type: true },
  });
  if (!vendor) {
    throw new AppError(404, "Vendor not found", "VENDOR_NOT_FOUND");
  }
  if (vendor.type !== "VENDOR" && vendor.type !== "BOTH") {
    throw new AppError(
      422,
      "Contact must be a vendor or both customer and vendor",
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

  let poNumber: string;
  let attempts = 0;
  while (attempts < 10) {
    poNumber = generatePoNumber();
    const existing = await prisma.purchaseOrder.findUnique({ where: { poNumber } });
    if (!existing) break;
    attempts++;
  }
  if (attempts === 10) {
    throw new AppError(500, "Failed to generate unique PO number", "PO_NUMBER_GENERATION_FAILED");
  }

  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: input.vendorId,
        date: input.date,
      },
    });

    await tx.purchaseOrderItem.createMany({
      data: input.items.map((item) => ({
        purchaseOrderId: po.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
      })),
    });

    return tx.purchaseOrder.findUniqueOrThrow({
      where: { id: po.id },
      include: { items: true, vendor: true },
    });
  });
}

interface ListPurchaseOrdersOptions {
  page?: number;
  limit?: number;
}

export async function listPurchaseOrders(options: ListPurchaseOrdersOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const [orders, total] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({
      include: { items: true, vendor: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.purchaseOrder.count(),
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

export async function getPurchaseOrderById(id: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true, vendor: true },
  });
  if (!po) {
    throw new AppError(404, "Purchase order not found", "PURCHASE_ORDER_NOT_FOUND");
  }
  return po;
}

function generateBillNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `BILL-${timestamp}-${random}`;
}

export async function convertPurchaseOrderToBill(
  poId: string,
  input: { invoiceDate: Date; dueDate: Date }
) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { items: true, bill: true },
  });
  if (!po) {
    throw new AppError(404, "Purchase order not found", "PURCHASE_ORDER_NOT_FOUND");
  }

  if (po.status !== "CONFIRMED") {
    throw new AppError(
      422,
      `Purchase order status must be CONFIRMED, but is ${po.status}`,
      "INVALID_PO_STATUS"
    );
  }

  if (po.bill) {
    throw new AppError(409, "This purchase order has already been converted to a bill", "BILL_ALREADY_EXISTS");
  }

  const totalAmount = po.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );

  let billNumber: string;
  let attempts = 0;
  while (attempts < 10) {
    billNumber = generateBillNumber();
    const existing = await prisma.vendorBill.findUnique({ where: { billNumber } });
    if (!existing) break;
    attempts++;
  }
  if (attempts === 10) {
    throw new AppError(500, "Failed to generate unique bill number", "BILL_NUMBER_GENERATION_FAILED");
  }

  return prisma.$transaction(async (tx) => {
    const bill = await tx.vendorBill.create({
      data: {
        billNumber,
        purchaseOrderId: poId,
        vendorId: po.vendorId,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        totalAmount: new Prisma.Decimal(totalAmount),
        status: "UNPAID" as DocStatus,
      },
    });

    await tx.purchaseOrder.update({
      where: { id: poId },
      data: { status: "BILLED" as OrderStatus },
    });

    return tx.vendorBill.findUniqueOrThrow({
      where: { id: bill.id },
      include: { purchaseOrder: { include: { items: true } }, vendor: true, payments: true },
    });
  });
}

export async function confirmPurchaseOrder(id: string) {
  const po = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!po) {
    throw new AppError(404, "Purchase order not found", "PURCHASE_ORDER_NOT_FOUND");
  }
  if (po.status !== "DRAFT") {
    throw new AppError(422, `Only DRAFT purchase orders can be confirmed, current status: ${po.status}`, "INVALID_PO_STATUS");
  }
  return prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CONFIRMED" },
    include: { items: true, vendor: true },
  });
}

