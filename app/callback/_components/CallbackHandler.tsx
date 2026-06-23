'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { exchangeCodeFromCallback } from '@/lib/auth';

export default function CallbackHandler() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ranRef         = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const code       = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(oauthError === 'access_denied'
        ? 'Sign-in was cancelled.'
        : 'Sign-in failed. Please try again.');
      return;
    }

    if (!code) {
      setError('Invalid callback — no authorization code received.');
      return;
    }

    exchangeCodeFromCallback(code)
      .then(() => router.replace('/dashboard'))
      .catch(() => setError('Sign-in failed. Please try again.'));
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md card-lg text-center">
          <div className="w-12 h-12 rounded-full bg-error-light flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
          </div>
          <h1 className="text-title-3 text-neutral-900 mb-2">Sign-in failed</h1>
          <p className="text-body-sm text-neutral-500 mb-6">{error}</p>
          <Link href="/login" className="btn btn-primary btn-full">
            Try again
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-body-sm text-neutral-500">Completing sign-in…</p>
      </div>
    </main>
  );
}