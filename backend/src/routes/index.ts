import { Router } from "express";
import { accountsRouter } from "./accounts.routes";
import { authRouter } from "./auth.routes";
import { productsRouter } from "./products.routes";
import { usersRouter } from "./users.routes";

// This is where every feature's routes get mounted. More get added here
// as each feature branch builds its routes.
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/users", usersRouter);
