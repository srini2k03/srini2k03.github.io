import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { postBySlug, posts } from "@/content/posts";
import { ArrowLeft, ArrowRight } from "@/components/icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `writing/${p.slug}/` },
    openGraph: { type: "article", title: p.title, description: p.summary, url: `writing/${p.slug}/` },
  };
}

/** Markdown is our own committed content, rendered to HTML at build time (static export). */
function renderPost(slug: string): string {
  const md = readFileSync(path.join(process.cwd(), "src", "content", "posts", `${slug}.md`), "utf8");
  return marked.parse(md, { async: false, gfm: true });
}

const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) notFound();
  const html = renderPost(p.slug);

  return (
    <article className="relative">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-[480px] opacity-60" />
      <header className="mx-auto max-w-3xl px-4 pb-8 pt-32 sm:px-6 sm:pt-36">
        <Link href="/writing/" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
          <ArrowLeft width={14} height={14} /> All writing
        </Link>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
          {fmt(p.date)} · {p.tags.join(" · ")}
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-fg sm:text-5xl">{p.title}</h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-fg-soft">{p.summary}</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="prose-sb" dangerouslySetInnerHTML={{ __html: html }} />
        <Link
          href={`/projects/${p.project.slug}/`}
          className="group mt-12 flex items-center justify-between gap-4 rounded-2xl border border-line bg-elev/70 p-5 transition-colors hover:border-line-strong"
        >
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Case study</span>
            <span className="mt-1 block font-semibold text-fg">{p.project.label}</span>
          </span>
          <ArrowRight width={16} height={16} className="text-accent transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
