import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Toggle register vs login
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ FIX #3: Track Google initialization to prevent multiple initializations
  const googleInitializedRef = useRef(false);
  const googleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  // ✅ FIX #3: Google Identity Services (GIS) - PREVENT DUPLICATE INITIALIZATION
  useEffect(() => {
    if (user) return;
    if (googleInitializedRef.current) return; // Already initialized, skip

    const initializeGoogleOAuth = () => {
      if (googleInitializedRef.current) return; // Double-check before init
      
      const googleWindow = window as any;
      if (googleWindow.google?.accounts?.id) {
        console.log('[Google Auth] Initializing Google Sign-In...');
        
        googleWindow.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder_google_client_id.apps.googleusercontent.com',
          callback: async (response: any) => {
            setError('');
            setLoading(true);
            try {
              await loginWithGoogle(response.credential);
              navigate(redirectPath);
            } catch (err: any) {
              setError(err.message || 'Google Sign-In failed.');
            } finally {
              setLoading(false);
            }
          },
        });
        
        googleInitializedRef.current = true;
        console.log('[Google Auth] Initialization complete');
      }
    };

    // Check if Google script is already loaded
    if ((window as any).google?.accounts?.id) {
      initializeGoogleOAuth();
    } else {
      // Retry checking if script tag hasn't loaded yet (max 10 seconds)
      let attempts = 0;
      const maxAttempts = 50; // 50 × 200ms = 10 seconds
      
      googleCheckIntervalRef.current = setInterval(() => {
        attempts++;
        
        if ((window as any).google?.accounts?.id) {
          initializeGoogleOAuth();
          if (googleCheckIntervalRef.current) {
            clearInterval(googleCheckIntervalRef.current);
            googleCheckIntervalRef.current = null;
          }
        } else if (attempts >= maxAttempts) {
          console.warn('[Google Auth] Google Identity Services script failed to load after 10 seconds');
          if (googleCheckIntervalRef.current) {
            clearInterval(googleCheckIntervalRef.current);
            googleCheckIntervalRef.current = null;
          }
        }
      }, 200);
    }

    // Cleanup function
    return () => {
      if (googleCheckIntervalRef.current) {
        clearInterval(googleCheckIntervalRef.current);
        googleCheckIntervalRef.current = null;
      }
    };
  }, [user, loginWithGoogle, navigate, redirectPath]);

  const handleGoogleSignInTrigger = () => {
    const googleWindow = window as any;
    
    if (!googleInitializedRef.current || !googleWindow.google?.accounts?.id) {
      alert('Google identity services script is still loading. Please try again in a moment.');
      return;
    }
    
    // Show the Google One Tap prompt
    googleWindow.google.accounts.id.prompt();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email || !password) {
          throw new Error('All fields are required.');
        }
        await register(name, email, password);
      } else {
        if (!email || !password) {
          throw new Error('Please fill in email and password.');
        }
        await login(email, password);
      }
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-white relative z-10 overflow-x-hidden">
      
      {/* Left panel: bedroom image with text overlay (50%) */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative flex-shrink-0 bg-navy-deep overflow-hidden">
        {/* Full-bleed high-res bedroom photo */}
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200"
          alt="Bedding Detail"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Navy gradient overlay matching screenshot dark bottom-left vignette */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F2854] via-[#0F2854]/45 to-transparent z-10" />

        {/* Content on left overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 sm:p-12 md:p-16 text-white">
          {/* Logo top-left */}
          <span className="font-serif text-2xl font-bold tracking-wide select-none">
            RareComforts
          </span>

          {/* Slogans bottom-left */}
          <div className="space-y-4 max-w-md">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight drop-shadow-sm">
              Welcome to the Royal Standard of Sleep.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#BDE8F5]/85 leading-relaxed font-light">
              Crafting premium Egyptian cotton and satin linens designed for restorative rest and quiet morning luxury.
            </p>
          </div>

          {/* Copyright bottom-left */}
          <p className="font-sans text-[10px] tracking-wide text-[#BDE8F5]/50">
            &copy; 2026 RareComforts Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel: centering auth forms (50%) */}
      <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-white flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-[420px] space-y-8">
          
          {/* Title Header */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-navy-deep font-bold leading-tight">
              {isRegister ? 'Begin Your Restful Journey' : 'Welcome Back to Luxury'}
            </h1>
            <p className="font-sans text-xs text-muted-gray leading-normal">
              {isRegister
                ? 'Sign up to create your registry, order custom sizes, and access concierge care.'
                : 'Sign in to access your curated orders, registry, and luxury details.'}
            </p>
          </div>

          {/* Inline notification banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-md font-sans">
              {error}
            </div>
          )}

          {/* Input details form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* NAME FIELD FOR SIGN UP */}
            {isRegister && (
              <div className="space-y-2">
                <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                  FULL NAME
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-royal-blue absolute left-4" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#BDE8F5]/15 border border-[#BDE8F5]/40 hover:border-royal-blue focus:border-royal-blue focus:bg-white rounded-full py-3.5 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none placeholder-muted-gray/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div className="space-y-2">
              <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                EMAIL ADDRESS
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-royal-blue absolute left-4" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#BDE8F5]/15 border border-[#BDE8F5]/40 hover:border-royal-blue focus:border-royal-blue focus:bg-white rounded-full py-3.5 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none placeholder-muted-gray/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-2">
              <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-royal-blue absolute left-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#BDE8F5]/15 border border-[#BDE8F5]/40 hover:border-royal-blue focus:border-royal-blue focus:bg-white rounded-full py-3.5 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none placeholder-muted-gray/50 transition-all font-medium"
                  required
                />
              </div>
              {!isRegister && (
                <div className="text-right pt-1">
                  <Link
                    to="/auth/forgot-password"
                    className="font-sans text-[10px] font-bold tracking-wide text-muted-gray hover:text-royal-blue uppercase underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {/* SUBMIT CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-deep text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-royal-blue transition-luxury shadow-md disabled:opacity-50 mt-8"
            >
              {loading
                ? 'VERIFYING CREDENTIALS...'
                : isRegister
                ? 'CREATE MY ACCOUNT →'
                : 'SIGN IN TO MY ACCOUNT →'}
            </button>
          </form>

          {/* Social Sign-In Section */}
          <div className="space-y-6 pt-4">
            {/* Custom Divider */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-gray-100 flex-1" />
              <span className="font-sans text-[9px] font-bold tracking-widest text-muted-gray/60 uppercase">
                OR CONTINUE WITH
              </span>
              <div className="h-px bg-gray-100 flex-1" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignInTrigger}
                className="flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-full font-sans text-xs font-semibold text-navy-deep hover:bg-gray-50 hover:border-royal-blue transition-luxury"
              >
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.988 0-.746-.08-1.32-.176-1.886l-10.617-.326z" />
                </svg>
                GOOGLE
              </button>

              {/* Apple Button (Disabled UI element) */}
              <button
                type="button"
                disabled
                title="Apple Sign-In is coming soon"
                className="flex items-center justify-center gap-2.5 py-3 border border-gray-200/50 rounded-full font-sans text-xs font-semibold text-muted-gray/40 cursor-not-allowed bg-gray-50/50"
              >
                <svg className="w-4 h-4 text-muted-gray/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.27-.56 2.98-1.41z" />
                </svg>
                APPLE
              </button>
            </div>

            {/* Toggle Sign Up / Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="font-sans text-[11px] font-semibold tracking-wider text-navy-deep hover:text-royal-blue uppercase underline"
              >
                {isRegister ? 'ALREADY REGISTERED? SIGN IN' : 'NEW TO LUXURY? SIGN UP'}
              </button>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
};
export default Auth;
