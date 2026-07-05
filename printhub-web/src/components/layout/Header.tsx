'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Menu, X, Printer, User, MapPin, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-secondary">
              Print<span className="text-primary">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-slate-600 hover:text-secondary'
                )}
              >
                {link.label}
              </Link>
            ))}
            {mounted && isAuthenticated && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && (
              <Link
                href="/orders"
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === '/orders'
                    ? 'text-primary'
                    : 'text-slate-600 hover:text-secondary'
                )}
              >
                My Orders
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {mounted && isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-slate-700">
                  Hi, {user?.name}
                </span>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Link href="/admin/dashboard">
                    <Button variant="primary" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={logout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-primary-50 text-primary'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {mounted && isAuthenticated && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && (
                <Link
                  href="/orders"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/orders'
                      ? 'bg-primary-50 text-primary'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
              <div className="flex flex-col gap-2 mt-4 px-4">
                {mounted && isAuthenticated ? (
                  <>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <Link href="/admin/dashboard" className="w-full" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="primary" className="w-full">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="w-full" onClick={logout}>
                      Log Out ({user?.name})
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button variant="primary" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
