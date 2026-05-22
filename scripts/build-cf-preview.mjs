/**
 * Static export build for Cloudflare Pages (mock / visual preview).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const foldersToHide = [
  { from: path.join(root, "src", "app", "api"), backup: path.join(root, "src", "app", "_api_cf_preview_backup") },
  { from: path.join(root, "src", "actions"), backup: path.join(root, "src", "_actions_cf_preview_backup") },
];

const checkoutActions = path.join(root, "src", "components", "checkout", "checkout-actions.ts");
const checkoutActionsServerBackup = path.join(
  root,
  "src",
  "components",
  "checkout",
  "_checkout-actions.server.ts.bak",
);
const checkoutActionsPreview = path.join(
  root,
  "src",
  "components",
  "checkout",
  "checkout-actions.preview.ts",
);

const moved = [];
let swappedCheckoutActions = false;

function hideFolder(from, backup) {
  if (!fs.existsSync(from)) return;
  if (fs.existsSync(backup)) fs.rmSync(backup, { recursive: true, force: true });
  fs.cpSync(from, backup, { recursive: true });
  fs.rmSync(from, { recursive: true, force: true });
  moved.push({ from, backup });
  console.log(`[build-cf-preview] Moved ${path.relative(root, from)} aside`);
}

function restoreFolders() {
  for (const { from, backup } of moved.reverse()) {
    if (!fs.existsSync(backup)) continue;
    if (fs.existsSync(from)) fs.rmSync(from, { recursive: true, force: true });
    fs.cpSync(backup, from, { recursive: true });
    fs.rmSync(backup, { recursive: true, force: true });
    console.log(`[build-cf-preview] Restored ${path.relative(root, from)}`);
  }
}

function usePreviewCheckoutActions() {
  if (!fs.existsSync(checkoutActionsPreview)) return;
  fs.cpSync(checkoutActions, checkoutActionsServerBackup);
  fs.cpSync(checkoutActionsPreview, checkoutActions);
  swappedCheckoutActions = true;
  console.log("[build-cf-preview] Using checkout-actions.preview.ts for build");
}

function restoreCheckoutActions() {
  if (!swappedCheckoutActions || !fs.existsSync(checkoutActionsServerBackup)) return;
  fs.cpSync(checkoutActionsServerBackup, checkoutActions);
  fs.rmSync(checkoutActionsServerBackup, { force: true });
  console.log("[build-cf-preview] Restored checkout-actions.ts");
}

for (const { from, backup } of foldersToHide) {
  hideFolder(from, backup);
}
usePreviewCheckoutActions();

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
restoreFolders();
process.exit(result.status ?? 1);
