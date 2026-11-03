import { profile } from "@/content/profile";
import { Reveal } from "./motion-primitives";

const facts = [
  { k: "Focus", v: "Retrieval & LLM systems, MLOps, applied statistics" },
  { k: "Education", v: `B.E. Information Science, ${profile.education.school} · ${profile.education.grade}` },
  { k: "Experience", v: "Software Intern (AI/ML), AIMPLIFY · 2024" },
  { k: "Based in", v: profile.location },
  { k: "Now", v: "Daily RAG evaluation runs and CPU LoRA training, both scheduled in GitHub Actions" },
];

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 md:pb-12 md:pt-28" aria-label="About">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
        <div>
          <Reveal>
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              <span className="text-accent">00</span> · About
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="text-balance text-2xl font-medium leading-[1.25] tracking-[-0.02em] text-fg sm:text-[2.1rem]">
              Most ML projects stop at a notebook. Mine stop at a{" "}
              <span className="font-serif italic text-accent">deployed endpoint</span>, a{" "}
              <span className="font-serif italic text-accent">browser demo</span> or a{" "}
              <span className="font-serif italic text-accent">CI gate</span>, and every number on this site comes from a file committed in that project’s repository.
            </p>
          </Reveal>
          {profile.about.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.05}>
              <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-muted">{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15}>
          <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elev/60 backdrop-blur">
            {facts.map((f) => (
              <div key={f.k} className="grid grid-cols-[6.5rem_1fr] gap-3 px-5 py-4 text-sm">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{f.k}</dt>
                <dd className="text-fg-soft">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
