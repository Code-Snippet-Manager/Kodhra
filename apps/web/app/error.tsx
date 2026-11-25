
"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa] px-5 py-16 text-[#171717]">

      {/* Subtle background detail */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#737373_1px,transparent_1px),linear-gradient(90deg,#737373_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative w-full max-w-[480px]">

        {/* Error indicator */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50">
            <AlertCircle className="h-[18px] w-[18px] text-red-600" />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight">
              Something went wrong
            </p>
            <p className="text-xs text-neutral-500">
              Application error
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="border-y border-neutral-200 py-9">

          <p className="mb-4 font-mono text-xs tracking-[0.18em] text-neutral-400">
            ERROR / 500
          </p>

          <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            Well, this is
            <br />
            unexpected.
          </h1>

          <p className="mt-5 max-w-[390px] text-[15px] leading-7 text-neutral-500">
            Something interrupted this page from loading properly.
            Your work may still be safe. Try refreshing the page
            and we’ll give it another shot.
          </p>

          {/* Error reference */}
          {error.digest && (
            <div className="mt-7 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
              <span className="text-xs text-neutral-500">
                Error reference
              </span>
              <code className="text-xs font-medium text-neutral-700">
                {error.digest}
              </code>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              onClick={() => reset()}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Try again
            </button>

            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            Sorry for the interruption.
          </p>

          <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
            System status
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Interrupted
          </span>
        </div>

        <div className="mt-12 flex justify-end">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Return to dashboard
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </main>
  );
}
