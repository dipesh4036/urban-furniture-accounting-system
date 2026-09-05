import { Router } from "express";
import { accountsRouter } from "./accounts.routes";
import { authRouter } from "./auth.routes";
import { contactsRouter } from "./contacts.routes";
import { uploadsRouter } from "./uploads.routes";

// This is where every feature's routes get mounted. More get added here
// as each feature branch builds its routes, e.g.:
//   router.use("/users", userRoutes);
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/contacts", contactsRouter);
apiRouter.use("/uploads", uploadsRouter);
