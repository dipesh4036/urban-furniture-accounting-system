import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

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
