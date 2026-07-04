import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopsApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Store, MapPin, Phone, Mail, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShopDetail() {
  const { id } = useParams();

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: async () => {
      const response = await shopsApi.getById(Number(id));
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

  if (!shop) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Shop not found</p>
        <Link to="/shops" className="btn-primary mt-4">Back to Shops</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/shops" className="flex items-center gap-2 text-slate-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back to Shops
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop Info */}
        <div className="card p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto">
              {shop.name[0]}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-4">{shop.name}</h2>
            <p className="text-slate-500">ID: {shop.id}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Store className="w-5 h-5" />
              <div>
                <p className="font-medium">{shop.ownerName}</p>
                <p className="text-sm text-slate-500">Owner</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-5 h-5" />
              <span>{shop.phone}</span>
            </div>
            {shop.email && (
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-5 h-5" />
                <span>{shop.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin className="w-5 h-5" />
              <span>{shop.address}, {shop.city}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span className={`badge ${shop.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                {shop.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-500">Accepting Orders</span>
              <span className={`badge ${shop.isAcceptingOrders ? 'badge-success' : 'badge-default'}`}>
                {shop.isAcceptingOrders ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-lg font-bold">{shop.ratingAvg.toFixed(1)}</p>
              <p className="text-xs text-slate-500">Rating</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-lg font-bold">{shop.totalReviews}</p>
              <p className="text-xs text-slate-500">Reviews</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-lg font-bold">{shop.totalOrders}</p>
              <p className="text-xs text-slate-500">Orders</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-lg font-bold">{formatCurrency(shop.totalRevenue)}</p>
              <p className="text-xs text-slate-500">Revenue</p>
            </div>
          </div>

          {/* Printers */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Printers ({shop.printers?.length || 0})</h3>
            <div className="grid grid-cols-2 gap-4">
              {shop.printers?.map((printer) => (
                <div key={printer.id} className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium">{printer.name}</p>
                  <p className="text-sm text-slate-500">{printer.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Rules */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Pricing Rules</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Paper Size</th>
                    <th>Color Mode</th>
                    <th>Base Price</th>
                    <th>Per Page</th>
                  </tr>
                </thead>
                <tbody>
                  {shop.pricingRules?.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.paperSize}</td>
                      <td>{rule.colorMode}</td>
                      <td>{formatCurrency(rule.basePrice)}</td>
                      <td>{formatCurrency(rule.pricePerPage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
