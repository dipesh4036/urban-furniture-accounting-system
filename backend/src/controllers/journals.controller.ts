import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as journalsService from "../services/journals.service";

export const createJournalController = asyncHandler(async (req: Request, res: Response) => {
  const journal = await journalsService.createJournal(req.body);

  res.status(201).json({
    success: true,
    message: "Journal created successfully",
    data: { journal },
    timestamp: new Date().toISOString(),
  });
});

export const listJournalsController = asyncHandler(async (req: Request, res: Response) => {
  const { journals, meta } = await journalsService.listJournals(req.query);

  res.status(200).json({
    success: true,
    message: "Journals retrieved successfully",
    data: { journals, meta },
    timestamp: new Date().toISOString(),
  });
});
