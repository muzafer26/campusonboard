import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import type { SessionUser, UserRole } from "@/types";

const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-min-32-chars-long-here";
const SECRET = new TextEncoder().encode(SECRET_KEY);
const COOKIE_NAME = "co_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function signToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<(SessionUser & { exp: number }) | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser & { exp: number };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireRole(user: SessionUser | null, role: UserRole): SessionUser {
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export const SESSION_COOKIE = COOKIE_NAME;