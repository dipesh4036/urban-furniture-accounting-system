import { Router } from "express";
import { authRouter } from "./auth.routes";

// This is where every feature's routes get mounted. More get added here
// as each feature branch builds its routes, e.g.:
//   router.use("/users", userRoutes);
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
