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
import { Package, FileText, Calendar, Store, ArrowRight } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.getMyOrders(0, 20);
      if (response.success && response.data) {
        setOrders(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
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

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary mb-2">No orders yet</h2>
            <p className="text-slate-600 mb-6">Start by uploading your first document</p>
            <Link href="/upload">
              <button className="btn-primary">Upload Document</button>
            </Link>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-secondary">
                              #{order.orderNumber}
                            </span>
                            <span className={`badge ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
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
        )}
      </div>
    </div>
  );
}
