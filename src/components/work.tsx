"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { featuredProjects, type Project } from "@/content/projects";
import { CountUp, useSpotlight } from "./motion-primitives";
import { PipelineStrip } from "./pipeline";
import { ProjectVisual } from "./project-visual";
import { SectionHeading, StatusBadge, Tag, accentVar } from "./ui";
import { ArrowRight, ArrowUpRight, Browser } from "./icons";

function CaseStudyCard({ p, index }: { p: Project; index: number }) {
  const ref = useSpotlight<HTMLElement>();
  const color = accentVar[p.accent] ?? "var(--accent)";
  const flip = index % 2 === 1;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="spotlight ring-glow group relative overflow-hidden rounded-3xl border border-line bg-elev/70 backdrop-blur-sm"
      aria-labelledby={`cs-${p.slug}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 size-72 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-45"
        style={{ background: color, [flip ? "left" : "right"]: "-6rem" }}
      />
      <div className={`grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:p-10 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-xs text-faint">{String(index + 1).padStart(2, "0")}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color }}>
              {p.category}
            </span>
            <span className="font-mono text-[11px] text-faint">{p.year}</span>
          </div>

          <h3 id={`cs-${p.slug}`} className="mt-4 text-balance text-2xl font-semibold leading-[1.1] tracking-[-0.025em] text-fg sm:text-[2rem]">
            <Link href={`/projects/${p.slug}/`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {p.title}
            </Link>
          </h3>
          <p className="mt-3 text-pretty leading-relaxed text-muted">{p.tagline}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {p.status.map((s) => (
              <StatusBadge key={s.label} status={s} />
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            {p.metrics.map((m) => (
              <div key={m.label} className="flex flex-col bg-elev p-4">
                <dt className="order-2 mt-1 text-[12px] font-medium leading-snug text-fg-soft">{m.label}</dt>
                <dd className="order-1 text-2xl font-semibold tracking-tight text-fg">
                  <CountUp value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
                </dd>
                {m.context && <dd className="order-3 mt-0.5 text-[11px] leading-snug text-muted">{m.context}</dd>}
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-5">
          <div className="min-h-[240px] flex-1">
            <ProjectVisual slug={p.slug} />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Pipeline</p>
            <PipelineStrip stages={p.pipeline} color={color} />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line px-6 py-4 sm:px-8 lg:px-10">
        <div className="hidden flex-wrap gap-1.5 md:flex">
          {p.skills.slice(1, 7).map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
        {p.inBrowser && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted" title={p.inBrowser}>
            <Browser width={13} height={13} /> runs in-browser
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {p.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              title={l.note}
              className="relative inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[13px] text-fg-soft transition-colors hover:border-line-strong hover:text-fg"
            >
              {l.label} <ArrowUpRight width={13} height={13} />
            </a>
          ))}
          <Link
            href={`/projects/${p.slug}/`}
            className="relative inline-flex items-center gap-1.5 rounded-lg bg-fg px-3.5 py-1.5 text-[13px] font-medium text-bg transition-transform hover:-translate-y-px"
          >
            Case study <ArrowRight width={13} height={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export function Work() {
  return (
    <section id="work" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24" aria-labelledby="work-title">
      <SectionHeading
        id="work-title"
        index="01"
        kicker="Selected work"
        title={
          <>
            Five systems, built <span className="font-serif font-normal italic text-accent">end to end</span>.
          </>
        }
        lead="Each one starts with a real problem and ends deployed: an API, an in-browser demo or a scheduled pipeline. Where results are still being measured, the card says so instead of inventing a number."
      />
      <div className="grid gap-8">
        {featuredProjects.map((p, i) => (
          <CaseStudyCard key={p.slug} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}
