'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Loader2, FileText, RefreshCw, Download, Printer, DollarSign, User, Hash } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xershop-production.up.railway.app/api/v1';

interface PastOrder {
  orderId: number;
  orderNumber: string;
  userName: string;
  userPhone: string;
  totalPages: number;
  totalCopies: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  utr: string;
  completedAt: string;
  createdAt: string;
}

export default function PastOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<PastOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, mounted, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('printhub-auth');
      const parsed = token ? JSON.parse(token) : null;
      const accessToken = parsed?.state?.accessToken || localStorage.getItem('accessToken');

      const res = await fetch(`${API_BASE}/admin/orders/past`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load past orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  if (!mounted || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalPages = orders.reduce((s, o) => s + o.totalPages, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      <Header />

      <main className="container-app py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-4xl font-black text-slate-900 tracking-tight">
              Past Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Completed orders with payment details — {orders.length} orders, {totalPages} pages, {formatCurrency(totalRevenue)} revenue
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="border-slate-200 bg-white text-slate-700 shadow-sm">
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 bg-white text-slate-700 shadow-sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary"><Hash className="w-6 h-6" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p><h3 className="text-2xl font-black text-slate-800 mt-0.5">{orders.length}</h3></div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600"><FileText className="w-6 h-6" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pages Printed</p><h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalPages}</h3></div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-green-50 text-green-600"><DollarSign className="w-6 h-6" /></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p><h3 className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(totalRevenue)}</h3></div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 text-center py-16">
            <Printer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">No completed orders yet</h3>
            <p className="text-sm text-slate-400 mt-1">Orders will appear here once they are marked as delivered.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Order</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Customer</th>
                    <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Pages</th>
                    <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Copies</th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Amount</th>
                    <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Payment</th>
                    <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">UTR</th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.orderId} className={`border-b border-slate-100 hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="px-4 py-3 font-bold text-slate-800 text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800 text-xs">{order.userName}</p>
                            <p className="text-[10px] text-slate-400">{order.userPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700 text-xs">{order.totalPages}</td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700 text-xs">{order.totalCopies}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-800 text-sm">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          order.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {order.paymentMethod === 'UPI' ? 'UPI' : order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-[10px] text-slate-500">{order.utr !== 'N/A' ? order.utr : '-'}</td>
                      <td className="px-4 py-3 text-right text-[10px] text-slate-400">
                        {order.completedAt ? format(new Date(order.completedAt), 'dd MMM yy') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
