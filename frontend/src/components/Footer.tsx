import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-navy-deep text-[#BDE8F5]/80 py-16 border-t border-[#1C4D8D]/40 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Blurb */}
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-semibold text-white tracking-wide">
            RareComforts
          </h3>
          <p className="text-sm leading-relaxed max-w-xs text-[#BDE8F5]/75">
            Woven for stillness. Reimagining the standard of rest with premium, sustainably sourced Egyptian cotton and liquid-smooth satin sateen.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Categories Link Grid */}
        <div className="space-y-4">
          <h4 className="text-white text-xs font-bold tracking-widest uppercase">Collections</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/products?category=bedsheets" className="hover:text-white transition-colors">
                Egyptian Bedsheets
              </Link>
            </li>
            <li>
              <Link to="/products?category=comforters" className="hover:text-white transition-colors">
                Mulberry Comforters
              </Link>
            </li>
            <li>
              <Link to="/products?category=cushion-covers" className="hover:text-white transition-colors">
                Velvet Cushion Covers
              </Link>
            </li>
            <li>
              <Link to="/products?category=towels" className="hover:text-white transition-colors">
                Turkish Towels
              </Link>
            </li>
            <li>
              <Link to="/products?category=door-mats" className="hover:text-white transition-colors">
                Organic Entry Mats
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-4">
          <h4 className="text-white text-xs font-bold tracking-widest uppercase">Customer Service</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/legal/shipping-policy" className="hover:text-white transition-colors">
                White Glove Shipping
              </Link>
            </li>
            <li>
              <Link to="/legal/returns-and-refunds" className="hover:text-white transition-colors">
                Returns & Restocking
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Care Instructions
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Contact Concierge
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Email Capture */}
        <div className="space-y-4">
          <h4 className="text-white text-xs font-bold tracking-widest uppercase">Newsletter</h4>
          <p className="text-sm leading-relaxed text-[#BDE8F5]/75">
            Subscribe to receive private sales, registry access, and bedding care secrets.
          </p>
          
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative flex items-center border-b border-[#BDE8F5]/30 hover:border-white focus-within:border-white transition-colors">
              <Mail className="w-4 h-4 text-[#BDE8F5]/50 mr-2 flex-shrink-0" />
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 outline-0 py-2.5 text-xs text-white placeholder-[#BDE8F5]/40 tracking-wider uppercase"
                required
              />
              <button
                type="submit"
                className="p-1.5 hover:text-white transition-colors"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {subscribed && (
              <p className="text-xs text-sky-blue animate-fadeIn">
                Welcome to luxury. Check your inbox soon.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Copyright bottom bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#1C4D8D]/20 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-4">
        <p className="text-xs text-[#BDE8F5]/50">
          &copy; 2026 RareComforts Inc. All rights reserved. Crafted for tranquility.
        </p>
        <div className="flex gap-6 text-xs text-[#BDE8F5]/50">
          <Link to="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/legal/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
