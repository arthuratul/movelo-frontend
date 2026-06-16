import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from './_components/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Movelo account and track your deliveries.',
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Movelo" className="h-44 w-auto mx-auto" />
          </Link>
          <h1 className="text-title-2 text-neutral-900">Welcome back</h1>
          <p className="text-body-sm text-neutral-500 mt-1.5">
            Sign in to continue your deliveries
          </p>
        </div>

        {/* Form card */}
        <div className="card-lg">
          <LoginForm />
        </div>

        {/* Sign up link */}
        <p className="text-center text-body-sm text-neutral-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Create account
          </Link>
        </p>

      </div>
    </main>
  );
}