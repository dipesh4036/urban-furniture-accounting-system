import { Prisma, type PaymentMethod } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

interface PayVendorBillInput {
  amount: number;
  method: string;
  date: Date;
}

export async function payVendorBill(billId: string, input: PayVendorBillInput) {
  const bill = await prisma.vendorBill.findUnique({
    where: { id: billId },
    include: { payments: true },
  });
  if (!bill) {
    throw new AppError(404, "Vendor bill not found", "VENDOR_BILL_NOT_FOUND");
  }

  const totalPaid = bill.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalAmount = Number(bill.totalAmount);
  const proposedTotal = totalPaid + input.amount;

  if (proposedTotal > totalAmount) {
    throw new AppError(
      422,
      `Payment exceeds bill amount. Bill total: ${totalAmount}, Already paid: ${totalPaid}, Attempted payment: ${input.amount}`,
      "PAYMENT_EXCEEDS_BILL_AMOUNT"
    );
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        type: "PAYMENT" as const,
        method: input.method as PaymentMethod,
        amount: new Prisma.Decimal(input.amount),
        date: input.date,
        vendorBillId: billId,
      },
    });

    const newStatus = proposedTotal >= totalAmount ? "PAID" : "PARTIALLY_PAID";

    const updatedBill = await tx.vendorBill.update({
      where: { id: billId },
      data: { status: newStatus },
      include: { payments: true, vendor: true, purchaseOrder: { include: { items: true } } },
    });

    return { payment, updatedBill };
  });
}

interface PayCustomerInvoiceInput {
  amount: number;
  method: string;
  date: Date;
}

export async function payCustomerInvoice(invoiceId: string, input: PayCustomerInvoiceInput) {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice) {
    throw new AppError(404, "Customer invoice not found", "CUSTOMER_INVOICE_NOT_FOUND");
  }

  const totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalAmount = Number(invoice.totalAmount);
  const proposedTotal = totalPaid + input.amount;

  if (proposedTotal > totalAmount) {
    throw new AppError(
      422,
      `Payment exceeds invoice amount. Invoice total: ${totalAmount}, Already paid: ${totalPaid}, Attempted payment: ${input.amount}`,
      "PAYMENT_EXCEEDS_INVOICE_AMOUNT"
    );
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        type: "RECEIPT" as const,
        method: input.method as PaymentMethod,
        amount: new Prisma.Decimal(input.amount),
        date: input.date,
        customerInvoiceId: invoiceId,
      },
    });

    const newStatus = proposedTotal >= totalAmount ? "PAID" : "PARTIALLY_PAID";

    const updatedInvoice = await tx.customerInvoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
      include: { payments: true, customer: true, salesOrder: { include: { items: true } } },
    });

    return { payment, updatedInvoice };
  });
}
