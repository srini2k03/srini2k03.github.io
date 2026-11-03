"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { profile } from "@/content/profile";
import { resumePdf } from "@/lib/site";
import { Check, Copy, FileText, GitHub, Mail, Phone, Pin } from "./icons";
import { Magnetic, Reveal } from "./motion-primitives";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line" aria-labelledby="contact-title">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 size-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-4 py-28 text-center sm:px-6 md:py-36">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="text-accent">06</span> · Contact
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="contact-title" className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1] tracking-[-0.04em] text-fg sm:text-6xl md:text-7xl">
            Let’s build something that <span className="font-serif font-normal italic text-accent">ships</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted">
            I’m looking for {profile.roles.slice(0, 2).join(", ")} or {profile.roles[2]} roles. The fastest way to reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-4 text-base font-semibold text-accent-ink shadow-[0_16px_50px_-14px_var(--accent)] transition-transform hover:-translate-y-0.5"
            >
              <Mail width={18} height={18} /> {profile.email}
            </a>
          </Magnetic>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-elev/70 px-5 py-4 text-sm font-medium text-fg backdrop-blur transition-colors hover:bg-surface-strong"
            aria-live="polite"
          >
            <motion.span key={copied ? "y" : "n"} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              {copied ? <Check className="text-live" /> : <Copy />}
            </motion.span>
            {copied ? "Copied" : "Copy email"}
          </button>
        </Reveal>

        <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-fg-soft">
          <a href={profile.phoneHref} className="inline-flex items-center gap-2 hover:text-fg">
            <Phone /> {profile.phone}
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-fg">
            <GitHub /> github.com/{profile.githubHandle}
          </a>
          <a href={resumePdf} className="inline-flex items-center gap-2 hover:text-fg">
            <FileText /> Résumé (PDF)
          </a>
          <span className="inline-flex items-center gap-2 text-muted">
            <Pin /> {profile.location}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
