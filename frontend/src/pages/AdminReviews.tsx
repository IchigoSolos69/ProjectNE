import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Star, Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    slug: string;
  };
}

export const AdminReviews: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Guard routing
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth?redirect=/admin/reviews');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Review[]>(`/api/admin/reviews?status=${filterStatus}`);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadReviews();
    }
  }, [user, isAdmin, filterStatus]);

  const handleModerate = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      alert(`Review has been successfully marked as ${status}.`);
      loadReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to moderate review.');
    }
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 mt-[80px] text-center">
        <p className="font-sans text-xs font-bold tracking-widest text-muted-gray uppercase animate-pulse">
          VERIFYING ACCESS PRIVILEGES...
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 mt-[80px] bg-[#F5FAFD]/40 min-h-screen py-10 px-6 max-w-7xl mx-auto space-y-8">
      {/* Dashboard header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#BDE8F5]/30 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy-deep">Review Moderation Board</h1>
          <p className="text-xs text-muted-gray mt-1 uppercase tracking-wide">
            Approve or reject customer reviews for product showroom catalogs
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-sans">
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-6 py-3 font-bold uppercase tracking-wider border-b-2 transition-all ${
            filterStatus === 'PENDING'
              ? 'border-royal-blue text-royal-blue'
              : 'border-transparent text-muted-gray hover:text-navy-deep'
          }`}
        >
          Pending Queue ({filterStatus === 'PENDING' ? reviews.length : '?'})
        </button>
        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-6 py-3 font-bold uppercase tracking-wider border-b-2 transition-all ${
            filterStatus === 'APPROVED'
              ? 'border-royal-blue text-royal-blue'
              : 'border-transparent text-muted-gray hover:text-navy-deep'
          }`}
        >
          Approved Reviews
        </button>
        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`px-6 py-3 font-bold uppercase tracking-wider border-b-2 transition-all ${
            filterStatus === 'REJECTED'
              ? 'border-royal-blue text-royal-blue'
              : 'border-transparent text-muted-gray hover:text-navy-deep'
          }`}
        >
          Rejected Reviews
        </button>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="py-20 text-center">
          <p className="font-sans text-xs font-bold tracking-widest text-muted-gray uppercase animate-pulse">
            LOADING SHOWROOM REVIEWS...
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-dashed border-[#BDE8F5]/40 rounded-xl p-16 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-[#BDE8F5] mx-auto" />
          <h3 className="font-serif text-lg font-semibold text-navy-deep">No reviews found</h3>
          <p className="text-xs text-muted-gray max-w-xs mx-auto">
            The {filterStatus.toLowerCase()} reviews queue is currently empty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-[#BDE8F5]/20 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              
              <div className="space-y-3">
                {/* Header: user and product */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-navy-deep">{rev.product.name}</h4>
                    <span className="font-sans text-[10px] text-muted-gray">By {rev.user.name} ({rev.user.email})</span>
                  </div>

                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-sans font-bold bg-[#BDE8F5]/30 text-royal-blue px-2 py-0.5 rounded uppercase">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-0.5 bg-[#3AA757]/10 text-[#3AA757] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED BUYER
                    </span>
                  )}
                </div>

                {/* Review Body */}
                <div className="space-y-1 font-sans text-xs">
                  {rev.title && <h5 className="font-bold text-navy-deep">{rev.title}</h5>}
                  <p className="text-muted-gray leading-relaxed">{rev.body}</p>
                </div>
              </div>

              {/* Action buttons */}
              {rev.status === 'PENDING' && (
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleModerate(rev.id, 'APPROVED')}
                    className="flex-1 bg-[#3AA757] text-white font-sans text-[10px] font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-1 hover:bg-[#3AA757]/90 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleModerate(rev.id, 'REJECTED')}
                    className="flex-1 bg-red-600 text-white font-sans text-[10px] font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-1 hover:bg-red-700 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}

              {rev.status !== 'PENDING' && (
                <div className="text-right pt-2 border-t border-gray-100 font-sans text-[9px] font-bold text-muted-gray uppercase">
                  Current Status: {rev.status}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminReviews;
