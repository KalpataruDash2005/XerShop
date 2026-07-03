import { Upload, Settings, CreditCard, Package } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Document',
    description: 'Upload your files and we will automatically detect page count.',
  },
  {
    icon: Settings,
    step: '02',
    title: 'Configure Print',
    description: 'Choose paper size, color, binding, and other options.',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Pay Online',
    description: 'Pay securely with Razorpay. Use coupons and wallet balance.',
  },
  {
    icon: Package,
    step: '04',
    title: 'Get Prints',
    description: 'Pick up from shop or get it delivered to your address.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-secondary mb-4">
            How It Works
          </h2>
          <p className="text-slate-600">
            Get your prints in just 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 shadow-glow">
                <step.icon className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-primary mb-2">STEP {step.step}</p>
              <h3 className="font-semibold text-secondary mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-primary/20">
                  <div className="absolute right-0 top-[-3px] w-2 h-2 rounded-full bg-primary/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
