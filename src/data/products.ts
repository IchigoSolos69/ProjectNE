export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'Bedsheets' | 'Comforters' | 'Pillows';
  image: string;
  images: string[];
  sizes: ('Twin' | 'Queen' | 'King')[];
  rating: number;
  reviewsCount: number;
  features: string[];
  details: string;
}

export const products: Product[] = [
  {
    id: "classic-percale-core-set",
    name: "Classic Percale Core Set",
    price: 139,
    description: "Our signature cotton percale sheets are cool, crisp, and breathable. Featuring a matte finish and a structure that gets softer with every wash, they are perfect for hot sleepers.",
    category: "Bedsheets",
    image: "/images/percale-sheets.jpg",
    images: [
      "/images/percale-sheets.jpg",
      "/images/percale-sheets-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.8,
    reviewsCount: 1240,
    features: [
      "100% Long-staple Egyptian cotton",
      "270 Thread count in a breathable percale weave",
      "Includes 1 flat sheet, 1 fitted sheet, and 2 pillowcases",
      "Fitted sheet fits mattresses up to 16\" deep",
      "Oeko-Tex certified for chemical-free sleep"
    ],
    details: "Meticulously woven in Italy, our Classic Percale sheets mimic the luxury of five-star hotel bedding. The weave structure allows for continuous airflow, helping you maintain a balanced body temperature throughout the night."
  },
  {
    id: "luxe-sateen-sheet-set",
    name: "Luxe Sateen Sheet Set",
    price: 159,
    description: "Indulge in a smooth, luminous drape. Woven in a rich 480-thread-count sateen, these sheets feel butter-soft against your skin and provide a cozy warmth for cool nights.",
    category: "Bedsheets",
    image: "/images/sateen-sheets.jpg",
    images: [
      "/images/sateen-sheets.jpg",
      "/images/sateen-sheets-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.9,
    reviewsCount: 842,
    features: [
      "100% premium long-staple cotton",
      "Luminous, buttery sateen weave",
      "480 Thread count for a substantial, cozy weight",
      "OEKO-TEX® certified for clean, safe manufacturing",
      "Wrinkle-resistant finish without harsh chemicals"
    ],
    details: "For those who prefer a silky, substantial sheet that wraps you in absolute comfort, our Luxe Sateen represents the pinnacle of bedtime luxury. The subtle sheen gives your bedroom a sophisticated aesthetic."
  },
  {
    id: "organic-linen-core-set",
    name: "Organic Linen Core Set",
    price: 249,
    description: "Crafted from fine European flax, our linen sheets are washed for exceptional softness. Naturally insulating yet exceptionally breathable, they offer a relaxed, textured elegance year-round.",
    category: "Bedsheets",
    image: "/images/linen-sheets.jpg",
    images: [
      "/images/linen-sheets.jpg",
      "/images/linen-sheets-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.7,
    reviewsCount: 512,
    features: [
      "100% French and Belgian flax",
      "Garment-washed for instant, lived-in softness",
      "Naturally moisture-wicking and hypoallergenic",
      "Highly durable fibers that strengthen with age",
      "Environmentally sustainable cultivation"
    ],
    details: "Indulge in the airy texture and effortless look of European linen. Known for its climate-regulating qualities, linen keeps you dry and cool during summer heat, yet retains warmth during winter chills."
  },
  {
    id: "cloud-cotton-quilt",
    name: "Cloud Cotton Quilt",
    price: 229,
    description: "Light as a cloud, this premium quilt features a textured, multi-layered gauze design. Made from 100% Turkish cotton, it brings an organic, cozy texture to your bed layers.",
    category: "Comforters",
    image: "/images/cotton-quilt.jpg",
    images: [
      "/images/cotton-quilt.jpg",
      "/images/cotton-quilt-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.9,
    reviewsCount: 319,
    features: [
      "100% Turkish Aegean cotton",
      "Four-layer gauze construction for a lofted, weightless feel",
      "Beautifully crinkled texture that needs no ironing",
      "Perfect for solo layering or under a heavy comforter",
      "Preshrunk and garment-dyed for color depth"
    ],
    details: "Woven in the Aegean region of Turkey, our Cloud Cotton Quilt offers a tactile experience unlike any other. The four layers of breathable gauze trap small pockets of air, mimicking the weightless warmth of a cloud."
  },
  {
    id: "all-season-down-alternative-duvet",
    name: "All-Season Down Alternative Duvet",
    price: 189,
    description: "Get the lofty feel of down without the allergens. Our hypoallergenic duvet insert features a baffle-box construction to keep the premium microfiber fill perfectly distributed.",
    category: "Comforters",
    image: "/images/down-duvet.jpg",
    images: [
      "/images/down-duvet.jpg",
      "/images/down-duvet-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.8,
    reviewsCount: 981,
    features: [
      "Hypoallergenic recycled down-alternative fill",
      "Baffle-box stitching preventing cold spots and shifting",
      "100% Cotton shell for crisp breathability",
      "Corner loops to easily secure your duvet cover",
      "Machine washable for easy maintenance"
    ],
    details: "Engineered to offer the perfect fluff-to-weight ratio, this duvet insert is designed for comfortable year-round use. It regulates heat so you stay warm without overheating."
  },
  {
    id: "premium-down-pillow",
    name: "Premium Down Pillow",
    price: 109,
    description: "Stuffed with ethically sourced European white down, this pillow offers a plush, cloud-like headrest. Tailored in soft, medium, and firm densities to suit any sleep position.",
    category: "Pillows",
    image: "/images/down-pillow.jpg",
    images: [
      "/images/down-pillow.jpg",
      "/images/down-pillow-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.6,
    reviewsCount: 1403,
    features: [
      "Filled with RDS-certified European white down",
      "Double-stitched piping with 100% cotton sateen shell",
      "Available in supportive densities (Plush or Firm)",
      "Hypoallergenic and washed 15 times to ensure purity",
      "Made in the USA from imported materials"
    ],
    details: "Sleep on a bed of air. Our Premium Down Pillows are carefully crafted using large down clusters that maintain their loft much longer than standard synthetic pillows, offering adaptive support for neck and shoulders."
  },
  {
    id: "dual-zone-memory-foam-pillow",
    name: "Dual-Zone Memory Foam Pillow",
    price: 89,
    description: "Experience pressure-relieving support combined with cooling technology. Features a dual-sided design with cooling gel on one side and adaptive memory foam on the other.",
    category: "Pillows",
    image: "/images/memory-foam-pillow.jpg",
    images: [
      "/images/memory-foam-pillow.jpg",
      "/images/memory-foam-pillow-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.7,
    reviewsCount: 654,
    features: [
      "Premium CertiPUR-US® memory foam core",
      "Advanced phase-change cooling gel layer",
      "Removable, washable Tencel cover for ultimate breathability",
      "Contoured support for optimal spinal alignment",
      "Low odor, hypoallergenic composition"
    ],
    details: "Engineered for active sleepers who shift positions, this pillow offers dense support that conforms to the curvature of your head and neck. The cooling gel side absorbs excess heat, maintaining a refreshing sleep surface."
  },
  {
    id: "organic-latex-pillow",
    name: "Organic Latex Pillow",
    price: 99,
    description: "Responsive, bouncy, and highly breathable. Made from 100% natural, organic Dunlop latex, this pillow provides orthopedic neck alignment and retains its shape for years.",
    category: "Pillows",
    image: "/images/latex-pillow.jpg",
    images: [
      "/images/latex-pillow.jpg",
      "/images/latex-pillow-detail.jpg"
    ],
    sizes: ["Twin", "Queen", "King"],
    rating: 4.8,
    reviewsCount: 412,
    features: [
      "100% GOLS-certified organic natural latex",
      "Penciled ventilation holes for continuous cooling airflow",
      "Inherent dust mite and mildew resistance",
      "Medium firmness with instant responsive bounce",
      "Includes organic cotton quilted cover"
    ],
    details: "Naturally harvested from rubber trees, our organic latex pillow offers a resilient bounce that holds its loft day after day. Perfect for side and back sleepers seeking a chemical-free, highly responsive cushion."
  }
];
