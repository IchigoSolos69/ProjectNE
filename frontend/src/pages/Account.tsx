import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../components/ProductCard';
import { User as UserIcon, Calendar, Package, LogOut, Plus, Trash2, Eye, Truck, Heart } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  size: string | null;
  color: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  statusHistory?: {
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }[];
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

export const Account: React.FC = () => {
  const { user, logout, loading: authLoading, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses'>('orders');
  
  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Wishlist
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Address form fields
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrLoading, setAddrLoading] = useState(false);

  // Redirect if logged out
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/account');
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await apiRequest<Order[]>('/api/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    setLoadingWishlist(true);
    try {
      const data = await apiRequest<Product[]>('/api/wishlist');
      setWishlistItems(data);
    } catch (err) {
      console.error('Failed to load wishlist items', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const data = await apiRequest<Address[]>('/api/addresses');
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'wishlist') fetchWishlist();
      if (activeTab === 'addresses') fetchAddresses();
    }
  }, [user, activeTab]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      alert('Required address fields are blank.');
      return;
    }
    setAddrLoading(true);
    try {
      await apiRequest('/api/addresses', {
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
      fetchAddresses();
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

  const handleDeleteAddress = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this address?');
    if (!confirm) return;
    try {
      await apiRequest(`/api/addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete address.');
    }
  };

  const handleWishlistMoveToCart = async (prod: Product) => {
    const variant = prod.variants?.find((v) => v.stock > 0) || prod.variants?.[0];
    if (!variant) {
      alert('This product has no active variants currently.');
      return;
    }
    try {
      // Add first variant to cart
      await addToCart(variant.id, 1);
      // Remove from wishlist
      await toggleWishlist(prod.id);
      // Refresh local list
      fetchWishlist();
      alert(`Moved "${prod.name}" to cart.`);
    } catch (err: any) {
      alert(err.message || 'Failed to move to cart.');
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      fetchWishlist();
    } catch (err: any) {
      alert(err.message || 'Failed to remove item.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PACKED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 mt-[80px] space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <main className="flex-1 mt-[80px] bg-white min-h-screen py-12 px-6 max-w-4xl mx-auto space-y-10">
      
      {/* Profile Header Ribbon */}
      <div className="border-b border-[#BDE8F5]/30 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gradient-to-r from-white to-[#BDE8F5]/10 p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#BDE8F5]/40 rounded-full flex items-center justify-center text-navy-deep">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-navy-deep font-bold leading-none">{user.name}</h1>
            <p className="text-xs text-muted-gray mt-1.5 uppercase font-semibold tracking-wide font-sans">
              {user.email} &bull; {user.role} profile
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors bg-white shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" /> LOG OUT
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200 font-sans text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'orders' ? 'border-royal-blue text-royal-blue' : 'border-transparent text-muted-gray hover:text-navy-deep'
          }`}
        >
          Sleep Registry
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'wishlist' ? 'border-royal-blue text-royal-blue' : 'border-transparent text-muted-gray hover:text-navy-deep'
          }`}
        >
          Saved Sanctuary
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'addresses' ? 'border-royal-blue text-royal-blue' : 'border-transparent text-muted-gray hover:text-navy-deep'
          }`}
        >
          Address Registry
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="pt-2">
        
        {/* TAB 1: ORDER LOGS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[#BDE8F5]/30 rounded-xl space-y-4 bg-gray-50/30">
                <Package className="w-10 h-10 text-[#BDE8F5] mx-auto" />
                <h3 className="font-serif text-lg font-semibold text-navy-deep">No Rest History</h3>
                <p className="text-xs text-muted-gray max-w-xs mx-auto">
                  Your bedroom collection is waiting. Explore sheets to build your sanctuary.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-5 py-2 bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold rounded-full"
                >
                  EXPLORE SHOWROOM
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      className="border border-gray-150 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      {/* Ribbon summary */}
                      <div className="bg-[#F5FAFD]/65 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-[#BDE8F5]/25 text-xs text-navy-deep font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-royal-blue" />
                          <span>Placed: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div>
                          <span>Ref: #{order.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="p-1 hover:bg-[#BDE8F5]/30 rounded text-royal-blue flex items-center gap-1 font-bold text-[10px]"
                          >
                            <Eye className="w-3.5 h-3.5" /> {isExpanded ? 'HIDE' : 'TRACK'}
                          </button>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="p-6 divide-y divide-gray-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                            <div className="w-12 h-14 bg-gray-50 rounded overflow-hidden flex-shrink-0 border">
                              <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <h4 className="font-serif text-xs font-semibold text-navy-deep">{item.product.name}</h4>
                                <p className="text-[10px] text-muted-gray mt-0.5">
                                  {item.size ? `Size: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''} &bull; Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="text-xs font-bold text-navy-deep font-sans">
                                ₹{Number(item.priceAtPurchase).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expanded timelines / details tracker */}
                      {isExpanded && (
                        <div className="bg-[#BDE8F5]/10 border-t border-gray-100 p-6 space-y-4">
                          {order.trackingNumber && (
                            <div className="bg-white border border-gray-100 rounded-lg p-4 font-sans text-xs flex items-center gap-3">
                              <Truck className="w-5 h-5 text-royal-blue flex-shrink-0" />
                              <div>
                                <p className="font-bold text-navy-deep">Package Dispatched</p>
                                <p className="text-muted-gray">Carrier: <strong>{order.carrier}</strong> | Tracking Number: <strong>{order.trackingNumber}</strong></p>
                              </div>
                            </div>
                          )}

                          {order.statusHistory && (
                            <div className="space-y-3 font-sans text-xs">
                              <h5 className="font-bold text-navy-deep uppercase text-[10px] tracking-wider">Rest Log Status Timeline</h5>
                              <div className="relative pl-5 border-l border-gray-200 ml-2 space-y-4">
                                {order.statusHistory.map((hist) => (
                                  <div key={hist.id} className="relative">
                                    <div className="absolute -left-[27px] top-1 w-2 h-2 rounded-full bg-royal-blue border border-white" />
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-navy-deep uppercase text-[9px]">{hist.status}</span>
                                      <span className="text-[9px] text-muted-gray">{new Date(hist.createdAt).toLocaleString('en-IN')}</span>
                                    </div>
                                    {hist.note && <p className="text-muted-gray mt-0.5 text-[11px] leading-relaxed">{hist.note}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Total */}
                      <div className="bg-[#F5FAFD]/20 border-t border-gray-100 px-6 py-4 flex justify-between items-center text-xs">
                        <span className="text-muted-gray uppercase tracking-wider font-semibold">Total Price Paid</span>
                        <span className="font-sans text-sm font-bold text-navy-deep">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST SAVED ITEMS */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            {loadingWishlist ? (
              <div className="grid grid-cols-2 gap-6 animate-pulse">
                <div className="h-48 bg-gray-50 rounded-lg" />
                <div className="h-48 bg-gray-50 rounded-lg" />
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[#BDE8F5]/30 rounded-xl space-y-4 bg-gray-50/30">
                <Heart className="w-10 h-10 text-[#BDE8F5] mx-auto" />
                <h3 className="font-serif text-lg font-semibold text-navy-deep">Your Sanctuary is Empty</h3>
                <p className="text-xs text-muted-gray max-w-xs mx-auto">
                  Click the heart icon on product pages to save bedroom inspirations.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-5 py-2 bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold rounded-full"
                >
                  SHOP LINENS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlistItems.map((prod) => (
                  <div key={prod.id} className="border border-gray-150 rounded-xl p-4 bg-white flex flex-col justify-between hover:shadow-md transition-shadow relative">
                    <div className="flex gap-4">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-20 bg-gray-50 rounded overflow-hidden border flex-shrink-0">
                        <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Product details info */}
                      <div className="flex-1 font-sans text-xs">
                        <h4 className="font-serif text-sm font-semibold text-navy-deep">{prod.name}</h4>
                        <p className="text-[10px] text-muted-gray mt-0.5 uppercase tracking-wide font-bold">{prod.category?.name}</p>
                        <p className="font-bold text-navy-deep mt-1">₹{Number(prod.lowestPrice).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-4 mt-3 border-t border-gray-50">
                      <button
                        onClick={() => handleWishlistMoveToCart(prod)}
                        className="flex-1 bg-navy-deep text-white font-sans text-[10px] font-bold uppercase tracking-wider py-2 rounded shadow hover:bg-royal-blue"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveWishlist(prod.id)}
                        className="border border-red-200 text-red-500 font-sans text-[10px] font-bold uppercase tracking-wider py-2 px-3 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHIPPING REGISTRY ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="font-serif text-lg font-bold text-navy-deep">Your Shipping Book</h3>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 bg-navy-deep text-white font-sans text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-full"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD NEW
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleCreateAddress} className="space-y-3 bg-[#BDE8F5]/10 border border-[#BDE8F5]/35 p-5 rounded-lg max-w-lg">
                <h4 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block mb-2">
                  Create Shipping Address
                </h4>

                <input
                  type="text"
                  placeholder="Recipient Full Name"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. +91 98765 43210)"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none"
                    required
                  />
                  <select
                    value={addrLabel}
                    onChange={(e) => setAddrLabel(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none cursor-pointer"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addrLoading}
                    className="flex-1 bg-royal-blue text-white font-sans text-[10px] font-bold uppercase py-2.5 rounded hover:bg-navy-deep disabled:opacity-40 shadow-sm"
                  >
                    {addrLoading ? 'SAVING...' : 'SAVE ADDRESS'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-5 border border-gray-300 text-muted-gray font-sans text-[10px] font-bold uppercase rounded hover:bg-gray-50"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : loadingAddresses ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-gray-50 rounded" />
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-xs text-muted-gray font-sans">No saved shipping addresses yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`border rounded-xl p-4 bg-white shadow-sm flex items-start gap-3 relative ${
                      addr.isDefault ? 'border-royal-blue' : 'border-gray-150'
                    }`}
                  >
                    <div className="flex-1 font-sans text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-deep">{addr.fullName}</span>
                        <span className="bg-[#BDE8F5] text-royal-blue text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {addr.label || 'Home'}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-[#3AA757]/10 text-[#3AA757] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-muted-gray mt-1.5 leading-normal">
                        {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-navy-deep font-semibold mt-1">Phone: {addr.phone}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-muted-gray hover:text-red-500 p-1 rounded hover:bg-red-50 absolute top-3 right-3"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
};

export default Account;
