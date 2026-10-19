'use client';

import { useEffect } from 'react';
import { safeLogger } from '../lib/logging/safeLogger';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    safeLogger.error('Application route failed', { digest: error.digest });
  }, [error.digest]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-xl font-bold text-[#0A192F]">We could not load this workspace</h1>
        <p className="mt-2 text-sm text-slate-600">Please try again. No internal error details are shown here.</p>
        <button onClick={reset} className="mt-6 rounded-xl bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2">
          Try again
        </button>
      </section>
    </main>
  );
}
