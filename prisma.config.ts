// Prisma 7 moved the connection URL out of schema.prisma. This file is
// what the Prisma CLI reads it from for `prisma generate`, `prisma db pull`,
// and `prisma studio`. It is NOT used by the running Next.js app - that
// connects through the driver adapter in lib/prisma.ts instead.

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
