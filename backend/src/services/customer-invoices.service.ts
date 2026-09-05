import { Prisma, type DocStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

interface ListCustomerInvoicesOptions {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  customerId?: string;
}

export async function listCustomerInvoices(options: ListCustomerInvoicesOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where: Prisma.CustomerInvoiceWhereInput = {};
  if (options.status) {
    where.status = options.status as DocStatus;
  }
  if (options.customerId) {
    where.customerId = options.customerId;
  }
  if (options.search) {
    where.OR = [
      { invoiceNumber: { contains: options.search } },
      { customer: { name: { contains: options.search } } },
    ];
  }

  const [invoices, total] = await prisma.$transaction([
    prisma.customerInvoice.findMany({
      where,
      include: { customer: true, payments: true, salesOrder: { include: { items: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { invoiceDate: "desc" },
    }),
    prisma.customerInvoice.count({ where }),
  ]);

  return {
    invoices,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerInvoiceById(id: string) {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: { customer: true, payments: true, salesOrder: { include: { items: true } } },
  });
  if (!invoice) {
    throw new AppError(404, "Customer invoice not found", "CUSTOMER_INVOICE_NOT_FOUND");
  }
  return invoice;
}
