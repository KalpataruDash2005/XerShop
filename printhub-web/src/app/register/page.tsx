'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, ArrowRight, Printer } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91' },
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+61', label: 'AU +61' },
  { code: '+81', label: 'JP +81' },
  { code: '+86', label: 'CN +86' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+971', label: 'AE +971' },
  { code: '+966', label: 'SA +966' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { isAuthenticated, setUser, setTokens } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) router.push('/');
  }, [mounted, isAuthenticated, router]);

  const handleRegister = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (!phone.trim() || phone.length < 9) { toast.error('Please enter a valid phone number'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`;

    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: fullPhone,
        password,
      });

      if (response.success && response.data) {
        setTokens(response.data.accessToken, response.data.refreshToken);
        setUser(response.data.user);
        document.cookie = 'printhub-auth-token=true; path=/; max-age=604800; SameSite=Lax';
        toast.success('Account created successfully!');
        router.push('/orders');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative text-white text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Printer className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome to PrintHub</h2>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            Your one-stop solution for all printing needs. Upload, customize, and get your documents delivered.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {['Upload', 'Print', 'Deliver'].map((step, i) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-white/70">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-2xl text-secondary">PrintHub</span>
            </Link>
            <h1 className="text-2xl font-bold text-secondary mb-1">Create your account</h1>
            <p className="text-slate-500">Join thousands of happy customers</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="input w-28 text-sm py-2 flex-shrink-0">
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} className="pl-10" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email <span className="text-slate-400">(Optional)</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
              </div>
            </div>

            <Button onClick={handleRegister} className="w-full" isLoading={isLoading} size="lg">
              Create Account
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
