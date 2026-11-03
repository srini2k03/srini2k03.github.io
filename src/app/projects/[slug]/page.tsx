import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredProjects, projectBySlug } from "@/content/projects";
import { CountUp, Reveal, WordReveal } from "@/components/motion-primitives";
import { PipelineTimeline } from "@/components/pipeline";
import { ProjectVisual } from "@/components/project-visual";
import { ProjectResults } from "@/components/project-results";
import { StatusBadge, Tag, accentVar } from "@/components/ui";
import { ArrowLeft, ArrowRight, ArrowUpRight, Browser } from "@/components/icons";

export const dynamicParams = false;

/** Case studies that have a results / evaluation section with committed data. */
const RESULT_SLUGS = new Set(["rbi-rag", "credit-default", "jobpost-extractor", "olist-analytics"]);

export function generateStaticParams() {
  return featuredProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline,
    alternates: { canonical: `projects/${p.slug}/` },
    openGraph: { title: p.title, description: p.tagline, url: `projects/${p.slug}/` },
  };
}

function Block({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-14 md:grid-cols-[14rem_1fr] md:gap-10">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{label}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg">{title}</h2>
      </Reveal>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p || !p.featured) notFound();

  const color = accentVar[p.accent] ?? "var(--accent)";
  const i = featuredProjects.findIndex((x) => x.slug === p.slug);
  const prev = featuredProjects[(i - 1 + featuredProjects.length) % featuredProjects.length]!;
  const next = featuredProjects[(i + 1) % featuredProjects.length]!;
  const hasResults = RESULT_SLUGS.has(p.slug);

  return (
    <article className="relative">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-[680px] opacity-60" />
      <div aria-hidden className="absolute -top-40 right-0 -z-10 size-[620px] rounded-full opacity-20 blur-3xl" style={{ background: color }} />

      <header className="mx-auto max-w-6xl px-4 pb-10 pt-32 sm:px-6 sm:pt-36">
        <Link href="/#work" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
          <ArrowLeft width={14} height={14} /> All work
        </Link>
        <p className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span style={{ color }}>{p.category}</span>
          <span className="text-faint">{p.year}</span>
          <span className="text-faint">Case study {String(i + 1).padStart(2, "0")} / {String(featuredProjects.length).padStart(2, "0")}</span>
        </p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-fg sm:text-6xl">
          <WordReveal text={p.title} stagger={0.03} />
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-fg-soft sm:text-xl">{p.tagline}</p>
        </Reveal>
        <Reveal delay={0.3} className="mt-6 flex flex-wrap items-center gap-2">
          {p.status.map((s) => (
            <StatusBadge key={s.label} status={s} />
          ))}
          {p.inBrowser && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] text-fg-soft" title={p.inBrowser}>
              <Browser width={12} height={12} /> runs in your browser
            </span>
          )}
        </Reveal>
        <Reveal delay={0.35} className="mt-8 flex flex-wrap gap-2">
          {p.links.map((l, li) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-transform hover:-translate-y-px ${
                li === 0 ? "bg-fg text-bg" : "border border-line-strong bg-elev/70 text-fg"
              }`}
            >
              {l.label} <ArrowUpRight width={14} height={14} />
            </a>
          ))}
        </Reveal>
        {p.links.some((l) => l.note) && (
          <p className="mt-3 text-[12.5px] text-muted">{p.links.filter((l) => l.note).map((l) => `${l.label}: ${l.note}.`).join(" ")}</p>
        )}
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {p.metrics.map((m) => (
              <div key={m.label} className="flex flex-col bg-elev p-5">
                <dt className="order-2 mt-1 text-[13px] font-medium text-fg-soft">{m.label}</dt>
                <dd className="order-1 text-3xl font-semibold tracking-tight text-fg">
                  <CountUp value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
                </dd>
                {m.context && <dd className="order-3 mt-1 text-[12px] text-muted">{m.context}</dd>}
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="mt-6 min-h-[260px]">
          <ProjectVisual slug={p.slug} />
        </Reveal>

        <div className="mt-10">
          <Block label="01 · Context" title="The problem">
            <p className="max-w-3xl text-pretty text-lg leading-relaxed text-fg-soft">{p.problem}</p>
          </Block>

          <Block label="02 · Contribution" title="What I built">
            <ul className="grid max-w-3xl gap-4">
              {p.highlights.map((h, hi) => (
                <Reveal as="li" key={h} delay={hi * 0.05} className="flex gap-3 text-[16px] leading-relaxed text-fg-soft">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full" style={{ background: color }} />
                  {h}
                </Reveal>
              ))}
            </ul>
          </Block>

          <Block label="03 · Architecture" title="Pipeline, stage by stage">
            <PipelineTimeline stages={p.pipeline} color={color} />
          </Block>

          {hasResults && (
            <Block label="04 · Evidence" title={p.slug === "rbi-rag" ? "Evaluation design" : "Results"}>
              <ProjectResults slug={p.slug} />
            </Block>
          )}

          <Block label="05 · Judgement" title="Decisions & trade-offs">
            <div className="grid gap-4 sm:grid-cols-2">
              {p.decisions.map((d, di) => (
                <Reveal key={d.title} delay={(di % 2) * 0.06} className="rounded-2xl border border-line bg-elev/70 p-5">
                  <h3 className="font-semibold tracking-tight text-fg">{d.title}</h3>
                  <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted">{d.body}</p>
                </Reveal>
              ))}
            </div>
          </Block>

          <Block label="06 · Quality" title="Engineering">
            <dl className="divide-y divide-line rounded-2xl border border-line">
              {p.engineering.map((e) => (
                <div key={e.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{e.label}</dt>
                  <dd className="text-[14.5px] leading-relaxed text-fg-soft">{e.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </Block>

          {p.honesty && (
            <Block label="07 · Status" title="What’s done, what isn’t">
              <div className="rounded-2xl border border-pending/30 bg-pending/5 p-5">
                <p className="text-pretty text-[15px] leading-relaxed text-fg-soft">{p.honesty}</p>
                {p.next && (
                  <ul className="mt-4 grid gap-2">
                    {p.next.map((n) => (
                      <li key={n} className="flex gap-2.5 text-[14px] text-fg-soft">
                        <span className="font-mono text-pending">next →</span> {n}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Block>
          )}
        </div>
      </div>

      <nav aria-label="More case studies" className="mx-auto mt-10 grid max-w-6xl gap-4 px-4 pb-24 sm:grid-cols-2 sm:px-6">
        <Link href={`/projects/${prev.slug}/`} className="group rounded-2xl border border-line bg-elev/60 p-5 transition-colors hover:border-line-strong">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            <ArrowLeft width={12} height={12} /> Previous
          </span>
          <span className="mt-2 block font-medium text-fg">{prev.title}</span>
        </Link>
        <Link href={`/projects/${next.slug}/`} className="group rounded-2xl border border-line bg-elev/60 p-5 text-right transition-colors hover:border-line-strong">
          <span className="flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            Next <ArrowRight width={12} height={12} />
          </span>
          <span className="mt-2 block font-medium text-fg">{next.title}</span>
        </Link>
      </nav>
    </article>
  );
}
