import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "../src/services/auth.service";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // 1. SEED STAFF USERS
  console.log("📝 Seeding staff users...");
  const staff = [
    { name: "Utsav Padaliya", loginId: "utsav01", email: "utsav@example.com", password: "Utsav@123", role: "ADMIN" as const },
    { name: "Maulik", loginId: "maulik01", email: "maulik@example.com", password: "Maulik@123", role: "ACCOUNTANT" as const },
    { name: "Dipesh", loginId: "dipesh01", email: "dipesh@example.com", password: "Dipesh@123", role: "ACCOUNTANT" as const },
  ];

  const users = [];
  for (const person of staff) {
    const passwordHash = await hashPassword(person.password);
    const user = await prisma.user.upsert({
      where: { loginId: person.loginId },
      update: {},
      create: {
        name: person.name,
        loginId: person.loginId,
        email: person.email,
        passwordHash,
        role: person.role,
      },
    });
    users.push(user);
    console.log(`  ✓ ${person.loginId} (${person.role})`);
  }

  // 2. SEED CHART OF ACCOUNTS
  console.log("\n💰 Seeding chart of accounts...");
  const accounts = [
    { name: "Cash", type: "ASSET" as const },
    { name: "Bank Account", type: "ASSET" as const },
    { name: "Accounts Receivable", type: "ASSET" as const },
    { name: "Inventory", type: "ASSET" as const },
    { name: "Furniture & Fixtures", type: "ASSET" as const },
    { name: "Accounts Payable", type: "LIABILITY" as const },
    { name: "Short-term Loan", type: "LIABILITY" as const },
    { name: "Opening Balance", type: "CAPITAL" as const },
    { name: "Sales Revenue", type: "INCOME" as const },
    { name: "Service Revenue", type: "INCOME" as const },
    { name: "Purchase Expense", type: "EXPENSE" as const },
    { name: "Salary Expense", type: "EXPENSE" as const },
    { name: "Rent Expense", type: "EXPENSE" as const },
    { name: "Utilities Expense", type: "EXPENSE" as const },
  ];

  const accountsCreated = [];
  for (const acc of accounts) {
    const account = await prisma.account.upsert({
      where: { name: acc.name },
      update: {},
      create: acc,
    });
    accountsCreated.push(account);
  }
  console.log(`  ✓ Created ${accountsCreated.length} accounts`);

  // 3. SEED JOURNALS
  console.log("\n📖 Seeding journals...");
  const salesAccount = accountsCreated.find(a => a.name === "Sales Revenue")!;
  const purchaseAccount = accountsCreated.find(a => a.name === "Purchase Expense")!;
  const bankAccount = accountsCreated.find(a => a.name === "Bank Account")!;
  const cashAccount = accountsCreated.find(a => a.name === "Cash")!;

  const journals = [
    { name: "Sales Journal", type: "SALES" as const, defaultAccountId: salesAccount.id },
    { name: "Purchase Journal", type: "PURCHASE" as const, defaultAccountId: purchaseAccount.id },
    { name: "Bank Journal", type: "BANK" as const, defaultAccountId: bankAccount.id },
    { name: "Cash Journal", type: "CASH" as const, defaultAccountId: cashAccount.id },
  ];

  const journalsCreated = [];
  for (const journal of journals) {
    const j = await prisma.journal.upsert({
      where: { name: journal.name },
      update: {},
      create: journal,
    });
    journalsCreated.push(j);
  }
  console.log(`  ✓ Created ${journalsCreated.length} journals`);

  // 4. SEED PRODUCTS
  console.log("\n📦 Seeding products...");
  const products = [
    { name: "Office Chair", type: "GOODS" as const, salesPrice: new Prisma.Decimal("150.00"), costPrice: new Prisma.Decimal("80.00"), category: "Furniture" },
    { name: "Wooden Desk", type: "GOODS" as const, salesPrice: new Prisma.Decimal("250.00"), costPrice: new Prisma.Decimal("120.00"), category: "Furniture" },
    { name: "Standing Desk", type: "GOODS" as const, salesPrice: new Prisma.Decimal("350.00"), costPrice: new Prisma.Decimal("180.00"), category: "Furniture" },
    { name: "Bookshelf", type: "GOODS" as const, salesPrice: new Prisma.Decimal("100.00"), costPrice: new Prisma.Decimal("50.00"), category: "Furniture" },
    { name: "Conference Table", type: "GOODS" as const, salesPrice: new Prisma.Decimal("500.00"), costPrice: new Prisma.Decimal("250.00"), category: "Furniture" },
    { name: "Furniture Assembly Service", type: "SERVICE" as const, salesPrice: new Prisma.Decimal("50.00"), costPrice: new Prisma.Decimal("20.00"), category: "Services" },
  ];

  const productsCreated = [];
  for (const product of products) {
    const p = await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
    productsCreated.push(p);
  }
  console.log(`  ✓ Created ${productsCreated.length} products`);

  // 5. SEED CONTACTS (Vendors & Customers)
  console.log("\n👥 Seeding contacts...");
  const contacts = [
    { name: "ABC Furniture Suppliers", type: "VENDOR" as const, email: "abc@suppliers.com", mobile: "9876543210", city: "Mumbai", state: "MH", pincode: "400001", activationToken: null, passwordHash: await hashPassword("Vendor@123"), isActivated: true },
    { name: "XYZ Imports Ltd", type: "VENDOR" as const, email: "xyz@imports.com", mobile: "9123456789", city: "Delhi", state: "DL", pincode: "110001", activationToken: null, passwordHash: await hashPassword("Vendor@123"), isActivated: true },
    { name: "Tech Office Solutions", type: "VENDOR" as const, email: "tech@office.com", mobile: "8765432109", city: "Bangalore", state: "KA", pincode: "560001", activationToken: null, passwordHash: await hashPassword("Vendor@123"), isActivated: true },
    { name: "Acme Corp", type: "CUSTOMER" as const, email: "contact@acmecorp.com", mobile: "9988776655", city: "Mumbai", state: "MH", pincode: "400050", activationToken: null, passwordHash: await hashPassword("Customer@123"), isActivated: true },
    { name: "Global Industries", type: "CUSTOMER" as const, email: "info@globalindustries.com", mobile: "9111223344", city: "Pune", state: "MH", pincode: "411001", activationToken: null, passwordHash: await hashPassword("Customer@123"), isActivated: true },
    { name: "StartUp Hub", type: "CUSTOMER" as const, email: "startup@hub.com", mobile: "9555666777", city: "Bangalore", state: "KA", pincode: "560034", activationToken: null, passwordHash: await hashPassword("Customer@123"), isActivated: true },
  ];

  const contactsCreated = [];
  for (const contact of contacts) {
    const c = await prisma.contact.upsert({
      where: { email: contact.email },
      update: {},
      create: contact,
    });
    contactsCreated.push(c);
  }
  console.log(`  ✓ Created ${contactsCreated.length} contacts`);

  // 6. SEED ANALYTIC ACCOUNTS
  console.log("\n📊 Seeding analytic accounts...");
  const analyticAccounts = [
    { name: "Marketing Department", type: "EXPENSE" as const },
    { name: "Sales Department", type: "INCOME" as const },
    { name: "Operations", type: "EXPENSE" as const },
    { name: "Product A Revenue", type: "INCOME" as const },
    { name: "Product B Revenue", type: "INCOME" as const },
  ];

  const analyticAccountsCreated = [];
  for (const aa of analyticAccounts) {
    const a = await prisma.analyticAccount.upsert({
      where: { name: aa.name },
      update: {},
      create: aa,
    });
    analyticAccountsCreated.push(a);
  }
  console.log(`  ✓ Created ${analyticAccountsCreated.length} analytic accounts`);

  // 7. SEED BUDGETS
  console.log("\n💵 Seeding budgets...");
  const budgets = [
    { name: "Marketing Q1 2026", period: "2026-Q1", plannedAmount: new Prisma.Decimal("50000.00"), analyticAccountId: analyticAccountsCreated[0].id, responsiblePersonId: users[1].id },
    { name: "Operations Q1 2026", period: "2026-Q1", plannedAmount: new Prisma.Decimal("75000.00"), analyticAccountId: analyticAccountsCreated[2].id, responsiblePersonId: users[2].id },
    { name: "Product A Sales Target", period: "2026-Q1", plannedAmount: new Prisma.Decimal("200000.00"), analyticAccountId: analyticAccountsCreated[3].id, responsiblePersonId: users[1].id },
  ];

  const budgetsCreated = [];
  for (const budget of budgets) {
    const b = await prisma.budget.upsert({
      where: { name: budget.name },
      update: {},
      create: budget,
    });
    budgetsCreated.push(b);
  }
  console.log(`  ✓ Created ${budgetsCreated.length} budgets`);

  // 8. SEED PURCHASE ORDERS & VENDOR BILLS
  console.log("\n🛒 Seeding purchase orders & vendor bills...");
  const vendors = contactsCreated.filter(c => c.type === "VENDOR");

  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: `PO-${Date.now()}-1001`,
      vendorId: vendors[0].id,
      date: new Date("2026-01-15"),
      status: "CONFIRMED",
      items: {
        create: [
          { productId: productsCreated[0].id, quantity: 10, unitPrice: new Prisma.Decimal("80.00") },
          { productId: productsCreated[1].id, quantity: 5, unitPrice: new Prisma.Decimal("120.00") },
        ],
      },
    },
  });

  const bill1 = await prisma.vendorBill.create({
    data: {
      billNumber: `BILL-${Date.now()}-5001`,
      purchaseOrderId: po1.id,
      vendorId: vendors[0].id,
      invoiceDate: new Date("2026-01-20"),
      dueDate: new Date("2026-02-20"),
      totalAmount: new Prisma.Decimal("1600.00"),
      status: "UNPAID",
    },
  });
  console.log(`  ✓ Created purchase order & vendor bill`);

  // 9. SEED SALES ORDERS & CUSTOMER INVOICES
  console.log("\n📈 Seeding sales orders & customer invoices...");
  const customers = contactsCreated.filter(c => c.type === "CUSTOMER");

  const so1 = await prisma.salesOrder.create({
    data: {
      soNumber: `SO-${Date.now()}-2001`,
      customerId: customers[0].id,
      date: new Date("2026-01-10"),
      status: "CONFIRMED",
      items: {
        create: [
          { productId: productsCreated[0].id, quantity: 5, unitPrice: new Prisma.Decimal("150.00"), tax: new Prisma.Decimal("112.50") },
          { productId: productsCreated[3].id, quantity: 3, unitPrice: new Prisma.Decimal("100.00"), tax: new Prisma.Decimal("45.00") },
        ],
      },
    },
  });

  const invoice1 = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}-3001`,
      salesOrderId: so1.id,
      customerId: customers[0].id,
      invoiceDate: new Date("2026-01-12"),
      dueDate: new Date("2026-02-12"),
      totalAmount: new Prisma.Decimal("957.50"),
      status: "UNPAID",
    },
  });
  console.log(`  ✓ Created sales order & customer invoice`);

  // 10. SEED PAYMENTS
  console.log("\n💳 Seeding payments...");

  const payment1 = await prisma.payment.create({
    data: {
      type: "PAYMENT",
      method: "BANK",
      amount: new Prisma.Decimal("1600.00"),
      date: new Date("2026-02-01"),
      vendorBillId: bill1.id,
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      type: "RECEIPT",
      method: "BANK",
      amount: new Prisma.Decimal("500.00"),
      date: new Date("2026-01-25"),
      customerInvoiceId: invoice1.id,
    },
  });

  // Update bill & invoice status after payments
  await prisma.vendorBill.update({
    where: { id: bill1.id },
    data: { status: "PAID" },
  });

  await prisma.customerInvoice.update({
    where: { id: invoice1.id },
    data: { status: "PARTIALLY_PAID" },
  });

  console.log(`  ✓ Created 2 payments`);

  console.log("\n✅ Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
