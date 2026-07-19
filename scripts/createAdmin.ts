// One-off script to bootstrap the very first admin account. The app is
// invite-only (no public signup page), so someone has to create user zero
// by hand before anyone can log in at all. Run with:
//
//   npm run create-admin -- admin@example.com "a-strong-password"

import prisma from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";
import { createId } from "../features/TripCalculator/TripCalculator.utils";

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: npm run create-admin -- <email> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`A user with email "${email}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      id: createId("user"),
      email,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Created admin user: ${user.email} (${user.id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
