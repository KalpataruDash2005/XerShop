import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shopsApi, Shop } from '@/lib/api';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, Eye, Check, X } from 'lucide-react';

export default function Shops() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['shops', page, statusFilter],
    queryFn: async () => {
      const response = await shopsApi.getAll(page, 15, statusFilter || undefined);
      return response.data;
    },
  });

  const shops = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const statusOptions = ['', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shops</h1>
          <p className="text-slate-500 mt-1">Manage print shops on the platform</p>
        </div>
        <div className="flex gap-3">
          <select
            className="input w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statusOptions.slice(1).map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Orders</th>
                <th>Revenue</th>
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
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No shops found
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {shop.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{shop.name}</p>
                          <p className="text-xs text-slate-500">{shop.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm">{shop.ownerName}</p>
                        <p className="text-xs text-slate-500">{shop.ownerPhone}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm">{shop.city}, {shop.state}</p>
                      <p className="text-xs text-slate-500">{shop.pincode}</p>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(shop.status)}`}>
                        {getStatusLabel(shop.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{shop.ratingAvg.toFixed(1)}</span>
                        <span className="text-slate-500 text-xs">({shop.totalReviews})</span>
                      </div>
                    </td>
                    <td>{shop.totalOrders}</td>
                    <td className="font-medium">{formatCurrency(shop.totalRevenue)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                        {shop.status === 'PENDING' && (
                          <>
                            <button className="p-1.5 hover:bg-green-50 rounded-lg text-slate-500 hover:text-green-600">
                              <Check className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
            Showing {shops.length} of {data?.totalElements || 0} shops
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
