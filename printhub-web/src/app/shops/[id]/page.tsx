'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';

export default function ShopDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container-app py-12">
        <h1 className="font-heading text-3xl font-bold text-secondary mb-4">Shop Details</h1>
        <p className="text-slate-600">Shop information and services.</p>
      </div>
    </div>
  );
}
