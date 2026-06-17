'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, User, Package, LogOut } from 'lucide-react';
import { getAccessToken, getRefreshToken, logout, getAuthUser } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard',         label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile',  icon: User            },
  { href: '/dashboard/orders',  label: 'Orders',   icon: Package         },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [ready,     setReady]     = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!getAccessToken() && !getRefreshToken()) {
      router.replace('/login');
      return;
    }
    setUserEmail(getAuthUser()?.email ?? '');
    setReady(true);
  }, [router]);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex bg-background">

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-surface border-r border-border fixed inset-y-0 left-0 z-20">

        <div className="px-5 h-16 flex items-center border-b border-border">
          <Link href="/dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Movelo" className="h-8 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard'
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-subtle text-primary'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs text-neutral-400">Signed in as</p>
            <p className="text-sm font-medium text-neutral-800 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                       text-sm font-medium text-neutral-600 hover:bg-neutral-100
                       hover:text-neutral-900 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            Sign out
          </button>
        </div>

      </aside>

      {/* ── Mobile top header ────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-20 h-14 bg-surface border-b border-border
                         flex items-center justify-between px-4">
        <Link href="/dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Movelo" className="h-7 w-auto" />
        </Link>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="btn-icon btn-icon-sm"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 md:ml-60">
        <main className="px-4 py-6 md:px-8 md:py-8 mt-14 md:mt-0 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-surface border-t border-border
                   flex items-center justify-around px-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)', paddingTop: '0.5rem' }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors ${
                active ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}