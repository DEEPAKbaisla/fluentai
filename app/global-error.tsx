"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center">
            <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
