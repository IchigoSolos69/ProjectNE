"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const DOMAIN = process.env.FRONTEND_ORIGIN || 'https://rarecomforts.in';
// GET /api/sitemap.xml - Compile a dynamic XML Sitemap matching database products & categories
router.get('/sitemap.xml', async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: { isActive: true },
            select: { slug: true, createdAt: true },
        });
        const categories = await prisma_1.prisma.category.findMany({
            select: { slug: true },
        });
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        // 1. Static Routes
        const staticPages = ['', '/products', '/auth', '/legal/privacy-policy', '/legal/terms-and-conditions', '/legal/shipping-policy', '/legal/returns-and-refunds'];
        for (const page of staticPages) {
            xml += `  <url>\n`;
            xml += `    <loc>${DOMAIN}${page}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        }
        // 2. Categories
        for (const cat of categories) {
            xml += `  <url>\n`;
            xml += `    <loc>${DOMAIN}/products?category=${cat.slug}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        }
        // 3. Products
        for (const prod of products) {
            xml += `  <url>\n`;
            xml += `    <loc>${DOMAIN}/products/${prod.slug}</loc>\n`;
            xml += `    <lastmod>${prod.createdAt.toISOString().split('T')[0]}</lastmod>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += `    <priority>0.9</priority>\n`;
            xml += `  </url>\n`;
        }
        xml += '</urlset>\n';
        res.header('Content-Type', 'application/xml');
        return res.status(200).send(xml);
    }
    catch (error) {
        console.error('Error generating sitemap:', error);
        return res.status(500).json({ error: 'Failed to compile sitemap.' });
    }
});
// GET /api/robots.txt - Serve crawlers instructions
router.get('/robots.txt', (req, res) => {
    let txt = 'User-agent: *\n';
    txt += 'Allow: /\n';
    txt += `Sitemap: ${DOMAIN}/sitemap.xml\n`;
    res.header('Content-Type', 'text/plain');
    return res.status(200).send(txt);
});
exports.default = router;
