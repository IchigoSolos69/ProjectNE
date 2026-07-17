import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { apiRequest } from '../lib/api';

export const AuthResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Invalid or missing password recovery token.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setSuccessMsg('Your password has been reset successfully. Redirecting to sign in...');
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-[#F5FAFD]/45 mt-[80px] p-6">
      <div className="w-full max-w-[420px] bg-white border border-gray-100 p-8 rounded-2xl shadow-xl space-y-6">
        
        <div className="space-y-2">
          <h1 className="font-serif text-2xl text-navy-deep font-bold leading-tight">
            Configure New Credentials
          </h1>
          <p className="font-sans text-xs text-muted-gray leading-relaxed">
            Please enter your new secure password below to regain full access to your RareComforts account.
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

        {!token && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-md font-sans">
            No recovery token detected in your URL. Please verify the link you clicked in your email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* New password */}
          <div className="space-y-2">
            <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
              NEW PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-royal-blue absolute left-4" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#BDE8F5]/15 border border-[#BDE8F5]/40 hover:border-royal-blue focus:border-royal-blue focus:bg-white rounded-full py-3 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none placeholder-muted-gray/50 transition-all font-medium"
                required
                disabled={loading || !token}
              />
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
              CONFIRM PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-royal-blue absolute left-4" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#BDE8F5]/15 border border-[#BDE8F5]/40 hover:border-royal-blue focus:border-royal-blue focus:bg-white rounded-full py-3 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none placeholder-muted-gray/50 transition-all font-medium"
                required
                disabled={loading || !token}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !password}
            className="w-full bg-navy-deep text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-royal-blue transition-luxury shadow-md disabled:opacity-50"
          >
            {loading ? 'RESETTING PASSWORD...' : 'UPDATE PASSWORD →'}
          </button>
        </form>

      </div>
    </main>
  );
};

export default AuthResetPassword;
