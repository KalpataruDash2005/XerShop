import { Header } from '@/components/layout/Header';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container-app py-12">
        <h1 className="font-heading text-3xl font-bold text-secondary mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-600">Common questions about using PrintHub.</p>
      </div>
    </div>
  );
}
