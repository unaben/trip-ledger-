import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/currentUser";
import { hashPassword } from "@/lib/auth/password";
import { createId } from "@/features/TripCalculator/TripCalculator.utils";

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

/** Lists every user account (admin only - this is the whole point of the role split). */
export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: USER_SELECT,
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("GET /api/admin/users failed:", err);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}

/**
 * Creates a new user account (admin only). There is no public signup -
 * this is the only way an account comes into existence, which is what
 * makes it "invite only": the admin sets the initial email/password and
 * shares it with the person directly.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  let body: { email?: string; password?: string; role?: "admin" | "user" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password, role = "user" } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        id: createId("user"),
        email,
        passwordHash,
        role,
      },
      select: USER_SELECT,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/users failed:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
