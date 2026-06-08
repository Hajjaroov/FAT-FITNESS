"use client";

import { useEffect, useState } from "react";

import { getBackendStatus } from "@/lib/api";
import { apiBaseUrl } from "@/lib/config";
import type { BackendStatus } from "@/types/api";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getBackendStatus()
      .then((status) => {
        if (!isMounted) {
          return;
        }

        setBackendStatus(status);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!isMounted) {
          return;
        }

        setBackendStatus(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to reach backend.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const statusLabel = isLoading
    ? "Checking"
    : backendStatus?.status ?? "Unavailable";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-wide">
            Fat Fitness
          </span>
          <span className="text-sm text-zinc-500">Local setup</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <section className="max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Backend connection
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {statusLabel}
          </h1>

          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">Service</dt>
              <dd className="font-medium">
                {backendStatus?.service ?? "Waiting for response"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">API base URL</dt>
              <dd className="font-mono text-xs">{apiBaseUrl}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">Timestamp</dt>
              <dd className="font-mono text-xs">
                {backendStatus?.timestamp ?? "-"}
              </dd>
            </div>
          </dl>

          {error ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-4 text-sm text-zinc-500">
          Backend endpoint: /api/status
        </div>
      </footer>
    </div>
  );
}
