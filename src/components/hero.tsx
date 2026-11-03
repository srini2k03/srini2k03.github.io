"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EmbeddingCanvas } from "./embedding-canvas";
import { CountUp, Magnetic, WordReveal } from "./motion-primitives";
import { ArrowDown, FileText, GitHub, Spark } from "./icons";
import { profile } from "@/content/profile";
import { proof } from "@/content/projects";
import { resumePdf } from "@/lib/site";

function RoleRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % profile.roles.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex h-[1.5em] min-w-[16ch] items-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={profile.roles[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 whitespace-nowrap font-medium text-fg"
        >
          {profile.roles[i]}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{profile.roles.join(", ")}</span>
    </span>
  );
}

const stats = [
  { value: proof.endToEnd, label: "end-to-end ML systems, each with code and docs" },
  { value: Math.floor(proof.testsApprox / 50) * 50, suffix: "+", label: "automated tests across my repos" },
  { value: proof.ciWorkflows, label: "GitHub Actions workflows: CI, training, eval, deploy" },
  { value: proof.inBrowserCount, label: "projects running ML directly in your browser" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-28 sm:pt-32" aria-labelledby="hero-title">
      <div className="bg-grid mask-fade-b absolute inset-0 -z-10 opacity-70" aria-hidden />
      <div
        aria-hidden
        className="absolute -right-40 top-10 -z-10 size-[560px] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-2xl"
      />
      <EmbeddingCanvas className="-z-10 opacity-40 md:opacity-90" />
      <div aria-hidden className="absolute inset-y-0 left-0 -z-10 hidden w-[55%] bg-gradient-to-r from-bg via-bg/70 to-transparent md:block" />

      <motion.div style={{ y, opacity }} className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 sm:px-6">
        <motion.a
          href="#contact"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-elev/60 px-3 py-1.5 text-xs text-fg-soft backdrop-blur transition-colors hover:border-line-strong"
        >
          <span className="pulse-dot size-2 rounded-full bg-live" aria-hidden />
          Open to full-time roles · Bangalore, India
        </motion.a>

        <h1 id="hero-title" className="max-w-4xl text-[clamp(2.6rem,8vw,6.4rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-fg">
          <WordReveal text="Srinivasan" />
          <br />
          <WordReveal text="Balasubramanian" delay={0.08} className="text-fg/90" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-7 max-w-2xl text-balance text-xl leading-snug text-fg-soft sm:text-2xl"
        >
          I build ML systems that <span className="font-serif text-[1.15em] italic text-fg">ship</span>,{" "}
          <span className="font-serif text-[1.15em] italic text-fg">measure themselves</span>, and know when to say{" "}
          <span className="whitespace-nowrap rounded-md bg-accent-soft px-1.5 font-serif text-[1.15em] italic text-accent">“I don’t know.”</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-5 flex flex-wrap items-center gap-x-2 text-sm text-muted sm:text-base"
        >
          <span>Applying for</span>
          <RoleRotator />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)] transition-transform hover:-translate-y-0.5"
            >
              See the case studies
              <ArrowDown className="transition-transform group-hover:translate-y-0.5" />
            </a>
          </Magnetic>
          <a
            href="#lab"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-elev/60 px-5 py-3 text-sm font-medium text-fg backdrop-blur transition-colors hover:bg-surface-strong"
          >
            <Spark /> Ask my portfolio
          </a>
          <a href={resumePdf} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-fg-soft transition-colors hover:text-fg">
            <FileText /> Résumé
          </a>
          <a href={profile.github} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-fg-soft transition-colors hover:text-fg">
            <GitHub /> GitHub
          </a>
        </motion.div>

        <p className="pointer-events-none mt-6 hidden font-mono text-[11px] text-faint md:block" aria-hidden>
          ↗ move your cursor: you are the query vector, retrieving its 6 nearest neighbours
        </p>
      </motion.div>

      <motion.dl
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative mx-auto mt-14 grid w-full max-w-6xl grid-cols-2 border-t border-line px-4 sm:px-6 md:grid-cols-4"
      >
        {stats.map((s, i) => (
          <div key={s.label} className={`flex flex-col py-6 pr-4 ${i > 0 ? "md:border-l md:border-line md:pl-6" : ""} ${i % 2 === 1 ? "border-l border-line pl-4 md:pl-6" : ""}`}>
            <dt className="order-2 mt-1 text-xs leading-snug text-muted">{s.label}</dt>
            <dd className="order-1 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              <CountUp value={s.value} suffix={s.suffix} />
            </dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}
