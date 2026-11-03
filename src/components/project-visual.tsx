"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { creditRules, olistDelay } from "@/content/charts";

const ease = [0.22, 1, 0.36, 1] as const;

function Frame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-[var(--chart-surface)]">
      <div className="flex-1 p-4 sm:p-5">{children}</div>
      <figcaption className="border-t border-line px-4 py-2.5 font-mono text-[10.5px] leading-snug text-muted sm:px-5">{caption}</figcaption>
    </figure>
  );
}

/** RBI RAG: candidates narrowing through the retrieval stack to a gated answer. */
function RagFunnel() {
  const stages = [
    { label: "corpus-v1 documents", value: "2,153", w: 1 },
    { label: "BM25 ∪ BGE dense candidates", value: "50", w: 0.72 },
    { label: "RRF fused, cross-encoder reranked", value: "20", w: 0.48 },
    { label: "context passed to the LLM", value: "top 5", w: 0.28 },
  ];
  return (
    <Frame caption="Retrieval funnel with default config values (config.py). Answers only if sigmoid(rerank logit) ≥ τ.">
      <div className="flex h-full flex-col justify-center gap-3">
        {stages.map((s, i) => (
          <div key={s.label}>
            <p className="mb-1 flex items-baseline gap-2 text-[11.5px] text-fg-soft">
              <span className="font-mono font-semibold text-fg tabular">{s.value}</span>
              {s.label}
            </p>
            <div className="h-2.5">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: s.w }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.15, ease }}
                className="h-full w-full origin-left rounded-r-[4px] bg-[var(--series-1)]"
                style={{ opacity: 1 - i * 0.14 }}
              />
            </div>
          </div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-2 grid grid-cols-2 gap-2 text-[11px]"
        >
          <div className="rounded-lg border border-line bg-surface px-3 py-2 text-fg-soft">
            <span className="font-mono text-live">conf ≥ τ</span> → answer with <span className="font-mono text-fg">[1][2]</span> citations
          </div>
          <div className="rounded-lg border border-line bg-surface px-3 py-2 text-fg-soft">
            <span className="font-mono text-pending">conf &lt; τ</span> → “I don’t know”
          </div>
        </motion.div>
      </div>
    </Frame>
  );
}

/** Credit: 0.5 default vs cost-optimal threshold on the 6,000-customer holdout. */
function CreditCompare() {
  const base = creditRules.find((r) => r.id === "default")!;
  const best = creditRules.find((r) => r.id === "cost")!;
  const rows = [
    { label: "Expected cost / applicant", a: base.cost, b: best.cost, max: 0.8, fmt: (v: number) => v.toFixed(3) },
    { label: "Default recall", a: base.recall, b: best.recall, max: 1, fmt: (v: number) => `${Math.round(v * 100)}%` },
  ];
  return (
    <Frame caption="Test holdout, n = 6,000 (results/metrics.md). Lower cost is better; costs in units of one false alarm.">
      <div className="flex h-full flex-col justify-center gap-6">
        <div className="flex gap-4 text-[11px] text-fg-soft">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--series-muted)]" /> 0.5 default
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--series-1)]" /> cost-optimal (t = 0.13)
          </span>
        </div>
        {rows.map((r, ri) => (
          <div key={r.label}>
            <p className="mb-2 text-xs text-fg-soft">{r.label}</p>
            {[
              { v: r.a, c: "var(--series-muted)" },
              { v: r.b, c: "var(--series-1)" },
            ].map((bar, bi) => (
              <div key={bi} className="mb-1.5 flex items-center gap-3">
                <div className="h-5 flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(bar.v / r.max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: ri * 0.2 + bi * 0.1, ease }}
                    className="h-full rounded-r-[4px]"
                    style={{ background: bar.c }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs text-fg tabular">{r.fmt(bar.v)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

const POST = `🔥 Hiring!! Sr. Python Developer @ Kaveri Analytics Pvt Ltd
Exp: 4-7 yrs | CTC 18-24 LPA
Loc: Bangalore / Pune (Hybrid)
Must know Django, AWS, PostgreSQL, Docker
B.Tech/B.E. preferred. Call HR 9876543210.`;

const JSON_OUT = `{"company": "Kaveri Analytics", "role": "Python Developer",
 "seniority": "senior",
 "skills": ["python", "django", "aws", "postgresql", "docker"],
 "min_experience_years": 4, "max_experience_years": 7,
 "salary": {"min": 1800000, "max": 2400000, "currency": "INR", "period": "year"},
 "locations": ["Bengaluru", "Pune"], "work_mode": "hybrid",
 "employment_type": null, "education": "b.tech"}`;

/** Job-post extractor: the README's input/target pair, typed out. */
function JsonExtract() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setN((c) => (c >= JSON_OUT.length ? c : c + 3)), 16);
    return () => clearInterval(id);
  }, [inView, reduced]);
  const len = reduced ? JSON_OUT.length : n;
  const shown = JSON_OUT.slice(0, len);
  return (
    <Frame caption="Example input and the target output the model is trained to produce (from the README). Not a model prediction.">
      <div ref={ref} className="grid h-full gap-2 text-[11px] leading-[1.5]">
        <pre className="overflow-hidden whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 font-mono text-fg-soft">{POST}</pre>
        <p aria-hidden className="text-center font-mono text-[10px] text-faint">↓ extract · null when absent ↓</p>
        <pre className="relative overflow-hidden whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 font-mono text-fg" aria-label="Target JSON output">
          {shown.split(/("[^"]*"(?=:)|null)/g).map((part, i) =>
            /^".*"$/.test(part) ? (
              <span key={i} className="text-violet">
                {part}
              </span>
            ) : part === "null" ? (
              <span key={i} className="text-pending">
                null
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
          {len < JSON_OUT.length && <span className="ml-px inline-block h-3 w-1.5 animate-pulse bg-accent align-middle" />}
        </pre>
      </div>
    </Frame>
  );
}

/** Olist: average review score by delivery-delay bucket. */
function DelayMini() {
  const max = 5;
  return (
    <Frame caption="Average review (1–5 stars) by delivery delay, 99,441 orders (results/sql/04_delivery_delay_vs_review.csv).">
      <div className="flex h-full flex-col">
        <div className="mb-3 flex gap-4 text-[11px] text-fg-soft">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--series-muted)]" /> on time or early
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--series-2)]" /> late
          </span>
        </div>
        <div className="flex flex-1 items-end gap-[2px] border-b border-[var(--chart-grid)]" style={{ minHeight: 150 }}>
          {olistDelay.map((d, i) => (
            <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-1 font-mono text-[10px] text-fg-soft tabular">{d.value.toFixed(1)}</span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${(d.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.07, ease }}
                className="w-full max-w-[24px] rounded-t-[4px]"
                style={{ background: d.late ? "var(--series-2)" : "var(--series-muted)" }}
                title={`${d.label}: ${d.value.toFixed(2)} stars`}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-[2px]">
          {olistDelay.map((d) => (
            <span key={d.label} className="flex-1 text-center text-[9px] leading-tight text-muted">
              {d.label.replace(" days", "")}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/** Deepfake: the multi-modal late-fusion architecture. */
function FusionDiagram() {
  const box = "rounded-lg border border-line bg-surface px-2.5 py-2 text-center text-[11.5px] leading-tight text-fg-soft";
  return (
    <Frame caption="Architecture as implemented in backend/deepfake_detector/models. Benchmark training is still pending.">
      <div className="grid h-full grid-cols-[1fr_auto_1.2fr_auto_1fr] items-center gap-2">
        <div className="grid gap-2">
          <div className={box}>32 frames → aligned faces 299²</div>
          <div className={box}>audio → log-mel</div>
        </div>
        <Arrow />
        <div className="grid gap-2">
          <div className={`${box} border-[color-mix(in_srgb,var(--rose)_40%,transparent)]`}>Xception + InceptionV3 → attention pooling</div>
          <div className={box}>3-block audio CNN</div>
        </div>
        <Arrow />
        <div className="grid gap-2">
          <div className={`${box} text-fg`}>
            late fusion
            <br />
            <span className="font-mono text-[10px] text-muted">0.7 · v + 0.3 · a</span>
          </div>
          <div className={box}>Grad-CAM heatmap</div>
        </div>
      </div>
    </Frame>
  );
}

function Arrow() {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden className="text-faint">
      <path d="M0 6h18" stroke="currentColor" strokeWidth="1.5" className="flow-dash" />
      <path d="m15 2 5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ProjectVisual({ slug }: { slug: string }) {
  switch (slug) {
    case "rbi-rag":
      return <RagFunnel />;
    case "credit-default":
      return <CreditCompare />;
    case "jobpost-extractor":
      return <JsonExtract />;
    case "olist-analytics":
      return <DelayMini />;
    case "deepfake-detection":
      return <FusionDiagram />;
    default:
      return null;
  }
}
