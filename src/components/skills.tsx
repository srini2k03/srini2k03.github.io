"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { evidenceFor, skillGroups } from "@/content/skills";
import { SectionHeading } from "./ui";

const marquee = [
  "transformers.js in the browser",
  "BM25 + BGE + RRF",
  "Cross-encoder reranking",
  "LoRA / TRL SFT",
  "GGUF Q4_K_M",
  "MLflow registry gates",
  "Evidently drift",
  "Optuna TPE",
  "Isotonic calibration",
  "SHAP per prediction",
  "DuckDB ⇄ PostgreSQL",
  "Bootstrap CIs",
  "Cliff's δ",
  "SRM checks",
  "Docker · FastAPI",
  "GitHub Actions",
];

export function Skills() {
  const [selected, setSelected] = useState<string | null>("RAG");
  const evidence = selected ? evidenceFor(selected) : [];

  return (
    <section id="skills" className="relative py-20 md:py-24" aria-labelledby="skills-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="skills-title"
          index="05"
          kicker="Skills, with receipts"
          title={
            <>
              A skills list you can <span className="font-serif font-normal italic text-accent">audit</span>.
            </>
          }
          lead="Click any skill to see which projects actually use it. The mapping comes from each project’s stack, not from a list of keywords."
        />
      </div>

      <div className="mask-fade-x mb-14 overflow-hidden border-y border-line py-4" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-10 font-mono text-sm text-muted">
              {m} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-7">
          {skillGroups.map((g) => (
            <div key={g.name}>
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{g.name}</h3>
              <div className="flex flex-wrap gap-2">
                {g.skills.map((s) => {
                  const n = evidenceFor(s).length;
                  const on = selected === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelected(on ? null : s)}
                      aria-pressed={on}
                      className={`group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] transition-all ${
                        on ? "border-accent bg-accent-soft text-fg" : "border-line bg-surface text-fg-soft hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      {s}
                      {n > 0 && (
                        <span className={`rounded px-1 font-mono text-[10px] ${on ? "bg-accent text-accent-ink" : "bg-surface-strong text-muted"}`}>{n}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-elev/70 p-6" aria-live="polite">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Evidence</p>
            <AnimatePresence mode="wait">
              <motion.div key={selected ?? "none"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {!selected ? (
                  <p className="mt-3 text-sm text-muted">Select a skill.</p>
                ) : evidence.length === 0 ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    <span className="font-medium text-fg">{selected}</span> is on my résumé but is not part of the projects featured on this site.
                  </p>
                ) : (
                  <>
                    <p className="mt-3 text-lg font-semibold text-fg">
                      {selected} <span className="font-normal text-muted">· {evidence.length} project{evidence.length > 1 ? "s" : ""}</span>
                    </p>
                    <ul className="mt-4 grid gap-2">
                      {evidence.map((p) => (
                        <li key={p.slug}>
                          {p.featured ? (
                            <Link href={`/projects/${p.slug}/`} className="flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg-soft transition-colors hover:border-line-strong hover:text-fg">
                              <span>{p.short}</span>
                              <span className="font-mono text-[11px] text-faint">{p.year}</span>
                            </Link>
                          ) : (
                            <a href={p.links[0]?.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg-soft transition-colors hover:border-line-strong hover:text-fg">
                              <span>{p.short}</span>
                              <span className="font-mono text-[11px] text-faint">{p.year}</span>
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
