/**
 * Static export build for Cloudflare Pages (mock / visual preview).
 * Temporarily moves server-only code outside src/ so Next does not compile it.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const backupRoot = path.join(root, ".cf-preview-backup");

const moves = [
  { from: path.join(root, "src", "app", "api"), to: path.join(backupRoot, "app", "api") },
  { from: path.join(root, "src", "app", "admin"), to: path.join(backupRoot, "app", "admin") },
  { from: path.join(root, "src", "actions"), to: path.join(backupRoot, "actions") },
  { from: path.join(root, "src", "components", "admin"), to: path.join(backupRoot, "components", "admin") },
  { from: path.join(root, "src", "middleware.ts"), to: path.join(backupRoot, "middleware.ts") },
];

const checkoutActions = path.join(root, "src", "components", "checkout", "checkout-actions.ts");
const checkoutActionsServerBackup = path.join(backupRoot, "checkout-actions.server.ts");
const checkoutActionsPreview = path.join(
  root,
  "src",
  "components",
  "checkout",
  "checkout-actions.preview.ts",
);

const restored = [];

function hidePath(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  fs.rmSync(from, { recursive: true, force: true });
  restored.push({ from, to });
  console.log(`[build-cf-preview] Moved ${path.relative(root, from)} → .cf-preview-backup`);
}

function restoreAll() {
  for (const { from, to } of restored.reverse()) {
    if (!fs.existsSync(to)) continue;
    fs.mkdirSync(path.dirname(from), { recursive: true });
    if (fs.existsSync(from)) fs.rmSync(from, { recursive: true, force: true });
    fs.cpSync(to, from, { recursive: true });
    console.log(`[build-cf-preview] Restored ${path.relative(root, from)}`);
  }
  if (fs.existsSync(backupRoot)) {
    fs.rmSync(backupRoot, { recursive: true, force: true });
  }
}

let swappedCheckoutActions = false;

function usePreviewCheckoutActions() {
  if (!fs.existsSync(checkoutActionsPreview)) return;
  fs.mkdirSync(backupRoot, { recursive: true });
  fs.cpSync(checkoutActions, checkoutActionsServerBackup);
  fs.cpSync(checkoutActionsPreview, checkoutActions);
  swappedCheckoutActions = true;
}

function restoreCheckoutActions() {
  if (!swappedCheckoutActions || !fs.existsSync(checkoutActionsServerBackup)) return;
  fs.cpSync(checkoutActionsServerBackup, checkoutActions);
  swappedCheckoutActions = false;
}

if (fs.existsSync(backupRoot)) fs.rmSync(backupRoot, { recursive: true, force: true });

for (const { from, to } of moves) {
  hidePath(from, to);
}
usePreviewCheckoutActions();

const nextCache = path.join(root, ".next");
if (fs.existsSync(nextCache)) {
  fs.rmSync(nextCache, { recursive: true, force: true });
  console.log("[build-cf-preview] Cleared .next cache");
}

const result = spawnSync("npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    MOCK_PREVIEW: "true",
    NEXT_PUBLIC_MOCK_PREVIEW: "true",
  },
});

restoreCheckoutActions();
restoreAll();
process.exit(result.status ?? 1);
