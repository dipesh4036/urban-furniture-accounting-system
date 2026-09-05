import { Router } from "express";
import { accountsRouter } from "./accounts.routes";
import { analyticAccountsRouter } from "./analytic-accounts.routes";
import { authRouter } from "./auth.routes";
import { budgetsRouter } from "./budgets.routes";
import { contactsRouter } from "./contacts.routes";
import { customerInvoicesRouter } from "./customer-invoices.routes";
import { journalEntriesRouter } from "./journal-entries.routes";
import { journalsRouter } from "./journals.routes";
import { paymentsRouter } from "./payments.routes";
import { productsRouter } from "./products.routes";
import { purchaseOrdersRouter } from "./purchase-orders.routes";
import { salesOrdersRouter } from "./sales-orders.routes";
import { uploadsRouter } from "./uploads.routes";
import { usersRouter } from "./users.routes";
import { vendorBillsRouter } from "./vendor-bills.routes";

// This is where every feature's routes get mounted. More get added here
// as each feature branch builds its routes.
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/contacts", contactsRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/journals", journalsRouter);
apiRouter.use("/journal-entries", journalEntriesRouter);
apiRouter.use("/analytic-accounts", analyticAccountsRouter);
apiRouter.use("/budgets", budgetsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/purchase-orders", purchaseOrdersRouter);
apiRouter.use("/sales-orders", salesOrdersRouter);
apiRouter.use("/vendor-bills", vendorBillsRouter);
apiRouter.use("/customer-invoices", customerInvoicesRouter);
