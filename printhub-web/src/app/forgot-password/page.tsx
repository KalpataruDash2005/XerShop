'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res: any = await authApi.forgotPassword(identifier);
      if (res.success) {
        toast.success('OTP sent to your phone via SMS');
        setStep('reset');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.resetPassword(identifier, otp, newPassword);
      if (res.success) {
        toast.success('Password reset successful! Please login.');
        window.location.href = '/login';
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-2xl font-bold text-secondary mb-4 text-center">Reset Password</h1>
        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <Input label="Email or Phone Number" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter email or phone number" />
            <Button type="submit" className="w-full" isLoading={isLoading}>Send OTP</Button>
            <p className="text-center text-sm text-slate-600">
              <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <Input label="OTP (6 digits)" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP sent to your phone" maxLength={6} />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
            <Button type="submit" className="w-full" isLoading={isLoading}>Reset Password</Button>
            <p className="text-center text-sm text-slate-600">
              <button onClick={() => { setStep('request'); setOtp(''); setNewPassword(''); }} className="text-primary hover:underline">Request new OTP</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
