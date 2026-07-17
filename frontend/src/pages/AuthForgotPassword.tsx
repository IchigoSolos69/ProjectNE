import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../lib/api';

export const AuthForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccessMsg(data.message || 'Verification details sent. Please inspect your mailbox.');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request recovery link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-[#F5FAFD]/45 mt-[80px] p-6">
      <div className="w-full max-w-[420px] bg-white border border-gray-100 p-8 rounded-2xl shadow-xl space-y-6">
        
        {/* Back Link */}
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 font-sans text-[10px] font-bold text-muted-gray hover:text-royal-blue uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl text-navy-deep font-bold leading-tight">
            Recover Your Rest
          </h1>
          <p className="font-sans text-xs text-muted-gray leading-relaxed">
            Provide your registered email address, and we will send a password reset link to recover your account.
          </p>
        </div>

        {successMsg && (
          <div className="bg-[#3AA757]/10 border border-[#3AA757]/20 text-[#3AA757] text-xs px-4 py-3 rounded-md font-sans">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-md font-sans">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-[#BDE8F5]/15 border border-[#BDE8F5]/40 hover:border-royal-blue focus:border-royal-blue focus:bg-white rounded-full py-3 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none placeholder-muted-gray/50 transition-all font-medium"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-navy-deep text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-royal-blue transition-luxury shadow-md disabled:opacity-50"
          >
            {loading ? 'SENDING LINK...' : 'SEND RESET LINK →'}
          </button>
        </form>

      </div>
    </main>
  );
};

export default AuthForgotPassword;
