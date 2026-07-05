import { Header } from '@/components/layout/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container-app py-12">
        <h1 className="font-heading text-3xl font-bold text-secondary mb-4">Terms of Service</h1>
        <p className="text-slate-600">By using PrintHub, you agree to these terms.</p>
      </div>
    </div>
  );
}
