import { Router, type NextFunction, type Request, type Response } from "express";
import {
  createContactController,
  getContactByIdController,
  listContactsController,
  resendActivationEmailController,
  updateContactController,
} from "../controllers/contacts.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createContactSchema, listContactsQuerySchema, updateContactSchema } from "../validators/contacts.validator";

export const contactsRouter = Router();

// Every route here needs a logged-in session - staff (Admin/Accountant)
// or a Contact looking up their own record on GET /:id below.
contactsRouter.use(authenticate);

// GET /:id is the one route a Contact can call for themselves (to see
// their own record). Staff can look up anyone; a Contact can only look
// up the id that matches their own token. Everything else on this
// router (create, list, update) stays staff-only.
function allowStaffOrSelf(req: Request, res: Response, next: NextFunction): void {
  const { role, sub } = req.user!;

  if (role === "ADMIN" || role === "ACCOUNTANT") {
    next();
    return;
  }

  if (role === "CONTACT" && sub === req.params.id) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: "You don't have permission to do this",
    code: "NOT_AUTHORIZED",
    errors: {},
    timestamp: new Date().toISOString(),
  });
}

contactsRouter.post("/", authorize("ADMIN", "ACCOUNTANT"), validate(createContactSchema), createContactController);
contactsRouter.get(
  "/",
  authorize("ADMIN", "ACCOUNTANT"),
  validate(listContactsQuerySchema, "query"),
  listContactsController
);
contactsRouter.get("/:id", allowStaffOrSelf, getContactByIdController);
contactsRouter.patch(
  "/:id",
  authorize("ADMIN", "ACCOUNTANT"),
  validate(updateContactSchema),
  updateContactController
);
contactsRouter.post("/:id/resend-activation", authorize("ADMIN", "ACCOUNTANT"), resendActivationEmailController);
