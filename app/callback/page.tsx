import { Suspense } from 'react';
import CallbackHandler from './_components/CallbackHandler';

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackHandler />
    </Suspense>
  );
}

function CallbackLoading() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-body-sm text-neutral-500">Completing sign-in…</p>
      </div>
    </main>
  );
}