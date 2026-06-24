import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verification Failed',
  description: 'We could not verify your email address.',
};

export default function EmailVerificationFailedPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center">

        <Link href="/" className="inline-block mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Movelo" className="h-36 w-auto mx-auto" />
        </Link>

        <div className="card-lg">
          <div className="flex justify-center mb-5">
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-error-light">
              <XCircle className="w-8 h-8 text-error" />
            </span>
          </div>

          <h1 className="text-title-3 text-neutral-900 mb-2">
            Link expired or invalid
          </h1>
          <p className="text-body-sm text-neutral-500 mb-7">
            This verification link has expired or already been used. Please sign up again to get a fresh link.
          </p>

          <Link href="/login" className="btn btn-primary btn-full">
            Sign in
          </Link>

          <p className="text-caption text-neutral-400 mt-4">
            Already verified?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}