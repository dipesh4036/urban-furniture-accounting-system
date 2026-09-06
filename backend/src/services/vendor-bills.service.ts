import { Prisma, type DocStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

interface ListVendorBillsOptions {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  vendorId?: string;
}

export async function listVendorBills(options: ListVendorBillsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where: Prisma.VendorBillWhereInput = {};
  if (options.status) {
    where.status = options.status as DocStatus;
  }
  if (options.vendorId) {
    where.vendorId = options.vendorId;
  }
  if (options.search) {
    where.OR = [
      { billNumber: { contains: options.search } },
      { vendor: { name: { contains: options.search } } },
    ];
  }

  const [bills, total] = await prisma.$transaction([
    prisma.vendorBill.findMany({
      where,
      include: { vendor: true, payments: true, purchaseOrder: { include: { items: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { invoiceDate: "desc" },
    }),
    prisma.vendorBill.count({ where }),
  ]);

  return {
    bills,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getVendorBillById(id: string) {
  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: { vendor: true, payments: true, purchaseOrder: { include: { items: true } } },
  });
  if (!bill) {
    throw new AppError(404, "Vendor bill not found", "VENDOR_BILL_NOT_FOUND");
  }
  return bill;
}
