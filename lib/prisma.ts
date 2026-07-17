import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const required = [
    "DATABASE_HOST",
    "DATABASE_USER",
    "DATABASE_PASSWORD",
    "DATABASE_NAME",
  ] as const;
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(
        `Missing required env var: ${key}. Check .env against .env.example.`
      );
    }
  }

  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 10,
  });

  return new PrismaClient({ adapter });
}

// Reuse the client across dev hot-reloads and warm serverless invocations
// instead of opening a fresh DB connection per request.
const prisma = global._prisma ?? createClient();
if (process.env.NODE_ENV !== "production") {
  global._prisma = prisma;
}

export default prisma;
