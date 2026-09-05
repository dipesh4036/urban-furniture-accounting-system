import { Router } from "express";
import {
  createUserController,
  getUserByIdController,
  listUsersController,
  updateUserController,
} from "../controllers/users.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from "../validators/users.validator";

export const usersRouter = Router();

// Admin only, unlike accounts/products/contacts which also let
// Accountant in - creating and managing staff accounts is an Admin-only
// power per plan.md Module 3.
usersRouter.use(authenticate, authorize("ADMIN"));

usersRouter.post("/", validate(createUserSchema), createUserController);
usersRouter.get("/", validate(listUsersQuerySchema, "query"), listUsersController);
usersRouter.get("/:id", getUserByIdController);
usersRouter.patch("/:id", validate(updateUserSchema), updateUserController);
