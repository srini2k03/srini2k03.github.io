import { otherProjects } from "@/content/projects";
import { Reveal } from "./motion-primitives";
import { StatusBadge, Tag } from "./ui";
import { ArrowUpRight } from "./icons";

export function MoreProjects() {
  const detailed = otherProjects.filter((p) => p.highlights.length > 0);
  const compact = otherProjects.filter((p) => p.highlights.length === 0);
  return (
    <section id="more-projects" className="relative mx-auto max-w-6xl px-4 pb-8 sm:px-6 md:pb-12" aria-labelledby="more-title">
      <Reveal>
        <h2 id="more-title" className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">+</span> More engineering
        </h2>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        {detailed.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.06} className="flex flex-col rounded-3xl border border-line bg-elev/70 p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                {p.category} · {p.year}
              </span>
              {p.status.map((s) => (
                <StatusBadge key={s.label} status={s} />
              ))}
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-fg">{p.title}</h3>
            <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted">{p.tagline}</p>
            <ul className="mt-4 grid gap-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-[14px] leading-relaxed text-fg-soft">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
            {p.honesty && <p className="mt-3 text-[12.5px] italic text-muted">{p.honesty}</p>}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[13px] text-fg-soft transition-colors hover:border-line-strong hover:text-fg"
                >
                  {l.label} <ArrowUpRight width={13} height={13} />
                </a>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
      {compact.length > 0 && (
        <Reveal className="mt-6">
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {compact.map((p) => (
              <li key={p.slug}>
                <a href={p.links[0]?.href} target="_blank" rel="noopener noreferrer" className="group flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="font-medium text-fg">{p.title}</span>
                  <span className="text-[13.5px] text-muted">{p.tagline}</span>
                  <span className="ml-auto flex items-center gap-2">
                    {p.skills.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                    <ArrowUpRight className="text-faint transition-colors group-hover:text-accent" width={14} height={14} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  );
}
