import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2, Tag, ChevronLeft, PlusCircle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    checkout,
    cartTotal,
    subtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartCount,
  } = useCart();

  const [step, setStep] = useState<1 | 2>(1); // 1: Cart, 2: Checkout Address Selection
  const [checkingOut, setCheckingOut] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponErr, setCouponErr] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New Address form state
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrLoading, setAddrLoading] = useState(false);

  // Load addresses when drawer opens & user is logged in
  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const data = await apiRequest<Address[]>('/api/addresses');
      setAddresses(data);
      if (data.length > 0) {
        const def = data.find((a) => a.isDefault) || data[0];
        setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error('Failed to load shipping addresses:', err);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchAddresses();
    }
  }, [isOpen, user]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponErr('');
    setCouponLoading(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err: any) {
      setCouponErr(err.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      alert('Please fill in all required address fields.');
      return;
    }
    setAddrLoading(true);
    try {
      const newAddress = await apiRequest<Address>('/api/addresses', {
        method: 'POST',
        body: JSON.stringify({
          fullName: addrName,
          phone: addrPhone,
          line1: addrLine1,
          line2: addrLine2 || null,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          label: addrLabel,
          isDefault: addresses.length === 0,
        }),
      });
      setAddresses((prev) => [newAddress, ...prev]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      
      // Clear form
      setAddrName('');
      setAddrPhone('');
      setAddrLine1('');
      setAddrLine2('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
      setAddrLabel('Home');
    } catch (err: any) {
      alert(err.message || 'Failed to save address.');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address.');
      return;
    }
    setCheckingOut(true);
    try {
      await checkout(selectedAddressId);
      setSuccessMsg('Your premium bedding order has been placed successfully. Awaiting payment verification.');
      setStep(1);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  const activePrice = (item: any) =>
    item.product.discountPrice ? Number(item.product.discountPrice) : Number(item.product.price);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F2854] z-50 cursor-pointer"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#BDE8F5]/40 flex items-center justify-between bg-gradient-to-r from-white to-[#BDE8F5]/10">
              <div className="flex items-center gap-2">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="p-1 hover:bg-[#BDE8F5]/30 rounded-full transition-colors text-navy-deep mr-1"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <ShoppingBag className="w-5 h-5 text-navy-deep" />
                <h3 className="font-serif text-lg font-semibold text-navy-deep">
                  {step === 1 ? 'Your Linen Closet' : 'Shipping & Review'}
                </h3>
                <span className="bg-navy-deep text-white text-xs px-2 py-0.5 rounded-full font-sans">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-[#BDE8F5]/30 rounded-full transition-colors text-navy-deep"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Panel Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {successMsg ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#BDE8F5]/30 rounded-full flex items-center justify-center text-navy-deep text-2xl animate-bounce">
                    ✨
                  </div>
                  <h4 className="font-serif text-2xl text-navy-deep font-semibold">Thank You</h4>
                  <p className="text-muted-gray text-xs leading-relaxed max-w-xs">{successMsg}</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-[#BDE8F5]" />
                  <h4 className="font-serif text-xl text-navy-deep">Your drawer is empty</h4>
                  <p className="text-muted-gray text-xs max-w-xs leading-relaxed">
                    Choose from our Egyptian cotton sheets, mulberry silks, or comforters to begin your rest.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-royal-blue text-royal-blue font-sans text-xs uppercase tracking-wide font-semibold hover:bg-royal-blue hover:text-white transition-luxury rounded-full"
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : step === 1 ? (
                /* STEP 1: CART LIST & COUPONS */
                <>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        {/* Product Thumbnail */}
                        <div className="w-16 h-20 bg-gray-50 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={item.product.images[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=120'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif text-xs font-semibold text-navy-deep line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-[10px] text-muted-gray font-sans mt-0.5">
                              {item.size ? `Size: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''}
                            </p>
                            <p className="text-xs text-navy-deep font-bold mt-1">
                              ₹{activePrice(item).toLocaleString('en-IN')}
                            </p>
                          </div>

                          {/* Quantities Controls */}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center border border-[#BDE8F5] rounded-full px-1.5 py-0.5 bg-[#BDE8F5]/10">
                              <button
                                onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-0.5 hover:text-royal-blue disabled:opacity-30"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-navy-deep">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-0.5 hover:text-royal-blue"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-muted-gray hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Codes Input */}
                  <div className="border-t border-gray-100 pt-5 space-y-3">
                    <h5 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase">
                      PROMOTIONAL COUPONS
                    </h5>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-sky-blue/15 border border-sky-blue/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-royal-blue" />
                          <div>
                            <span className="font-sans text-xs font-bold text-royal-blue">
                              {appliedCoupon.code}
                            </span>
                            <span className="font-sans text-[10px] text-muted-gray ml-2">
                              (₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} Saved)
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="font-sans text-[10px] font-bold text-red-500 uppercase hover:underline"
                        >
                          REMOVE
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="ENTER COUPON CODE"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-[#BDE8F5]/10 border border-[#BDE8F5]/40 focus:border-royal-blue rounded-lg px-3 py-2 font-sans text-xs text-navy-deep outline-none uppercase placeholder-muted-gray/45"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading || !couponInput.trim()}
                          className="bg-navy-deep text-white font-sans text-[10px] font-bold uppercase tracking-wider px-4 rounded-lg hover:bg-royal-blue disabled:opacity-40"
                        >
                          {couponLoading ? 'APPLYING...' : 'APPLY'}
                        </button>
                      </form>
                    )}
                    {couponErr && <p className="font-sans text-[10px] text-red-500">{couponErr}</p>}
                  </div>
                </>
              ) : (
                /* STEP 2: ADDRESS SELECTION & CHECKOUT FORM */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-semibold text-navy-deep">Shipping Destination</h4>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-1 text-[11px] font-bold text-royal-blue hover:text-navy-deep"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> ADD NEW
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    /* Address insertion sub-form */
                    <form onSubmit={handleCreateAddress} className="space-y-3 bg-[#BDE8F5]/10 border border-[#BDE8F5]/35 p-4 rounded-lg">
                      <h5 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase">
                        ADD SHIPPING ADDRESS
                      </h5>

                      <input
                        type="text"
                        placeholder="Recipient Full Name"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number (e.g. +91 98765 43210)"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs"
                          required
                        />
                        <select
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                          className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={addrLoading}
                          className="flex-1 bg-royal-blue text-white font-sans text-[10px] font-bold uppercase py-2 rounded shadow-sm hover:bg-navy-deep disabled:opacity-40"
                        >
                          {addrLoading ? 'SAVING...' : 'SAVE ADDRESS'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 border border-gray-300 text-muted-gray font-sans text-[10px] font-bold uppercase rounded hover:bg-gray-50"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-muted-gray font-sans mb-3">No shipping addresses saved yet.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="px-4 py-2 bg-navy-deep text-white font-sans text-[10px] font-bold uppercase tracking-wider rounded"
                      >
                        ADD SHIPPING ADDRESS
                      </button>
                    </div>
                  ) : (
                    /* Address selections grid */
                    <div className="space-y-3">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`border rounded-lg p-3 cursor-pointer transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'border-royal-blue bg-[#BDE8F5]/10 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isSelected ? (
                                <div className="w-4 h-4 rounded-full bg-royal-blue flex items-center justify-center text-white">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 font-sans text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-navy-deep">{addr.fullName}</span>
                                <span className="bg-[#BDE8F5] text-royal-blue text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                  {addr.label || 'Home'}
                                </span>
                              </div>
                              <p className="text-muted-gray mt-1">{addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-navy-deep font-medium mt-1">Phone: {addr.phone}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Checkout Actions */}
            {cartItems.length > 0 && !successMsg && (
              <div className="p-5 border-t border-[#BDE8F5]/40 bg-gradient-to-b from-white to-[#BDE8F5]/10 space-y-4">
                {/* Summaries details */}
                <div className="space-y-1.5 text-xs font-sans">
                  <div className="flex justify-between text-muted-gray">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-royal-blue font-semibold">
                      <span>Discount Coupon</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-navy-deep font-bold text-sm pt-2 border-t border-gray-100">
                    <span>Estimated Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {step === 1 ? (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/auth');
                        onClose();
                      } else {
                        setStep(2);
                      }
                    }}
                    className="w-full bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-royal-blue transition-luxury"
                  >
                    PROCEED TO SHIPPING →
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || !selectedAddressId || showAddressForm}
                    className="w-full bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-royal-blue transition-luxury disabled:opacity-50"
                  >
                    {checkingOut ? 'CREATING RESERVATION...' : 'PLACE ORDER (SIMULATED) →'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
