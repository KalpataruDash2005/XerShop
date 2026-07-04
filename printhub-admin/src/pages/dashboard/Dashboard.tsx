import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import {
  Users,
  Store,
  FileText,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, change, icon, iconBg }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {formatPercentage(change)} vs last month
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await adminApi.getDashboardStats();
      return response.data;
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-chart', '30d'],
    queryFn: async () => {
      const response = await adminApi.getRevenueChart('30d');
      return response.data || [];
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const response = await adminApi.getRecentOrders(5);
      return response.data || [];
    },
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await adminApi.getPendingApprovals();
      return response.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with PrintHub.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change={stats?.monthlyGrowth}
          icon={<Users className="w-6 h-6 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Active Shops"
          value={stats?.totalShops?.toLocaleString() || '0'}
          icon={<Store className="w-6 h-6 text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString() || '0'}
          icon={<FileText className="w-6 h-6 text-orange-600" />}
          iconBg="bg-orange-100"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          change={stats?.monthlyGrowth}
          icon={<IndianRupee className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-100"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today's Orders</p>
              <p className="text-xl font-bold text-slate-900">{stats?.todayOrders || 0}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Revenue: <span className="font-semibold text-slate-900">{formatCurrency(stats?.todayRevenue || 0)}</span>
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="text-xl font-bold text-slate-900">{stats?.pendingApprovals || 0}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Shops awaiting approval
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Orders</p>
              <p className="text-xl font-bold text-slate-900">{stats?.activeOrders || 0}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Currently being processed
          </p>
        </div>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6FED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2F6FED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2740',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2F6FED"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Pending Shop Approvals</h3>
          {pendingApprovals && pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.slice(0, 4).map((shop) => (
                <div key={shop.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{shop.name}</p>
                    <p className="text-sm text-slate-500">{shop.ownerName} | {shop.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-success btn-sm">Approve</button>
                    <button className="btn-danger btn-sm">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No pending approvals
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-primary">{order.orderNumber}</td>
                    <td>
                      <div>
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-slate-500 text-xs">{order.userPhone}</p>
                      </div>
                    </td>
                    <td>{order.shopName}</td>
                    <td className="font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
