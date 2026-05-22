/** True during `npm run build:preview` (Cloudflare static export). */
export const isPreviewBuild = process.env.MOCK_PREVIEW === "true";
