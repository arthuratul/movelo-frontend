import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from './_components/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for Movelo and get fast delivery at your fingertips.',
};

export default function SignupPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Movelo" className="h-44 w-auto mx-auto" />
          </Link>
          <h1 className="text-title-2 text-neutral-900">Create your account</h1>
          <p className="text-body-sm text-neutral-500 mt-1.5">
            Fast delivery, right at your fingertips
          </p>
        </div>

        {/* Form card */}
        <div className="card-lg">
          <SignupForm />
        </div>

        {/* Sign in link */}
        <p className="text-center text-body-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}