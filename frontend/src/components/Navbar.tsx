import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartDrawer } from './CartDrawer';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Track scrolling to trigger header border/shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page transitions
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
  }, [location]);

  const categories = [
    { name: 'BEDSHEETS', slug: 'bedsheets' },
    { name: 'COMFORTERS', slug: 'comforters' },
    { name: 'CUSHION COVERS', slug: 'cushion-covers' },
    { name: 'TOWELS', slug: 'towels' },
    { name: 'DOOR MATS', slug: 'door-mats' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-medium ease-smooth ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#BDE8F5]/30 shadow-sm py-4'
            : 'bg-white/40 backdrop-blur-sm border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-2xl font-bold tracking-tight text-navy-deep hover:text-royal-blue transition-all duration-fast ease-soft"
          >
            RareComforts
          </Link>
 
          {/* Desktop Categories */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="font-sans text-xs font-semibold tracking-wide text-navy-deep hover:text-royal-blue transition-colors duration-fast ease-soft relative group py-1"
              >
                {cat.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-royal-blue transition-all duration-medium ease-smooth group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* User & Cart Actions */}
          <div className="flex items-center gap-4">
            
            {/* Admin Panel Icon */}
            {isAdmin && (
              <Link
                to="/admin/inventory"
                className="p-2 text-navy-deep hover:text-royal-blue transition-colors"
                title="Admin Control"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            {/* Account Link */}
            <Link
              to={user ? '/account' : '/auth'}
              className="p-2 text-navy-deep hover:text-royal-blue transition-colors flex items-center gap-1.5"
              title={user ? 'Your Account' : 'Sign In'}
            >
              <User className="w-5 h-5" />
              {user && (
                <span className="hidden sm:inline font-sans text-[11px] font-semibold tracking-wider uppercase max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-navy-deep hover:text-royal-blue transition-colors relative"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-royal-blue text-white rounded-full flex items-center justify-center font-sans text-[9px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-navy-deep hover:text-royal-blue transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[#BDE8F5]/30 shadow-md py-6 px-8 flex flex-col gap-4 animate-fadeIn">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="font-sans text-sm font-semibold tracking-wide text-navy-deep hover:text-royal-blue transition-colors py-1.5 border-b border-gray-50 last:border-0"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Cart Slider Overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
