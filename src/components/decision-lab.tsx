"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { creditRules } from "@/content/charts";

const metrics = [
  { key: "cost", label: "Expected cost per applicant", better: "lower", fmt: (v: number) => v.toFixed(3), max: 0.8 },
  { key: "recall", label: "Defaulters caught (recall)", better: "higher", fmt: (v: number) => `${(v * 100).toFixed(1)}%`, max: 1 },
  { key: "precision", label: "Precision of declines", better: "higher", fmt: (v: number) => `${(v * 100).toFixed(1)}%`, max: 1 },
  { key: "approval", label: "Approval rate", better: "context", fmt: (v: number) => `${(v * 100).toFixed(1)}%`, max: 1 },
] as const;

const notes: Record<string, string> = {
  default: "The textbook 0.5 cutoff. It approves 88.7% of applicants and misses about two-thirds of defaulters, which is the most expensive choice when a miss costs 5× a false alarm.",
  maxf1: "Maximising F1 balances precision and recall, but F1 does not know a miss costs five times a false alarm, so it still leaves money on the table.",
  cost: "The threshold that minimises expected cost on validation (0.13, next to the Bayes value 1/6 ≈ 0.167). It catches 76.6% of defaulters and cuts expected cost by 25.9% against the 0.5 default.",
};

export function DecisionLab() {
  const [rule, setRule] = useState<(typeof creditRules)[number]["id"]>("cost");
  const sel = creditRules.find((r) => r.id === rule)!;
  const base = creditRules[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
      <div className="flex flex-col gap-5">
        <div role="radiogroup" aria-label="Decision rule" className="relative grid grid-cols-3 rounded-xl border border-line bg-surface p-1">
          {creditRules.map((r) => (
            <button
              key={r.id}
              role="radio"
              aria-checked={rule === r.id}
              onClick={() => setRule(r.id)}
              className={`relative z-10 rounded-lg px-2 py-2 text-[13px] transition-colors ${rule === r.id ? "text-fg" : "text-muted hover:text-fg"}`}
            >
              {rule === r.id && (
                <motion.span layoutId="rule-pill" className="absolute inset-0 -z-10 rounded-lg bg-elev shadow-sm ring-1 ring-line-strong" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
              )}
              {r.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-elev p-5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">Threshold on calibrated P(default)</p>
          <div className="relative mt-6 h-14">
            <div className="absolute inset-x-0 top-4 h-1.5 rounded-full bg-gradient-to-r from-[var(--series-1)] via-[var(--series-muted)] to-[var(--series-2)] opacity-60" />
            <motion.div
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              animate={{ left: `${sel.threshold * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <span className="rounded-md bg-fg px-1.5 py-0.5 font-mono text-[11px] font-semibold text-bg tabular">{sel.threshold.toFixed(2)}</span>
              <span className="h-4 w-0.5 bg-fg" />
            </motion.div>
            <span className="absolute top-10 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-faint" style={{ left: `${(1 / 6) * 100}%` }}>
              ▲ Bayes 1/6
            </span>
          </div>
          <div className="mt-3 flex justify-between font-mono text-[10px] text-faint">
            <span>0 · decline everyone</span>
            <span>1 · approve everyone</span>
          </div>
          <p className="mt-5 text-pretty text-[14px] leading-relaxed text-fg-soft">{notes[rule]}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-[var(--chart-surface)] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-fg">LightGBM champion · 6,000-customer test holdout</p>
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-3 w-0.5 bg-fg/60" /> 0.5 default for reference
          </span>
        </div>
        <div className="grid gap-5">
          {metrics.map((m) => {
            const v = sel[m.key];
            const ref = base[m.key];
            return (
              <div key={m.key}>
                <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                  <span className="text-fg-soft">
                    {m.label}
                    {m.better !== "context" && <span className="ml-1.5 text-[11px] text-faint">({m.better} is better)</span>}
                  </span>
                  <motion.span key={`${rule}-${m.key}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-sm text-fg tabular">
                    {m.fmt(v)}
                  </motion.span>
                </div>
                <div className="relative h-6">
                  <motion.div
                    className="h-full rounded-r-[4px] bg-[var(--series-1)]"
                    animate={{ width: `${(v / m.max) * 100}%` }}
                    transition={{ type: "spring", stiffness: 140, damping: 22 }}
                  />
                  <span className="absolute -top-1 h-8 w-0.5 bg-fg/60" style={{ left: `${(ref / m.max) * 100}%` }} aria-hidden />
                </div>
              </div>
            );
          })}
        </div>
        <details className="mt-5 overflow-x-auto text-[12px] text-muted">
          <summary className="cursor-pointer select-none text-fg-soft">View as table</summary>
          <table className="mt-3 w-full text-left tabular">
            <thead className="text-faint">
              <tr>
                <th className="py-1 font-normal">Rule</th>
                <th className="font-normal">Thr</th>
                <th className="font-normal">Cost</th>
                <th className="font-normal">Recall</th>
                <th className="font-normal">Precision</th>
                <th className="font-normal">Approval</th>
              </tr>
            </thead>
            <tbody className="font-mono text-fg-soft">
              {creditRules.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="py-1.5 font-sans">{r.label}</td>
                  <td>{r.threshold}</td>
                  <td>{r.cost}</td>
                  <td>{r.recall}</td>
                  <td>{r.precision}</td>
                  <td>{r.approval}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2">Source: credit-default-mlops/results/metrics.md (train run at commit d2d7669).</p>
        </details>
      </div>
    </div>
  );
}
