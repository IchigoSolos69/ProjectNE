import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Search, Eye, X, ClipboardList, MapPin } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  size: string | null;
  color: string | null;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  userId: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  shippingAddress?: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    label: string | null;
  };
  statusHistory?: {
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }[];
  items?: OrderItem[];
}

export const AdminOrders: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Transition status fields
  const [nextStatus, setNextStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [note, setNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Guard routing
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth?redirect=/admin/orders');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/orders?status=${filterStatus}&search=${search}`;
      const data = await apiRequest<Order[]>(url);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadOrders();
    }
  }, [user, isAdmin, filterStatus, search]);

  const handleOpenDetail = async (orderId: string) => {
    setNextStatus('');
    setTrackingNumber('');
    setCarrier('');
    setNote('');
    try {
      const data = await apiRequest<Order>(`/api/admin/orders/${orderId}`);
      setSelectedOrder(data);
      setNextStatus(data.status);
      setTrackingNumber(data.trackingNumber || '');
      setCarrier(data.carrier || '');
    } catch (err) {
      alert('Failed to retrieve order details.');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      const payload: any = {
        status: nextStatus,
        note: note || `Status transitioned to ${nextStatus}.`,
      };

      if (nextStatus === 'SHIPPED') {
        if (!trackingNumber || !carrier) {
          alert('Please enter tracking number and carrier details.');
          setUpdatingStatus(false);
          return;
        }
        payload.trackingNumber = trackingNumber;
        payload.carrier = carrier;
      }

      await apiRequest(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      // Reload order detail
      await handleOpenDetail(selectedOrder.id);
      // Reload lists
      loadOrders();
      setNote('');
      alert('Order status updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PACKED':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="font-serif text-3xl font-bold text-navy-deep">Order Management Logs</h1>
          <p className="text-xs text-muted-gray mt-1 uppercase tracking-wide">
            Track payments verification, packet dispatches, and timeline histories
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-[#BDE8F5]/20 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-gray absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by ID, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 focus:border-royal-blue focus:bg-white rounded-full py-2.5 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none"
          />
        </div>
        {/* Status selection */}
        <div className="w-full sm:w-60">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-white border border-[#BDE8F5]/40 rounded-full px-4 py-2.5 text-xs text-navy-deep font-semibold focus:outline-none focus:border-royal-blue cursor-pointer"
          >
            <option value="">All Order Statuses</option>
            <option value="PENDING">PENDING (Awaiting Payment)</option>
            <option value="CONFIRMED">CONFIRMED (Paid)</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="py-20 text-center">
          <p className="font-sans text-xs font-bold tracking-widest text-muted-gray uppercase animate-pulse">
            LOADING ORDER REGISTERS...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-dashed border-[#BDE8F5]/40 rounded-xl p-16 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-[#BDE8F5] mx-auto" />
          <h3 className="font-serif text-lg font-semibold text-navy-deep">No orders recorded</h3>
          <p className="text-xs text-muted-gray max-w-xs mx-auto">
            No matching order entries satisfy current search queries.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#BDE8F5]/20 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5FAFD]/60 text-navy-deep text-[11px] font-bold tracking-wider uppercase border-b border-[#BDE8F5]/20">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Placement Date</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-mono font-semibold text-navy-deep text-[11px]">
                    #{ord.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-navy-deep">{ord.user.name}</div>
                    <div className="text-[10px] text-muted-gray">{ord.user.email}</div>
                  </td>
                  <td className="p-4 text-muted-gray font-medium">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="p-4 font-sans font-bold text-navy-deep">
                    ₹{Number(ord.total).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleOpenDetail(ord.id)}
                      className="p-2 border border-[#BDE8F5] hover:bg-royal-blue hover:text-white rounded-full text-navy-deep transition-all"
                      title="Inspect Order"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL PANEL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-navy-deep/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            
            {/* Header */}
            <div className="p-5 border-b border-[#BDE8F5]/30 flex justify-between items-center bg-[#F5FAFD]/45">
              <div>
                <h2 className="font-serif text-lg font-bold text-navy-deep">
                  Order Details — #{selectedOrder.id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-[10px] text-muted-gray uppercase tracking-wider font-sans mt-0.5">
                  Placed {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 hover:bg-[#BDE8F5]/30 rounded-full text-navy-deep transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Client & Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#BDE8F5]/5 border border-[#BDE8F5]/30 rounded-xl p-4">
                <div className="space-y-1 font-sans text-xs">
                  <h4 className="font-bold text-navy-deep tracking-wider uppercase text-[10px]">Client Contact</h4>
                  <p className="font-medium text-navy-deep">{selectedOrder.user.name}</p>
                  <p className="text-muted-gray">{selectedOrder.user.email}</p>
                </div>

                {selectedOrder.shippingAddress && (
                  <div className="space-y-1 font-sans text-xs">
                    <h4 className="font-bold text-navy-deep tracking-wider uppercase text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-royal-blue" /> Shipping Destination
                    </h4>
                    <p className="font-semibold text-navy-deep">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-muted-gray">
                      {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.line2 ? `${selectedOrder.shippingAddress.line2}, ` : ''}
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                    <p className="text-navy-deep font-medium">Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                )}
              </div>

              {/* Items Summary Table */}
              <div className="space-y-3">
                <h4 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase">Purchased Items</h4>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-gray-50 border border-gray-200 rounded overflow-hidden">
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-navy-deep">{item.product.name}</div>
                            <div className="text-[10px] text-muted-gray">
                              {item.size ? `Size: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-sans">
                          <div className="font-bold text-navy-deep">₹{Number(item.priceAtPurchase).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-muted-gray">Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order total ledger */}
              <div className="border-t border-gray-100 pt-4 flex flex-col items-end text-xs font-sans space-y-1">
                <div className="flex justify-between w-64 text-muted-gray">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(selectedOrder.discountAmount) > 0 && (
                  <div className="flex justify-between w-64 text-[#3AA757] font-semibold">
                    <span>Discount Code</span>
                    <span>-₹{Number(selectedOrder.discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 text-navy-deep font-bold text-sm pt-2 border-t border-gray-100">
                  <span>Total Amount Paid</span>
                  <span>₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Update Control Form */}
              <form onSubmit={handleUpdateStatus} className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase">
                  Advance Order Lifecycle
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-gray uppercase block">Transition To</label>
                    <select
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                      className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/40 rounded px-3 py-2 text-xs text-navy-deep font-semibold"
                    >
                      <option value="PENDING">PENDING (Awaiting Verification)</option>
                      <option value="CONFIRMED">CONFIRMED (Payment Verified)</option>
                      <option value="PACKED">PACKED (In Warehouse)</option>
                      <option value="SHIPPED">SHIPPED (En Route)</option>
                      <option value="DELIVERED">DELIVERED (White-glove Completed)</option>
                      <option value="CANCELLED">CANCELLED (Exit)</option>
                      <option value="REFUNDED">REFUNDED (Exit)</option>
                    </select>
                  </div>

                  {nextStatus === 'SHIPPED' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-gray uppercase block">Courier Carrier *</label>
                        <input
                          type="text"
                          placeholder="e.g. BlueDart / Delhivery"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-gray uppercase block">Tracking Number *</label>
                        <input
                          type="text"
                          placeholder="e.g. 789162453"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-gray uppercase block">Note / Reason (Optional)</label>
                  <input
                    type="text"
                    placeholder="Provide a text note (e.g. Payment verified via bank transfer)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="bg-navy-deep text-white font-sans text-[10px] font-bold uppercase tracking-wider py-2.5 px-6 rounded hover:bg-royal-blue disabled:opacity-40"
                >
                  {updatingStatus ? 'TRANSITIONING...' : 'CONFIRM TRANSITION'}
                </button>
              </form>

              {/* Status events logging timeline */}
              {selectedOrder.statusHistory && (
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h4 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase">
                    Order Status Event Timeline
                  </h4>

                  <div className="relative pl-6 border-l border-gray-200 ml-3 space-y-5">
                    {selectedOrder.statusHistory.map((hist) => (
                      <div key={hist.id} className="relative font-sans text-xs">
                        {/* Timeline dot */}
                        <div className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-royal-blue border-2 border-white" />
                        
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-deep uppercase text-[10px]">{hist.status}</span>
                          <span className="text-[9px] text-muted-gray">
                            {new Date(hist.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {hist.note && <p className="text-muted-gray mt-1 leading-normal">{hist.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;
