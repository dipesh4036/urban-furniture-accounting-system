import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as contactsService from "../services/contacts.service";

export const createContactController = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactsService.createContact(req.body);

  res.status(201).json({
    success: true,
    message: "Contact created successfully",
    data: { contact },
    timestamp: new Date().toISOString(),
  });
});

export const listContactsController = asyncHandler(async (req: Request, res: Response) => {
  const { contacts, meta } = await contactsService.listContacts(req.query);

  res.status(200).json({
    success: true,
    message: "Contacts retrieved successfully",
    data: { contacts, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getContactByIdController = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactsService.getContactById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Contact retrieved successfully",
    data: { contact },
    timestamp: new Date().toISOString(),
  });
});

export const updateContactController = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactsService.updateContact(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    data: { contact },
    timestamp: new Date().toISOString(),
  });
});
