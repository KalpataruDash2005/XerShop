'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { adminApi, Order, Payment } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  Loader2, Phone, MapPin, CheckCircle, XCircle, FileText, 
  Image as ImageIcon, RefreshCw, ShoppingBag, DollarSign, 
  CheckCircle2, Clock, Truck, Printer as PrinterIcon, ClipboardList, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

  // Stats
  const [stats, setStats] = useState({
    pendingPaymentsCount: 0,
    activeOrdersCount: 0,
    completedTodayCount: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Security guard
  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, mounted, router]);

  const fetchData = async () => {
    setLoadingOrders(true);
    setLoadingPayments(true);
    setFetchErrors([]);

    let allOrders: Order[] = [];
    let allPayments: Payment[] = [];
    const errors: string[] = [];

    try {
      const pingRes = await adminApi.ping();
      if (!pingRes.success || pingRes.data !== 'pong') {
        errors.push('Backend ping: unexpected response');
      }
    } catch (e: any) {
      const s = e?.response?.status || 'ERR';
      const d = e?.response?.data?.message || e?.message || '';
      errors.push('Backend ping: ' + s + (d ? ' - ' + d : ''));
    }

    try {
      const ordersResponse = await adminApi.getOrders(0, 200);
      if (ordersResponse.success && ordersResponse.data) {
        allOrders = ordersResponse.data.content;
      }
    } catch (e: any) {
      const respData = e?.response?.data;
      const detail = respData?.message ? ' - ' + respData.message : respData ? ' - ' + JSON.stringify(respData) : '';
      const msg = e?.response?.status ? 'Orders API: ' + e.response.status + detail : 'Orders API: Network error';
      console.error('Failed to fetch orders:', e);
      errors.push(msg);
    } finally {
      setLoadingOrders(false);
    }

    try {
      const paymentsResponse = await adminApi.getPendingPayments();
      if (paymentsResponse.success && paymentsResponse.data) {
        allPayments = paymentsResponse.data;
      }
    } catch (e: any) {
      const respData = e?.response?.data;
      const detail = respData?.message ? ' - ' + respData.message : respData ? ' - ' + JSON.stringify(respData) : '';
      const msg = e?.response?.status ? 'Payments API: ' + e.response.status + detail : 'Payments API: Network error';
      console.error('Failed to fetch payments:', e);
      errors.push(msg);
    } finally {
      setLoadingPayments(false);
    }

    setFetchErrors(errors);
    if (errors.length > 0) {
      toast.error('Failed to load some dashboard data');
    }

    setPendingPayments(allPayments);

    const active = allOrders.filter(
      (o) => o.status !== 'COMPLETED' && o.status !== 'REJECTED' && o.status !== 'CANCELLED'
    );
    setOrders(active);

    const completedOrders = allOrders.filter((o) => o.status === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const completedToday = completedOrders.filter(
      (o) => format(new Date(o.completedAt || o.createdAt), 'yyyy-MM-dd') === todayStr
    ).length;

    setStats({
      pendingPaymentsCount: allPayments.length,
      activeOrdersCount: active.length,
      completedTodayCount: completedToday,
      totalRevenue: totalRevenue,
    });
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const handleApprovePayment = async (paymentId: number) => {
    try {
      const res = await adminApi.approvePayment(paymentId);
      if (res.success) {
        toast.success('Payment approved! Order accepted.');
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async (paymentId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      const res = await adminApi.rejectPayment(paymentId, reason || 'Invalid transaction reference');
      if (res.success) {
        toast.success('Payment rejected');
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject payment');
    }
  };

  const advanceToCompleted = async (orderId: number, currentStatus: string) => {
    const chain: Record<string, string> = {
      'PLACED': 'ACCEPTED',
      'ACCEPTED': 'PRINTING',
      'PRINTING': 'READY',
      'READY': 'OUT_FOR_DELIVERY',
      'OUT_FOR_DELIVERY': 'COMPLETED',
    };
    const steps = [];
    let s = currentStatus;
    while (s && s !== 'COMPLETED' && chain[s]) {
      steps.push(chain[s]);
      s = chain[s];
    }
    setUpdatingOrderId(orderId);
    try {
      for (const step of steps) {
        const res = await adminApi.updateOrderStatus(orderId, {
          status: step,
          notes: `Advanced to ${step}`
        });
        if (!res.success) {
          toast.error(`Failed to advance to ${step}`);
          return;
        }
      }
      toast.success('Order marked as Delivered!');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'COMPLETED' } : o))
      );
    } catch (e: any) {
      toast.error(e.message || 'Failed to advance order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStatusStepChange = async (orderId: number, currentStatus: string) => {
    const statuses = ['PLACED', 'ACCEPTED', 'PRINTING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED'];
    let nextIndex = statuses.indexOf(currentStatus) + 1;
    if (nextIndex >= statuses.length) return;
    const nextStatus = statuses[nextIndex];

    try {
      setUpdatingOrderId(orderId);
      const res = await adminApi.updateOrderStatus(orderId, {
        status: nextStatus,
        notes: `Advanced to ${nextStatus}`
      });
      if (res.success) {
        toast.success(`Status updated to ${nextStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Status mapping to display label and color classes
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PLACED': return { label: 'Placed', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ACCEPTED': return { label: 'Accepted', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'PRINTING': return { label: 'Printing', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'READY': return { label: 'Ready', bg: 'bg-pink-50 text-pink-700 border-pink-200' };
      case 'OUT_FOR_DELIVERY': return { label: 'Shipping', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'COMPLETED': return { label: 'Delivered', bg: 'bg-green-50 text-green-700 border-green-200' };
      default: return { label: status, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  if (!mounted || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      <Header />

      <main className="container-app py-8">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-4xl font-black text-slate-900 tracking-tight">
              PrintHub Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time monitoring of printing queues, payments, and shipments.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm" 
            onClick={fetchData}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Queue
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payments</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.pendingPaymentsCount}</h3>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Queue</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.activeOrdersCount}</h3>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-green-50 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered Today</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.completedTodayCount}</h3>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {fetchErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 mb-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-base">Dashboard load errors</h3>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {fetchErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-xl transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
                <Link
                  href="http://localhost:8080/h2-console"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition"
                >
                  Check Database
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Pending Verification Payments Section */}
        {pendingPayments.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="font-heading font-black text-2xl text-slate-900">
                Incoming UPI Verifications
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-3xl border border-amber-200/60 bg-amber-50/5 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase bg-amber-100 px-2.5 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                        <h3 className="font-heading font-bold text-lg text-slate-800 mt-2">
                          Order Reference: #{payment.orderId}
                        </h3>
                      </div>
                      <p className="font-heading font-black text-xl text-slate-800">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>

                    <div className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer</p>
                          <p className="font-bold text-slate-800">{payment.userName || 'N/A'}</p>
                        </div>
                        {payment.contactPhone && (
                          <a
                            href={`tel:${payment.contactPhone}`}
                            className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {payment.contactPhone}
                          </a>
                        )}
                      </div>
                      <p><span className="font-semibold text-slate-700">Method:</span> UPI QR</p>
                      <p><span className="font-semibold text-slate-700">UTR:</span> <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-xs text-slate-800 font-mono">{payment.utr}</code></p>
                      {payment.screenshotPath && (
                        <button
                          onClick={() => setSelectedScreenshot(payment.screenshotPath!)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark mt-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          View Screenshot
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-2xl shadow-sm"
                      onClick={() => handleApprovePayment(payment.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Payment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-2xl"
                      onClick={() => handleRejectPayment(payment.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Orders Section */}
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 mb-4">
            Active Print Queue
          </h2>

          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700">No active orders</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                New orders from customers will appear here once placed. The database resets on every server restart — place a test order from a customer account first.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusDetails = getStatusDetails(order.status);
                const steps = ['PLACED', 'ACCEPTED', 'PRINTING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED'];
                const currentStepIndex = steps.indexOf(order.status);

                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition duration-200">
                    {/* Header bar of order card */}
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-black text-lg text-slate-800">
                          #{order.orderNumber}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusDetails.bg}`}>
                          {statusDetails.label}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        Ordered {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6 justify-between">
                        {/* Customer & Address Details */}
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient Name</p>
                              <p className="font-bold text-slate-800 mt-0.5 text-base">{order.userName || 'Anonymous'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Connection</p>
                              <a href={`tel:${order.userPhone}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline mt-0.5">
                                <Phone className="w-3.5 h-3.5" />
                                {order.userPhone || 'No phone'}
                              </a>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Place</p>
                              <p className="font-medium text-slate-700 mt-1 flex items-start gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                {order.deliveryType === 'PICKUP' ? (
                                  <span className="text-slate-500 italic">Self Pickup from print shop</span>
                                ) : order.deliveryAddress ? (
                                  `${order.deliveryAddress.line1}, ${order.deliveryAddress.line2 ? order.deliveryAddress.line2 + ', ' : ''}${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`
                                ) : (
                                  <span className="text-red-500">No Address Specified</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Documents specs */}
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documents specs</p>
                            <div className="space-y-2">
                              {order.items && order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                                  <span className="flex items-center gap-2 font-semibold truncate max-w-xs md:max-w-md">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    {item.fileName}
                                  </span>
                                  <span className="text-slate-500">
                                    {item.pageCount} pages × {item.copies} copies ({item.colorMode}, {item.sides})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Status Timeline & Controls */}
                        <div className="lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between items-stretch lg:items-end gap-6 min-w-[280px]">
                          <div className="text-left lg:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Charged</p>
                            <p className="font-heading font-black text-2xl text-slate-900 mt-0.5">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>

                          {/* Visual Step Tracker */}
                          <div className="w-full">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Delivery Status Tracker</p>
                            <div className="flex justify-between items-center relative">
                              <div className="absolute left-0 right-0 h-0.5 bg-slate-100 top-2 -z-10"></div>
                              <div 
                                className="absolute left-0 h-0.5 bg-green-500 top-2 -z-10 transition-all duration-300"
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                              ></div>
                              {steps.map((st, idx) => {
                                const active = idx <= currentStepIndex;
                                return (
                                  <div key={st} className="flex flex-col items-center">
                                    <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                                      st === order.status ? 'bg-primary border-primary text-white scale-125' :
                                      active ? 'bg-green-500 border-green-500 text-white' :
                                      'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                              <span>Placed</span>
                              <span>Ready</span>
                              <span>Done</span>
                            </div>
                          </div>

                          {/* Delivery Controls */}
                          <div className="space-y-3 w-full">
                            {order.status === 'COMPLETED' ? (
                              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
                                <p className="text-xs font-bold text-green-700">Delivered</p>
                              </div>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleStatusStepChange(order.id, order.status)}
                                  disabled={updatingOrderId === order.id}
                                  className="w-full text-xs font-bold py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  {updatingOrderId === order.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Truck className="w-4 h-4" />
                                      Advance Delivery Step
                                    </>
                                  )}
                                </Button>

                                <Button
                                  onClick={() => advanceToCompleted(order.id, order.status)}
                                  disabled={updatingOrderId === order.id}
                                  variant="outline"
                                  className="w-full text-xs font-bold py-2.5 border-green-300 text-green-700 hover:bg-green-50 rounded-2xl flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Delivered
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal for Payment Screenshot Preview (Optional fallback support) */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden relative p-6">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition font-bold"
            >
              Close
            </button>
            <h3 className="font-heading font-bold text-lg text-secondary mb-4">
              Screenshot Preview
            </h3>
            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
              <img
                src={selectedScreenshot}
                alt="Payment proof"
                className="max-w-full max-h-[60vh] object-contain"
                onError={(e) => {
                  (e.target as any).src = 'https://placehold.co/600x400?text=Screenshot+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
