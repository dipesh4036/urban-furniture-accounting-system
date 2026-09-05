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
