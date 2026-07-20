import React, { useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Landing } from './pages/Landing';

// Catch dynamic import failures and reload the page automatically
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

// Lazy loaded page components
const ProductListing = React.lazy(() => import('./pages/ProductListing').then(m => ({ default: m.ProductListing })));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Auth = React.lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const AuthForgotPassword = React.lazy(() => import('./pages/AuthForgotPassword').then(m => ({ default: m.AuthForgotPassword })));
const AuthResetPassword = React.lazy(() => import('./pages/AuthResetPassword').then(m => ({ default: m.AuthResetPassword })));
const LegalPage = React.lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));
const Account = React.lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const AdminInventory = React.lazy(() => import('./pages/AdminInventory').then(m => ({ default: m.AdminInventory })));
const AdminOrders = React.lazy(() => import('./pages/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminReviews = React.lazy(() => import('./pages/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminCoupons = React.lazy(() => import('./pages/AdminCoupons').then(m => ({ default: m.AdminCoupons })));

const LazyFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh] bg-white">
    <div className="flex flex-col items-center space-y-4 animate-none">
      {/* Brand logo styling */}
      <h2 className="font-serif text-xl font-medium tracking-[0.2em] text-[#0F2854] animate-pulse">
        RARECOMFORTS
      </h2>
      {/* Centered pulsing navy loading ring */}
      <div className="relative w-8 h-8 animate-none">
        <div className="absolute inset-0 rounded-full border-2 border-[#0F2854]/10 animate-none" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#0F2854] animate-spin" />
      </div>
    </div>
  </div>
);

// Import self-hosted @fontsource typography files (only active weights and families)
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';

import './index.css';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global Layout wrapper containing header/footer persistent frames
const AppLayout: React.FC = () => {
  const location = useLocation();
  const lenisRef = React.useRef<Lenis | null>(null);

  // Scroll to top on route change via Lenis
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Connect Lenis Smooth Scroll to GSAP Ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Update ScrollTrigger on scroll ticks
    lenis.on('scroll', ScrollTrigger.update);

    // Run Lenis frame updates via GSAP ticker
    const gsapTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(gsapTick);
    gsap.ticker.lagSmoothing(0, 0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(gsapTick);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Persistent Navigation Header */}
      <Navbar />

      {/* 2. Page viewport contents */}
      <div className="flex-grow">
        <Suspense fallback={<LazyFallback />}>
          <Outlet />
        </Suspense>
      </div>

      {/* 3. Persistent Brand Footer */}
      <Footer />
    </div>
  );
};

// Fallback 404 page
const NotFound: React.FC = () => (
  <main className="flex-1 mt-[80px] py-32 text-center bg-white space-y-4">
    <span className="text-3xl">🏺</span>
    <h2 className="font-serif text-2xl font-semibold text-navy-deep">Page Not Found</h2>
    <p className="text-muted-gray text-sm">The luxury collection you seek is not at this location.</p>
    <a
      href="/"
      className="inline-block px-6 py-2.5 bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold rounded-full hover:bg-royal-blue transition-luxury"
    >
      RETURN TO HOME
    </a>
  </main>
);

const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Landing />} />
                <Route path="products" element={<ProductListing />} />
                <Route path="products/:slug" element={<ProductDetail />} />
                <Route path="auth" element={<Auth />} />
                <Route path="auth/forgot-password" element={<AuthForgotPassword />} />
                <Route path="auth/reset-password" element={<AuthResetPassword />} />
                <Route path="account" element={<Account />} />
                <Route path="admin/inventory" element={<AdminInventory />} />
                <Route path="admin/orders" element={<AdminOrders />} />
                <Route path="admin/reviews" element={<AdminReviews />} />
                <Route path="admin/coupons" element={<AdminCoupons />} />
                <Route path="legal/:policyName" element={<LegalPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
