import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-4 pt-24 sm:px-6">
      <p className="font-mono text-sm text-accent">404 · confidence below τ</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fg sm:text-6xl">
        I don’t know <span className="font-serif font-normal italic">this page</span>.
      </h1>
      <p className="mt-4 text-lg text-muted">Rather than guess, here is somewhere that does exist.</p>
      <Link href="/" className="mt-8 rounded-xl bg-fg px-5 py-3 text-sm font-medium text-bg">
        Back to the portfolio
      </Link>
    </section>
  );
}
