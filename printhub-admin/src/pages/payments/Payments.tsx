import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

// Mock data for payments
const mockPayments = [
  { id: 1, orderId: 'PH20240101-123456-0001', amount: 250, method: 'UPI', status: 'PAID', createdAt: '2024-01-15 10:30:00' },
  { id: 2, orderId: 'PH20240101-123456-0002', amount: 180, method: 'CARD', status: 'PAID', createdAt: '2024-01-15 11:45:00' },
  { id: 3, orderId: 'PH20240101-123456-0003', amount: 520, method: 'WALLET', status: 'PAID', createdAt: '2024-01-15 14:20:00' },
];

export default function Payments() {
  const [page] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">View all payment transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-900">1,234</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(125000)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">UPI Transactions</p>
          <p className="text-2xl font-bold text-slate-900">856</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Wallet Usage</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(45000)}</p>
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="font-mono">#{payment.id}</td>
                  <td className="font-mono text-primary">{payment.orderId}</td>
                  <td className="font-semibold">{formatCurrency(payment.amount)}</td>
                  <td>
                    <span className="badge badge-default">{payment.method}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">{payment.status}</span>
                  </td>
                  <td className="text-slate-500">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
