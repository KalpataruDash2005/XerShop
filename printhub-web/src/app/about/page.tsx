import { Header } from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container-app py-12">
        <h1 className="font-heading text-3xl font-bold text-secondary mb-4">About PrintHub</h1>
        <p className="text-slate-600">Your trusted on-demand printing marketplace. Print Anything. Anywhere. Anytime.</p>
      </div>
    </div>
  );
}
