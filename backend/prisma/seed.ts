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
    try {
      const account = await prisma.account.create({ data: acc });
      accountsCreated.push(account);
    } catch (e: any) {
      // Skip if already exists
      if (e.code !== "P2002") throw e;
    }
  }
  console.log(`  ✓ Created/Verified ${accountsCreated.length} accounts`);

  // 3. SEED JOURNALS
  console.log("\n📖 Seeding journals...");
  const allAccounts = await prisma.account.findMany();
  const salesAccount = allAccounts.find(a => a.name === "Sales Revenue")!;
  const purchaseAccount = allAccounts.find(a => a.name === "Purchase Expense")!;
  const bankAccount = allAccounts.find(a => a.name === "Bank Account")!;
  const cashAccount = allAccounts.find(a => a.name === "Cash")!;

  const journals = [
    { name: "Sales Journal", type: "SALES" as const, defaultAccountId: salesAccount.id },
    { name: "Purchase Journal", type: "PURCHASE" as const, defaultAccountId: purchaseAccount.id },
    { name: "Bank Journal", type: "BANK" as const, defaultAccountId: bankAccount.id },
    { name: "Cash Journal", type: "CASH" as const, defaultAccountId: cashAccount.id },
  ];

  const journalsCreated = [];
  for (const journal of journals) {
    try {
      const j = await prisma.journal.create({ data: journal });
      journalsCreated.push(j);
    } catch (e: any) {
      if (e.code !== "P2002") throw e;
    }
  }
  console.log(`  ✓ Created/Verified ${journalsCreated.length} journals`);

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
    try {
      const p = await prisma.product.create({ data: product });
      productsCreated.push(p);
    } catch (e: any) {
      if (e.code !== "P2002") throw e;
    }
  }
  console.log(`  ✓ Created/Verified ${productsCreated.length} products`);

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
  let analyticAccountsCreated: any[] = [];
  try {
    console.log("\n📊 Seeding analytic accounts...");
    const analyticAccounts = [
      { name: "Marketing Department", type: "EXPENSE" as const },
      { name: "Sales Department", type: "INCOME" as const },
      { name: "Operations", type: "EXPENSE" as const },
      { name: "Product A Revenue", type: "INCOME" as const },
      { name: "Product B Revenue", type: "INCOME" as const },
    ];

    for (const aa of analyticAccounts) {
      try {
        const a = await (prisma as any).analyticAccount.create({ data: aa });
        analyticAccountsCreated.push(a);
      } catch (e: any) {
        if (e.code !== "P2002") throw e;
      }
    }
    if (analyticAccountsCreated.length === 0) {
      analyticAccountsCreated = await (prisma as any).analyticAccount.findMany();
    }
    console.log(`  ✓ Created/Verified ${analyticAccountsCreated.length} analytic accounts`);
  } catch (e) {
    console.log(`  ⚠ Skipped analytic accounts (model may not be available yet)`);
  }

  // 7. SEED BUDGETS
  try {
    console.log("\n💵 Seeding budgets...");
    if (analyticAccountsCreated.length > 0) {
      const budgetTemplates = [
        { name: "Marketing Budget", plannedAmount: "50000.00", analyticIndex: 0, userIndex: 1 },
        { name: "Operations Budget", plannedAmount: "75000.00", analyticIndex: 2, userIndex: 2 },
        { name: "Sales Target", plannedAmount: "200000.00", analyticIndex: 1, userIndex: 1 },
        { name: "Product Development", plannedAmount: "120000.00", analyticIndex: 3, userIndex: 0 },
      ];

      const quarters = ["2026-Q1", "2026-Q2", "2026-Q3", "2026-Q4"];
      let seededBudgetsCount = 0;

      for (const q of quarters) {
        for (const t of budgetTemplates) {
          const budgetData = {
            name: `${t.name} ${q}`,
            period: q,
            plannedAmount: new Prisma.Decimal(t.plannedAmount),
            analyticAccountId: analyticAccountsCreated[Math.min(t.analyticIndex, analyticAccountsCreated.length - 1)].id,
            responsiblePersonId: (users[t.userIndex] || users[0]).id,
          };

          const existing = await (prisma as any).budget.findFirst({
            where: { name: budgetData.name, period: budgetData.period },
          });

          if (!existing) {
            await (prisma as any).budget.create({ data: budgetData });
            seededBudgetsCount++;
          }
        }
      }
      console.log(`  ✓ Created/Verified ${quarters.length * budgetTemplates.length} budgets (${seededBudgetsCount} newly created)`);
    } else {
      console.log(`  ⚠ Skipped budgets (no analytic accounts available)`);
    }
  } catch (e) {
    console.log(`  ⚠ Skipped budgets:`, e);
  }

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

  await prisma.payment.create({
    data: {
      type: "PAYMENT",
      method: "BANK_TRANSFER",
      amount: new Prisma.Decimal("1600.00"),
      date: new Date("2026-02-01"),
      vendorBillId: bill1.id,
    },
  });

  await prisma.payment.create({
    data: {
      type: "RECEIPT",
      method: "BANK_TRANSFER",
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

  // 11. SEED JOURNAL ENTRIES & ITEMS (for Financial Reports: Balance Sheet & Profit & Loss)
  console.log("\n📝 Seeding journal entries for accounting reports...");

  const allAccountsForJE = await prisma.account.findMany();
  const accMap = new Map(allAccountsForJE.map((a) => [a.name, a.id]));

  const allJournalsForJE = await prisma.journal.findMany();
  const jrMap = new Map(allJournalsForJE.map((j) => [j.name, j.id]));
  const bankJrId = jrMap.get("Bank Journal") || allJournalsForJE[0].id;
  const salesJrId = jrMap.get("Sales Journal") || allJournalsForJE[0].id;
  const purchaseJrId = jrMap.get("Purchase Journal") || allJournalsForJE[0].id;

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const currentDay = Math.max(1, Math.min(now.getDate(), 28));
  const currentMonthDate1 = new Date(curYear, curMonth, Math.max(1, Math.min(2, currentDay)));
  const currentMonthDate2 = new Date(curYear, curMonth, Math.max(1, Math.min(3, currentDay)));
  const currentMonthDate3 = new Date(curYear, curMonth, Math.max(1, Math.min(4, currentDay)));
  const currentMonthDate4 = new Date(curYear, curMonth, currentDay);

  const journalEntriesToSeed = [
    // 1. Opening Balance - Perfectly balances Assets = Liabilities + Capital
    {
      reference: "JE-OPENING-2026",
      journalId: bankJrId,
      date: new Date("2026-01-01"),
      items: [
        { accountId: accMap.get("Bank Account")!, debit: new Prisma.Decimal("100000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Cash")!, debit: new Prisma.Decimal("25000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Inventory")!, debit: new Prisma.Decimal("50000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Furniture & Fixtures")!, debit: new Prisma.Decimal("40000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Accounts Payable")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("25000.00") },
        { accountId: accMap.get("Short-term Loan")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("40000.00") },
        { accountId: accMap.get("Opening Balance")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("150000.00") },
      ],
    },
    // 2. Q1 Operations - Sales
    {
      reference: "JE-OPS-Q1-SALES",
      journalId: salesJrId,
      date: new Date("2026-03-15"),
      items: [
        { accountId: accMap.get("Accounts Receivable")!, debit: new Prisma.Decimal("35000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Sales Revenue")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("30000.00") },
        { accountId: accMap.get("Service Revenue")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("5000.00") },
      ],
    },
    // 3. Q1 Operations - Payment Collection
    {
      reference: "JE-OPS-Q1-PAYMENT",
      journalId: bankJrId,
      date: new Date("2026-03-25"),
      items: [
        { accountId: accMap.get("Bank Account")!, debit: new Prisma.Decimal("30000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Accounts Receivable")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("30000.00") },
      ],
    },
    // 4. Q1 Operations - Expenses
    {
      reference: "JE-OPS-Q1-EXPENSES",
      journalId: bankJrId,
      date: new Date("2026-03-28"),
      items: [
        { accountId: accMap.get("Rent Expense")!, debit: new Prisma.Decimal("9000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Salary Expense")!, debit: new Prisma.Decimal("15000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Utilities Expense")!, debit: new Prisma.Decimal("2500.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Bank Account")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("26500.00") },
      ],
    },
    // 5. Current Month - Sales Revenue (shows in P&L current month default)
    {
      reference: "JE-CURRENT-MONTH-SALES",
      journalId: salesJrId,
      date: currentMonthDate1,
      items: [
        { accountId: accMap.get("Accounts Receivable")!, debit: new Prisma.Decimal("45000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Sales Revenue")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("38000.00") },
        { accountId: accMap.get("Service Revenue")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("7000.00") },
      ],
    },
    // 6. Current Month - Purchases
    {
      reference: "JE-CURRENT-MONTH-PURCHASES",
      journalId: purchaseJrId,
      date: currentMonthDate2,
      items: [
        { accountId: accMap.get("Purchase Expense")!, debit: new Prisma.Decimal("16500.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Accounts Payable")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("16500.00") },
      ],
    },
    // 7. Current Month - Operating Expenses (Rent, Salary, Utilities)
    {
      reference: "JE-CURRENT-MONTH-EXPENSES",
      journalId: bankJrId,
      date: currentMonthDate3,
      items: [
        { accountId: accMap.get("Rent Expense")!, debit: new Prisma.Decimal("6000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Salary Expense")!, debit: new Prisma.Decimal("12500.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Utilities Expense")!, debit: new Prisma.Decimal("1800.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Bank Account")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("20300.00") },
      ],
    },
    // 8. Current Month - Collections & Settlements
    {
      reference: "JE-CURRENT-MONTH-SETTLEMENTS",
      journalId: bankJrId,
      date: currentMonthDate4,
      items: [
        { accountId: accMap.get("Bank Account")!, debit: new Prisma.Decimal("25000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Accounts Payable")!, debit: new Prisma.Decimal("10000.00"), credit: new Prisma.Decimal("0.00") },
        { accountId: accMap.get("Accounts Receivable")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("25000.00") },
        { accountId: accMap.get("Bank Account")!, debit: new Prisma.Decimal("0.00"), credit: new Prisma.Decimal("10000.00") },
      ],
    },
  ];

  let seededJEsCount = 0;
  for (const je of journalEntriesToSeed) {
    const existing = await prisma.journalEntry.findFirst({
      where: { reference: je.reference },
    });

    if (!existing) {
      await prisma.journalEntry.create({
        data: {
          journalId: je.journalId,
          date: je.date,
          reference: je.reference,
          items: {
            create: je.items,
          },
        },
      });
      seededJEsCount++;
    }
  }
  console.log(`  ✓ Created/Verified ${journalEntriesToSeed.length} journal entries (${seededJEsCount} newly created)`);

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
