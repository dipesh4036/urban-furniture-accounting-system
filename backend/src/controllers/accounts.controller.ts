import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as accountsService from "../services/accounts.service";

export const createAccountController = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountsService.createAccount(req.body);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { account },
    timestamp: new Date().toISOString(),
  });
});

export const listAccountsController = asyncHandler(async (req: Request, res: Response) => {
  const { accounts, meta } = await accountsService.listAccounts(req.query);

  res.status(200).json({
    success: true,
    message: "Accounts retrieved successfully",
    data: { accounts, meta },
    timestamp: new Date().toISOString(),
  });
});

export const updateAccountController = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountsService.updateAccount(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Account updated successfully",
    data: { account },
    timestamp: new Date().toISOString(),
  });
});
