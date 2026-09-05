import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as usersService from "../services/users.service";

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.createStaffUser(req.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user },
    timestamp: new Date().toISOString(),
  });
});

export const listUsersController = asyncHandler(async (req: Request, res: Response) => {
  const { users, meta } = await usersService.listStaffUsers(req.query);

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: { users, meta },
    timestamp: new Date().toISOString(),
  });
});

export const getUserByIdController = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getStaffUserById(req.params.id);

  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: { user },
    timestamp: new Date().toISOString(),
  });
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateStaffUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: { user },
    timestamp: new Date().toISOString(),
  });
});
