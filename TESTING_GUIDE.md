# 🧪 Urban Furniture Accounting System — Complete Testing Guide

> **Database has been reset and seeded with fresh data.**
> Follow each phase sequentially — later phases depend on earlier ones.

---

## Table of Contents

1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Phase 1 — Authentication & Login](#2-phase-1--authentication--login)
3. [Phase 2 — Dashboard Overview](#3-phase-2--dashboard-overview)
4. [Phase 3 — Chart of Accounts](#4-phase-3--chart-of-accounts)
5. [Phase 4 — Products](#5-phase-4--products)
6. [Phase 5 — Contacts (Customers & Vendors)](#6-phase-5--contacts-customers--vendors)
7. [Phase 6 — Staff User Management](#7-phase-6--staff-user-management)
8. [Phase 7 — Journals](#8-phase-7--journals)
9. [Phase 8 — Journal Entries](#9-phase-8--journal-entries)
10. [Phase 9 — Purchase Orders & Vendor Bills](#10-phase-9--purchase-orders--vendor-bills)
11. [Phase 10 — Sales Orders & Customer Invoices](#11-phase-10--sales-orders--customer-invoices)
12. [Phase 11 — Analytic Accounts & Budgets](#12-phase-11--analytic-accounts--budgets)
13. [Phase 12 — Financial Reports](#13-phase-12--financial-reports)
14. [Phase 13 — Contact Portal (Customer/Vendor Login)](#14-phase-13--contact-portal-customervendor-login)
15. [Phase 14 — Portal Payments](#15-phase-14--portal-payments)
16. [Phase 15 — Edge Cases & Validation Testing](#16-phase-15--edge-cases--validation-testing)
17. [Quick Reference — Seeded Test Data](#17-quick-reference--seeded-test-data)
18. [Final Checklist](#18-final-checklist)

---

## 1. Prerequisites & Setup

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js  | v18+    | Runtime |
| MySQL    | 8.0+ (MAMP at port 8889) | Database |
| npm      | v9+     | Package manager |

### Step 1: Start MySQL (MAMP)

Make sure MAMP is running with MySQL on port **8889**. The database name is `urban_furniture`.

### Step 2: Reset Database & Seed

```bash
cd backend
npx prisma migrate reset --force
```

This drops all tables, re-applies all migrations, and runs the seed script. After seeding you get:

| Entity             | Count |
|--------------------|-------|
| Staff Users        | 1 (Admin) |
| GL Accounts        | 30    |
| Journals           | 4     |
| Products           | 26    |
| Contacts           | 26 (12 vendors, 12 customers, 2 both) |
| Analytic Accounts  | 22    |
| Budgets            | 25    |
| Purchase Orders    | 25    |
| Sales Orders       | 25    |
| Vendor Bills       | 16    |
| Customer Invoices  | 17    |
| Payments           | 25    |
| Journal Entries    | 25    |

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

Backend runs at **http://localhost:5001**. You should see: `🚀 Server running on port 5001`

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at **http://localhost:3000**

### Step 5: Verify Both Are Running

- Open **http://localhost:3000** → should redirect to login page
- Backend health: `http://localhost:5001/api/v1/auth/me` → returns 401 (expected — no token)

---

## 2. Phase 1 — Authentication & Login

### Test 2.1: Admin Login ✅

1. Go to **http://localhost:3000/login**
2. Enter:

| Field    | Value       |
|----------|-------------|
| Login ID | `utsav01`   |
| Password | `Utsav@123` |

3. Click **Sign In**
4. ✅ **Expected**: Redirected to `/dashboard` — you see the main dashboard with stats
5. ✅ **Verify**: Name "Utsav Padaliya" and role ADMIN shown in sidebar/header

### Test 2.2: Wrong Password ❌

1. Log out (click avatar → Logout)
2. Try: `utsav01` / `wrongpassword`
3. ✅ **Expected**: Error message — "Invalid credentials"

### Test 2.3: Empty Fields ❌

1. Click Sign In without entering anything
2. ✅ **Expected**: Validation errors on both fields

> **Stay logged in as `utsav01` (ADMIN) for all remaining phases.**

---

## 3. Phase 2 — Dashboard Overview

1. Navigate to **http://localhost:3000/dashboard**
2. **Verify these elements**:

| Element                 | What to Check |
|-------------------------|---------------|
| Total Revenue card      | Shows a non-zero value (from seeded invoices) |
| Total Expenses card     | Shows a non-zero value (from seeded bills) |
| Outstanding Receivables | Count of UNPAID/PARTIALLY_PAID customer invoices |
| Outstanding Payables    | Count of UNPAID/PARTIALLY_PAID vendor bills |
| Charts / Graphs         | Visual graphs with data points render correctly |

3. ✅ **Verify**: Numbers reflect seeded data (17 invoices, 16 bills, 25 payments)

---

## 4. Phase 3 — Chart of Accounts

### Test 4.1: View All Accounts

1. Sidebar → **Accounts** → **http://localhost:3000/accounts**
2. ✅ **Expected**: 30 accounts in a table
3. **Verify by type** (use filter if available):

| Type      | Count | Sample Accounts |
|-----------|-------|-----------------|
| ASSET     | 8     | Cash on Hand, Bank Account, Accounts Receivable |
| LIABILITY | 6     | Accounts Payable, Short-term Bank Loan |
| CAPITAL   | 4     | Opening Balance Equity, Retained Earnings |
| INCOME    | 6     | Furniture Sales Revenue, Custom Project Revenue |
| EXPENSE   | 6     | Raw Material Purchase Expense, Staff Salary & Wages |

### Test 4.2: Create a New Account

1. Click **Create Account** / **+ Add**
2. Fill in:

| Field | Value    |
|-------|----------|
| Name  | `Petty Cash` |
| Type  | `ASSET`  |

3. Click **Save**
4. ✅ **Expected**: "Petty Cash" appears in the list — total is now **31**

### Test 4.3: Edit an Account

1. Find "Petty Cash" → click Edit
2. Change name to `Petty Cash Reserve`
3. Save
4. ✅ **Expected**: Name updated in list

---

## 5. Phase 4 — Products

### Test 5.1: View All Products

1. Sidebar → **Products** → **http://localhost:3000/products**
2. ✅ **Expected**: 26 products
3. **Spot-check**:

| Product                          | Type    | Sales Price | Cost Price | Category |
|----------------------------------|---------|-------------|------------|----------|
| Ergonomic Mesh Chair             | GOODS   | 180.00      | 90.00      | Seating  |
| Solar Smart Urban Bench          | GOODS   | 1,200.00    | 650.00     | Smart Infrastructure |
| Onsite Furniture Assembly Service| SERVICE | 60.00       | 25.00      | Services |

### Test 5.2: Create a New Product

1. Click **Create Product**
2. Fill in:

| Field       | Value                |
|-------------|----------------------|
| Name        | `Bamboo Standing Desk` |
| Type        | `GOODS`              |
| Sales Price | `399.00`             |
| Cost Price  | `195.00`             |
| Category    | `Desks`              |

3. Click **Save**
4. ✅ **Expected**: Product created — total is now **27**

### Test 5.3: Edit a Product

1. Find "Bamboo Standing Desk" → Edit
2. Change Sales Price to `425.00`
3. Save
4. ✅ **Expected**: Price updated

### Test 5.4: Toggle Product Active/Inactive

1. Find any product → toggle its Active status off
2. ✅ **Expected**: Status changes (inactive products may hide from order dropdowns)

---

## 6. Phase 5 — Contacts (Customers & Vendors)

### Test 6.1: View All Contacts

1. Sidebar → **Contacts** → **http://localhost:3000/contacts**
2. ✅ **Expected**: 26 contacts
3. **Filter by type**: VENDOR (12), CUSTOMER (12), BOTH (2)

| Sample Contact                     | Type     | City       | Activated |
|------------------------------------|----------|------------|-----------|
| ABC Timber & Wood Suppliers        | VENDOR   | Mumbai     | ✅ Yes    |
| Acme Corporate Park                | CUSTOMER | Mumbai     | ✅ Yes    |
| Omni Logistics & Trade Center      | BOTH     | Navi Mumbai| ✅ Yes    |
| Zenith Software Systems            | CUSTOMER | Kolkata    | ❌ No     |
| Nova Healthcare Hospitals          | CUSTOMER | Chandigarh | ❌ No     |

### Test 6.2: Create a New Vendor

1. Click **Create Contact**
2. Fill in:

| Field   | Value                      |
|---------|----------------------------|
| Name    | `Supreme Raw Materials Co` |
| Type    | `VENDOR`                   |
| Email   | `info@supremeraw.com`      |
| Mobile  | `9876500001`               |
| City    | `Rajkot`                   |
| State   | `GJ`                       |
| Pincode | `360001`                   |

3. Click **Save**
4. ✅ **Expected**: New contact appears — total is **27**
5. ✅ **Check backend console**: Activation email log with token/link

### Test 6.3: Create a New Customer

1. Click **Create Contact**
2. Fill in:

| Field   | Value                      |
|---------|----------------------------|
| Name    | `Metro Office Solutions`   |
| Type    | `CUSTOMER`                 |
| Email   | `purchase@metrooffice.com` |
| Mobile  | `9123400001`               |
| City    | `Lucknow`                  |
| State   | `UP`                       |
| Pincode | `226001`                   |

3. Click **Save**
4. ✅ **Expected**: New customer added — total is **28**

### Test 6.4: Edit a Contact

1. Find "Supreme Raw Materials Co" → Edit
2. Change City to `Ahmedabad`
3. Save
4. ✅ **Expected**: City updated

### Test 6.5: Resend Activation Email

1. Find an unactivated contact (e.g., "Zenith Software Systems")
2. Click **Resend Activation**
3. ✅ **Expected**: Success message — check backend console for new activation token

---

## 7. Phase 6 — Staff User Management

### Test 7.1: View Staff Users

1. Sidebar → **Users** → **http://localhost:3000/users**
2. ✅ **Expected**: 1 user:

| Name             | Login ID | Role  | Active |
|------------------|----------|-------|--------|
| Utsav Padaliya   | utsav01  | ADMIN | ✅     |

### Test 7.2: Create a New Staff User

1. Click **Create User**
2. Fill in:

| Field    | Value            |
|----------|------------------|
| Name     | `Ankit Mehta`    |
| Login ID | `ankit01`        |
| Email    | `ankit@example.com` |
| Password | `Ankit@123`      |
| Role     | `ACCOUNTANT`     |

3. Click **Save**
4. ✅ **Expected**: New user appears — total is **2**

### Test 7.3: Verify New User Can Login

1. Log out → Login as `ankit01` / `Ankit@123`
2. ✅ **Expected**: Dashboard loads, role shows ACCOUNTANT
3. Log out → Log back in as `utsav01` / `Utsav@123`

### Test 7.4: Edit a Staff User

1. Find "Ankit Mehta" → Edit → Change role to `ADMIN`
2. Save
3. ✅ **Expected**: Role updated

### Test 7.5: Toggle User Active Status

1. Find "Ankit Mehta" → toggle Active to **OFF**
2. Log out → try login as `ankit01` / `Ankit@123`
3. ✅ **Expected**: Login fails — "Account is disabled" or similar error
4. Log back in as `utsav01`

---

## 8. Phase 7 — Journals

### Test 8.1: View All Journals

1. Sidebar → **Journals** → **http://localhost:3000/journals**
2. ✅ **Expected**: 4 journals:

| Name             | Type     | Default Account                 |
|------------------|----------|---------------------------------|
| Sales Journal    | SALES    | Furniture Sales Revenue         |
| Purchase Journal | PURCHASE | Raw Material Purchase Expense   |
| Bank Journal     | BANK     | Bank Account                    |
| Cash Journal     | CASH     | Cash on Hand                    |

### Test 8.2: Create a New Journal

1. Click **Create Journal**
2. Fill in:

| Field           | Value                |
|-----------------|----------------------|
| Name            | `Petty Cash Journal` |
| Type            | `CASH`               |
| Default Account | Select `Petty Cash Reserve` (created in Phase 3) |

3. Click **Save**
4. ✅ **Expected**: New journal appears — total is **5**

### Test 8.3: Edit a Journal

1. Find "Petty Cash Journal" → Edit → Change name to `Petty Expenses Journal`
2. Save
3. ✅ **Expected**: Name updated

---

## 9. Phase 8 — Journal Entries

### Test 9.1: View All Journal Entries

1. Sidebar → **Journal Entries** → **http://localhost:3000/journal-entries**
2. ✅ **Expected**: 25 entries (JE-2026-REC-101 through JE-2026-REC-125)

### Test 9.2: View Entry Detail

1. Click on `JE-2026-REC-101`
2. ✅ **Expected**:
   - Header: Reference, Date, Journal name
   - Line items: Two rows (one debit, one credit) with **matching amounts**
   - **Total Debit = Total Credit** (balanced)

### Test 9.3: Create a New Journal Entry ✅

1. Click **Create Journal Entry**
2. Fill in:

| Field     | Value            |
|-----------|------------------|
| Journal   | `Bank Journal`   |
| Date      | `2026-09-06`     |
| Reference | `RENT-SEP-2026`  |

3. Add line items:

| Account                | Debit      | Credit   |
|------------------------|------------|----------|
| Factory Rent Expense   | `25000.00` | `0.00`   |
| Bank Account           | `0.00`     | `25000.00` |

4. Click **Save**
5. ✅ **Expected**: Entry created, debits = credits = ₹25,000.00 — total is now **26**

### Test 9.4: Create Unbalanced Entry ❌

1. Try creating an entry with:

| Account      | Debit    | Credit   |
|--------------|----------|----------|
| Cash on Hand | `5000.00`| `0.00`   |
| Bank Account | `0.00`   | `3000.00`|

2. ✅ **Expected**: Validation error — "Debits must equal credits"

---

## 10. Phase 9 — Purchase Orders & Vendor Bills

### Test 10.1: View All Purchase Orders

1. Sidebar → **Purchase Orders** → **http://localhost:3000/purchase-orders**
2. ✅ **Expected**: 25 POs (PO-2026-1001 through PO-2026-1025)
3. **Status mix**: DRAFT, CONFIRMED, BILLED, CANCELLED

### Test 10.2: Create a New Purchase Order

1. Click **Create Purchase Order**
2. Fill in:

| Field  | Value |
|--------|-------|
| Vendor | Select `ABC Timber & Wood Suppliers` |
| Date   | `2026-09-06` |

3. Add line items:

| Product              | Quantity | Unit Price |
|----------------------|----------|------------|
| Ergonomic Mesh Chair | `10`     | `90.00`    |
| Executive Wooden Desk| `5`      | `180.00`   |

4. Click **Save**
5. ✅ **Expected**: PO created in **DRAFT** status with auto-generated PO number
6. ✅ **Verify total**: (10 × 90) + (5 × 180) = **₹1,800.00**

### Test 10.3: Confirm the Purchase Order

1. Find the PO you just created (DRAFT) → Click **Confirm**
2. ✅ **Expected**: Status changes to **CONFIRMED**

### Test 10.4: Convert PO to Vendor Bill

1. With the CONFIRMED PO, click **Convert to Bill**
2. Fill in:

| Field        | Value        |
|--------------|--------------|
| Invoice Date | `2026-09-06` |
| Due Date     | `2026-10-06` |

3. Click **Create Bill**
4. ✅ **Expected**:
   - PO status → **BILLED**
   - New Vendor Bill created automatically

### Test 10.5: Verify Vendor Bill Created

1. Sidebar → **Vendor Bills** → **http://localhost:3000/vendor-bills**
2. ✅ **Expected**: 17 bills (16 seeded + 1 you just created)
3. Click on the new bill → **Verify**:
   - Bill Number auto-generated
   - Linked to your PO
   - Total = ₹1,800.00
   - Status: **UNPAID**

---

## 11. Phase 10 — Sales Orders & Customer Invoices

### Test 11.1: View All Sales Orders

1. Sidebar → **Sales Orders** → **http://localhost:3000/sales-orders**
2. ✅ **Expected**: 25 SOs (SO-2026-2001 through SO-2026-2025)

### Test 11.2: Create a New Sales Order

1. Click **Create Sales Order**
2. Fill in:

| Field    | Value |
|----------|-------|
| Customer | Select `Acme Corporate Park` |
| Date     | `2026-09-06` |

3. Add line items:

| Product                          | Quantity | Unit Price | Tax     |
|----------------------------------|----------|------------|---------|
| Electric Motorized Standing Desk | `3`      | `480.00`   | `72.00` |
| Dual Monitor Arm Stand           | `6`      | `85.00`    | `25.50` |

4. Click **Save**
5. ✅ **Expected**: SO created in **DRAFT** status
6. ✅ **Verify subtotal**: (3 × 480) + (6 × 85) = ₹1,440 + ₹510 = **₹1,950.00** + tax

### Test 11.3: Confirm the Sales Order

1. Find the SO you created → Click **Confirm**
2. ✅ **Expected**: Status → **CONFIRMED**

### Test 11.4: Generate Invoice from Sales Order

1. With the CONFIRMED SO, click **Generate Invoice**
2. Fill in:

| Field        | Value        |
|--------------|--------------|
| Invoice Date | `2026-09-06` |
| Due Date     | `2026-10-06` |

3. Click **Create Invoice**
4. ✅ **Expected**:
   - SO status → **BILLED**
   - New Customer Invoice created

### Test 11.5: Verify Customer Invoice Created

1. Sidebar → **Invoices** → **http://localhost:3000/invoices**
2. ✅ **Expected**: 18 invoices (17 seeded + 1 new)
3. Click on the new invoice → **Verify**:
   - Invoice Number auto-generated
   - Linked to your SO
   - Status: **UNPAID**

---

## 12. Phase 11 — Analytic Accounts & Budgets

### Test 12.1: View Analytic Accounts

1. Sidebar → **Analytic Accounts** → **http://localhost:3000/analytic-accounts**
2. ✅ **Expected**: 22 analytic accounts

| Sample                              | Type    |
|--------------------------------------|---------|
| Marketing & Brand Promotions         | EXPENSE |
| Commercial Sales Division            | INCOME  |
| Smart City Infrastructure Projects   | INCOME  |
| Warehouse & Inventory Storage        | EXPENSE |

### Test 12.2: Create a New Analytic Account

1. Click **Create Analytic Account**
2. Fill in:

| Field | Value                       |
|-------|-----------------------------|
| Name  | `Digital Marketing Campaign`|
| Type  | `EXPENSE`                   |

3. Click **Save**
4. ✅ **Expected**: New account appears — total is **23**

### Test 12.3: View Budgets

1. Sidebar → **Budgets** → **http://localhost:3000/budgets**
2. ✅ **Expected**: 25 budgets across 4 quarters
3. **Spot-check**:

| Budget Name                         | Period  | Planned Amount | Analytic Account |
|--------------------------------------|---------|----------------|------------------|
| Marketing Campaign Target 2026-Q1   | 2026-Q1 | ₹65,000.00     | Marketing & Brand Promotions |
| Commercial Sales Quota 2026-Q1      | 2026-Q1 | ₹250,000.00    | Commercial Sales Division |
| Smart City Contract Target 2026-Q1  | 2026-Q1 | ₹350,000.00    | Smart City Infrastructure Projects |

### Test 12.4: Create a New Budget

1. Click **Create Budget**
2. Fill in:

| Field              | Value                        |
|--------------------|------------------------------|
| Name               | `Digital Marketing Q4 Budget`|
| Period             | `2026-Q4`                    |
| Planned Amount     | `50000.00`                   |
| Analytic Account   | `Digital Marketing Campaign` |
| Responsible Person | `Utsav Padaliya`             |

3. Click **Save**
4. ✅ **Expected**: New budget appears — total is **26**

---

## 13. Phase 12 — Financial Reports

### Test 13.1: Balance Sheet

1. Sidebar → **Reports → Balance Sheet** → **http://localhost:3000/reports/balance-sheet**
2. ✅ **Expected**: Formatted report with:
   - **Assets** section (Cash on Hand, Bank Account, etc.)
   - **Liabilities** section
   - **Capital / Equity** section
   - **Assets = Liabilities + Capital** (accounting equation holds)
3. ✅ **Verify**: Numbers reflect the 25 seeded journal entries

### Test 13.2: Profit & Loss Statement

1. **Reports → Profit & Loss** → **http://localhost:3000/reports/profit-loss**
2. ✅ **Expected**:
   - **Income** section (Furniture Sales Revenue, etc.)
   - **Expenses** section (Raw Material Purchase Expense, etc.)
   - **Net Profit/Loss** = Total Income − Total Expenses
3. ✅ **Verify**: Amounts tie back to journal entry items

### Test 13.3: Budget Report

1. **Reports → Budget Report** → **http://localhost:3000/reports/budget-report**
2. ✅ **Expected**: All 25+ budgets with:
   - Planned Amount
   - Actual Amount (from linked analytic data)
   - Variance (Planned − Actual)
3. ✅ **Verify**: Multiple quarters (Q1, Q2, Q3, Q4)

---

## 14. Phase 13 — Contact Portal (Customer/Vendor Login)

> The portal lets Contacts (Customers/Vendors) log in, view their invoices/bills, and make payments.

### Test 14.1: Customer Portal Login

1. Go to **http://localhost:3000/portal/login** (or the portal login link)
2. Login as an activated customer:

| Field    | Value                        |
|----------|------------------------------|
| Email    | `procurement@acmecorp.com`   |
| Password | `User@123`                   |

3. ✅ **Expected**: Redirected to Customer Portal
4. ✅ **Verify**: Only invoices for "Acme Corporate Park" shown

### Test 14.2: View My Invoices (Customer Portal)

1. Navigate to **Invoices** in the portal
2. ✅ **Expected**: Only invoices for "Acme Corporate Park"
3. Click an invoice → **Verify**: Invoice Number, Date, Due Date, Total, Payment Status

### Test 14.3: Vendor Portal Login

1. Log out from customer portal
2. Login as a vendor:

| Field    | Value                        |
|----------|------------------------------|
| Email    | `contact@abctimber.com`      |
| Password | `User@123`                   |

3. ✅ **Expected**: Vendor portal loads
4. ✅ **Verify**: Only bills for "ABC Timber & Wood Suppliers" shown

### Test 14.4: View My Bills (Vendor Portal)

1. Navigate to **Bills** in the portal
2. ✅ **Expected**: Only bills for "ABC Timber & Wood Suppliers"
3. Click a bill → **Verify**: Bill Number, Invoice Date, Due Date, Total, Status

### Test 14.5: Unactivated Contact Cannot Login ❌

1. Log out → Try:

| Field    | Value                    |
|----------|--------------------------|
| Email    | `hr@zenithsoftware.com`  |
| Password | `User@123`               |

2. ✅ **Expected**: Login fails — account not activated

---

## 15. Phase 14 — Portal Payments

### Test 15.1: Customer Pays an Invoice (Partial)

1. Log in as: `procurement@acmecorp.com` / `User@123`
2. Go to **Invoices** → find an **UNPAID** invoice
3. Click **Pay** / **Make Payment**
4. Fill in:

| Field  | Value         |
|--------|---------------|
| Amount | `500.00`      |
| Method | `BANK`        |

5. Click **Submit Payment**
6. ✅ **Expected**:
   - Payment recorded
   - Invoice status → **PARTIALLY_PAID**
   - Payment visible in history

### Test 15.2: Customer Pays Remaining (Full)

1. Same invoice → Pay the remaining balance
2. ✅ **Expected**:
   - Invoice status → **PAID**
   - No more payment button / greyed out

### Test 15.3: Vendor Pays a Bill

1. Log out → Log in as: `contact@abctimber.com` / `User@123`
2. Go to **Bills** → find an **UNPAID** bill
3. Click **Pay** → Enter:

| Field  | Value  |
|--------|--------|
| Amount | `300.00` |
| Method | `CASH`   |

4. Click **Submit**
5. ✅ **Expected**: Payment recorded, bill status updates

---

## 16. Phase 15 — Edge Cases & Validation Testing

### Test 16.1: Duplicate Login ID ❌

1. As admin, Users → Create → Login ID = `utsav01` (already exists)
2. ✅ **Expected**: Error — "Login ID already exists"

### Test 16.2: Duplicate Email (Contact) ❌

1. Contacts → Create → Email = `contact@abctimber.com`
2. ✅ **Expected**: Error — "Email already exists"

### Test 16.3: Negative Price (Product) ❌

1. Products → Create → Sales Price = `-50.00`
2. ✅ **Expected**: Validation error

### Test 16.4: Confirm Already Confirmed PO ❌

1. Find a CONFIRMED PO → try clicking Confirm again
2. ✅ **Expected**: Error or button disabled

### Test 16.5: Convert DRAFT PO to Bill ❌

1. Find a DRAFT PO → try Convert to Bill
2. ✅ **Expected**: Error — must be CONFIRMED first

### Test 16.6: Delete Account with Journal Items ❌

1. Accounts → try deleting "Bank Account"
2. ✅ **Expected**: Error — foreign key constraint (Restrict policy)

### Test 16.7: Session Expiry

1. Clear cookies/local storage manually
2. Navigate to any dashboard page
3. ✅ **Expected**: Redirected to login page

---

## 17. Quick Reference — Seeded Test Data

### Staff Login

| Name             | Login ID | Password    | Role  |
|------------------|----------|-------------|-------|
| Utsav Padaliya   | `utsav01`| `Utsav@123` | ADMIN |

### Contact Portal Logins (all use password: `User@123`)

**Vendors:**

| Contact                       | Email                            |
|-------------------------------|----------------------------------|
| ABC Timber & Wood Suppliers   | `contact@abctimber.com`          |
| XYZ Steel Imports Ltd         | `info@xyzsteel.com`              |
| Tech Hardware Solutions       | `sales@techhardware.com`         |
| Precision Fasteners & Screws  | `orders@precisionfasteners.com`  |
| Global Foam & Fabrics Co      | `support@globalfoam.com`         |
| Urban Powder Coating Works    | `info@urbancoating.com`          |
| Metro Cast Iron Foundry       | `sales@metrofoundry.com`         |
| Green Eco Lumber Corp         | `timber@greenecolumber.com`      |
| ProLock Drawer Systems        | `contact@prolocksystems.com`     |
| Solar Panel & LED Tech        | `solar@ledtech.com`              |
| Polymer Plastics Ltd          | `info@polymerplastics.com`       |
| Industrial Adhesives & Paints | `paints@industrialadhesives.com` |

**Customers:**

| Contact                              | Email                               |
|---------------------------------------|--------------------------------------|
| Acme Corporate Park                  | `procurement@acmecorp.com`           |
| Global Financial Services            | `facilities@globalfinance.com`       |
| StartUp Accelerator Hub              | `admin@startuphub.com`               |
| Apex Tech IT Park                    | `admin@apextechpark.com`             |
| Horizon Coworking Spaces             | `hello@horizoncoworking.com`         |
| City Municipal Dev Authority         | `projects@citydevelopment.gov`       |
| National Highway Trust               | `infrastructure@highwaytrust.org`    |
| St. Jude Educational Campus          | `campus@stjude.edu`                  |
| Grand Vista Luxury Hotels            | `purchase@grandvistahotels.com`      |
| Apex International Airport Authority | `vendor-portal@apexairport.com`      |

**Both (Vendor + Customer):**

| Contact                          | Email                             |
|----------------------------------|-----------------------------------|
| Omni Logistics & Trade Center    | `support@omnilogistics.com`       |
| Universal Building Solutions     | `contact@universalbuilding.com`   |

**Not Activated (login should fail):**

| Contact                  | Email                      |
|--------------------------|----------------------------|
| Zenith Software Systems  | `hr@zenithsoftware.com`    |
| Nova Healthcare Hospitals| `admin@novahealth.com`     |

### Seeded Document Numbers

| Entity            | Pattern           | Range                          |
|-------------------|-------------------|--------------------------------|
| Purchase Orders   | PO-2026-XXXX      | PO-2026-1001 to PO-2026-1025  |
| Sales Orders      | SO-2026-XXXX      | SO-2026-2001 to SO-2026-2025  |
| Customer Invoices | INV-2026-XXXX     | INV-2026-3001 to INV-2026-3017|
| Vendor Bills      | BILL-2026-XXXX    | BILL-2026-5001 to BILL-2026-5016|
| Journal Entries   | JE-2026-REC-XXX   | JE-2026-REC-101 to JE-2026-REC-125|

### GL Account Types

| Type      | Count | Key Accounts |
|-----------|-------|--------------|
| ASSET     | 8     | Cash on Hand, Bank Account, Accounts Receivable, Inventory (3), Furniture & Fixtures, Office Machinery |
| LIABILITY | 6     | Accounts Payable, Short-term Bank Loan, Sales Tax Payable, Payroll, Accrued Expenses, Long-term Loan |
| CAPITAL   | 4     | Opening Balance Equity, Owner's Capital, Retained Earnings, Common Stock |
| INCOME    | 6     | Furniture Sales, Custom Project, Assembly & Service, Maintenance, Export Sales, Discounts |
| EXPENSE   | 6     | Raw Material Purchase, Staff Salary, Factory Rent, Utilities, Marketing, Freight & Shipping |

---

## 18. Final Checklist

| # | Module | Tests | Status |
|---|--------|-------|--------|
| 1 | **Auth** | Admin login, wrong password, empty fields | ☐ |
| 2 | **Dashboard** | All cards show data, charts render | ☐ |
| 3 | **Accounts** | View 30, Create 1, Edit 1 | ☐ |
| 4 | **Products** | View 26, Create 1, Edit 1, Toggle active | ☐ |
| 5 | **Contacts** | View 26, Create vendor + customer, Edit, Resend activation | ☐ |
| 6 | **Users** | View 1, Create 1, Login as new user, Edit role, Disable login | ☐ |
| 7 | **Journals** | View 4, Create 1, Edit 1 | ☐ |
| 8 | **Journal Entries** | View 25, View detail, Create balanced, Reject unbalanced | ☐ |
| 9 | **Purchase Orders** | View 25, Create PO, Confirm, Convert to Bill | ☐ |
| 10 | **Vendor Bills** | View 16+1, Verify linked PO and status | ☐ |
| 11 | **Sales Orders** | View 25, Create SO, Confirm, Generate Invoice | ☐ |
| 12 | **Customer Invoices** | View 17+1, Verify linked SO and status | ☐ |
| 13 | **Analytic Accounts** | View 22, Create 1 | ☐ |
| 14 | **Budgets** | View 25, Create 1 | ☐ |
| 15 | **Balance Sheet** | Report renders with correct sections | ☐ |
| 16 | **Profit & Loss** | Report renders, Net P/L calculated | ☐ |
| 17 | **Budget Report** | All quarters shown, variance calculated | ☐ |
| 18 | **Portal — Customer** | Login, view invoices, partial + full payment | ☐ |
| 19 | **Portal — Vendor** | Login, view bills, make payment | ☐ |
| 20 | **Portal — Blocked** | Unactivated contact cannot login | ☐ |
| 21 | **Edge Cases** | Duplicates, negatives, re-confirm, draft-to-bill, FK restrict, session | ☐ |

> **Total test scenarios: 40+** · Estimated time: **45–60 minutes**
