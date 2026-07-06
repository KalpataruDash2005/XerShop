'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { shopApi, Shop } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { MapPin, Star, Phone, Store } from 'lucide-react';

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const response = await shopApi.getNearby(19.0760, 72.8777, 50, 50);
      if (response.success && response.data) {
        setShops(response.data);
      }
    } catch (err) {
      setError('Failed to load shops. Please try again.');
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
            Print Shops
          </h1>
          <p className="text-slate-600">Available print shops for your orders</p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                <div className="h-32 bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchShops}>Try Again</Button>
          </div>
        )}

        {!isLoading && !error && shops.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No shops available</p>
            <Button onClick={fetchShops}>Refresh</Button>
          </div>
        )}

        {!isLoading && !error && shops.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <Card hoverable className="h-full">
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                    {shop.logoUrl ? (
                      <img
                        src={shop.logoUrl}
                        alt={shop.name}
                        className="w-24 h-24 object-contain"
                      />
                    ) : (
                      <Store className="w-16 h-16 text-primary/40" />
                    )}
                  </div>
                  <CardBody>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-secondary">{shop.name}</h3>
                      {shop.distanceKm && (
                        <Badge variant="default">{shop.distanceKm.toFixed(1)} km</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{shop.city}, {shop.state}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{shop.ratingAvg.toFixed(1)}</span>
                        <span className="text-slate-400">({shop.totalReviews})</span>
                      </div>

                      {!shop.isAcceptingOrders && (
                        <Badge variant="warning">Closed</Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{shop.phone}</span>
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
