import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest, getOptimizedImageUrl } from '../lib/api';
import { Product, ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowLeft, Sparkles, RefreshCw, Star, Heart, CheckCircle2, Truck, Lock } from 'lucide-react';
import { CartDrawer } from '../components/CartDrawer';
import { useToast } from '../context/ToastContext';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { name: string };
}

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Selection states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Review posting state
  const [newRating, setNewRating] = useState<number>(5);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  // Image Hover Zoom States & Events
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.5)',
    });
  };
  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
    });
  };

  // Wishlist check
  const isWishlisted = product ? wishlistIds.includes(product.id) : false;

  const fetchReviews = async () => {
    try {
      const data: any = await apiRequest(`/api/products/${slug}/reviews`);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const fetchRelated = async () => {
    try {
      const data = await apiRequest<Product[]>(`/api/products/${slug}/related`);
      setRelatedProducts(data);
    } catch (err) {
      console.error('Failed to load related products:', err);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await apiRequest<Product>(`/api/products/${slug}`);
        setProduct(data);
        if (data && data.variants && data.variants.length > 0) {
          // Resolve standard sizes and colors
          const sizes = Array.from(new Set(data.variants.map((v) => v.size).filter(Boolean))) as string[];
          const colors = Array.from(new Set(data.variants.map((v) => v.color).filter(Boolean))) as string[];
          
          if (sizes.length > 0) setSelectedSize(sizes[0]);
          if (colors.length > 0) setSelectedColor(colors[0]);
        }
      } catch (err: any) {
        console.error('Error loading product details:', err);
        setErrorMsg(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    fetchReviews();
    fetchRelated();
  }, [slug]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!product) return;
    try {
      await toggleWishlist(product.id);
      toast.success('Wishlist Updated', `Successfully updated wishlist for ${product.name}`);
    } catch (err: any) {
      toast.error('Wishlist Error', err.message || 'Failed to update wishlist.');
    }
  };

  // Resolve matching active variant
  const activeVariant = product?.variants.find(
    (v) => (v.size || '') === selectedSize && (v.color || '') === selectedColor
  ) || product?.variants[0];

  const price = activeVariant ? Number(activeVariant.price) : 0;
  const discountPrice = activeVariant ? (activeVariant.discountPrice ? Number(activeVariant.discountPrice) : null) : null;
  const activePrice = discountPrice !== null ? discountPrice : price;
  const hasDiscount = discountPrice !== null;
  const isOutOfStock = !activeVariant || activeVariant.stock <= 0;

  // Resolve image overrides
  const variantImages = activeVariant && activeVariant.images.length > 0 ? activeVariant.images : [];
  const displayImages = variantImages.length > 0 ? variantImages : (product?.images || []);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!activeVariant) return;

    setAddingToCart(true);
    try {
      await addToCart(activeVariant.id, quantity);
      setShowDrawer(true);
      toast.success('Added to Cart', `${product?.name} has been added to your cart.`);
    } catch (err: any) {
      toast.error('Add to Cart Failed', err.message || 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBody.trim()) {
      setReviewErrorMsg('Review body comment cannot be blank.');
      return;
    }
    setReviewSubmitLoading(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');
    try {
      await apiRequest(`/api/products/${slug}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: newRating,
          title: newTitle || null,
          body: newBody,
        }),
      });
      setReviewSuccessMsg('Thank you. Your review has been submitted for moderation.');
      setNewTitle('');
      setNewBody('');
      setNewRating(5);
      await fetchReviews();
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'Failed to record review.');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 mt-[80px] grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-gray-100 rounded-lg" />
        </div>
        <div className="space-y-6">
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-10 w-2/3 bg-gray-200 rounded" />
          <div className="h-6 w-1/3 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <main className="flex-1 mt-[80px] py-24 text-center space-y-4">
        <span className="text-3xl">🏺</span>
        <h2 className="font-serif text-2xl font-semibold text-navy-deep">{errorMsg || 'Product details unavailable'}</h2>
        <Link to="/products" className="inline-block px-6 py-2 bg-navy-deep text-white font-sans text-xs uppercase tracking-wide rounded-full">
          BACK TO COLLECTIONS
        </Link>
      </main>
    );
  }

  // Derive unique sizes and colors lists from variants to build filters
  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];

  // JSON-LD structured data block
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: activePrice,
      priceCurrency: 'INR',
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${window.location.origin}/products/${product.slug}`,
    },
    ...(reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingInfo?.average || 5.0,
        reviewCount: product.ratingInfo?.count || reviews.length,
      },
    }),
  };

  return (
    <main className="flex-1 mt-[80px] bg-white min-h-screen py-12 px-6 max-w-7xl mx-auto">
      <Helmet>
        <title>{`${product.name.replace(/linen/gi, 'cotton')} | RareComforts Bedding`}</title>
        <meta name="description" content={product.description.replace(/linen/gi, 'cotton').substring(0, 155)} />
        <link rel="canonical" href={`${window.location.origin}/products/${product.slug}`} />
        <meta property="og:title" content={product.name.replace(/linen/gi, 'cotton')} />
        <meta property="og:description" content={product.description.replace(/linen/gi, 'cotton').substring(0, 150)} />
        <meta property="og:image" content={displayImages[0] || product.images[0]} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={activePrice.toString()} />
        <meta property="product:price:currency" content="INR" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="preload"
          as="image"
          href={getOptimizedImageUrl(displayImages[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 800)}
          imageSrcSet={`${getOptimizedImageUrl(displayImages[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 400)} 400w, ${getOptimizedImageUrl(displayImages[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 800)} 800w, ${getOptimizedImageUrl(displayImages[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 1200)} 1200w`}
          imageSizes="(max-width: 1024px) 100vw, 50vw"
        />
      </Helmet>

      {/* Structured Schema Script */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdData)}
      </script>

      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-gray hover:text-royal-blue mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> BACK TO ALL COLLECTIONS
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div
            className="aspect-[4/5] bg-gray-50 overflow-hidden rounded-lg border border-gray-100 shadow-sm relative cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={getOptimizedImageUrl(displayImages[activeImageIndex] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 800)}
              srcSet={`${getOptimizedImageUrl(displayImages[activeImageIndex] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 400)} 400w, ${getOptimizedImageUrl(displayImages[activeImageIndex] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 800)} 800w, ${getOptimizedImageUrl(displayImages[activeImageIndex] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200', 1200)} 1200w`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              width="800"
              height="1000"
              alt={product.name.replace(/linen/gi, 'cotton')}
              loading="eager"
              fetchPriority="high"
              style={{
                transition: 'transform 0.1s ease-out',
                ...zoomStyle,
              }}
              className="w-full h-full object-cover"
            />

            {/* Wishlist toggle */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-sm text-navy-deep rounded-full shadow hover:text-red-500 transition-all scale-100 active:scale-90"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row */}
          {displayImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 rounded-md overflow-hidden bg-gray-50 border flex-shrink-0 transition-all ${
                    idx === activeImageIndex
                      ? 'border-royal-blue ring-2 ring-royal-blue/10'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img, 100)}
                    width="80"
                    height="100"
                    loading="lazy"
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Configs */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.category && (
              <span className="font-sans text-xs font-bold tracking-widest text-royal-blue uppercase">
                {product.category.name}
              </span>
            )}
            <h1 className="font-serif text-3xl md:text-4xl text-navy-deep font-bold leading-tight">
              {product.name.replace(/linen/gi, 'cotton')}
            </h1>
            
            {/* Reviews aggregate score */}
            {product.reviewCount && product.reviewCount > 0 ? (
              <div className="flex items-center gap-1.5 py-0.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.averageRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-sans text-xs font-bold text-navy-deep">
                  {product.averageRating}
                </span>
                <span className="font-sans text-xs text-muted-gray">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            ) : null}
          </div>

          {/* Price breakdown */}
          <div className="flex items-baseline gap-3 border-y border-[#BDE8F5]/30 py-4">
            {hasDiscount ? (
              <>
                <span className="font-sans text-base text-muted-gray line-through">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                <span className="font-sans text-2xl font-bold text-navy-deep">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-green-600 font-sans text-xs font-semibold bg-green-50 px-2 py-1 rounded ml-1">
                  Save {Math.round(((price - activePrice) / price) * 100)}%
                </span>
              </>
            ) : (
              <span className="font-sans text-2xl font-bold text-navy-deep">
                ₹{activePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <p className={`text-sm text-muted-gray leading-relaxed font-sans ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
              {product.description.replace(/linen/gi, 'cotton')}
            </p>
            <button
              type="button"
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-[10px] font-sans font-bold tracking-widest text-[var(--color-royal-blue)] hover:underline uppercase block"
            >
              {isDescExpanded ? 'Read Less' : 'Read More'}
            </button>
          </div>

          {/* "What's Included" Section */}
          {product.packageIncludes && product.packageIncludes.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                What's Included
              </span>
              <ul className="list-disc pl-4 text-xs text-muted-gray space-y-1 font-sans">
                {product.packageIncludes.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Variant Selection Filters */}
          <div className="space-y-5 pt-4">
            {/* Size options */}
            {sizes.length > 0 && (
              <div className="space-y-2">
                <span className="font-sans text-xs font-bold tracking-wider text-navy-deep uppercase block">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setActiveImageIndex(0);
                      }}
                      className={`px-4 py-2 border rounded-md text-xs font-semibold transition-luxury ${
                        selectedSize === size
                          ? 'border-navy-deep bg-navy-deep text-white shadow-sm'
                          : 'border-gray-200 text-navy-deep hover:border-royal-blue'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color options */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <span className="font-sans text-xs font-bold tracking-wider text-navy-deep uppercase block">
                  Select Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setActiveImageIndex(0);
                      }}
                      className={`px-4 py-2 border rounded-md text-xs font-semibold transition-luxury ${
                        selectedColor === color
                          ? 'border-navy-deep bg-[#BDE8F5]/10 text-navy-deep font-bold'
                          : 'border-gray-200 text-muted-gray hover:border-royal-blue'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="text-xs font-sans font-semibold">
              {activeVariant ? (
                activeVariant.stock > 10 ? (
                  <span className="text-green-600">🟢 In Stock | Ships within 24 Hours</span>
                ) : activeVariant.stock > 0 ? (
                  <span className="text-amber-600">🟠 Only {activeVariant.stock} Left - Order Soon</span>
                ) : (
                  <span className="text-red-600">🔴 Out of Stock</span>
                )
              ) : (
                <span className="text-red-600">🔴 Out of Stock</span>
              )}
            </div>

            {/* Quantity and Checkout buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-2">
              {!isOutOfStock && (
                <div className="flex items-center border border-gray-200 rounded-full h-12 px-3 bg-white w-full sm:w-auto justify-between">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 hover:text-royal-blue disabled:opacity-30 text-navy-deep font-bold font-sans"
                  >
                    -
                  </button>
                  <span className="px-6 text-sm font-semibold text-navy-deep w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 hover:text-royal-blue text-navy-deep font-bold font-sans"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock}
                className="flex-1 bg-navy-deep text-white font-sans text-xs uppercase tracking-wider font-bold h-12 rounded-full flex items-center justify-center gap-2 hover:bg-royal-blue transition-luxury shadow-md disabled:opacity-50"
              >
                {isOutOfStock ? (
                  'OUT OF STOCK'
                ) : addingToCart ? (
                  'ADDING TO CART...'
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> ADD TO CART
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#BDE8F5]/30 text-center">
            <div className="flex flex-col items-center space-y-1">
              <Truck className="w-5 h-5 text-muted-gray" />
              <p className="font-sans text-[10px] font-bold text-navy-deep uppercase tracking-widest">Free Shipping</p>
              <p className="text-[9px] text-muted-gray font-medium">Pan-India delivery</p>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Lock className="w-5 h-5 text-muted-gray" />
              <p className="font-sans text-[10px] font-bold text-navy-deep uppercase tracking-widest">Secure Payment</p>
              <p className="text-[9px] text-muted-gray font-medium">100% Encrypted</p>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <RefreshCw className="w-5 h-5 text-muted-gray animate-none" />
              <p className="font-sans text-[10px] font-bold text-navy-deep uppercase tracking-widest">Easy Returns</p>
              <p className="text-[9px] text-muted-gray font-medium">10-day exchange</p>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Sparkles className="w-5 h-5 text-muted-gray" />
              <p className="font-sans text-[10px] font-bold text-navy-deep uppercase tracking-widest">Made in India</p>
              <p className="text-[9px] text-muted-gray font-medium">Artisanal heritage</p>
            </div>
          </div>

          {/* Collapsible Details Accordion */}
          <div className="space-y-2 pt-6 border-t border-[#BDE8F5]/30">
            {product.material && (
              <div className="border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('material')}
                  className="w-full flex justify-between items-center text-xs font-semibold text-navy-deep font-sans uppercase tracking-wider py-2"
                >
                  <span>Material & Build</span>
                  <span className="text-muted-gray text-sm">{activeAccordion === 'material' ? '−' : '+'}</span>
                </button>
                {activeAccordion === 'material' && (
                  <p className="text-xs text-muted-gray leading-relaxed font-sans pt-2">
                    {product.material}
                  </p>
                )}
              </div>
            )}
            {product.careInstructions && (
              <div className="border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex justify-between items-center text-xs font-semibold text-navy-deep font-sans uppercase tracking-wider py-2"
                >
                  <span>Care Instructions</span>
                  <span className="text-muted-gray text-sm">{activeAccordion === 'care' ? '−' : '+'}</span>
                </button>
                {activeAccordion === 'care' && (
                  <p className="text-xs text-muted-gray leading-relaxed font-sans pt-2">
                    {product.careInstructions}
                  </p>
                )}
              </div>
            )}
            {product.manufacturingDetails && (
              <div className="border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('manufacturing')}
                  className="w-full flex justify-between items-center text-xs font-semibold text-navy-deep font-sans uppercase tracking-wider py-2"
                >
                  <span>Manufacturing & Origin Details</span>
                  <span className="text-muted-gray text-sm">{activeAccordion === 'manufacturing' ? '−' : '+'}</span>
                </button>
                {activeAccordion === 'manufacturing' && (
                  <p className="text-xs text-muted-gray leading-relaxed font-sans pt-2">
                    {product.manufacturingDetails}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Section */}
      <section className="mt-20 border-t border-gray-100 pt-16 space-y-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="font-serif text-2xl font-semibold text-navy-deep text-center">Verified Rest Reviews</h2>

          {/* List of reviews */}
          {reviews.length === 0 ? (
            <p className="text-center text-sm text-muted-gray font-sans py-4">No reviews have been written for this product yet. Sleepers who purchase can leave their ratings below.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="border border-gray-100 rounded-lg p-5 space-y-3 shadow-sm bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-sans text-xs font-bold text-navy-deep">{rev.user.name}</span>
                      <span className="font-sans text-[10px] text-muted-gray ml-2">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>

                  {rev.isVerifiedPurchase && (
                    <div className="inline-flex items-center gap-1 bg-[#3AA757]/10 text-[#3AA757] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED REST PURCHASE
                    </div>
                  )}

                  <div className="space-y-1 font-sans text-xs">
                    {rev.title && <h4 className="font-bold text-navy-deep">{rev.title}</h4>}
                    <p className="text-muted-gray leading-relaxed">{rev.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form to submit review */}
          <div className="bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 rounded-lg p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-navy-deep">Write a Sleep Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewSuccessMsg && (
                  <p className="text-xs text-[#3AA757] font-semibold bg-[#3AA757]/15 border border-[#3AA757]/30 px-3 py-2 rounded-md">
                    {reviewSuccessMsg}
                  </p>
                )}
                {reviewErrorMsg && (
                  <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                    {reviewErrorMsg}
                  </p>
                )}

                <div className="space-y-2">
                  <span className="font-sans text-[10px] font-bold tracking-wider text-navy-deep uppercase block">Rating Score</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-sans text-[10px] font-bold tracking-wider text-navy-deep uppercase block">Review Headline</span>
                  <input
                    type="text"
                    placeholder="E.g. A true royal sleep experience"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs outline-none focus:border-royal-blue"
                  />
                </div>

                <div className="space-y-1">
                  <span className="font-sans text-[10px] font-bold tracking-wider text-navy-deep uppercase block">Review Details</span>
                  <textarea
                    rows={4}
                    placeholder="Detail your sleep quality, material feel, or sizing accuracy..."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs outline-none focus:border-royal-blue resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitLoading}
                  className="bg-navy-deep text-white font-sans text-[10px] font-bold uppercase tracking-wider py-2.5 px-6 rounded hover:bg-royal-blue disabled:opacity-40"
                >
                  {reviewSubmitLoading ? 'RECORDING REVIEW...' : 'SUBMIT REVIEW'}
                </button>
              </form>
            ) : (
              <p className="font-sans text-xs text-muted-gray text-center py-4">
                Please{' '}
                <Link to={`/auth?redirect=${encodeURIComponent(window.location.pathname)}`} className="text-royal-blue hover:underline font-semibold">
                  sign in
                </Link>{' '}
                to share your review.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section ("You May Also Like") */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-gray-100 pt-16">
          <h3 className="font-serif text-2xl font-semibold text-navy-deep text-center mb-12">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Cart Drawer Panel */}
      <CartDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </main>
  );
};

export default ProductDetail;
