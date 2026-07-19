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
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { Auth } from './pages/Auth';
import { AuthForgotPassword } from './pages/AuthForgotPassword';
import { AuthResetPassword } from './pages/AuthResetPassword';
import { LegalPage } from './pages/LegalPage';

// Catch dynamic import failures and reload the page automatically
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

// Lazy loaded page components
const Account = React.lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const AdminInventory = React.lazy(() => import('./pages/AdminInventory').then(m => ({ default: m.AdminInventory })));
const AdminOrders = React.lazy(() => import('./pages/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminReviews = React.lazy(() => import('./pages/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminCoupons = React.lazy(() => import('./pages/AdminCoupons').then(m => ({ default: m.AdminCoupons })));

const LazyFallback: React.FC = () => (
  <div className="max-w-7xl mx-auto px-6 py-24 mt-[80px] text-center">
    <p className="font-sans text-xs font-bold tracking-widest text-muted-gray uppercase animate-pulse">
      LOADING PAGE...
    </p>
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
        <Outlet />
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
                <Route path="account" element={
                  <Suspense fallback={<LazyFallback />}>
                    <Account />
                  </Suspense>
                } />
                <Route path="admin/inventory" element={
                  <Suspense fallback={<LazyFallback />}>
                    <AdminInventory />
                  </Suspense>
                } />
                <Route path="admin/orders" element={
                  <Suspense fallback={<LazyFallback />}>
                    <AdminOrders />
                  </Suspense>
                } />
                <Route path="admin/reviews" element={
                  <Suspense fallback={<LazyFallback />}>
                    <AdminReviews />
                  </Suspense>
                } />
                <Route path="admin/coupons" element={
                  <Suspense fallback={<LazyFallback />}>
                    <AdminCoupons />
                  </Suspense>
                } />
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
