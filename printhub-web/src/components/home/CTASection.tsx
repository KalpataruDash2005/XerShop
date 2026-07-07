import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container-app">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Printer className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Print?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Join thousands of happy customers who trust PrintHub for their printing needs. Get started today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-accent text-secondary hover:bg-accent-400 w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Existing User?
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
