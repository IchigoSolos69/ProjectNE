import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, X, Tag, Check, Calendar } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export const AdminCoupons: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState('1');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Guard routing
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth?redirect=/admin/coupons');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Coupon[]>('/api/admin/coupons');
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadCoupons();
    }
  }, [user, isAdmin]);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode('');
    setType('PERCENTAGE');
    setValue('');
    setMinOrderValue('');
    setMaxDiscountAmount('');
    setUsageLimit('');
    setUsageLimitPerUser('1');
    
    // Set standard default dates (valid from now to next month)
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);
    
    setValidFrom(now.toISOString().substring(0, 10));
    setValidUntil(nextMonth.toISOString().substring(0, 10));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cp: Coupon) => {
    setEditingCoupon(cp);
    setCode(cp.code);
    setType(cp.type);
    setValue(cp.value.toString());
    setMinOrderValue(cp.minOrderValue ? cp.minOrderValue.toString() : '');
    setMaxDiscountAmount(cp.maxDiscountAmount ? cp.maxDiscountAmount.toString() : '');
    setUsageLimit(cp.usageLimit ? cp.usageLimit.toString() : '');
    setUsageLimitPerUser(cp.usageLimitPerUser ? cp.usageLimitPerUser.toString() : '1');
    setValidFrom(cp.validFrom.substring(0, 10));
    setValidUntil(cp.validUntil.substring(0, 10));
    setIsActive(cp.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this coupon code?');
    if (!confirm) return;

    try {
      await apiRequest(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      loadCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !validFrom || !validUntil) {
      alert('Please fill in required fields.');
      return;
    }

    const payload = {
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser, 10) : null,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
      isActive,
    };

    try {
      if (editingCoupon) {
        await apiRequest(`/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to save coupon.');
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
          <h1 className="font-serif text-3xl font-bold text-navy-deep">Coupon & Discount Manager</h1>
          <p className="text-xs text-muted-gray mt-1 uppercase tracking-wide">
            Create, edit, or retire promotional codes for checkout discounts
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-bold px-6 py-3 rounded-full hover:bg-royal-blue transition-luxury shadow-md"
        >
          <Plus className="w-4 h-4" /> CREATE NEW COUPON
        </button>
      </div>

      {/* Coupon List */}
      {loading ? (
        <div className="py-20 text-center animate-pulse">
          <p className="font-sans text-xs font-bold tracking-widest text-muted-gray uppercase">
            LOADING COUPON FILES...
          </p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-dashed border-[#BDE8F5]/40 rounded-xl p-16 text-center space-y-3">
          <Tag className="w-12 h-12 text-[#BDE8F5] mx-auto" />
          <h3 className="font-serif text-lg font-semibold text-navy-deep">No coupons active</h3>
          <p className="text-xs text-muted-gray max-w-xs mx-auto">
            Click the "Create New Coupon" button to establish promotional campaigns.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((cp) => {
            const expired = new Date(cp.validUntil) < new Date();
            return (
              <div
                key={cp.id}
                className="bg-white border border-[#BDE8F5]/20 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-base font-bold text-navy-deep bg-[#BDE8F5]/30 border border-royal-blue/20 rounded px-2.5 py-0.5 tracking-wider">
                      {cp.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        expired
                          ? 'bg-red-100 text-red-800'
                          : cp.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {expired ? 'EXPIRED' : cp.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-sans">
                    <p className="text-navy-deep font-bold">
                      Discount: {cp.type === 'PERCENTAGE' ? `${cp.value}% Off` : `₹${cp.value} Flat Off`}
                    </p>
                    {cp.minOrderValue && (
                      <p className="text-muted-gray">
                        Min. Order: ₹{Number(cp.minOrderValue).toLocaleString('en-IN')}
                      </p>
                    )}
                    {cp.maxDiscountAmount && (
                      <p className="text-muted-gray">
                        Max. Cap: ₹{Number(cp.maxDiscountAmount).toLocaleString('en-IN')}
                      </p>
                    )}
                    {cp.usageLimit && (
                      <p className="text-muted-gray">
                        Limit: {cp.usageLimit} redemptions max
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-gray font-sans border-t border-gray-50 pt-2">
                    <Calendar className="w-3.5 h-3.5 text-royal-blue" />
                    <span>
                      {new Date(cp.validFrom).toLocaleDateString('en-IN')} — {new Date(cp.validUntil).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(cp)}
                    className="flex-1 border border-[#BDE8F5] text-navy-deep font-sans text-[10px] font-bold uppercase tracking-wider py-1.5 rounded flex items-center justify-center gap-1 hover:bg-royal-blue hover:text-white"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cp.id)}
                    className="border border-red-150 text-red-500 font-sans text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded flex items-center justify-center hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OVERLAY MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-deep/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-scaleIn">
            {/* Header */}
            <div className="p-5 border-b border-[#BDE8F5]/30 flex justify-between items-center bg-[#F5FAFD]/45">
              <h2 className="font-serif text-lg font-bold text-navy-deep">
                {editingCoupon ? 'Configure Coupon Code' : 'Establish Promotional Campaign'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-[#BDE8F5]/30 rounded-full text-navy-deep transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Coupon Code *</label>
                  <input
                    type="text"
                    placeholder="WELCOME10"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 rounded px-3 py-2 text-xs text-navy-deep font-mono uppercase font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Coupon Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 rounded px-3 py-2 text-xs text-navy-deep font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Min. Subtotal</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Max. Cap (INR)</label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                    disabled={type === 'FIXED'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Usage Limit (Total)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500 (optional)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Limit Per User</label>
                  <input
                    type="number"
                    value={usageLimitPerUser}
                    onChange={(e) => setUsageLimitPerUser(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Valid From *</label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy-deep uppercase block">Valid Until *</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-8 items-center bg-[#F5FAFD]/20 border border-[#BDE8F5]/20 p-3 rounded">
                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs font-semibold text-navy-deep">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-royal-blue cursor-pointer"
                  />
                  Activate Coupon Code
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-gray-200 rounded-full text-xs font-semibold text-muted-gray"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy-deep text-white hover:bg-royal-blue rounded-full text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" /> Save Coupon
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminCoupons;
