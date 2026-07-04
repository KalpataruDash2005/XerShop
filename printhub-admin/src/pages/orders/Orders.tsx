import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, Order } from '@/lib/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, statusFilter],
    queryFn: async () => {
      const response = await ordersApi.getAll(page, 15, statusFilter || undefined);
      return response.data;
    },
  });

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">Track and manage all orders</p>
        </div>
        <select
          className="input w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="PRINTING">Printing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div>
                        <p className="font-mono text-primary">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">{order.deliveryType}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-xs text-slate-500">{order.userPhone}</p>
                      </div>
                    </td>
                    <td>{order.shopName}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td className="text-slate-500">{formatDate(order.createdAt)}</td>
                    <td>
                      <Link
                        to={`/orders/${order.id}`}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {orders.length} of {data?.totalElements || 0} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              className="btn-outline p-2"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-700">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="btn-outline p-2"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
