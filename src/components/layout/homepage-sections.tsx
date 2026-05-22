"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/currency";
import { useCartStore } from "@/stores/cart-store";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/database";
import { motion } from "framer-motion";

// Framer motion variants for premium staggered reveals
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// Reusable Section Header matching user screenshot styling but using theme colors
export function SectionHeader({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10 w-full border-b border-border/40 pb-3 flex items-end"
    >
      <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-foreground relative pb-3 select-none uppercase">
        {title}
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-[-1.5px] left-0 right-0 h-[3px] bg-primary rounded-full origin-left"
        />
      </h2>
    </motion.div>
  );
}

// ----------------------------------------------------
// 1. SHOP BY CATEGORIES
// ----------------------------------------------------
export function ShopByCategories() {
  const categoryItems = [
    {
      label: "BEDSHEETS",
      href: "/shop/beddings/sheets",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "BATH",
      href: "/shop/bath-towels",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "COMFORTERS",
      href: "/shop/beddings/comforters",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "PILLOW AND CUSHIONS",
      href: "/shop/pillow-covers",
      image: "https://images.unsplash.com/photo-1584622506244-08eba1a66f88?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "BLANKETS",
      href: "/shop/beddings/comforters",
      image: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "KIDS",
      href: "/shop/beddings",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "GIFTING",
      href: "/shop/beddings",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "BESTSELLERS",
      href: "/shop/beddings?filter=bestsellers",
      image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80",
    },
    {
      label: "SALE",
      href: "/shop/beddings?price=under-1500",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader title="SHOP BY CATEGORIES" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8"
      >
        {categoryItems.map((item, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Link href={item.href} className="group flex flex-col items-center">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted border border-border/30 shadow-sm transition-all duration-500 hover:shadow-md">
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  priority={idx < 3}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <span className="mt-3 text-center text-[11px] font-bold tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ----------------------------------------------------
// 2. SHOP BY PRICE
// ----------------------------------------------------
export function ShopByPrice() {
  const priceBrackets = [
    { prefix: "Shop Under", price: "₹1500", href: "/shop/beddings?price=under-1500" },
    { prefix: "Shop Under", price: "₹3000", href: "/shop/beddings?price=under-3000" },
    { prefix: "Shop Under", price: "₹5000", href: "/shop/beddings?price=under-5000" },
    { prefix: "Shop Luxury", price: "ABOVE ₹5000", href: "/shop/beddings?price=over-5000" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader title="SHOP BY PRICE" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {priceBrackets.map((item, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Link
              href={item.href}
              className="group flex flex-col items-center justify-center py-10 px-6 rounded-xl border border-border/15 bg-nest-brown-dark text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 relative overflow-hidden"
            >
              {/* Double border effect matching user screenshot */}
              <div className="absolute inset-1 border border-nest-cream/15 rounded-lg pointer-events-none group-hover:border-nest-sage/40 transition-colors duration-500" />
              <span className="font-serif italic text-sm text-nest-cream/70 group-hover:text-nest-sage transition-colors duration-300">
                {item.prefix}
              </span>
              <span className="font-sans text-2xl font-black tracking-wider text-nest-cream mt-1 group-hover:scale-105 transition-transform duration-500">
                {item.price}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// Helper: Wishlist button component for localized interactive toggling
function WishlistButton() {
  const [active, setActive] = useState(false);
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(!active);
      }}
      className="absolute top-3 right-3 rounded-full bg-white/80 p-1.5 shadow-sm text-muted-foreground/80 hover:text-red-500 hover:bg-white transition-all duration-200 z-10 cursor-pointer"
      aria-label="Add to wishlist"
    >
      <motion.div
        animate={active ? { scale: [1, 1.45, 0.9, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <Heart className={`h-4.5 w-4.5 transition-colors ${active ? "fill-red-500 text-red-500" : ""}`} />
      </motion.div>
    </motion.button>
  );
}

// ----------------------------------------------------
// 3. WHAT'S NEW
// ----------------------------------------------------
export function WhatsNew({ products }: { products: Product[] }) {
  // Grab the 4 latest products
  const latestProducts = products.slice(0, 4);

  // Helper to determine product material tag overlay
  const getMaterialTag = (product: Product) => {
    const meta = (product.metadata as any) || {};
    if (meta.material) return `MADE WITH ${meta.material.toUpperCase()}`;
    if (meta.type) return `MADE WITH ${meta.type.toUpperCase()}`;
    if (product.name.toLowerCase().includes("sheets")) return "MADE WITH SUPIMA COTTON";
    if (product.name.toLowerCase().includes("towel")) return "MADE WITH TURKISH COTTON";
    return "MADE WITH PREMIUM COTTON";
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader title="WHAT'S NEW" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-2 gap-6 lg:grid-cols-4"
      >
        {latestProducts.map((product) => {
          const image = product.images[0] ?? "/placeholder-product.jpg";
          return (
            <motion.div key={product.id} variants={itemVariants}>
              <article className="group flex flex-col relative">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted border border-border/30 shadow-sm"
                >
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  {/* Overlays matching screenshot */}
                  {/* 1. New Arrivals Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 border border-border/20 shadow-sm px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest text-foreground select-none">
                    New Arrivals
                  </div>

                  {/* 2. Wishlist Heart */}
                  <WishlistButton />

                  {/* 3. Material Bottom-Left tag */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-[1px] px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-wider text-white select-none">
                    {getMaterialTag(product)}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="mt-4 flex flex-1 flex-col">
                  <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
                    <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
                  </Link>
                  <span className="mt-1 text-sm font-bold text-foreground">
                    {formatINR(product.price_paise)}
                  </span>
                </div>
              </article>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

// Bestseller card with localized state for adding loading indicators and animations
function BestsellerCard({
  product,
  addItem,
  openCart,
  router,
}: {
  product: Product;
  addItem: any;
  openCart: any;
  router: any;
}) {
  const [addingState, setAddingState] = useState<"idle" | "adding" | "added">("idle");
  const image = product.images[0] ?? "/placeholder-product.jpg";
  const compareAt = product.compare_at_price_paise;
  const price = product.price_paise;
  const hasDiscount = compareAt && compareAt > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0;

  const getProductTypeLabel = (p: Product) => {
    const meta = (p.metadata as any) || {};
    const nameLower = p.name.toLowerCase();
    const size = meta.size ? `${meta.size} ` : "";
    if (nameLower.includes("sheets")) return `${size}Bedsheet`;
    if (nameLower.includes("duvet")) return `${size}Duvet Cover`;
    if (nameLower.includes("comforter")) return `${size}Comforter`;
    if (nameLower.includes("pillow")) return `${size}Pillow Cover`;
    if (nameLower.includes("hand")) return "Hand Towel";
    if (nameLower.includes("face")) return "Face Towel";
    if (nameLower.includes("bath")) return "Bath Towel";
    return "Home Linen";
  };

  const getMockRating = (id: string) => {
    const charSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const options = [4.7, 4.8, 4.9, 5.0];
    return options[charSum % options.length];
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingState !== "idle") return;

    setAddingState("adding");
    // Premium timing simulation for standard micro-interaction feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      pricePaise: product.price_paise,
    });

    setAddingState("added");
    await new Promise((resolve) => setTimeout(resolve, 450));
    openCart();

    setTimeout(() => {
      setAddingState("idle");
    }, 1000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      pricePaise: product.price_paise,
    });
    router.push("/checkout");
  };

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col relative bg-card border border-border/30 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Overlays */}
        <WishlistButton />

        {/* Rating Badge at bottom-left of image */}
        <div className="absolute bottom-3 left-3 bg-white/95 border border-border/20 px-2 py-0.5 rounded text-[10px] font-bold text-foreground flex items-center gap-1 shadow-sm select-none">
          <span className="text-amber-500">★</span>
          <span>{getMockRating(product.id).toFixed(1)}</span>
        </div>
      </Link>

      {/* Product details */}
      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/product/${product.slug}`} className="hover:text-primary transition-colors">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
        </Link>

        {/* Product type label */}
        <span className="mt-1 text-xs text-muted-foreground font-medium select-none">
          {getProductTypeLabel(product)}
        </span>

        {/* Pricing row */}
        <div className="mt-2 flex items-baseline flex-wrap gap-1.5">
          <span className="text-sm font-bold text-red-600 dark:text-red-400">
            {formatINR(price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-muted-foreground/80 line-through">
                {formatINR(compareAt)}
              </span>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                ({discountPercent}% OFF)
              </span>
            </>
          )}
        </div>

        {/* Buttons row matching user screenshot */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <motion.button
            onClick={handleAddToCart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full text-[11px] font-bold py-2 border border-primary text-primary hover:bg-primary/5 transition-colors duration-200 rounded-lg cursor-pointer flex items-center justify-center min-h-[38px] select-none"
            disabled={addingState !== "idle"}
          >
            {addingState === "idle" && "Add To Cart"}
            {addingState === "adding" && (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </span>
            )}
            {addingState === "added" && "Added ✓"}
          </motion.button>
          <motion.button
            onClick={handleBuyNow}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full text-[11px] font-bold py-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-colors duration-200 rounded-lg cursor-pointer flex items-center justify-center min-h-[38px]"
          >
            Buy Now
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// ----------------------------------------------------
// 4. BESTSELLERS
// ----------------------------------------------------
export function Bestsellers({ products }: { products: Product[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const router = useRouter();

  // Bestsellers: 4 products with compare_at discounts or standard featured
  const bestsellerProducts = products.filter((p) => p.compare_at_price_paise).slice(0, 4);

  // Fallback to first 4 if none have compare_at price
  const displayProducts = bestsellerProducts.length >= 4
    ? bestsellerProducts
    : products.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader title="BESTSELLERS" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {displayProducts.map((product) => (
          <BestsellerCard
            key={product.id}
            product={product}
            addItem={addItem}
            openCart={openCart}
            router={router}
          />
        ))}
      </motion.div>
    </section>
  );
}
