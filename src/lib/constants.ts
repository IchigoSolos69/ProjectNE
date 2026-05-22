export const BRAND_NAME = "Atelier Home";

/** Must match slugs in `src/lib/mock-data.ts` for preview/mock deploys */
export const TOP_CATEGORIES = [
  { slug: "beddings", label: "Beddings" },
  { slug: "towels", label: "Towels" },
  { slug: "pillows", label: "Pillows" },
] as const;

export const SUBCATEGORIES: Record<
  string,
  { slug: string; label: string }[]
> = {
  beddings: [
    { slug: "bed-sheets", label: "Bed Sheets" },
    { slug: "duvet-covers", label: "Duvet Covers" },
  ],
  towels: [
    { slug: "bath-towels", label: "Bath Towels" },
    { slug: "hand-towels", label: "Hand Towels" },
  ],
  pillows: [],
};
