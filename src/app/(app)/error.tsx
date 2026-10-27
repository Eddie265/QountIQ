"use client";

import { RotateCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-lg font-semibold">This page couldn&apos;t load</h1>
      <p className="max-w-md text-sm text-muted">
        We couldn&apos;t reach the database. This is usually temporary. Please try again.
      </p>
      {error.digest && <p className="text-xs text-faint">Reference: {error.digest}</p>}
      <button onClick={reset} className="btn-primary mt-2">
        <RotateCw className="size-4" /> Try again
      </button>
    </div>
  );
}
