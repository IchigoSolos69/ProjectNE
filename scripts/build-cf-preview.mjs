/**
 * Static export build for Cloudflare Pages (mock / visual preview).
 * Temporarily moves server-only folders aside (incompatible with output: "export").
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

const moved = [];

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

for (const { from, backup } of foldersToHide) {
  hideFolder(from, backup);
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

restoreFolders();
process.exit(result.status ?? 1);
