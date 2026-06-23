'use client';

import { useEffect } from 'react';
import { initiateLogin } from '@/lib/auth';

export default function LoginInitiator() {
  useEffect(() => {
    initiateLogin();
  }, []);

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-body-sm text-neutral-500">Redirecting to sign in…</p>
      </div>
    </main>
  );
}