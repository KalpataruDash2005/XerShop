import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <footer className="bg-secondary text-white py-12">
        <div className="container-app">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading font-bold text-xl mb-4">PrintHub</h3>
              <p className="text-slate-300 text-sm">
                Print Anything. Anywhere. Anytime. Your trusted on-demand printing marketplace.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/shops" className="hover:text-white transition">Find Shops</Link></li>
                <li><Link href="/orders" className="hover:text-white transition">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white transition">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} PrintHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
