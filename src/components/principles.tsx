"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { principles } from "@/content/profile";
import { projectBySlug } from "@/content/projects";
import { SectionHeading } from "./ui";
import { ArrowUpRight } from "./icons";

function PrincipleRow({ p, i }: { p: (typeof principles)[number]; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [14, 0]);

  return (
    <motion.li ref={ref} style={{ opacity, x }} className="grid gap-4 border-t border-line py-10 md:grid-cols-[5rem_1fr_1fr] md:gap-8">
      <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
      <div>
        <h3 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-fg sm:text-3xl">{p.title}</h3>
        <p className="mt-3 text-pretty leading-relaxed text-muted">{p.body}</p>
      </div>
      <ul className="grid content-start gap-2">
        {p.evidence.map((e) => {
          const proj = projectBySlug(e.project);
          return (
            <li key={e.text}>
              <Link
                href={`/projects/${e.project}/`}
                className="group flex items-start gap-3 rounded-xl border border-line bg-elev/60 p-3.5 transition-colors hover:border-line-strong"
              >
                <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">evidence</span>
                <span className="flex-1 text-[13.5px] leading-snug text-fg-soft">
                  {e.text}
                  <span className="mt-1 block font-mono text-[11px] text-muted">{proj?.short}</span>
                </span>
                <ArrowUpRight className="mt-0.5 text-faint transition-colors group-hover:text-accent" width={14} height={14} />
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.li>
  );
}

export function Principles() {
  return (
    <section id="principles" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24" aria-labelledby="principles-title">
      <SectionHeading
        id="principles-title"
        index="03"
        kicker="How I work"
        title={
          <>
            Five habits that separate a model from a <span className="font-serif font-normal italic text-accent">system</span>.
          </>
        }
        lead="These are not slogans. Each one is a pattern that shows up in my repositories, with a link to where."
      />
      <ol className="border-b border-line">
        {principles.map((p, i) => (
          <PrincipleRow key={p.id} p={p} i={i} />
        ))}
      </ol>
    </section>
  );
}
