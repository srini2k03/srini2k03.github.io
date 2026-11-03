"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { buildCorpus } from "@/lib/search/corpus";
import { GATE, PortfolioRetriever, type AskResult } from "@/lib/search/engine";
import { DEV_QUERIES, TEST_QUERIES, evaluate } from "@/lib/search/eval";
import { words } from "@/lib/search/tokenize";
import { ArrowRight, Search } from "./icons";

const DEFAULT_QUERY = "Which reranker does the RAG system use?";

const KNOWN_FAILURE = "Best biryani in Bangalore?";

const SUGGESTIONS = [
  DEFAULT_QUERY,
  "How was the credit threshold chosen?",
  "How do you prevent data leakage?",
  "Where did you intern?",
  "Do you know Kubernetes?",
  "Can you recommend a good movie?",
  KNOWN_FAILURE,
];

function Highlight({ text, terms }: { text: string; terms: Set<string> }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, i) => {
        const w = words(p)[0];
        const hit = w && w.length > 2 && [...terms].some((t) => w.startsWith(t) || t.startsWith(w));
        return hit ? (
          <mark key={i} className="rounded bg-accent-soft px-0.5 text-fg">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        );
      })}
    </>
  );
}

function Meter({ label, value, gate }: { label: string; value: number; gate: number }) {
  const pass = value >= gate;
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[10.5px] text-muted">
        <span>{label}</span>
        <span className="text-fg tabular">
          {value.toFixed(2)} <span className="text-faint">/ gate {gate}</span>
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-surface-strong">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pass ? "var(--live)" : "var(--pending)" }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(1, value) * 100}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        />
        <span className="absolute -top-1 h-3.5 w-px bg-fg/70" style={{ left: `${gate * 100}%` }} aria-hidden />
      </div>
    </div>
  );
}

export function AskLab() {
  const retriever = useMemo(() => new PortfolioRetriever(buildCorpus()), []);
  const report = useMemo(() => evaluate(retriever, TEST_QUERIES), [retriever]);
  const [q, setQ] = useState(DEFAULT_QUERY);
  const [res, setRes] = useState<AskResult | null>(() => retriever.ask(DEFAULT_QUERY, 5));
  const [hover, setHover] = useState<string | null>(null);

  const run = (query: string) => {
    setQ(query);
    setRes(retriever.ask(query, 5));
  };

  const terms = useMemo(() => new Set(res?.tokens ?? []), [res]);
  const top = res?.fused[0] ? retriever.byId.get(res.fused[0].id) : undefined;

  const column = (title: string, sub: string, list: AskResult["bm25"], fmt: (s: number) => string) => (
    <div className="min-w-0">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-fg-soft">{title}</p>
      <p className="mb-2 text-[11px] text-faint">{sub}</p>
      <ol className="grid grid-cols-1 gap-1">
        <AnimatePresence initial={false}>
          {list.map((r) => {
            const d = retriever.byId.get(r.id);
            return (
              <motion.li
                layout
                key={r.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                onMouseEnter={() => setHover(r.id)}
                onMouseLeave={() => setHover(null)}
                className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 text-[11.5px] transition-colors ${
                  hover === r.id ? "border-accent bg-accent-soft" : "border-line bg-surface"
                }`}
              >
                <span className="w-4 font-mono text-faint">{r.rank}</span>
                <span className="min-w-0 flex-1 truncate text-fg-soft" title={d?.title}>
                  {d?.title}
                </span>
                <span className="font-mono text-[10.5px] text-muted tabular">{fmt(r.score)}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {list.length === 0 && <li className="rounded-md border border-dashed border-line px-2 py-3 text-center text-[11px] text-faint">no lexical matches</li>}
      </ol>
    </div>
  );

  return (
    <div className="grid min-w-0 gap-6 [&>*]:min-w-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) run(q);
        }}
        className="flex items-center gap-2 rounded-2xl border border-line-strong bg-elev p-2 focus-within:border-accent"
      >
        <Search className="ml-2 shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask anything about my work…"
          aria-label="Ask a question about the portfolio"
          className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-faint focus-visible:outline-none"
        />
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink">
          Retrieve <ArrowRight width={14} height={14} />
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => run(s)}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-fg-soft transition-colors hover:border-line-strong hover:text-fg"
          >
            {s}
            {s === KNOWN_FAILURE && <span className="ml-1.5 rounded bg-pending/15 px-1 font-mono text-[10px] text-pending">known failure</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {res ? (
          <motion.div
            key={res.query}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 [&>*]:min-w-0"
          >
            <div className="rounded-2xl border border-line bg-elev p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
                    res.answered ? "border-live/30 bg-live/10 text-live" : "border-pending/30 bg-pending/10 text-pending"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${res.answered ? "bg-live" : "bg-pending"}`} aria-hidden />
                  {res.answered ? "Answered from sources" : "Refused: I don’t know"}
                </span>
                <span className="font-mono text-[10.5px] text-faint" suppressHydrationWarning>
                  {res.ms.toFixed(1)} ms · in your browser
                </span>
              </div>

              {res.answered && top ? (
                <>
                  <p className="text-[15px] leading-relaxed text-fg">
                    <Highlight text={top.text} terms={terms} /> <sup className="font-mono text-[10px] text-accent">[1]</sup>
                  </p>
                  <ol className="mt-5 grid gap-2 border-t border-line pt-4">
                    {res.fused.slice(0, 3).map((r, i) => {
                      const d = retriever.byId.get(r.id);
                      if (!d) return null;
                      return (
                        <li key={r.id} className="flex items-start gap-2 text-[12.5px]">
                          <span className="font-mono text-accent">[{i + 1}]</span>
                          <Link href={d.href} className="text-fg-soft underline decoration-line-strong underline-offset-2 hover:text-fg">
                            {d.title}
                          </Link>
                          <span className="ml-auto shrink-0 font-mono text-[10.5px] text-faint">{d.sourceLabel}</span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <p className="text-[15px] leading-relaxed text-fg-soft">
                  Nothing in my portfolio supports an answer, so the system declines rather than guessing.{" "}
                  <span className="text-muted">{res.reason}</span>
                </p>
              )}

              {res.query === KNOWN_FAILURE && (
                <p className="mt-4 rounded-lg border border-pending/30 bg-pending/5 p-3 text-[12.5px] leading-relaxed text-fg-soft">
                  <span className="font-medium text-pending">Known failure, kept on purpose.</span> “Best” and “Bangalore” both appear in my
                  portfolio, so a purely lexical gate lets this through. Word overlap can’t tell whether a question is on topic, which is why the
                  RBI system gates on a cross-encoder relevance score instead.
                </p>
              )}

              <div className="mt-5 grid gap-3 border-t border-line pt-4">
                <Meter label="query-term coverage" value={res.coverage} gate={GATE.minCoverage} />
                <Meter label="top char-trigram cosine" value={res.similarity} gate={GATE.minSimilarity} />
              </div>
            </div>

            <div className="grid gap-5 rounded-2xl border border-line bg-elev p-5 md:grid-cols-3">
              {column("BM25", "word-level, k1 1.2 · b 0.75", res.bm25, (s) => s.toFixed(2))}
              {column("Char 3-gram", "TF-IDF cosine, typo-tolerant", res.ngram, (s) => s.toFixed(2))}
              {column("RRF fused", "Σ 1 / (60 + rank)", res.fused, (s) => s.toFixed(4))}
            </div>
          </motion.div>
        ) : (
          <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
            Pick a question above, including one I should refuse, to see both retrievers, the fused ranking and the gate decision.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid gap-4 rounded-2xl border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
        <p className="text-[13px] leading-relaxed text-muted">
          <span className="font-medium text-fg">Evaluated live in your browser</span> on {report.n} held-out, hand-labelled questions ({report.answerable}{" "}
          answerable, {report.n - report.answerable} out of scope). The gate thresholds were tuned on a separate {DEV_QUERIES.length}-question dev split,
          so these numbers were not tuned on themselves. The set is small, so read them as a sanity check, not a benchmark. Retrieval here is lexical only
          (no LLM, no embeddings) to keep the page fast; the{" "}
          <Link href="/projects/rbi-rag/" className="text-fg underline decoration-line-strong underline-offset-2">
            RBI RAG system
          </Link>{" "}
          runs the full dense and reranker stack.
        </p>
        <dl className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4 md:min-w-[22rem]">
          {[
            { k: "Recall@3", v: `${Math.round(report.recallAt3 * 100)}%` },
            { k: "MRR", v: report.mrr.toFixed(2) },
            { k: "Refusal P", v: `${Math.round(report.refusalPrecision * 100)}%` },
            { k: "Refusal R", v: `${Math.round(report.refusalRecall * 100)}%` },
          ].map((m) => (
            <div key={m.k} className="flex flex-col">
              <dt className="order-2 font-mono text-[10px] uppercase tracking-wider text-faint">{m.k}</dt>
              <dd className="order-1 text-xl font-semibold text-fg tabular">{m.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
