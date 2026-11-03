import { experience, profile } from "@/content/profile";
import { Reveal } from "./motion-primitives";
import { SectionHeading, Tag } from "./ui";
import { ArrowUpRight } from "./icons";

export function Experience() {
  const ed = profile.education;
  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24" aria-labelledby="exp-title">
      <SectionHeading id="exp-title" index="04" kicker="Experience & education" title="Where I’ve learned it." />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {experience.map((e) => (
          <Reveal key={e.company} className="rounded-3xl border border-line bg-elev/70 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-fg">{e.role}</h3>
                <p className="mt-1 text-fg-soft">
                  {e.company} · <span className="text-muted">{e.location}</span>
                </p>
              </div>
              <span className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted">{e.period}</span>
            </div>
            <ul className="mt-6 grid gap-4">
              {e.points.map((pt, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-fg-soft">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  {pt}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {e.stack.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </Reveal>
        ))}

        <div className="grid gap-6">
          <Reveal delay={0.08} className="rounded-3xl border border-line bg-elev/70 p-6 sm:p-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Education</p>
            <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-fg">{ed.school}</h3>
            <p className="mt-1 text-[15px] leading-snug text-fg-soft">{ed.degree}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-xs font-semibold text-accent">{ed.grade}</span>
              <span className="font-mono text-[11px] text-muted">{ed.period}</span>
            </div>
          </Reveal>
          <Reveal delay={0.14} className="rounded-3xl border border-line bg-elev/70 p-6 sm:p-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Certifications</p>
            <ul className="mt-3 grid gap-3">
              {profile.certifications.map((c) => (
                <li key={c.name}>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-[15px] font-medium leading-snug text-fg group-hover:underline">{c.name}</span>
                      <span className="text-[13px] text-muted">{c.issuer}</span>
                    </span>
                    <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted group-hover:text-accent">
                      verify <ArrowUpRight width={12} height={12} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
