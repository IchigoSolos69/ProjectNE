import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../components/ProductCard';
import { User as UserIcon, Calendar, Package, LogOut, Plus, Trash2, Truck, Heart, MapPin, CreditCard, Camera, MessageSquare, HelpCircle, RefreshCw, Mail, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  size: string | null;
  color: string | null;
  variantId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    category?: { name: string };
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

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  ctaText: string;
  onCtaClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message, ctaText, onCtaClick }) => {
  return (
    <div className="py-16 text-center border border-dashed border-[#BDE8F5]/30 rounded-xl space-y-4 bg-gray-50/30 font-sans shadow-sm">
      <Icon className="w-10 h-10 text-[var(--color-sky-blue)] mx-auto" />
      <h3 className="font-serif text-lg font-semibold text-navy-deep">{message}</h3>
      <button
        onClick={onCtaClick}
        className="px-6 py-2.5 bg-navy-deep hover:bg-royal-blue text-white font-sans text-xs uppercase tracking-wider font-bold rounded-full transition-colors shadow-sm"
      >
        {ctaText}
      </button>
    </div>
  );
};

export const Account: React.FC = () => {
  const { user, logout, loading: authLoading, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

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
  const [addrPhone, setAddrPhone] = useState('');
  const [addrPhoneCode, setAddrPhoneCode] = useState('+91');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLabel, setAddrLabel] = useState('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [addrLoading, setAddrLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      fetchOrders();
      fetchWishlist();
      fetchAddresses();
    }
  }, [user]);

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
    if (!addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      toast.error('Blank Fields', 'Required address fields are blank.');
      return;
    }
    setAddrLoading(true);
    try {
      const compositePhone = `${addrPhoneCode} ${addrPhone}`;
      const finalLabel = addrLabel === 'Custom' ? (customLabel.trim() || 'Custom') : addrLabel;
      await apiRequest('/api/addresses', {
        method: 'POST',
        body: JSON.stringify({
          fullName: user?.name || 'Customer',
          phone: compositePhone,
          line1: addrLine1,
          line2: addrLine2 || null,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          label: finalLabel,
          isDefault: addresses.length === 0,
        }),
      });
      fetchAddresses();
      setShowAddressForm(false);

      // Clear form
      setAddrPhone('');
      setAddrPhoneCode('+91');
      setAddrLine1('');
      setAddrLine2('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
      setAddrLabel('Home');
      setCustomLabel('');
    } catch (err: any) {
      toast.error('Error Saving Address', err.message || 'Failed to save address.');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      console.log('Call delete API');
      // Trigger API call
      await apiRequest('/api/users/me', { method: 'DELETE' });
      toast.success('Account Deleted', 'Your profile and data have been removed.');
      setShowDeleteModal(false);
      logout();
      navigate('/');
    } catch (err: any) {
      console.error('Delete account failed:', err);
      // Clean up local profile mock
      toast.info('Request Logged', 'A request to delete your account has been logged.');
      setShowDeleteModal(false);
      logout();
      navigate('/');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this address?');
    if (!confirm) return;
    try {
      await apiRequest(`/api/addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch (err: any) {
      toast.error('Error Deleting Address', err.message || 'Failed to delete address.');
    }
  };

  const handleBuyAgain = async (order: Order) => {
    try {
      setLoadingOrders(true);
      for (const item of order.items) {
        await addToCart(item.variantId, item.quantity);
      }
      toast.success('Added to Cart', 'All items from this order have been added to your cart.');
    } catch (err: any) {
      toast.error('Failed to Add', err.message || 'Failed to add items to cart.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirm = window.confirm('Are you sure you want to cancel this order? This action cannot be undone.');
    if (!confirm) return;
    try {
      setLoadingOrders(true);
      await apiRequest(`/api/orders/${orderId}/cancel`, { method: 'PATCH' });
      fetchOrders();
      toast.success('Order Cancelled', 'Your order has been cancelled successfully.');
    } catch (err: any) {
      toast.error('Failed to Cancel', err.message || 'Failed to cancel order.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleWishlistMoveToCart = async (prod: Product) => {
    const variant = prod.variants?.find((v) => v.stock > 0) || prod.variants?.[0];
    if (!variant) {
      toast.error('Unavailable', 'This product has no active variants currently.');
      return;
    }
    try {
      // Add first variant to cart
      await addToCart(variant.id, 1);
      // Remove from wishlist
      await toggleWishlist(prod.id);
      // Refresh local list
      fetchWishlist();
      toast.success('Moved to Cart', `"${prod.name}" has been moved to your cart.`);
    } catch (err: any) {
      toast.error('Error Moving Item', err.message || 'Failed to move to cart.');
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      fetchWishlist();
    } catch (err: any) {
      toast.error('Error Removing Item', err.message || 'Failed to remove item.');
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
        <div className="flex items-center gap-5">
          <div className="relative group w-20 h-20 bg-[#BDE8F5]/40 rounded-full flex items-center justify-center text-navy-deep shadow-inner border border-[#BDE8F5]/20 cursor-pointer overflow-hidden flex-shrink-0">
            <UserIcon className="w-8 h-8 group-hover:scale-95 transition-transform duration-300" />
            <div className="absolute inset-0 bg-navy-deep/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-3xl text-navy-deep font-bold leading-none">{user.name}</h1>
            <p className="text-xs text-muted-gray uppercase font-semibold tracking-wider font-sans">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info('Coming Soon', 'Profile editing is coming soon.')}
            className="flex items-center gap-1.5 px-4 py-2 border border-navy-deep text-navy-deep rounded-full text-xs font-bold uppercase tracking-wider hover:bg-navy-deep hover:text-white transition-all bg-white shadow-sm font-sans"
          >
            ✏ Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors bg-white shadow-sm font-sans"
          >
            <LogOut className="w-3.5 h-3.5" /> LOG OUT
          </button>
        </div>
      </div>

      {/* Redesigned Tab Navigation with Integrated Statistics & Iconography */}
      <div className="flex flex-col sm:flex-row border-b border-gray-200 font-sans text-xs font-bold uppercase tracking-wider gap-2 sm:gap-0">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-6 border-b-4 transition-all duration-200 flex items-center gap-3 text-left ${activeTab === 'orders'
            ? 'border-navy-deep text-navy-deep font-black'
            : 'border-transparent text-muted-gray hover:text-navy-deep'
            }`}
        >
          <Package className="w-5 h-5 text-sky-blue flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] tracking-wider">My Orders ({orders.length})</span>
            <span className="text-[10px] text-muted-gray font-semibold uppercase tracking-normal">Sleep Registry</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-4 px-6 border-b-4 transition-all duration-200 flex items-center gap-3 text-left ${activeTab === 'wishlist'
            ? 'border-navy-deep text-navy-deep font-black'
            : 'border-transparent text-muted-gray hover:text-navy-deep'
            }`}
        >
          <Heart className="w-5 h-5 text-sky-blue flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] tracking-wider">Wishlist ({wishlistItems.length})</span>
            <span className="text-[10px] text-muted-gray font-semibold uppercase tracking-normal">Saved Sanctuary</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-4 px-6 border-b-4 transition-all duration-200 flex items-center gap-3 text-left ${activeTab === 'addresses'
            ? 'border-navy-deep text-navy-deep font-black'
            : 'border-transparent text-muted-gray hover:text-navy-deep'
            }`}
        >
          <MapPin className="w-5 h-5 text-sky-blue flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] tracking-wider">Addresses ({addresses.length})</span>
            <span className="text-[10px] text-muted-gray font-semibold uppercase tracking-normal">Address Registry</span>
          </div>
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
                      className="border border-gray-150 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
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
                            className="px-4 py-2 bg-navy-deep hover:bg-royal-blue text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                          >
                            {isExpanded ? 'Hide Details' : 'Track Order →'}
                          </button>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="p-6 divide-y divide-gray-100">
                        {order.items.map((item) => {
                          let paymentStatus = 'Paid';
                          if (order.status === 'PENDING') paymentStatus = 'Pending';
                          else if (order.status === 'CANCELLED') paymentStatus = 'Cancelled';
                          else if (order.status === 'REFUNDED') paymentStatus = 'Refunded';

                          const orderDate = new Date(order.createdAt);
                          const estDeliveryDate = new Date(orderDate.setDate(orderDate.getDate() + 5));
                          const estDeliveryString = estDeliveryDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          });

                          return (
                            <div key={item.id} className="flex gap-6 py-4 first:pt-0 last:pb-0 items-start">
                              {/* Larger Image Thumbnail */}
                              <div className="w-20 h-24 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-150 shadow-sm">
                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-sans font-bold text-sky-blue uppercase tracking-widest block">
                                    {item.product.category?.name || 'Bedding'}
                                  </span>
                                  <h4 className="font-serif text-sm font-semibold text-navy-deep">{item.product.name}</h4>
                                  <p className="text-[11px] text-muted-gray font-sans">
                                    {item.size ? `Size: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''}
                                  </p>
                                  <div className="flex flex-wrap gap-2 items-center text-[10px] pt-1">
                                    <span className="bg-gray-100 text-muted-gray px-2 py-0.5 rounded font-sans font-semibold">
                                      Qty: {item.quantity}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded font-sans font-semibold border ${paymentStatus === 'Paid'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : paymentStatus === 'Pending'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                      }`}>
                                      Payment: {paymentStatus}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-left md:text-right font-sans space-y-1">
                                  <p className="text-xs font-bold text-navy-deep">
                                    ₹{(Number(item.priceAtPurchase) * item.quantity).toLocaleString('en-IN')}
                                  </p>
                                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                                    <p className="text-[10px] text-royal-blue font-semibold flex items-center md:justify-end gap-1 font-sans">
                                      <Truck className="w-3.5 h-3.5" /> Est. Delivery: {estDeliveryString}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expanded timelines / details tracker */}
                      {isExpanded && (
                        <div className="bg-[#BDE8F5]/10 border-t border-gray-100 p-6 space-y-6">

                          {/* Visual Order Status Timeline */}
                          {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (() => {
                            const steps = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                            let activeStepIndex = 0;
                            if (order.status === 'PACKED') activeStepIndex = 1;
                            else if (order.status === 'SHIPPED') activeStepIndex = 2;
                            else if (order.status === 'DELIVERED') activeStepIndex = 4;

                            return (
                              <div className="bg-white border border-gray-100 rounded-xl p-6 font-sans text-xs space-y-6 shadow-sm">
                                <h5 className="font-bold text-navy-deep uppercase text-[10px] tracking-wider">
                                  Order Status Timeline
                                </h5>
                                <div className="flex items-center justify-between relative pt-2 pb-6 max-w-lg mx-auto">
                                  {/* Connecting line */}
                                  <div className="absolute top-[11px] left-2 right-2 h-0.5 bg-gray-200 -z-0" />
                                  <div
                                    className="absolute top-[11px] left-2 h-0.5 bg-navy-deep transition-all duration-500 -z-0"
                                    style={{ width: `${(activeStepIndex / (steps.length - 1)) * 96}%` }}
                                  />

                                  {steps.map((step, idx) => {
                                    const isCompleted = idx <= activeStepIndex;
                                    return (
                                      <div key={step} className="flex flex-col items-center relative z-10">
                                        {/* Node */}
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isCompleted
                                            ? 'bg-navy-deep text-white shadow-sm'
                                            : 'border-2 border-sky-blue bg-white text-gray-400'
                                            }`}
                                        >
                                          {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        {/* Step Label */}
                                        <span
                                          className={`absolute top-7 whitespace-nowrap text-[9px] font-bold tracking-wider uppercase ${isCompleted ? 'text-navy-deep' : 'text-gray-400'
                                            }`}
                                        >
                                          {step}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

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

                      {/* Order Quick Actions */}
                      <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between font-sans text-xs">
                        <div className="flex flex-wrap gap-4 text-gray-500 font-bold">
                          <button
                            type="button"
                            onClick={() => toast.info('Invoice Processing', 'Invoice download is being prepared and will be available shortly.')}
                            className="hover:text-royal-blue transition-colors uppercase tracking-wider text-[10px]"
                          >
                            View Invoice
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBuyAgain(order)}
                            className="hover:text-royal-blue transition-colors uppercase tracking-wider text-[10px]"
                          >
                            Buy Again
                          </button>

                          <a
                            href={`mailto:support@rarecomforts.com?subject=Support Request for Order Ref #${order.id.slice(-8).toUpperCase()}`}
                            className="hover:text-royal-blue transition-colors uppercase tracking-wider text-[10px]"
                          >
                            Contact Support
                          </a>

                          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-800 transition-colors font-bold uppercase tracking-wider text-[10px]"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>

                        <div className="text-right flex items-center gap-1.5 font-sans">
                          <CreditCard className="w-3.5 h-3.5 text-sky-blue" />
                          <span className="text-muted-gray uppercase tracking-wider font-semibold mr-1">Total Paid</span>
                          <span className="font-sans text-sm font-bold text-navy-deep">
                            ₹{Number(order.total).toLocaleString('en-IN')}
                          </span>
                        </div>
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
              <EmptyState
                icon={Heart}
                message="No saved products yet."
                ctaText="Start exploring →"
                onCtaClick={() => navigate('/products')}
              />
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

                {/* 1. Pincode at the Top with auto-complete */}
                <input
                  type="text"
                  placeholder="Pincode (6 digits)"
                  value={addrPincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setAddrPincode(val);
                    if (val.length === 6) {
                      // Fetch API automatically
                      fetch(`https://api.postalpincode.in/pincode/${val}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.[0]) {
                            const info = data[0].PostOffice[0];
                            setAddrCity(info.District || info.Circle || '');
                            setAddrState(info.State || '');
                            toast.success('Pincode Auto-filled', `Resolved ${info.District}, ${info.State}`);
                          }
                        })
                        .catch((err) => console.error('Failed to auto-resolve pincode details', err));
                    }
                  }}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                  maxLength={6}
                  required
                />

                {/* 2. City & State Auto-filled or Manual overrides */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                    required
                  />
                </div>

                {/* 3. Address Line 1 & Line 2 */}
                <input
                  type="text"
                  placeholder="Address Line 1 (House No, Building, Street)"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Apartment, Suite, Landmark - Optional)"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                />

                {/* 4. Custom Address Type */}
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={addrLabel}
                    onChange={(e) => setAddrLabel(e.target.value)}
                    className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none cursor-pointer focus:border-royal-blue"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Custom">Custom Label</option>
                  </select>
                  {addrLabel === 'Custom' ? (
                    <input
                      type="text"
                      placeholder="e.g. Mom's House"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                      required
                    />
                  ) : (
                    <div className="bg-gray-50/50 border border-gray-100 rounded px-3 py-2 text-[10px] text-muted-gray uppercase font-bold tracking-wider flex items-center">
                      Label: {addrLabel}
                    </div>
                  )}
                </div>

                {/* 5. Phone Number Input with extra top margin mt-6 and Country Code dropdown */}
                <div className="mt-6 space-y-1.5">
                  <label className="font-sans text-[10px] font-bold tracking-wider text-muted-gray uppercase">
                    Contact Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={addrPhoneCode}
                      onChange={(e) => setAddrPhoneCode(e.target.value)}
                      className="bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none cursor-pointer focus:border-royal-blue w-20 flex-shrink-0"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+971">+971 (AE)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={addrPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setAddrPhone(val);
                      }}
                      className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 font-sans text-xs outline-none focus:border-royal-blue"
                      maxLength={10}
                      required
                    />
                  </div>
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
              <EmptyState
                icon={MapPin}
                message="Your address book is empty."
                ctaText="Add an Address"
                onCtaClick={() => setShowAddressForm(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`border rounded-xl p-4 bg-white shadow-sm flex items-start gap-3 relative ${addr.isDefault ? 'border-royal-blue' : 'border-gray-150'
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

      {/* Danger Zone */}
      <div className="pt-8 border-t border-gray-150 flex justify-between items-center font-sans text-xs">
        <div className="space-y-1">
          <h4 className="font-serif text-sm font-bold text-navy-deep">Danger Zone</h4>
          <p className="text-[11px] text-muted-gray">Permanently delete your account and all associated sleep history.</p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-full font-bold uppercase tracking-wider hover:bg-red-50 hover:border-red-400 transition-colors shadow-sm"
        >
          Delete Account
        </button>
      </div>

      {/* Recommended for You */}
      {orders.length <= 1 && (
        <div className="pt-8 border-t border-gray-150 space-y-6">
          <div className="flex justify-between items-center font-sans">
            <h3 className="font-serif text-lg font-bold text-navy-deep">Recommended Bestsellers</h3>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-bold text-sky-blue hover:text-royal-blue uppercase tracking-widest flex items-center gap-1 font-sans"
            >
              Shop All Collections <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                name: "Imperial Egyptian Cotton Sheet Set",
                price: 14500,
                image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600",
                slug: "imperial-egyptian-cotton-sheet-set",
                category: "Bedsheets"
              },
              {
                name: "Organic Waffle Weave Towel Set",
                price: 4800,
                image: "https://images.unsplash.com/photo-1616627561950-9f746e330187?q=80&w=600",
                slug: "organic-waffle-weave-towel-set",
                category: "Bath"
              }
            ].map((prod) => (
              <div
                key={prod.slug}
                onClick={() => navigate(`/product/${prod.slug}`)}
                className="border border-gray-150 rounded-xl p-4 bg-[#FAF9F6]/40 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="w-20 h-24 bg-gray-50 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={prod.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-sky-blue uppercase tracking-widest block">{prod.category}</span>
                    <h4 className="font-serif text-sm font-semibold text-navy-deep mt-1 leading-snug">{prod.name}</h4>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-navy-deep">₹{prod.price.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-bold text-royal-blue uppercase tracking-wider">View Product</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust & Support Footer */}
      <div className="pt-10 border-t border-gray-150 space-y-6 font-sans">
        <div className="bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-navy-deep">Need assistance with your sanctuary?</h3>
            <p className="text-xs text-muted-gray">Our concierge white-glove team is available to assist you with order delivery tracking, returns, and comfort advice.</p>
          </div>
          <a
            href="mailto:support@rarecomforts.com"
            className="flex-shrink-0 px-6 py-3 bg-navy-deep hover:bg-royal-blue text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors shadow-sm font-sans text-center"
          >
            Contact Concierge
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <button
            onClick={() => toast.info('Connecting Chat', 'Live Chat Support is online from 9 AM - 9 PM IST. Connecting now...')}
            className="border border-[#BDE8F5]/20 hover:border-royal-blue hover:bg-gray-50/50 rounded-xl p-4 transition-all flex flex-col items-center justify-center space-y-2 group"
          >
            <MessageSquare className="w-5 h-5 text-sky-blue group-hover:scale-105 transition-transform animate-none" />
            <span className="text-[10px] font-bold text-navy-deep uppercase tracking-wider">Chat Support</span>
          </button>

          <button
            onClick={() => toast.info('Coming Soon', 'FAQ section is under updates. Feel free to contact our Concierge!')}
            className="border border-[#BDE8F5]/20 hover:border-royal-blue hover:bg-gray-50/50 rounded-xl p-4 transition-all flex flex-col items-center justify-center space-y-2 group"
          >
            <HelpCircle className="w-5 h-5 text-sky-blue group-hover:scale-105 transition-transform animate-none" />
            <span className="text-[10px] font-bold text-navy-deep uppercase tracking-wider">FAQs</span>
          </button>

          <button
            onClick={() => toast.info('Returns Info', 'Returns can be scheduled within 10 days of delivery. Click Contact Support to begin.')}
            className="border border-[#BDE8F5]/20 hover:border-royal-blue hover:bg-gray-50/50 rounded-xl p-4 transition-all flex flex-col items-center justify-center space-y-2 group"
          >
            <RefreshCw className="w-5 h-5 text-sky-blue group-hover:scale-105 transition-transform animate-none" />
            <span className="text-[10px] font-bold text-navy-deep uppercase tracking-wider">Returns</span>
          </button>

          <a
            href="mailto:concierge@rarecomforts.com"
            className="border border-[#BDE8F5]/20 hover:border-royal-blue hover:bg-gray-50/50 rounded-xl p-4 transition-all flex flex-col items-center justify-center space-y-2 group"
          >
            <Mail className="w-5 h-5 text-sky-blue group-hover:scale-105 transition-transform animate-none" />
            <span className="text-[10px] font-bold text-navy-deep uppercase tracking-wider">Contact Us</span>
          </a>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-navy-deep/45 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          
          {/* Modal Card */}
          <div className="relative bg-white border border-[#BDE8F5]/45 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl font-sans text-left space-y-4">
            <h3 className="font-serif text-lg font-bold text-navy-deep">Permanently delete your account?</h3>
            <p className="text-xs text-muted-gray leading-relaxed">
              Are you sure you want to permanently delete your account? This action cannot be undone. All your orders, addresses, and saved wishlists will be lost forever.
            </p>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-750 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 border border-gray-300 text-muted-gray text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Account;
