import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * The authoritative auth check. Verifies the session cookie's signature,
 * then re-reads the user from the database so isActive/role are always
 * current - a token that says "role: admin" from a while ago is not
 * trusted if the database has since said otherwise (role changed, or the
 * account was deactivated). Returns null for any of: no cookie, invalid/
 * expired token, account deleted, or account deactivated.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) return null;
    return { id: user.id, email: user.email, role: user.role };
  } catch (err) {
    console.error("getCurrentUser: DB lookup failed:", err);
    return null;
  }
}

/**
 * Use at the top of any API route that any logged-in, active user may call.
 * Returns the user on success, or a ready-to-return 401 NextResponse on
 * failure - callers just do:
 *   const auth = await requireUser();
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireUser(): Promise<CurrentUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return user;
}

/** Same as requireUser(), but also requires the admin role (403 if not). */
export async function requireAdmin(): Promise<CurrentUser | NextResponse> {
  const result = await requireUser();
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return result;
}
