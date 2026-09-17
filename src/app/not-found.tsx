import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container-wide flex min-h-screen flex-col items-start justify-center gap-6">
      <p className="eyebrow">A little off the trail</p>
      <h1 className="display section-title">This page isn&apos;t here.</h1>
      <p>Let&apos;s get you back to the river.</p>
      <Link href="/" className="text-link">
        Back to Fox River →
      </Link>
    </main>
  );
}
