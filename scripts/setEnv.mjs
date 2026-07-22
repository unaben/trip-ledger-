#!/usr/bin/env node
// Copies either .env.docker.example or .env.hostinger over .env, so you
// can swap which database the app talks to without retyping credentials
// by hand every time.
//
// Usage:
//   npm run env:docker      -> points .env at the local Docker MySQL
//   npm run env:hostinger   -> points .env at the real Hostinger database
//
// .env.hostinger is NOT included in this project - it's git-ignored on
// purpose (covered by the .env* rule in .gitignore) because it holds your
// real password. Create it ONCE:
//   cp .env.example .env.hostinger
// then fill in your real Hostinger values in that file. From then on,
// `npm run env:hostinger` reads the password back out of that file
// instead of you needing to remember or retype it.

import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const target = process.argv[2];
console.log('target', target);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const sources = {
  docker: ".env.docker.example",
  hostinger: ".env.hostinger",
};

const sourceFile = sources[target];
if (!sourceFile) {
  console.error("Usage: npm run env:docker | npm run env:hostinger");
  process.exit(1);
}

const sourcePath = path.join(root, sourceFile);
const destPath = path.join(root, ".env");

if (!existsSync(sourcePath)) {
  console.error(`Missing ${sourceFile}.`);
  if (target === "hostinger") {
    console.error(
      "Create it once with: cp .env.example .env.hostinger\n" +
        "Then fill in your real Hostinger values in that file. It's " +
        "git-ignored, so this is a one-time step - after that, " +
        "`npm run env:hostinger` will always work without retyping anything."
    );
  }
  process.exit(1);
}

copyFileSync(sourcePath, destPath);
console.log(`Copied ${sourceFile} -> .env (now using ${target}).`);
