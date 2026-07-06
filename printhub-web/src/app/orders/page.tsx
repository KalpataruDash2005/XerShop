'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { orderApi, Order } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, FileText, Calendar, Store, ArrowRight, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [mounted, isAuthenticated, router, page]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setFetchError(false);
      const response = await orderApi.getMyOrders(page, pageSize);
      if (response.success && response.data) {
        setOrders(response.data.content);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null;
    if (paymentStatus === 'PENDING_VERIFICATION') return 'bg-amber-100 text-amber-800';
    if (paymentStatus === 'SUCCESS') return 'bg-emerald-100 text-emerald-800';
    if (paymentStatus === 'FAILED') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-600';
  };

  const getPaymentLabel = (paymentStatus?: string) => {
    if (!paymentStatus) return null;
    if (paymentStatus === 'PENDING_VERIFICATION') return 'Awaiting Verification';
    if (paymentStatus === 'SUCCESS') return 'Paid';
    if (paymentStatus === 'FAILED') return 'Failed';
    return paymentStatus;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-secondary mb-2">
            My Orders
          </h1>
          <p className="text-slate-600">Track and manage your print orders</p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/4 mb-4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <h3 className="font-bold text-red-800">Failed to load orders</h3>
            <p className="text-sm text-red-600 mt-1 mb-4">Something went wrong. Please try again.</p>
            <button
              onClick={() => { setPage(0); fetchOrders(); }}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {!isLoading && !fetchError && orders.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary mb-2">You have 0 orders yet</h2>
            <p className="text-slate-600 mb-6">Start by uploading your first document</p>
            <Link href="/upload">
              <button className="btn-primary">Upload Document</button>
            </Link>
          </div>
        )}

        {!isLoading && !fetchError && orders.length > 0 && (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card hoverable>
                    <CardBody>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-secondary">
                                #{order.orderNumber}
                              </span>
                              <span className={`badge ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                              {order.paymentStatus && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                                  {getPaymentLabel(order.paymentStatus)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <Store className="w-4 h-4" />
                              {order.shopName}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:text-right">
                          <div>
                            <p className="text-sm text-slate-600">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </p>
                            <p className="font-semibold text-secondary">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary disabled:text-slate-300 disabled:cursor-not-allowed transition px-3 py-2 rounded-xl hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-slate-500 font-medium">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-primary disabled:text-slate-300 disabled:cursor-not-allowed transition px-3 py-2 rounded-xl hover:bg-slate-100"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
