import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

const encoder = new TextEncoder();

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing required env var: SESSION_SECRET. Check .env against .env.example."
    );
  }
  return encoder.encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
}

export const SESSION_COOKIE_NAME = "session";

// How long a session stays valid before the person has to log in again.
// This is deliberately generous (not a tight security boundary) - the
// database is re-checked on every real data request (see currentUser.ts),
// so a longer-lived token here only affects convenience, not whether a
// deactivated account can still read or write real data.
const SESSION_DURATION = "7d";

/**
 * Signs a session token. The signature makes it tamper-proof (nobody can
 * edit `role` inside it without the secret), but it is NOT re-checked
 * against the database by this function - see verifySessionToken's comment.
 */
export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

/**
 * Verifies a session token's signature and expiry ONLY. This does NOT
 * confirm the account still exists, is still active, or still holds the
 * role written into the token - it's a lightweight, no-database check
 * meant for proxy.ts to decide "is this even worth routing to a page",
 * not an authorization decision. Anything that reads or changes real data
 * must call getCurrentUser() (lib/auth/currentUser.ts) instead, which
 * re-reads the user from the database.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
