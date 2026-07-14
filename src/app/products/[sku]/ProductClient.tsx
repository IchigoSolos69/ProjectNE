"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Plus,
  Minus,
  ArrowLeft,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { API_URL } from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamically import heavy below-the-fold component to reduce initial JS payload size
const RelatedProducts = dynamic(() => import("@/components/products/RelatedProducts"), {
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse" />
      ))}
    </div>
  ),
  ssr: false,
});

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sku: string;
  inventoryCount: number;
  isActive: boolean;
  sizes: string[];
  features: string[];
  materials?: string;
  careInstructions?: string;
  likes: number;
  averageRating: number;
  totalReviews: number;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      name: string;
    };
  }>;
}

const COLORS = [
  { name: "Ivory", hex: "#FAF9F6" },
  { name: "Slate Grey", hex: "#475569" },
  { name: "Midnight Navy", hex: "#0F2854" },
];

export default function ProductClient({ sku }: { sku: string }) {
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  // Configuration selections
  const [selectedSize, setSelectedSize] = useState<string>("Queen");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("description");

  // Likes & rating states
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Pincode Delivery Availability states
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const runPincodeCheck = (code: string) => {
    if (!/^\d{6}$/.test(code)) {
      setPincodeError("Please enter a valid 6-digit pincode.");
      setDeliveryInfo(null);
      return;
    }
    
    setPincodeError(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("user-pincode", code);
    }
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 4);
    
    const dayOfWeek = targetDate.toLocaleDateString("en-IN", { weekday: "long" });
    const month = targetDate.toLocaleDateString("en-IN", { month: "short" });
    const day = targetDate.getDate();
    
    setDeliveryInfo(`✓ Delivery by ${dayOfWeek}, ${month} ${day}`);
  };

  const handlePincodeCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    runPincodeCheck(pincode);
  };

  const fetchProduct = async () => {
    try {
      const targetUrl = `${API_URL}/products/sku/${sku}`;
      const response = await fetch(targetUrl);

      if (response.status === 404) {
        setError("Product not found");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch product with status ${response.status}`);
      }

      const data: DatabaseProduct = await response.json();
      setProduct(data);
      setLikeCount(data.likes || 0);

      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    } catch (fetchError) {
      console.error("Failed to fetch product:", fetchError);
      setError("Unable to load product details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPincode = localStorage.getItem("user-pincode");
      if (savedPincode && /^\d{6}$/.test(savedPincode)) {
        setPincode(savedPincode);
        runPincodeCheck(savedPincode);
      }
    }
    fetchProduct();
  }, [sku]);

  useEffect(() => {
    if (!isLoading && product) {
      setIsMounted(true);
    }
  }, [isLoading, product]);

  const handleLikeToggle = async () => {
    if (isLiked) return;
    setLikeCount((prev) => prev + 1);
    setIsLiked(true);

    try {
      const response = await fetch(`${API_URL}/products/sku/${sku}/like`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to register like.");
    } catch (err) {
      console.error("Failed to like product:", err);
      setLikeCount((prev) => Math.max(0, prev - 1));
      setIsLiked(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmittingRating(true);
    try {
      const response = await fetch(`${API_URL}/products/${sku}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: userRating,
          comment: reviewComment,
          userId: "e578aba7-446b-40f7-8b3e-e6d60b96c862", // Default registered test user
        }),
      });

      if (!response.ok) throw new Error("Failed to submit rating.");
      
      alert("Thank you for your rating!");
      setReviewComment("");
      // Refetch to display latest reviews list
      await fetchProduct();
    } catch (err) {
      console.error("Rating error:", err);
      alert("Could not register rating at this time.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="animate-pulse">
          <div className="h-4 bg-brand-sky/40 w-32 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="aspect-[4/5] bg-brand-sky/40 rounded-none"></div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 bg-brand-sky/40 w-3/4 rounded"></div>
              <div className="h-12 bg-brand-sky/40 w-full rounded"></div>
              <div className="h-20 bg-brand-sky/40 w-full rounded"></div>
              <div className="h-12 bg-brand-sky/40 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center py-12 px-6 bg-red-50 rounded-none border border-red-200 max-w-xl mx-auto">
          <p className="font-serif text-2xl font-semibold text-brand-midnight mb-4">
            {error === "Product not found" ? "Product Not Found" : "Unable to Load Product"}
          </p>
          <p className="text-sm text-brand-midnight/65 mb-6">{error}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.price / 100;
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["Twin", "Queen", "King"];

  const cartProduct = {
    id: product.id,
    name: product.name,
    price: displayPrice,
    image: product.imageUrl,
    sku: product.sku,
    category: product.category,
  };

  const handleBuyNow = async () => {
    addToCart(cartProduct, selectedSize as any, quantity);
    
    try {
      const response = await fetch(`${API_URL}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "00000000-0000-0000-0000-000000000000",
          items: [{ productId: product.id, quantity }],
          shippingAddress: "Default Luxury Suite Address, New Delhi, India",
        }),
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || "Failed to create order");

      alert(`Direct Order Created via Buy Now! ID: ${orderData.razorpayOrderId}`);
    } catch (err) {
      console.error("Buy Now Checkout Error:", err);
      // Fallback: Open Cart Drawer so user can checkout manually
      setIsCartOpen(true);
    }
  };

  return (
    <div
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 transition-opacity duration-700 ease-out ${
        isMounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Back to catalog breadcrumb */}
      <div className="mb-8 font-sans">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-midnight/60 hover:text-brand-midnight transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bedding Collection
        </Link>
      </div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column (Sticky Image Gallery) */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
          <div className="relative aspect-[4/5] w-full bg-brand-sky/15 border border-gray-100 overflow-hidden shadow-luxury">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
            />
          </div>
          
          {/* Below-the-fold alternate images using lazy loading */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[4/5] bg-brand-sky/10 border border-gray-100 overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={`${product.name} lifestyle view 1`}
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 30vw"
                unoptimized
              />
            </div>
            <div className="relative aspect-[4/5] bg-brand-sky/10 border border-gray-100 overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={`${product.name} detail view 2`}
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 30vw"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Details Box) */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24 font-sans">
          
          {/* Header Info */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-midnight/60 block">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-brand-midnight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-between pb-3 border-b border-brand-sky/30">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(product.averageRating || 5) ? "fill-current" : "opacity-35"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-brand-midnight/60">
                  ({product.averageRating || "5.0"} / {product.totalReviews || "0"} reviews)
                </span>
              </div>
              <span className="text-xl font-bold text-brand-midnight">
                {Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(displayPrice)}
              </span>
            </div>
          </div>

          {/* Delivery Checker */}
          <div className="space-y-2 bg-[#F6FAFC] border border-brand-sky/20 p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F2854]/70 block">
              DELIVERY AVAILABILITY
            </span>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="bg-white border border-brand-sky/40 rounded-md py-2 px-3 text-xs font-semibold text-[#0F2854] focus:outline-none focus:border-[#0F2854] focus:ring-1 focus:ring-[#0F2854] w-36"
              />
              <button
                onClick={handlePincodeCheck}
                className="text-xs font-bold text-[#1C4D8D] hover:text-[#0F2854] cursor-pointer"
              >
                CHECK
              </button>
            </div>
            {pincodeError && (
              <p className="text-red-600 text-[10px] font-medium leading-relaxed">{pincodeError}</p>
            )}
            {deliveryInfo && (
              <p className="text-emerald-700 text-xs font-semibold leading-relaxed">{deliveryInfo}</p>
            )}
          </div>

          {/* Configuration Options */}
          <div className="space-y-5">
            {/* Size Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/70">
                Choose Size
              </span>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all duration-300 ${
                        isActive
                          ? "bg-brand-midnight text-white border-brand-midnight"
                          : "bg-white text-brand-midnight border-brand-sky/60 hover:bg-[#F6FAFC]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Swatches Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/70 block">
                Color: <span className="font-semibold text-brand-midnight">{selectedColor.name}</span>
              </span>
              <div className="flex items-center gap-3.5">
                {COLORS.map((col) => {
                  const isActive = selectedColor.name === col.name;
                  return (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col)}
                      className={`h-7 w-7 rounded-full border transition-all relative flex items-center justify-center cursor-pointer ${
                        isActive ? "ring-2 ring-brand-royal ring-offset-2 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart & Buy Funnel Actions */}
          <div className="space-y-3.5 pt-2">
            <div className="flex gap-3 items-stretch">
              {/* Quantity selectors */}
              <div className="flex items-center border border-brand-sky/40 rounded-md bg-[#F6FAFC] shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-brand-midnight/60 hover:text-brand-midnight active:scale-90 transition-transform"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-semibold w-8 text-center text-brand-midnight">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      product.inventoryCount > 0 ? Math.min(product.inventoryCount, q + 1) : q + 1
                    )
                  }
                  className="px-3.5 py-2 text-brand-midnight/60 hover:text-brand-midnight active:scale-90 transition-transform"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  addToCart(cartProduct, selectedSize as any, quantity);
                  alert(`Added ${product.name} to cart.`);
                }}
                disabled={product.inventoryCount === 0}
                className="flex-grow py-3.5 border border-brand-midnight text-brand-midnight hover:bg-brand-sky/10 text-xs font-semibold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                {product.inventoryCount === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* Wishlist Like Button */}
              <button
                onClick={handleLikeToggle}
                className={`px-4 border active:scale-[0.95] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isLiked
                    ? "border-brand-midnight text-brand-midnight bg-brand-midnight/5 font-bold"
                    : "border-brand-sky/60 hover:border-brand-midnight text-brand-midnight/60 hover:text-brand-midnight"
                }`}
                aria-label="Toggle wishlist like"
              >
                <Heart className={`h-4.5 w-4.5 ${isLiked ? "fill-brand-midnight text-brand-midnight" : "stroke-[1.5]"}`} />
                <span className="text-xs font-semibold">{likeCount}</span>
              </button>
            </div>

            {/* Direct Buy Now CTA (Navy Premium style) */}
            <button
              onClick={handleBuyNow}
              disabled={product.inventoryCount === 0}
              className="w-full py-4 bg-[#0F2854] hover:bg-[#1C4D8D] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              Buy Now
            </button>
          </div>

          {/* D2C Trust Badges */}
          <div className="border-t border-brand-sky/30 pt-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center space-y-1.5">
                <Truck className="h-5 w-5 text-brand-midnight/60 stroke-[1.2]" />
                <span className="text-[10px] font-semibold text-brand-midnight uppercase tracking-wider">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5">
                <RotateCcw className="h-5 w-5 text-brand-midnight/60 stroke-[1.2]" />
                <span className="text-[10px] font-semibold text-brand-midnight uppercase tracking-wider">30 Day Returns</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5">
                <ShieldCheck className="h-5 w-5 text-brand-midnight/60 stroke-[1.2]" />
                <span className="text-[10px] font-semibold text-brand-midnight uppercase tracking-wider">Secure Payment</span>
              </div>
            </div>
          </div>

          {/* Re-designed Accordions System */}
          <div className="border-t border-brand-sky/30 pt-2 text-xs">
            
            {/* Description Accordion */}
            <div className="border-b border-brand-sky/30">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "description" ? null : "description")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-brand-midnight"
              >
                <span>Description</span>
                {activeAccordion === "description" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "description" && (
                <div className="pb-4 text-brand-midnight/80 leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  {product.features && product.features.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 pt-1.5">
                      {product.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Materials Accordion */}
            <div className="border-b border-brand-sky/30">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "materials" ? null : "materials")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-brand-midnight"
              >
                <span>Materials</span>
                {activeAccordion === "materials" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "materials" && (
                <div className="pb-4 text-brand-midnight/80 leading-relaxed">
                  {product.materials || "Woven from 100% GOTS-certified organic cotton or European flax linen. OEKO-TEX® certified to be free of harmful chemicals and dyes, making it safe for sensitive skin."}
                </div>
              )}
            </div>

            {/* Care Instructions Accordion */}
            <div className="border-b border-brand-sky/30">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "care" ? null : "care")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-brand-midnight"
              >
                <span>Care Instructions</span>
                {activeAccordion === "care" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "care" && (
                <div className="pb-4 text-brand-midnight/80 leading-relaxed">
                  {product.careInstructions || "Machine wash warm on gentle cycle. Avoid chlorine bleach. Tumble dry on low heat or line dry in shade. Warm iron if desired to maintain a smooth hotel look."}
                </div>
              )}
            </div>

            {/* Shipping Accordion */}
            <div className="border-b border-brand-sky/30">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "shipping" ? null : "shipping")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-brand-midnight"
              >
                <span>Shipping</span>
                {activeAccordion === "shipping" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "shipping" && (
                <div className="pb-4 text-brand-midnight/80 leading-relaxed">
                  Enjoy complimentary shipping within India. Most items ship within 24 hours of checkout and arrive in 3-5 working days. Returns are accepted within 30 days of delivery.
                </div>
              )}
            </div>

            {/* Reviews & Interactive Rating Accordion */}
            <div className="border-b border-brand-sky/30">
              <button
                onClick={() => setActiveAccordion(activeAccordion === "reviews" ? null : "reviews")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-brand-midnight"
              >
                <span>Reviews ({product.reviews?.length || 0})</span>
                {activeAccordion === "reviews" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "reviews" && (
                <div className="pb-4 space-y-6">
                  {/* Submission form */}
                  <form onSubmit={handleRatingSubmit} className="space-y-4 bg-brand-sky/10 border border-brand-sky/20 p-4">
                    <span className="font-bold text-brand-midnight block uppercase text-[10px] tracking-wider">Leave a Review</span>
                    
                    {/* Star selector */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`h-5 w-5 ${star <= userRating ? "fill-current" : "opacity-30"}`} />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <textarea
                        required
                        placeholder="Write your review comment..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-white border border-brand-sky/40 rounded-md p-2.5 text-xs text-brand-midnight focus:outline-none focus:border-brand-royal min-h-[60px]"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingRating}
                        className="px-4 py-2 bg-brand-midnight text-white text-[10px] font-bold uppercase tracking-wider hover:bg-brand-royal transition-colors disabled:opacity-50"
                      >
                        {isSubmittingRating ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>

                  {/* List of reviews */}
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4 divide-y divide-brand-sky/20">
                      {product.reviews.map((rev) => (
                        <div key={rev.id} className="pt-4 first:pt-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-brand-midnight">{rev.user.name}</span>
                            <span className="text-[10px] text-brand-midnight/40">
                              {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex text-amber-500 gap-0.5 mb-1.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < rev.rating ? "fill-current text-amber-500" : "opacity-25"
                                }`}
                              />
                            ))}
                          </div>
                          {rev.comment && (
                            <p className="text-brand-midnight/75 text-xs italic leading-relaxed">
                              "{rev.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brand-midnight/50 italic text-xs text-center py-2">
                      No customer reviews yet. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products below fold section optimized with content-visibility */}
      <div style={{ contentVisibility: "auto" }} className="contain-intrinsic-size-[600px] mt-14">
        <div className="border-t border-brand-sky/30 pt-14">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-brand-midnight mb-8 text-center lg:text-left">
            Related Collections
          </h2>
          <RelatedProducts category={product.category} excludeSku={product.sku} />
        </div>
      </div>
    </div>
  );
}
