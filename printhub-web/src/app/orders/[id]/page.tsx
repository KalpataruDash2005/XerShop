'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { orderApi, Order, OrderItem } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { 
  FileText, Calendar, Store, MapPin, ShoppingBag, 
  ArrowLeft, Clock, CreditCard, ChevronRight, CheckCircle2,
  Printer, Truck, User, Phone, Check, RefreshCw, X, PhoneCall, ShieldCheck, Trash2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrderDetails();
  }, [isAuthenticated, params.id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.getById(params.id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (e) {
      console.error('Failed to fetch order details:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await orderApi.deleteOrder(order!.id);
      if (res.success) {
        toast.success('Order deleted');
        router.push('/orders');
      }
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  const formatOrderTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '';
    }
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container-app py-12 flex flex-col items-center justify-center min-h-[50vh]">
          <LoaderSpinner />
          <p className="text-slate-500 mt-4 font-medium animate-pulse">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container-app py-12 text-center">
          <h2 className="text-2xl font-bold text-secondary mb-2">Order Not Found</h2>
          <p className="text-slate-600 mb-6">We couldn't retrieve the details for order #{params.id}.</p>
          <Link href="/orders">
            <button className="btn-primary flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Back to My Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate timeline steps
  const steps = [
    { label: 'Order Placed', status: 'PLACED', desc: 'Order received and waiting for shop confirmation' },
    { label: 'Accepted', status: 'ACCEPTED', desc: 'Payment verified and order accepted' },
    { label: 'Printing', status: 'PRINTING', desc: 'Your documents are currently printing' },
    { label: 'Ready', status: 'READY', desc: 'Ready for pickup at store' },
    { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY', desc: 'Out for delivery' },
    { label: 'Completed', status: 'COMPLETED', desc: 'Order collected/delivered successfully' }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'REJECTED' || status === 'CANCELLED') return -1;
    switch (status) {
      case 'PLACED': return 0;
      case 'ACCEPTED': return 1;
      case 'PRINTING': return 2;
      case 'READY':
      case 'READY_FOR_DELIVERY': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'COMPLETED': return 5;
      default: return 0;
    }
  };

  const getStepDescription = (status: string) => {
    switch (status) {
      case 'PLACED': return 'Order received and waiting for shop confirmation';
      case 'ACCEPTED': return 'Payment verified and order accepted';
      case 'PRINTING': return 'Your documents are currently printing';
      case 'READY': return order.deliveryType === 'DELIVERY' ? 'Out for delivery' : 'Ready for pickup at store';
      case 'OUT_FOR_DELIVERY': return 'Out for delivery';
      case 'COMPLETED': return 'Order collected/delivered successfully';
      case 'REJECTED': return 'Order was rejected';
      case 'CANCELLED': return 'Order was cancelled';
      default: return '';
    }
  };

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Header />

      <div className="container-app py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/orders" 
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary transition font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Orders
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-black text-2xl md:text-3xl text-secondary">
                Order #{order.orderNumber}
              </h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatOrderDate(order.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {formatOrderTime(order.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-slate-400" />
                {order.shopName}
              </span>
            </div>
          </div>

          {(() => {
            const ps = order.paymentStatus;
            const isPending = ps === 'PENDING_VERIFICATION';
            const isSuccess = ps === 'SUCCESS';
            const isFailed = ps === 'FAILED';

            if (isPending) {
              return (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Payment Status</p>
                    <p className="text-sm font-black text-amber-900">Pending Verification</p>
                  </div>
                </div>
              );
            } else if (isSuccess) {
              return (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Payment Status</p>
                    <p className="text-sm font-black text-emerald-900">Verified via UPI</p>
                  </div>
                </div>
              );
            } else if (isFailed) {
              return (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <X className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-red-800 tracking-wider">Payment Status</p>
                    <p className="text-sm font-black text-red-900">Payment Failed</p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-2xl border border-red-200 hover:border-red-300 transition text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Delete Order
          </button>
        </div>

        {order.paymentStatus === 'PENDING_VERIFICATION' && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-base">Payment Submitted — Awaiting Admin Verification</h3>
              <p className="text-sm text-amber-800 mt-1">
                Your payment has been received and is being reviewed by our team. 
                <strong> You may receive a verification call</strong> from the admin to confirm your order. 
                This is a standard security measure to ensure smooth processing.
              </p>
              <p className="text-xs text-amber-700 mt-2 font-medium">
                Your order will be accepted once payment is verified.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline and Details (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Timeline step chart */}
            <Card className="border border-slate-200">
              <CardBody className="p-6 md:p-8">
                <h3 className="font-heading font-bold text-lg text-secondary mb-6">
                  Order Tracking
                </h3>
                
                {order.status === 'REJECTED' || order.status === 'CANCELLED' ? (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
                    <X className="w-6 h-6 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-800">
                        {order.status === 'REJECTED' ? 'Order Rejected' : 'Order Cancelled'}
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        {order.rejectionReason || 'No reason was provided.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-6 md:pl-8 border-l border-slate-200 space-y-6 py-2">
                    {order.timeline && order.timeline.length > 0 ? (
                      order.timeline.map((entry, idx) => (
                        <div key={entry.id || idx} className="relative">
                          <div className={`absolute -left-[35px] md:-left-[43px] top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-sm ${
                            currentStepIndex >= getStepIndex(entry.status)
                              ? 'bg-primary border-primary text-white'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}>
                            {currentStepIndex >= getStepIndex(entry.status) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold text-base ${currentStepIndex === getStepIndex(entry.status) ? 'text-primary' : 'text-secondary'}`}>
                              {getStatusLabel(entry.status)}
                            </h4>
                            <p className="text-sm text-slate-500 mt-0.5">{entry.notes || getStepDescription(entry.status)}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatOrderDate(entry.createdAt)} at {formatOrderTime(entry.createdAt)}
                              {entry.changedByName ? ` by ${entry.changedByName}` : ''}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-400 py-4">No timeline entries available</div>
                    )}
                    {/* Show next expected step if not terminal */}
                    {currentStepIndex >= 0 && currentStepIndex < steps.length - 1 && (
                      <div className="relative opacity-40">
                        <div className="absolute -left-[35px] md:-left-[43px] top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 bg-white">
                          <span className="text-xs font-bold text-slate-400">{currentStepIndex + 2}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-400">{steps[currentStepIndex + 1].label}</h4>
                          <p className="text-sm text-slate-400 mt-0.5">{steps[currentStepIndex + 1].desc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Document Details Card */}
            <Card className="border border-slate-200">
              <CardBody className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-lg text-secondary">
                    Printed Items
                  </h3>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary text-sm max-w-xs md:max-w-md truncate">
                            {item.fileName || `Document #${idx + 1}`}
                          </h4>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-500 font-medium mt-1">
                            <span>{item.pageCount} pages</span>
                            <span>•</span>
                            <span>{item.copies} {item.copies === 1 ? 'copy' : 'copies'}</span>
                            <span>•</span>
                            <span className="uppercase">{item.colorMode === 'BW' ? 'Black & White' : 'Color'}</span>
                            <span>•</span>
                            <span className="capitalize">{item.sides.toLowerCase().replace('_', ' ')} sided</span>
                            {item.lamination && (
                              <>
                                <span>•</span>
                                <span>Lamination</span>
                              </>
                            )}
                            {item.binding !== 'NONE' && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{item.binding?.toLowerCase().replace('_', ' ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-black text-secondary text-sm">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Fulfillment & Billing (Right col) */}
          <div className="space-y-6">
            
            {/* Fulfillment Mode */}
            <Card className="border border-slate-200">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  {order.deliveryType === 'DELIVERY' ? (
                    <Truck className="w-5 h-5 text-primary" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                  <h3 className="font-heading font-bold text-lg text-secondary">
                    Fulfillment Method
                  </h3>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Fulfillment Mode</span>
                  <Badge variant={order.deliveryType === 'DELIVERY' ? 'success' : 'primary'}>
                    {order.deliveryType === 'DELIVERY' ? 'Home Delivery' : 'Self Pickup'}
                  </Badge>
                </div>

                {order.deliveryType === 'DELIVERY' && order.deliveryAddress && (
                  <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Delivery Address</p>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        {order.deliveryAddress.label && (
                          <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded uppercase mb-1">
                            {order.deliveryAddress.label}
                          </span>
                        )}
                        <p className="font-medium text-slate-800">{order.deliveryAddress.line1}</p>
                        {order.deliveryAddress.line2 && <p className="text-xs text-slate-500">{order.deliveryAddress.line2}</p>}
                        <p className="text-xs text-slate-500">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Billing Summary */}
            <Card className="border border-slate-200">
              <CardBody className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-lg text-secondary">
                    Billing Summary
                  </h3>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>

                  {order.deliveryCharge > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charges</span>
                      <span>{formatCurrency(order.deliveryCharge)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discounts {order.couponCode ? `(${order.couponCode})` : ''}</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  {order.walletAmountUsed !== undefined && order.walletAmountUsed > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Wallet Used</span>
                      <span>-{formatCurrency(order.walletAmountUsed)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-secondary text-base border-t border-slate-100 pt-3">
                    <span>Paid Amount</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
