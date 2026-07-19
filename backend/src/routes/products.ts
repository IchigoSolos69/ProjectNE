import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';

const router = Router();

// In-memory cache to mitigate regional database latency and N+1 query compiles
export const productsCache = new Map<string, { data: any; expiry: number }>();
export function clearProductsCache() {
  productsCache.clear();
}

// Helper to get active price of a variant (considers discount)
function getVariantActivePrice(variant: any): number {
  return variant.discountPrice ? Number(variant.discountPrice) : Number(variant.price);
}

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// GET /api/products - Lists products with variants and sorting
router.get('/products', async (req, res) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cached = productsCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return res.status(200).json(cached.data);
    }

    const { category, trending, sort, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { isActive: true };

    if (category) {
      whereClause.category = {
        slug: category as string,
      };
    }

    if (trending === 'true') {
      whereClause.isTrending = true;
    }

    // Fetch all matching products with variants and categories
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true, slug: true },
        },
        variants: true,
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true }
        }
      },
      orderBy: sort === 'newest' || !sort ? { createdAt: 'desc' } : undefined,
    });

    // Map aggregate ratings client-side or during response compilation
    let formattedProducts = products.map((prod) => {
      const totalReviews = prod.reviews.length;
      const avgRating = totalReviews > 0
        ? Number((prod.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

      // Find lowest variant price
      let lowestPrice = 0;
      if (prod.variants.length > 0) {
        lowestPrice = Math.min(...prod.variants.map((v) => getVariantActivePrice(v)));
      }

      return {
        ...prod,
        lowestPrice,
        averageRating: avgRating,
        reviewCount: totalReviews,
        ratingInfo: {
          average: avgRating,
          count: totalReviews,
        }
      };
    });

    // Sorting in JavaScript since variant pricing is relational
    if (sort === 'price_asc') {
      formattedProducts.sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (sort === 'price_desc') {
      formattedProducts.sort((a, b) => b.lowestPrice - a.lowestPrice);
    } else if (sort === 'trending') {
      formattedProducts.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
    }

    // Paginate JavaScript array
    const totalCount = formattedProducts.length;
    const paginatedProducts = formattedProducts.slice(skip, skip + limitNum);

    const responsePayload = {
      products: paginatedProducts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
    };

    // Cache responses for 60 seconds (60000ms)
    productsCache.set(cacheKey, { data: responsePayload, expiry: Date.now() + 60000 });

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /api/products/:slug - Retrieve product by slug
router.get('/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        variants: true,
      },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Calculate rating averages
    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: 'APPROVED' },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return res.status(200).json({
      ...product,
      averageRating: avgRating,
      reviewCount: totalReviews,
      ratingInfo: {
        average: avgRating,
        count: totalReviews,
      }
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// GET /api/products/:slug/related - Recommendations upsell (Category matches + Trending backfill)
router.get('/products/:slug/related', async (req, res) => {
  try {
    const { slug } = req.params;

    const currentProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Fetch related products (same category, active, not itself)
    let related = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        isActive: true,
        id: { not: currentProduct.id },
      },
      include: {
        category: true,
        variants: true,
      },
      take: 4,
    });

    // Backfill with other trending items if category has insufficient products
    if (related.length < 4) {
      const takeCount = 4 - related.length;
      const excludedIds = [currentProduct.id, ...related.map((p) => p.id)];
      const trending = await prisma.product.findMany({
        where: {
          isTrending: true,
          isActive: true,
          id: { notIn: excludedIds },
        },
        include: {
          category: true,
          variants: true,
        },
        take: takeCount,
      });
      related = [...related, ...trending];
    }

    return res.status(200).json(related);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return res.status(500).json({ error: 'Failed to retrieve related product recommendations.' });
  }
});

// GET /api/products/:slug/reviews - Retrieve product reviews
router.get('/products/:slug/reviews', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: 'APPROVED' },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ratingSummary = await prisma.review.aggregate({
      where: { productId: product.id, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return res.status(200).json({
      reviews,
      ratingInfo: {
        average: ratingSummary._avg.rating ? Number(ratingSummary._avg.rating.toFixed(1)) : 0,
        count: ratingSummary._count.rating,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// POST /api/products/:slug/reviews - Submit review (Authenticated)
router.post('/products/:slug/reviews', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user!.id;
    const { rating, title, body } = req.body;

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    if (!body || body.trim() === '') {
      return res.status(400).json({ error: 'Review body content is required.' });
    }

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check if the user has a DELIVERED order containing a variant of this product
    const deliveredOrderWithProduct = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            variant: {
              productId: product.id,
            },
          },
        },
      },
    });

    const isVerifiedPurchase = !!deliveredOrderWithProduct;

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        rating: ratingVal,
        title: title || null,
        body: body.trim(),
        isVerifiedPurchase,
        status: 'PENDING', // Default to admin moderation queue
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    clearProductsCache();

    return res.status(201).json({
      success: true,
      message: 'Your review has been submitted for moderation.',
      review,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ error: 'Failed to record your review.' });
  }
});

export default router;
