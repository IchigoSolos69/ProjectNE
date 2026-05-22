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
const dynamicPatchFiles = [
  "src/app/page.tsx",
  "src/app/shop/[category]/page.tsx",
  "src/app/shop/[category]/[subcategory]/page.tsx",
  "src/app/product/[slug]/page.tsx",
];
const dynamicPatches = [];

function patchCatalogPagesForStaticExport() {
  for (const rel of dynamicPatchFiles) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    const original = fs.readFileSync(file, "utf8");
    if (!original.includes('export const dynamic = "force-dynamic"')) continue;
    const backup = path.join(backupRoot, "dynamic-patches", rel);
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.writeFileSync(backup, original);
    fs.writeFileSync(
      file,
      original.replace(
        'export const dynamic = "force-dynamic"',
        'export const dynamic = "force-static"',
      ),
    );
    dynamicPatches.push({ file, backup });
    console.log(`[build-cf-preview] Patched ${rel} → force-static`);
  }
}

function restoreDynamicPatches() {
  for (const { file, backup } of dynamicPatches.reverse()) {
    if (!fs.existsSync(backup)) continue;
    fs.copyFileSync(backup, file);
    console.log(`[build-cf-preview] Restored ${path.relative(root, file)} dynamic export`);
  }
  dynamicPatches.length = 0;
}

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
    if (fs.existsSync(from)) {
      const stat = fs.statSync(from);
      if (stat.isDirectory()) fs.rmSync(from, { recursive: true, force: true });
      else fs.rmSync(from, { force: true });
    }
    const backupStat = fs.statSync(to);
    if (backupStat.isDirectory()) {
      fs.cpSync(to, from, { recursive: true });
    } else {
      fs.copyFileSync(to, from);
    }
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
patchCatalogPagesForStaticExport();

const nextCache = path.join(root, ".next");
if (fs.existsSync(nextCache)) {
  fs.rmSync(nextCache, { recursive: true, force: true });
  console.log("[build-cf-preview] Cleared .next cache");
}

const hasSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );

if (hasSupabase) {
  console.log(
    "[build-cf-preview] Supabase env detected — Google/email auth ENABLED (do not set NEXT_PUBLIC_MOCK_PREVIEW=true on Cloudflare)",
  );
} else {
  console.warn(
    "[build-cf-preview] Missing Supabase env — auth DISABLED. Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to Cloudflare build env.",
  );
}

const result = spawnSync("npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    MOCK_PREVIEW: "true",
    NEXT_PUBLIC_MOCK_PREVIEW: hasSupabase ? "false" : "true",
  },
});

restoreCheckoutActions();
restoreDynamicPatches();
restoreAll();
process.exit(result.status ?? 1);
