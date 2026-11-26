import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/content/posts";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Writing",
  description: "Technical write-ups on retrieval, LLM evaluation and what the data actually showed.",
  alternates: { canonical: "writing/" },
};

const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function WritingIndex() {
  return (
    <div className="relative">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-[480px] opacity-60" />
      <header className="mx-auto max-w-3xl px-4 pb-6 pt-32 sm:px-6 sm:pt-36">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">Writing</span> · notes from the projects
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-fg sm:text-5xl">
          What the data <span className="font-serif italic font-normal text-accent">actually</span> showed.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-fg-soft">
          Short write-ups of the findings that surprised me, with the numbers and the code behind them.
        </p>
      </header>
      <ul className="mx-auto grid max-w-3xl gap-4 px-4 pb-24 sm:px-6">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/writing/${p.slug}/`}
              className="group block rounded-2xl border border-line bg-elev/70 p-6 transition-colors hover:border-line-strong"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                {fmt(p.date)} · {p.tags.join(" · ")}
              </p>
              <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-fg">{p.title}</h2>
              <p className="mt-3 text-pretty leading-relaxed text-muted">{p.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Read <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
