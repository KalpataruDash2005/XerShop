'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.success('Password reset instructions sent to your email');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-2xl font-bold text-secondary mb-4 text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <Input label="Email or Phone" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email or phone" />
          <Button type="submit" className="w-full" isLoading={isLoading}>Send Reset Instructions</Button>
          <p className="text-center text-sm text-slate-600">
            <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
