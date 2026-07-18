import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Landing } from './pages/Landing';
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { Auth } from './pages/Auth';
import { Account } from './pages/Account';
import { AdminInventory } from './pages/AdminInventory';
import { AuthForgotPassword } from './pages/AuthForgotPassword';
import { AuthResetPassword } from './pages/AuthResetPassword';
import { AdminOrders } from './pages/AdminOrders';
import { AdminReviews } from './pages/AdminReviews';
import { AdminCoupons } from './pages/AdminCoupons';
import { LegalPage } from './pages/LegalPage';

import './index.css';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global Layout wrapper containing header/footer persistent frames
const AppLayout: React.FC = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Connect Lenis Smooth Scroll to GSAP Ticker
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });

    // Update ScrollTrigger on scroll ticks
    lenis.on('scroll', ScrollTrigger.update);

    // Run Lenis frame updates via GSAP ticker
    const gsapTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(gsapTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
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
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder_google_client_id.apps.googleusercontent.com';

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
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
        </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
