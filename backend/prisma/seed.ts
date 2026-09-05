import { PrismaClient, Prisma, PaymentMethod } from "@prisma/client";
import { hashPassword } from "../src/services/auth.service";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting expanded database seed (>20 records per entity)...\n");

  // 1. SEED STAFF USERS (5 users)
  console.log("📝 Seeding staff users...");
  const staff = [
    { name: "Utsav Padaliya", loginId: "utsav01", email: "utsav@example.com", password: "Utsav@123", role: "ADMIN" as const },
    { name: "Maulik Patel", loginId: "maulik01", email: "maulik@example.com", password: "Maulik@123", role: "ACCOUNTANT" as const },
    { name: "Dipesh Sharma", loginId: "dipesh01", email: "dipesh@example.com", password: "Dipesh@123", role: "ACCOUNTANT" as const },
    { name: "Rahul Verma", loginId: "rahul01", email: "rahul@example.com", password: "Rahul@123", role: "ACCOUNTANT" as const },
    { name: "Priya Singh", loginId: "priya01", email: "priya@example.com", password: "Priya@123", role: "ADMIN" as const },
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
    console.log(`  ✓ User: ${person.loginId} (${person.role})`);
  }

  // 2. SEED CHART OF ACCOUNTS (30 GL Accounts)
  console.log("\n💰 Seeding chart of accounts...");
  const accountsData = [
    // ASSET (8)
    { name: "Cash on Hand", type: "ASSET" as const },
    { name: "Bank Account", type: "ASSET" as const },
    { name: "Accounts Receivable", type: "ASSET" as const },
    { name: "Inventory - Raw Wood", type: "ASSET" as const },
    { name: "Inventory - Metal Parts", type: "ASSET" as const },
    { name: "Inventory - Finished Goods", type: "ASSET" as const },
    { name: "Furniture & Fixtures", type: "ASSET" as const },
    { name: "Office Machinery & Equipment", type: "ASSET" as const },
    // LIABILITY (6)
    { name: "Accounts Payable", type: "LIABILITY" as const },
    { name: "Short-term Bank Loan", type: "LIABILITY" as const },
    { name: "Sales Tax Payable", type: "LIABILITY" as const },
    { name: "Payroll Liabilities", type: "LIABILITY" as const },
    { name: "Accrued Expenses", type: "LIABILITY" as const },
    { name: "Long-term Commercial Loan", type: "LIABILITY" as const },
    // CAPITAL (4)
    { name: "Opening Balance Equity", type: "CAPITAL" as const },
    { name: "Owner's Capital Share", type: "CAPITAL" as const },
    { name: "Retained Earnings", type: "CAPITAL" as const },
    { name: "Common Stock", type: "CAPITAL" as const },
    // INCOME (6)
    { name: "Furniture Sales Revenue", type: "INCOME" as const },
    { name: "Custom Project Revenue", type: "INCOME" as const },
    { name: "Assembly & Service Revenue", type: "INCOME" as const },
    { name: "Maintenance Contract Revenue", type: "INCOME" as const },
    { name: "Export Sales Revenue", type: "INCOME" as const },
    { name: "Discounts & Rebates Income", type: "INCOME" as const },
    // EXPENSE (6)
    { name: "Raw Material Purchase Expense", type: "EXPENSE" as const },
    { name: "Staff Salary & Wages Expense", type: "EXPENSE" as const },
    { name: "Factory Rent Expense", type: "EXPENSE" as const },
    { name: "Utilities & Electricity Expense", type: "EXPENSE" as const },
    { name: "Marketing & Advertising Expense", type: "EXPENSE" as const },
    { name: "Freight & Shipping Expense", type: "EXPENSE" as const },
  ];

  const accountsCreated = [];
  for (const acc of accountsData) {
    let account = await prisma.account.findFirst({ where: { name: acc.name } });
    if (!account) {
      account = await prisma.account.create({ data: acc });
    }
    accountsCreated.push(account);
  }
  console.log(`  ✓ Created/Verified ${accountsCreated.length} GL Accounts`);

  // 3. SEED JOURNALS (4 Journals)
  console.log("\n📖 Seeding journals...");
  const salesAccount = accountsCreated.find((a) => a.name === "Furniture Sales Revenue")!;
  const purchaseAccount = accountsCreated.find((a) => a.name === "Raw Material Purchase Expense")!;
  const bankAccount = accountsCreated.find((a) => a.name === "Bank Account")!;
  const cashAccount = accountsCreated.find((a) => a.name === "Cash on Hand")!;

  const journalsData = [
    { name: "Sales Journal", type: "SALES" as const, defaultAccountId: salesAccount.id },
    { name: "Purchase Journal", type: "PURCHASE" as const, defaultAccountId: purchaseAccount.id },
    { name: "Bank Journal", type: "BANK" as const, defaultAccountId: bankAccount.id },
    { name: "Cash Journal", type: "CASH" as const, defaultAccountId: cashAccount.id },
  ];

  const journalsCreated = [];
  for (const jData of journalsData) {
    let j = await prisma.journal.findFirst({ where: { name: jData.name } });
    if (!j) {
      j = await prisma.journal.create({ data: jData });
    }
    journalsCreated.push(j);
  }
  console.log(`  ✓ Created/Verified ${journalsCreated.length} Journals`);

  // 4. SEED PRODUCTS (26 Products)
  console.log("\n📦 Seeding products (26 items)...");
  const productsData = [
    { name: "Ergonomic Mesh Chair", type: "GOODS" as const, salesPrice: "180.00", costPrice: "90.00", category: "Seating" },
    { name: "Executive Wooden Desk", type: "GOODS" as const, salesPrice: "350.00", costPrice: "180.00", category: "Desks" },
    { name: "Electric Motorized Standing Desk", type: "GOODS" as const, salesPrice: "480.00", costPrice: "240.00", category: "Desks" },
    { name: "5-Tier Modular Bookshelf", type: "GOODS" as const, salesPrice: "120.00", costPrice: "60.00", category: "Storage" },
    { name: "10-Person Conference Table", type: "GOODS" as const, salesPrice: "750.00", costPrice: "380.00", category: "Tables" },
    { name: "Steel 3-Drawer Filing Cabinet", type: "GOODS" as const, salesPrice: "140.00", costPrice: "70.00", category: "Storage" },
    { name: "Acoustic Fabric Office Partition", type: "GOODS" as const, salesPrice: "210.00", costPrice: "110.00", category: "Partitions" },
    { name: "Premium Leather Lounge Armchair", type: "GOODS" as const, salesPrice: "420.00", costPrice: "210.00", category: "Seating" },
    { name: "Curved Reception Desk", type: "GOODS" as const, salesPrice: "650.00", costPrice: "320.00", category: "Desks" },
    { name: "Cafeteria Round Dining Table", type: "GOODS" as const, salesPrice: "160.00", costPrice: "85.00", category: "Tables" },
    { name: "Heavy-Duty Wooden Bench", type: "GOODS" as const, salesPrice: "220.00", costPrice: "110.00", category: "Outdoor Furniture" },
    { name: "Stainless Steel Recycling Bin", type: "GOODS" as const, salesPrice: "95.00", costPrice: "45.00", category: "Outdoor Furniture" },
    { name: "Solar Smart Urban Bench", type: "GOODS" as const, salesPrice: "1200.00", costPrice: "650.00", category: "Smart Infrastructure" },
    { name: "LED Street Light Pole", type: "GOODS" as const, salesPrice: "850.00", costPrice: "420.00", category: "Street Lighting" },
    { name: "Cast Iron Tree Guard Grid", type: "GOODS" as const, salesPrice: "180.00", costPrice: "90.00", category: "Urban Fixtures" },
    { name: "Public Bus Shelter Bench", type: "GOODS" as const, salesPrice: "540.00", costPrice: "280.00", category: "Outdoor Furniture" },
    { name: "Stainless Steel Bike Stand", type: "GOODS" as const, salesPrice: "130.00", costPrice: "65.00", category: "Urban Fixtures" },
    { name: "Adjustable Ergonomic Footrest", type: "GOODS" as const, salesPrice: "45.00", costPrice: "20.00", category: "Accessories" },
    { name: "Dual Monitor Arm Stand", type: "GOODS" as const, salesPrice: "85.00", costPrice: "40.00", category: "Accessories" },
    { name: "Under-Desk Cable Tray", type: "GOODS" as const, salesPrice: "30.00", costPrice: "12.00", category: "Accessories" },
    { name: "Onsite Furniture Assembly Service", type: "SERVICE" as const, salesPrice: "60.00", costPrice: "25.00", category: "Services" },
    { name: "Custom Wood Carving & Engraving", type: "SERVICE" as const, salesPrice: "120.00", costPrice: "45.00", category: "Services" },
    { name: "Annual Office Furniture Maintenance", type: "SERVICE" as const, salesPrice: "300.00", costPrice: "100.00", category: "Services" },
    { name: "Express Freight Delivery Service", type: "SERVICE" as const, salesPrice: "90.00", costPrice: "40.00", category: "Services" },
    { name: "3D Space Planning & Interior Layout", type: "SERVICE" as const, salesPrice: "250.00", costPrice: "80.00", category: "Services" },
    { name: "Ergonomic Workstation Assessment", type: "SERVICE" as const, salesPrice: "150.00", costPrice: "50.00", category: "Services" },
  ];

  const productsCreated = [];
  for (const pData of productsData) {
    let product = await prisma.product.findFirst({ where: { name: pData.name } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: pData.name,
          type: pData.type,
          salesPrice: new Prisma.Decimal(pData.salesPrice),
          costPrice: new Prisma.Decimal(pData.costPrice),
          category: pData.category,
        },
      });
    }
    productsCreated.push(product);
  }
  console.log(`  ✓ Created/Verified ${productsCreated.length} Products`);

  // 5. SEED CONTACTS (26 Vendors & Customers)
  console.log("\n👥 Seeding contacts (26 items)...");
  const defaultPasswordHash = await hashPassword("User@123");
  const contactsData = [
    // Vendors (12)
    { name: "ABC Timber & Wood Suppliers", type: "VENDOR" as const, email: "contact@abctimber.com", mobile: "9876543201", city: "Mumbai", state: "MH", pincode: "400001", isActivated: true },
    { name: "XYZ Steel Imports Ltd", type: "VENDOR" as const, email: "info@xyzsteel.com", mobile: "9876543202", city: "Delhi", state: "DL", pincode: "110001", isActivated: true },
    { name: "Tech Hardware Solutions", type: "VENDOR" as const, email: "sales@techhardware.com", mobile: "9876543203", city: "Bangalore", state: "KA", pincode: "560001", isActivated: true },
    { name: "Precision Fasteners & Screws", type: "VENDOR" as const, email: "orders@precisionfasteners.com", mobile: "9876543204", city: "Pune", state: "MH", pincode: "411001", isActivated: true },
    { name: "Global Foam & Fabrics Co", type: "VENDOR" as const, email: "support@globalfoam.com", mobile: "9876543205", city: "Surat", state: "GJ", pincode: "395001", isActivated: true },
    { name: "Urban Powder Coating Works", type: "VENDOR" as const, email: "info@urbancoating.com", mobile: "9876543206", city: "Ahmedabad", state: "GJ", pincode: "380001", isActivated: true },
    { name: "Metro Cast Iron Foundry", type: "VENDOR" as const, email: "sales@metrofoundry.com", mobile: "9876543207", city: "Kolkata", state: "WB", pincode: "700001", isActivated: true },
    { name: "Green Eco Lumber Corp", type: "VENDOR" as const, email: "timber@greenecolumber.com", mobile: "9876543208", city: "Chennai", state: "TN", pincode: "600001", isActivated: true },
    { name: "ProLock Drawer Systems", type: "VENDOR" as const, email: "contact@prolocksystems.com", mobile: "9876543209", city: "Hyderabad", state: "TS", pincode: "500001", isActivated: true },
    { name: "Solar Panel & LED Tech", type: "VENDOR" as const, email: "solar@ledtech.com", mobile: "9876543210", city: "Jaipur", state: "RJ", pincode: "302001", isActivated: true },
    { name: "Polymer Plastics Ltd", type: "VENDOR" as const, email: "info@polymerplastics.com", mobile: "9876543211", city: "Vadodara", state: "GJ", pincode: "390001", isActivated: true },
    { name: "Industrial Adhesives & Paints", type: "VENDOR" as const, email: "paints@industrialadhesives.com", mobile: "9876543212", city: "Nagpur", state: "MH", pincode: "440001", isActivated: true },

    // Customers (12)
    { name: "Acme Corporate Park", type: "CUSTOMER" as const, email: "procurement@acmecorp.com", mobile: "9123456701", city: "Mumbai", state: "MH", pincode: "400050", isActivated: true },
    { name: "Global Financial Services", type: "CUSTOMER" as const, email: "facilities@globalfinance.com", mobile: "9123456702", city: "Pune", state: "MH", pincode: "411002", isActivated: true },
    { name: "StartUp Accelerator Hub", type: "CUSTOMER" as const, email: "admin@startuphub.com", mobile: "9123456703", city: "Bangalore", state: "KA", pincode: "560034", isActivated: true },
    { name: "Apex Tech IT Park", type: "CUSTOMER" as const, email: "admin@apextechpark.com", mobile: "9123456704", city: "Hyderabad", state: "TS", pincode: "500081", isActivated: true },
    { name: "Horizon Coworking Spaces", type: "CUSTOMER" as const, email: "hello@horizoncoworking.com", mobile: "9123456705", city: "Delhi", state: "DL", pincode: "110020", isActivated: true },
    { name: "City Municipal Development Authority", type: "CUSTOMER" as const, email: "projects@citydevelopment.gov", mobile: "9123456706", city: "Ahmedabad", state: "GJ", pincode: "380009", isActivated: true },
    { name: "National Highway Trust", type: "CUSTOMER" as const, email: "infrastructure@highwaytrust.org", mobile: "9123456707", city: "New Delhi", state: "DL", pincode: "110003", isActivated: true },
    { name: "St. Jude Educational Campus", type: "CUSTOMER" as const, email: "campus@stjude.edu", mobile: "9123456708", city: "Chennai", state: "TN", pincode: "600025", isActivated: true },
    { name: "Grand Vista Luxury Hotels", type: "CUSTOMER" as const, email: "purchase@grandvistahotels.com", mobile: "9123456709", city: "Goa", state: "GA", pincode: "403001", isActivated: true },
    { name: "Apex International Airport Authority", type: "CUSTOMER" as const, email: "vendor-portal@apexairport.com", mobile: "9123456710", city: "Mumbai", state: "MH", pincode: "400099", isActivated: true },
    { name: "Zenith Software Systems", type: "CUSTOMER" as const, email: "hr@zenithsoftware.com", mobile: "9123456711", city: "Kolkata", state: "WB", pincode: "700091", isActivated: false },
    { name: "Nova Healthcare Hospitals", type: "CUSTOMER" as const, email: "admin@novahealth.com", mobile: "9123456712", city: "Chandigarh", state: "CH", pincode: "160001", isActivated: false },

    // Both Vendor & Customer (2)
    { name: "Omni Logistics & Trade Center", type: "BOTH" as const, email: "support@omnilogistics.com", mobile: "9555444331", city: "Navi Mumbai", state: "MH", pincode: "400703", isActivated: true },
    { name: "Universal Building Solutions", type: "BOTH" as const, email: "contact@universalbuilding.com", mobile: "9555444332", city: "Indore", state: "MP", pincode: "452001", isActivated: true },
  ];

  const contactsCreated = [];
  for (const cData of contactsData) {
    const contact = await prisma.contact.upsert({
      where: { email: cData.email },
      update: {},
      create: {
        ...cData,
        passwordHash: cData.isActivated ? defaultPasswordHash : null,
      },
    });
    contactsCreated.push(contact);
  }
  console.log(`  ✓ Created/Verified ${contactsCreated.length} Contacts`);

  // 6. SEED ANALYTIC ACCOUNTS (22 items)
  console.log("\n📊 Seeding analytic accounts (22 items)...");
  const analyticData = [
    { name: "Marketing & Brand Promotions", type: "EXPENSE" as const },
    { name: "Commercial Sales Division", type: "INCOME" as const },
    { name: "Factory Operations & Crafting", type: "EXPENSE" as const },
    { name: "Product A - Ergonomic Line Revenue", type: "INCOME" as const },
    { name: "Product B - Executive Desk Revenue", type: "INCOME" as const },
    { name: "Research & Development Lab", type: "EXPENSE" as const },
    { name: "Customer Support & After-Sales", type: "EXPENSE" as const },
    { name: "Human Resources & Training", type: "EXPENSE" as const },
    { name: "IT Infrastructure & Cloud Services", type: "EXPENSE" as const },
    { name: "Supply Chain & Material Logistics", type: "EXPENSE" as const },
    { name: "Quality Control & Compliance", type: "EXPENSE" as const },
    { name: "Municipal & Public Infrastructure Revenue", type: "INCOME" as const },
    { name: "Smart City Infrastructure Projects", type: "INCOME" as const },
    { name: "Export & International Sales Revenue", type: "INCOME" as const },
    { name: "Custom Architectural Projects", type: "INCOME" as const },
    { name: "Corporate Showroom Maintenance", type: "EXPENSE" as const },
    { name: "Sustainability & Green Materials", type: "EXPENSE" as const },
    { name: "Executive Management & Legal", type: "EXPENSE" as const },
    { name: "Field Assembly & Onsite Support", type: "EXPENSE" as const },
    { name: "Annual Maintenance Contracts Revenue", type: "INCOME" as const },
    { name: "Design & Prototyping Workshop", type: "EXPENSE" as const },
    { name: "Warehouse & Inventory Storage", type: "EXPENSE" as const },
  ];

  const analyticAccountsCreated = [];
  for (const aData of analyticData) {
    let aa = await prisma.analyticAccount.findFirst({ where: { name: aData.name } });
    if (!aa) {
      aa = await prisma.analyticAccount.create({ data: aData });
    }
    analyticAccountsCreated.push(aa);
  }
  console.log(`  ✓ Created/Verified ${analyticAccountsCreated.length} Analytic Accounts`);

  // 7. SEED BUDGETS (25 items)
  console.log("\n💵 Seeding budgets (25 items)...");
  const periods = ["2026-Q1", "2026-Q2", "2026-Q3", "2026-Q4"];
  const budgetTemplates = [
    { name: "Marketing Campaign Target", planned: "65000.00", analyticIdx: 0 },
    { name: "Commercial Sales Quota", planned: "250000.00", analyticIdx: 1 },
    { name: "Factory Overheads Target", planned: "90000.00", analyticIdx: 2 },
    { name: "Ergonomic Line Sales Goal", planned: "180000.00", analyticIdx: 3 },
    { name: "Executive Desk Sales Goal", planned: "140000.00", analyticIdx: 4 },
    { name: "R&D Prototype Budget", planned: "45000.00", analyticIdx: 5 },
    { name: "Smart City Contract Target", planned: "350000.00", analyticIdx: 12 },
  ];

  const seededBudgets = [];
  let bCounter = 1;
  for (const p of periods) {
    for (const bt of budgetTemplates) {
      if (seededBudgets.length >= 25) break;
      const bName = `${bt.name} ${p}`;
      let b = await prisma.budget.findFirst({ where: { name: bName, period: p } });
      if (!b) {
        b = await prisma.budget.create({
          data: {
            name: bName,
            period: p,
            plannedAmount: new Prisma.Decimal(bt.planned),
            analyticAccountId: analyticAccountsCreated[bt.analyticIdx % analyticAccountsCreated.length].id,
            responsiblePersonId: users[bCounter % users.length].id,
          },
        });
      }
      seededBudgets.push(b);
      bCounter++;
    }
  }
  console.log(`  ✓ Created/Verified ${seededBudgets.length} Budgets`);

  // 8. SEED PURCHASE ORDERS (25 items)
  console.log("\n🛒 Seeding purchase orders (25 items)...");
  const vendorsList = contactsCreated.filter((c) => c.type === "VENDOR" || c.type === "BOTH");
  const poStatuses: Array<"DRAFT" | "CONFIRMED" | "BILLED" | "CANCELLED"> = [
    "DRAFT", "CONFIRMED", "BILLED", "CANCELLED", "CONFIRMED", "BILLED"
  ];

  const purchaseOrdersCreated = [];
  for (let i = 1; i <= 25; i++) {
    const poNum = `PO-2026-${1000 + i}`;
    let po = await prisma.purchaseOrder.findUnique({ where: { poNumber: poNum } });
    if (!po) {
      const vendor = vendorsList[(i - 1) % vendorsList.length];
      const status = poStatuses[(i - 1) % poStatuses.length];
      const poDate = new Date(2026, 0, (i % 28) + 1);

      po = await prisma.purchaseOrder.create({
        data: {
          poNumber: poNum,
          vendorId: vendor.id,
          date: poDate,
          status,
          items: {
            create: [
              {
                productId: productsCreated[(i * 2) % productsCreated.length].id,
                quantity: (i % 5) + 5,
                unitPrice: productsCreated[(i * 2) % productsCreated.length].costPrice,
              },
              {
                productId: productsCreated[(i * 2 + 1) % productsCreated.length].id,
                quantity: (i % 3) + 2,
                unitPrice: productsCreated[(i * 2 + 1) % productsCreated.length].costPrice,
              },
            ],
          },
        },
      });
    }
    purchaseOrdersCreated.push(po);
  }
  console.log(`  ✓ Created/Verified ${purchaseOrdersCreated.length} Purchase Orders`);

  // 9. SEED SALES ORDERS (25 items)
  console.log("\n📈 Seeding sales orders (25 items)...");
  const customersList = contactsCreated.filter((c) => c.type === "CUSTOMER" || c.type === "BOTH");
  const soStatuses: Array<"DRAFT" | "CONFIRMED" | "BILLED" | "CANCELLED"> = [
    "CONFIRMED", "BILLED", "DRAFT", "BILLED", "CONFIRMED", "CANCELLED"
  ];

  const salesOrdersCreated = [];
  for (let i = 1; i <= 25; i++) {
    const soNum = `SO-2026-${2000 + i}`;
    let so = await prisma.salesOrder.findUnique({ where: { soNumber: soNum } });
    if (!so) {
      const customer = customersList[(i - 1) % customersList.length];
      const status = soStatuses[(i - 1) % soStatuses.length];
      const soDate = new Date(2026, 0, (i % 28) + 1);

      const prod1 = productsCreated[(i * 3) % productsCreated.length];
      const prod2 = productsCreated[(i * 3 + 1) % productsCreated.length];

      so = await prisma.salesOrder.create({
        data: {
          soNumber: soNum,
          customerId: customer.id,
          date: soDate,
          status,
          items: {
            create: [
              {
                productId: prod1.id,
                quantity: (i % 4) + 2,
                unitPrice: prod1.salesPrice,
                tax: new Prisma.Decimal(((Number(prod1.salesPrice) * (i % 4 + 2)) * 0.05).toFixed(2)),
              },
              {
                productId: prod2.id,
                quantity: (i % 3) + 1,
                unitPrice: prod2.salesPrice,
                tax: new Prisma.Decimal(((Number(prod2.salesPrice) * (i % 3 + 1)) * 0.05).toFixed(2)),
              },
            ],
          },
        },
      });
    }
    salesOrdersCreated.push(so);
  }
  console.log(`  ✓ Created/Verified ${salesOrdersCreated.length} Sales Orders`);

  // 10. SEED VENDOR BILLS (25 items)
  console.log("\n🧾 Seeding vendor bills (25 items)...");
  const billedPOs = purchaseOrdersCreated.filter((p) => p.status === "BILLED" || p.status === "CONFIRMED");
  const docStatuses: Array<"UNPAID" | "PARTIALLY_PAID" | "PAID"> = ["UNPAID", "PAID", "PARTIALLY_PAID", "UNPAID", "PAID"];

  const vendorBillsCreated = [];
  for (let i = 1; i <= Math.min(25, billedPOs.length); i++) {
    const po = billedPOs[i - 1];
    const billNum = `BILL-2026-${5000 + i}`;
    let bill = await prisma.vendorBill.findUnique({ where: { billNumber: billNum } });
    if (!bill) {
      const status = docStatuses[(i - 1) % docStatuses.length];
      const invDate = new Date(2026, 1, (i % 20) + 1);
      const dueDate = new Date(2026, 2, (i % 20) + 1);
      const totalAmount = new Prisma.Decimal((1200 + i * 140).toFixed(2));

      bill = await prisma.vendorBill.create({
        data: {
          billNumber: billNum,
          purchaseOrderId: po.id,
          vendorId: po.vendorId,
          invoiceDate: invDate,
          dueDate: dueDate,
          totalAmount,
          status,
        },
      });
    }
    vendorBillsCreated.push(bill);
  }
  console.log(`  ✓ Created/Verified ${vendorBillsCreated.length} Vendor Bills`);

  // 11. SEED CUSTOMER INVOICES (25 items)
  console.log("\n📄 Seeding customer invoices (25 items)...");
  const billedSOs = salesOrdersCreated.filter((s) => s.status === "BILLED" || s.status === "CONFIRMED");

  const customerInvoicesCreated = [];
  for (let i = 1; i <= Math.min(25, billedSOs.length); i++) {
    const so = billedSOs[i - 1];
    const invNum = `INV-2026-${3000 + i}`;
    let invoice = await prisma.customerInvoice.findUnique({ where: { invoiceNumber: invNum } });
    if (!invoice) {
      const status = docStatuses[(i - 1) % docStatuses.length];
      const invDate = new Date(2026, 1, (i % 20) + 1);
      const dueDate = new Date(2026, 2, (i % 20) + 1);
      const totalAmount = new Prisma.Decimal((1800 + i * 210).toFixed(2));

      invoice = await prisma.customerInvoice.create({
        data: {
          invoiceNumber: invNum,
          salesOrderId: so.id,
          customerId: so.customerId,
          invoiceDate: invDate,
          dueDate: dueDate,
          totalAmount,
          status,
        },
      });
    }
    customerInvoicesCreated.push(invoice);
  }
  console.log(`  ✓ Created/Verified ${customerInvoicesCreated.length} Customer Invoices`);

  // 12. SEED PAYMENTS (25 items)
  console.log("\n💳 Seeding payments (25 items)...");
  const paymentsCreated = [];
  for (let i = 1; i <= 25; i++) {
    const isVendorPayment = i % 2 === 0;
    const pDate = new Date(2026, 2, (i % 25) + 1);
    const amount = new Prisma.Decimal((500 + i * 75).toFixed(2));
    const method: PaymentMethod = i % 3 === 0 ? PaymentMethod.CASH : PaymentMethod.BANK;

    if (isVendorPayment && vendorBillsCreated.length > 0) {
      const bill = vendorBillsCreated[(i - 1) % vendorBillsCreated.length];
      const p = await prisma.payment.create({
        data: {
          type: "PAYMENT",
          method,
          amount,
          date: pDate,
          vendorBillId: bill.id,
        },
      });
      paymentsCreated.push(p);
    } else if (customerInvoicesCreated.length > 0) {
      const inv = customerInvoicesCreated[(i - 1) % customerInvoicesCreated.length];
      const p = await prisma.payment.create({
        data: {
          type: "RECEIPT",
          method,
          amount,
          date: pDate,
          customerInvoiceId: inv.id,
        },
      });
      paymentsCreated.push(p);
    }
  }
  console.log(`  ✓ Created/Verified ${paymentsCreated.length} Payments`);

  // 13. SEED JOURNAL ENTRIES & ITEMS (25 Journal Entries)
  console.log("\n📝 Seeding journal entries (25 items)...");
  const allAccountsList = await prisma.account.findMany();
  const accMap = new Map(allAccountsList.map((a) => [a.name, a.id]));

  const allJournalsList = await prisma.journal.findMany();
  const jrMap = new Map(allJournalsList.map((j) => [j.name, j.id]));
  const bankJrId = jrMap.get("Bank Journal") || allJournalsList[0].id;
  const salesJrId = jrMap.get("Sales Journal") || allJournalsList[0].id;
  const purchaseJrId = jrMap.get("Purchase Journal") || allJournalsList[0].id;
  const cashJrId = jrMap.get("Cash Journal") || allJournalsList[0].id;

  const journalEntriesToSeed = [];
  for (let i = 1; i <= 25; i++) {
    const ref = `JE-2026-REC-${100 + i}`;
    const date = new Date(2026, (i % 3), (i % 28) + 1);
    let journalId = bankJrId;
    if (i % 4 === 1) journalId = salesJrId;
    if (i % 4 === 2) journalId = purchaseJrId;
    if (i % 4 === 3) journalId = cashJrId;

    const amountVal = new Prisma.Decimal((1000 + i * 250).toFixed(2));

    const debitAcc = i % 2 === 0
      ? accMap.get("Bank Account")!
      : accMap.get("Furniture Sales Revenue")!;
    const creditAcc = i % 2 === 0
      ? accMap.get("Raw Material Purchase Expense")!
      : accMap.get("Cash on Hand")!;

    journalEntriesToSeed.push({
      reference: ref,
      journalId,
      date,
      items: [
        { accountId: debitAcc, debit: amountVal, credit: new Prisma.Decimal("0.00") },
        { accountId: creditAcc, debit: new Prisma.Decimal("0.00"), credit: amountVal },
      ],
    });
  }

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
  console.log(`  ✓ Created/Verified ${journalEntriesToSeed.length} Journal Entries (${seededJEsCount} newly created)`);

  console.log("\n✅ Comprehensive database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
