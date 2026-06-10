import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Email Confirmed',
  description: 'Your Movelo account has been verified.',
};

export default function EmailVerifiedPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center">

        <Link href="/" className="inline-block mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Movelo" className="h-36 w-auto mx-auto" />
        </Link>

        <div className="card-lg">
          <div className="flex justify-center mb-5">
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-success-light">
              <CheckCircle className="w-8 h-8 text-success" />
            </span>
          </div>

          <h1 className="text-title-3 text-neutral-900 mb-2">
            Email confirmed!
          </h1>
          <p className="text-body-sm text-neutral-500 mb-7">
            Your account is active. You&apos;re all set to start ordering.
          </p>

          <Link href="/login" className="btn btn-primary btn-full">
            Sign in to Movelo
          </Link>
        </div>

      </div>
    </main>
  );
}