import { FileText, Palette, Truck, CreditCard, MapPin, Headphones } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Multiple Formats',
    description: 'Upload PDF, DOC, DOCX, PPT, images, and ZIP files. We handle them all.',
  },
  {
    icon: Palette,
    title: 'Custom Options',
    description: 'Choose paper size, color mode, binding, GSM, lamination, and more.',
  },
  {
    icon: Truck,
    title: 'Delivery or Pickup',
    description: 'Get prints delivered to your doorstep or pick up from the shop.',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Pay securely via UPI, cards, net banking, or wallet balance.',
  },
  {
    icon: MapPin,
    title: 'Quick Turnaround',
    description: 'Get your prints done same day — upload now, pickup or deliver shortly.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Need help? Our support team is always here to assist you.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-600">
            From document upload to doorstep delivery, we have got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-50 hover:bg-primary-50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
