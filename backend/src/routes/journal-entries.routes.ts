import { Router } from "express";
import {
  createJournalEntryController,
  getJournalEntryByIdController,
  listJournalEntriesController,
} from "../controllers/journal-entries.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createJournalEntrySchema, listJournalEntriesQuerySchema } from "../validators/journal-entries.validator";

export const journalEntriesRouter = Router();

// Every route here needs a logged-in Admin or Accountant.
journalEntriesRouter.use(authenticate, authorize("ADMIN", "ACCOUNTANT"));

journalEntriesRouter.post("/", validate(createJournalEntrySchema), createJournalEntryController);
journalEntriesRouter.get("/", validate(listJournalEntriesQuerySchema, "query"), listJournalEntriesController);
journalEntriesRouter.get("/:id", getJournalEntryByIdController);
