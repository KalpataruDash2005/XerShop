import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi, User } from '@/lib/api';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, MoreVertical, Eye, UserCog, Ban } from 'lucide-react';

export default function Users() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () => {
      const response = await usersApi.getAll(page, 15, search || undefined);
      return response.data;
    },
  });

  const users = data?.content || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">Manage all registered users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="input pl-10 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Wallet</th>
                <th>Orders</th>
                <th>Joined</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm">{user.phone}</p>
                        {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-error' : 'badge-default'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="font-medium">{formatCurrency(user.walletBalance)}</td>
                    <td>{user.totalOrders}</td>
                    <td className="text-slate-500">{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary">
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-error">
                          <Ban className="w-4 h-4" />
                        </button>
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
            Showing {users.length} of {data?.totalElements || 0} users
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
