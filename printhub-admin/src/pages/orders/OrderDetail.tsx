import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { ArrowLeft, FileText, MapPin, User, Store, Package } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await ordersApi.getById(Number(id));
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Order not found</p>
        <Link to="/orders" className="btn-primary mt-4">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/orders" className="flex items-center gap-2 text-slate-600 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order {order.orderNumber}</h1>
          <p className="text-slate-500 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`badge ${getStatusBadgeClass(order.status)} text-base px-4 py-2`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.fileName}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {item.pageCount} pages x {item.copies} copies | {item.colorMode} | {item.sides} sided
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.paperSize} | {item.binding || 'No Binding'} | {item.lamination ? 'Laminated' : 'No Lamination'}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {order.timeline?.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-slate-300'}`} />
                    {index < order.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-slate-900">{getStatusLabel(event.status)}</p>
                    {event.notes && <p className="text-sm text-slate-500">{event.notes}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {event.changedByName && `by ${event.changedByName}`} | {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-3 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer
            </h3>
            <p className="font-medium">{order.userName}</p>
            <p className="text-sm text-slate-500">{order.userPhone}</p>
          </div>

          {/* Shop */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Store className="w-4 h-4" />
              Shop
            </h3>
            <p className="font-medium">{order.shopName}</p>
          </div>

          {/* Delivery Address */}
          {order.deliveryType === 'DELIVERY' && order.address && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </h3>
              <p className="text-sm text-slate-600">
                {order.address.line1}
                {order.address.line2 && <>, {order.address.line2}</>}
                <br />
                {order.address.city}, {order.address.state} {order.address.pincode}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
