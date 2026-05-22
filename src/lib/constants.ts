export const BRAND_NAME = "Atelier Home";

export const TOP_CATEGORIES = [
  { slug: "beddings", label: "Beddings" },
  { slug: "bath-towels", label: "Bath Towels" },
  { slug: "pillow-covers", label: "Pillow Covers" },
] as const;

export const SUBCATEGORIES: Record<
  string,
  { slug: string; label: string }[]
> = {
  beddings: [
    { slug: "sheets", label: "Sheets" },
    { slug: "duvets", label: "Duvets" },
    { slug: "comforters", label: "Comforters" },
  ],
  "bath-towels": [
    { slug: "hand", label: "Hand" },
    { slug: "face", label: "Face" },
    { slug: "bath", label: "Bath" },
    { slug: "mats", label: "Mats" },
  ],
  "pillow-covers": [
    { slug: "standard", label: "Standard" },
    { slug: "king", label: "King" },
    { slug: "euro", label: "Euro" },
  ],
};
