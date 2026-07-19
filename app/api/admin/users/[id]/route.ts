import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/currentUser";

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

/**
 * Updates a user's role and/or active status. This is also how "withdraw
 * access" works in practice: PATCH { isActive: false }. Refuses to let an
 * admin deactivate or demote their own account, since that could lock
 * every admin out with no way back in without direct DB access.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  let body: { role?: "admin" | "user"; isActive?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (auth.id === id && body.isActive === false) {
    return NextResponse.json(
      { error: "You can't deactivate your own account" },
      { status: 400 }
    );
  }
  if (auth.id === id && body.role === "user") {
    return NextResponse.json(
      { error: "You can't demote your own account" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.user.updateMany({
      where: { id },
      data: {
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(`PATCH /api/admin/users/${id} failed:`, err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/** Permanently deletes a user account. Refuses to let an admin delete themselves. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  if (auth.id === id) {
    return NextResponse.json(
      { error: "You can't delete your own account" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.user.deleteMany({ where: { id } });
    if (result.count === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/admin/users/${id} failed:`, err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
