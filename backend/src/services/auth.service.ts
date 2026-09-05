import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { sendPasswordResetEmail } from "./email.service";
import { AppError } from "../utils/AppError";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const BCRYPT_COST = 10;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_COST);
}

export async function comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

// The JWT payload shape is shared between staff (User) and Contact
// sessions, so one authorize() middleware can read `role` from either
// kind of token. Contact tokens will be issued the same way once the
// Contact Master feature is built.
export interface TokenPayload {
  sub: string; // the user's or contact's id
  role: string; // "ADMIN" | "ACCOUNTANT" | "CONTACT"
}

export function issueAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function issueRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// Verifies a token against whichever secret it should have been signed
// with. Throws if the token is missing, expired, or tampered with -
// callers (like the auth middleware) should catch that and respond 401.
export function verifyToken(token: string, secret: string): TokenPayload {
  return jwt.verify(token, secret) as TokenPayload;
}

interface SafeUser {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export async function login(loginId: string, password: string): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { loginId } });

  // Same error for "no such user" and "wrong password" - so we don't
  // tell an attacker which one was wrong.
  if (!user || !user.isActive) {
    throw new AppError(401, "Invalid login id or password", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError(401, "Invalid login id or password", "INVALID_CREDENTIALS");
  }

  const tokenPayload: TokenPayload = { sub: user.id, role: user.role };

  return {
    accessToken: issueAccessToken(tokenPayload),
    refreshToken: issueRefreshToken(tokenPayload),
    user: {
      id: user.id,
      name: user.name,
      loginId: user.loginId,
      email: user.email,
      role: user.role,
    },
  };
}

// Used by GET /auth/me - looks up the full profile for whoever the
// access token belongs to, so the frontend gets real user data back
// instead of just the raw {sub, role} JWT payload.
export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isActive) {
    throw new AppError(401, "Session is no longer valid", "NOT_AUTHENTICATED");
  }

  return {
    id: user.id,
    name: user.name,
    loginId: user.loginId,
    email: user.email,
    role: user.role,
  };
}

// If a User exists with this email, generate a reset token and email
// it to them. If no User exists with this email, do nothing - but
// don't tell the caller that. Otherwise an attacker could use this
// endpoint to check which emails have accounts.
export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiresAt },
  });

  await sendPasswordResetEmail({ email: user.email, name: user.name, resetToken });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiresAt: { gt: new Date() } },
  });

  if (!user) {
    throw new AppError(400, "This reset link is invalid or has expired", "INVALID_RESET_TOKEN");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });
}

// Which kind of account a token belongs to.
type TokenAudience = "USER" | "CONTACT";

// One shared "set your password from a token" endpoint, meant to serve
// both audiences:
// - USER (staff): not really needed per plan.md, since an Admin sets
//   the password directly on Create User - but built out here anyway so
//   the shared token flow has a working reference implementation.
// - CONTACT: a Contact activates their account this way after an
//   Admin/Accountant creates them in Contact Master (feat/contact-master).
export async function activateAccount(token: string, newPassword: string): Promise<void> {
  const audience = await resolveTokenAudience(token);

  if (audience === "USER") {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiresAt: { gt: new Date() } },
    });

    if (!user) {
      throw new AppError(400, "This activation link is invalid or has expired", "INVALID_ACTIVATION_TOKEN");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
    });
    return;
  }

  const contact = await prisma.contact.findFirst({
    where: { activationToken: token, activationTokenExpiresAt: { gt: new Date() } },
  });

  if (!contact) {
    throw new AppError(400, "This activation link is invalid or has expired", "INVALID_ACTIVATION_TOKEN");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.contact.update({
    where: { id: contact.id },
    data: {
      passwordHash,
      isActivated: true,
      activationToken: null,
      activationTokenExpiresAt: null,
    },
  });
}

async function resolveTokenAudience(token: string): Promise<TokenAudience> {
  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (user) {
    return "USER";
  }

  // Fall through to CONTACT - activateAccount() itself re-checks the
  // token (and its expiry) against the Contact table and throws a clean
  // 400 if nothing matches there either, so returning "CONTACT" here
  // even when no Contact has this token is safe.
  return "CONTACT";
}

interface SafeContact {
  id: string;
  name: string;
  email: string;
  type: string;
  role: "CONTACT";
}

interface ContactLoginResult {
  accessToken: string;
  refreshToken: string;
  contact: SafeContact;
}

// Same shape as login() above, but against the Contact table instead of
// User, and only lets an activated Contact in (isActivated implies
// passwordHash is set - the two are always changed together in
// activateAccount()).
export async function contactLogin(email: string, password: string): Promise<ContactLoginResult> {
  const contact = await prisma.contact.findUnique({ where: { email } });

  if (!contact || !contact.isActive) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  if (!contact.isActivated || !contact.passwordHash) {
    throw new AppError(
      403,
      "This account hasn't been activated yet. Check your email for the activation link",
      "ACCOUNT_NOT_ACTIVATED"
    );
  }

  const passwordMatches = await comparePassword(password, contact.passwordHash);
  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const tokenPayload: TokenPayload = { sub: contact.id, role: "CONTACT" };

  return {
    accessToken: issueAccessToken(tokenPayload),
    refreshToken: issueRefreshToken(tokenPayload),
    contact: {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      type: contact.type,
      role: "CONTACT",
    },
  };
}
