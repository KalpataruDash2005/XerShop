import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Upload, MapPin, Clock, Shield } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary py-20 md:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

      <div className="container-app relative">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Print Anything.<br />Anywhere. Anytime.
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Upload documents, configure print options, and get prints delivered from nearby shops. Fast, reliable, affordable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="bg-white text-primary hover:bg-slate-100 w-full sm:w-auto">
                <Upload className="w-5 h-5" />
                Upload & Print
              </Button>
            </Link>
            <Link href="/shops">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                <MapPin className="w-5 h-5" />
                Find Nearby Shops
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Easy Upload</p>
              <p className="text-xs text-white/60">PDF, DOC, Images</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Fast Delivery</p>
              <p className="text-xs text-white/60">Same day pickup</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Secure</p>
              <p className="text-xs text-white/60">Safe payments</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">50+ Shops</p>
              <p className="text-xs text-white/60">Near your location</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
