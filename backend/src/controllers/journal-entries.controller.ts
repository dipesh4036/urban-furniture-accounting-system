import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as journalEntriesService from "../services/journal-entries.service";

export const createJournalEntryController = asyncHandler(async (req: Request, res: Response) => {
  const entry = await journalEntriesService.createJournalEntry(req.body);

  res.status(201).json({
    success: true,
    message: "Journal entry created successfully",
    data: { entry },
    timestamp: new Date().toISOString(),
  });
});

export const listJournalEntriesController = asyncHandler(async (req: Request, res: Response) => {
  const { entries, meta } = await journalEntriesService.listJournalEntries(req.query);

  res.status(200).json({
    success: true,
    message: "Journal entries retrieved successfully",
    data: { entries, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getJournalEntryByIdController = asyncHandler(async (req: Request, res: Response) => {
  const entry = await journalEntriesService.getJournalEntryById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Journal entry retrieved successfully",
    data: { entry },
    timestamp: new Date().toISOString(),
  });
});
