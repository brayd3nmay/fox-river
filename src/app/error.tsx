"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container-wide flex min-h-screen flex-col items-start justify-center gap-6">
      <p className="eyebrow">Fox River Recreation</p>
      <h1 className="display section-title">A small detour.</h1>
      <p>We couldn&apos;t load this page. Please try again in a moment.</p>
      <button onClick={reset} className="text-link">
        Try again →
      </button>
    </main>
  );
}
