import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, User, Mail, Phone, Wallet, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDetail() {
  const { id } = useParams();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await usersApi.getById(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">User not found</p>
        <Link to="/users" className="btn-primary mt-4">Back to Users</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/users" className="flex items-center gap-2 text-slate-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="card p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto">
              {user.name[0]}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-4">{user.name}</h2>
            <p className="text-slate-500">ID: {user.id}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-5 h-5" />
              <span>{user.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-5 h-5" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Wallet className="w-5 h-5" />
              <span>{formatCurrency(user.walletBalance)}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar className="w-5 h-5" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span className={`badge ${user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                {user.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-500">Role</span>
              <span className="badge badge-default">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="card p-6">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{user.totalOrders}</p>
            </div>
            <div className="card p-6">
              <Wallet className="w-8 h-8 text-green-600 mb-3" />
              <p className="text-sm text-slate-500">Wallet Balance</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(user.walletBalance)}</p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <p className="text-slate-500 text-center py-8">Activity timeline coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
