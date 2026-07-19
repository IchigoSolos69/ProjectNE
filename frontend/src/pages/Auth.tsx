import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export const Auth: React.FC = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect only when a session already exists on load — not during Google FedCM flow.
  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify your entries.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-white relative z-10 overflow-x-hidden">
      <Helmet>
        <title>Sign In | RareComforts Bedding</title>
        <meta name="description" content="Sign in to your RareComforts account to access your orders, saved registries, and custom bedding selections." />
        <meta property="og:title" content="Sign In | RareComforts Bedding" />
        <meta property="og:description" content="Sign in to your RareComforts account." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative flex-shrink-0 bg-navy-deep overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200"
          alt="Bedding Detail"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F2854] via-[#0F2854]/45 to-transparent z-10" />

        <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 sm:p-12 md:p-16 text-white">
          <span className="font-serif text-2xl font-bold tracking-wide select-none">RareComforts</span>

          <div className="space-y-4 max-w-md">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight drop-shadow-sm">
              Welcome to the Royal Standard of Sleep.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#BDE8F5]/85 leading-relaxed font-light">
              Crafting premium Egyptian cotton and satin bedding designed for restorative rest and quiet morning luxury.
            </p>
          </div>

          <p className="font-sans text-[10px] tracking-wide text-[#BDE8F5]/50">
            &copy; 2026 RareComforts Inc. All rights reserved.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-white flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-[420px] space-y-8">
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-md font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-gray-100 flex-1" />
              <span className="font-sans text-[9px] font-bold tracking-widest text-muted-gray/60 uppercase">
                OR CONTINUE WITH
              </span>
              <div className="h-px bg-gray-100 flex-1" />
            </div>

            <div className="space-y-4">
              <GoogleSignInButton onError={setError} />

              <button
                type="button"
                disabled
                title="Apple Sign-In is coming soon"
                className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-200/50 rounded-full font-sans text-xs font-semibold text-muted-gray/40 cursor-not-allowed bg-gray-50/50"
              >
                <svg className="w-4 h-4 text-muted-gray/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.27-.56 2.98-1.41z" />
                </svg>
                APPLE (COMING SOON)
              </button>
            </div>

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
