import { Router } from "express";
import { createJournalController, listJournalsController } from "../controllers/journals.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createJournalSchema, listJournalsQuerySchema } from "../validators/journals.validator";

export const journalsRouter = Router();

// Every route here needs a logged-in Admin or Accountant.
journalsRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

journalsRouter.post("/", validate(createJournalSchema), createJournalController);
journalsRouter.get("/", validate(listJournalsQuerySchema, "query"), listJournalsController);
