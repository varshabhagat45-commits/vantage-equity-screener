#!/usr/bin/env node
import { spawn } from "node:child_process";

const argv = process.argv.slice(2);
const command = argv[0];
const args = argv.slice(1);
if (!command) {
  console.error("usage: node scripts/with-app-env.mjs <command> [args]");
  process.exit(2);
}
const env = { ...process.env, VITE_AUTH_ENABLED: process.env.VITE_AUTH_ENABLED ?? "false" };
const child = spawn(command, args, { stdio: "inherit", env });
child.on("exit", (code) => process.exit(code ?? 1));
