#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const cmd = argv[0];
const args = argv.slice(1);
if (!cmd) {
  console.error("usage: node scripts/with-app-env.mjs <command> [args]");
  process.exit(2);
}
const env = { ...process.env, VITE_AUTH_ENABLED: process.env.VITE_AUTH_ENABLED ?? "false" };
const bin = join(root, "node_modules", ".bin", cmd);
const child = spawn(bin, args, { stdio: "inherit", env, cwd: root });
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
