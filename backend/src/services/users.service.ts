import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { hashPassword } from "./auth.service";
import type { CreateUserInput, UpdateUserInput } from "../validators/users.validator";

// Never return passwordHash to a client - same principle as auth.service.ts's
// SafeUser and contacts.service.ts's safeContactSelect.
const safeUserSelect = {
  id: true,
  name: true,
  loginId: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Only an Admin can reach this (enforced in users.routes.ts). Checks
// loginId and email uniqueness explicitly, one at a time, so the error
// tells the Admin exactly which field collided - a raw Prisma P2002
// error would 409 either way, but couldn't tell them which one.
export async function createStaffUser(input: CreateUserInput) {
  const loginIdTaken = await prisma.user.findUnique({ where: { loginId: input.loginId }, select: { id: true } });
  if (loginIdTaken) {
    throw new AppError(409, "This Login Id is already taken", "LOGIN_ID_TAKEN");
  }

  const emailTaken = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (emailTaken) {
    throw new AppError(409, "This email is already registered", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      loginId: input.loginId,
      email: input.email,
      role: input.role,
      passwordHash,
    },
    select: safeUserSelect,
  });
}

interface ListStaffUsersOptions {
  page?: number;
  limit?: number;
}

// Same pagination shape as accounts.service.ts's listAccounts - capped
// at 100 per page per backend-express SKILL.md.
export async function listStaffUsers(options: ListStaffUsersOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      select: safeUserSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStaffUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }
  return user;
}

// Covers both "change someone's role" and "deactivate/reactivate" - both
// are just a PATCH with whichever field changed. Never touches
// passwordHash; there's no password-change path through this endpoint.
export async function updateStaffUser(id: string, input: UpdateUserInput) {
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return prisma.user.update({ where: { id }, data: input, select: safeUserSelect });
}
