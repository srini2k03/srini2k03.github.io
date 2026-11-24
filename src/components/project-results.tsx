"use client";

import { abaloneCv, creditLoad, creditModels, creditShap, jobpostApproaches, jobpostReal, olistDelay, olistPeeking, olistSegments, rbiAblation, rbiGeneration, rbiStrategies } from "@/content/charts";
import { AblationGrid, BarList, ChartCard, LogLine, PairedBars } from "./charts";
import { DecisionLab } from "./decision-lab";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function Table({ head, rows, highlight }: { head: string[]; rows: (string | number)[][]; highlight?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[13px] tabular">
        <thead>
          <tr className="text-faint">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-4 font-mono text-[10.5px] font-normal uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-line ${i === highlight ? "bg-accent-soft" : ""}`}>
              {r.map((c, j) => (
                <td key={j} className={`py-2.5 pr-4 ${j === 0 ? "text-fg" : "font-mono text-fg-soft"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectResults({ slug }: { slug: string }) {
  switch (slug) {
    case "credit-default":
      return (
        <div className="grid gap-6 [&>*]:min-w-0">
          <DecisionLab />
          <ChartCard title="Model comparison on the test holdout" subtitle="n = 6,000 · each family calibrated and at its own cost-optimal threshold from validation" source="results/metrics.json">
            <Table
              head={["Model", "ROC-AUC", "PR-AUC", "Brier (raw → calibrated)", "Cost / applicant", "Recall"]}
              rows={creditModels.map((m) => [m.model, m.rocAuc.toFixed(4), m.prAuc.toFixed(4), `${m.brierRaw.toFixed(4)} → ${m.brier.toFixed(4)}`, m.cost.toFixed(4), pct(m.recall)])}
              highlight={2}
            />
            <p className="mt-3 text-[12.5px] text-muted">
              The tree families overlap within their bootstrap intervals. LightGBM had the lowest validation cost, which is the selection rule; CatBoost was compared but is not a deployable dependency.
            </p>
          </ChartCard>
          <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <ChartCard
              title="What drives the prediction"
              subtitle="Mean |SHAP| value, top 10 features"
              source="results/figures/shap_importance.csv"
              table={{ head: ["Feature", "Mean |SHAP|"], rows: creditShap.map((s) => [s.label, s.value]) }}
            >
              <BarList data={creditShap} format={(v) => v.toFixed(3)} />
            </ChartCard>
            <ChartCard title="Load test" subtitle="Locust, 20 users, 60 s, API in Docker on a CI runner · 7,023 requests, 0 failures" source="results/loadtest.md">
              <Table head={["Endpoint", "RPS", "p50", "p95", "p99"]} rows={creditLoad.map((l) => [l.endpoint, l.rps, `${l.p50} ms`, `${l.p95} ms`, `${l.p99} ms`])} />
            </ChartCard>
          </div>
        </div>
      );
    case "olist-analytics":
      return (
        <div className="grid gap-6 [&>*]:min-w-0">
          <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <ChartCard
              title="Late deliveries crush review scores"
              subtitle="Average review (1–5) by delivery delay bucket"
              source="results/sql/04_delivery_delay_vs_review.csv"
              table={{ head: ["Bucket", "Avg review", "Share of orders"], rows: olistDelay.map((d) => [d.label, d.value, pct(d.share)]) }}
            >
              <BarList data={olistDelay.map((d) => ({ label: d.label, value: d.value, baseline: !d.late }))} format={(v) => v.toFixed(2)} max={5} color="var(--series-2)" />
              <p className="mt-3 text-[12.5px] text-muted">Grey: on time or early. Orange: late. Late orders average 2.27 vs 4.29 on time (Cliff’s δ −0.64, large).</p>
            </ChartCard>
            <ChartCard
              title="12% of customers, 39% of revenue"
              subtitle="K-Means segments on RFM features (k = 5)"
              source="results/metrics/segments.json"
              table={{ head: ["Segment", "Customers", "Revenue"], rows: olistSegments.map((s) => [s.label, pct(s.customers), pct(s.revenue)]) }}
            >
              <PairedBars data={olistSegments.map((s) => ({ label: s.label, a: s.customers, b: s.revenue }))} aLabel="share of customers" bLabel="share of revenue" format={pct} />
            </ChartCard>
          </div>
          <ChartCard
            title="Why you shouldn’t peek at an A/B test"
            subtitle="Simulated false-positive rate when checking for significance repeatedly (nominal α = 5%)"
            source="results/metrics/stats.json"
            table={{ head: ["Looks", "False-positive rate"], rows: olistPeeking.map((p) => [p.looks, pct(p.fpr)]) }}
          >
            <LogLine data={olistPeeking.map((p) => ({ x: p.looks, y: p.fpr }))} refY={0.05} refLabel="α = 5%" xLabel="number of interim looks (log scale)" format={pct} />
          </ChartCard>
        </div>
      );
    case "jobpost-extractor":
      return (
        <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <ChartCard
            title="Real job postings"
            subtitle="130 real Indian postings from 4 licence-checked public sources · AI-assisted labels, not human-verified"
            source="results/metrics/*__test_real.json"
            table={{ head: ["Approach", "Micro-F1 %", "Hallucinated fields %"], rows: jobpostReal.map((a) => [a.label, a.f1, a.halluc]) }}
          >
            <BarList data={jobpostReal.map((a) => ({ label: a.label, value: a.f1, baseline: !a.ours }))} format={(v) => v.toFixed(1)} max={100} />
            <p className="mt-3 text-[12.5px] text-muted">
              Real text is much harder than the synthetic set (99.3% → 56.1%). The fine-tune matches a 6× larger 3B model on micro-F1 with a quarter of its hallucinations (7.9% vs 30.3%). Regex leads on micro-F1 only because list items dominate it; on role and company it trails badly (52% vs 82%, 34% vs 81%).
            </p>
          </ChartCard>
          <ChartCard
            title="Micro-F1 by approach"
            subtitle="Synthetic test split (n = 471; API and grammar rows on a fixed 200-post subset)"
            source="results/results_table.md"
            table={{ head: ["Approach", "Micro-F1 %", "Hallucinated fields %", "n"], rows: jobpostApproaches.map((a) => [a.label, a.f1, a.halluc, a.n]) }}
          >
            <BarList data={jobpostApproaches.map((a) => ({ label: a.label, value: a.f1, baseline: !a.ours }))} format={(v) => v.toFixed(1)} max={100} />
            <p className="mt-3 text-[12.5px] text-muted">
              Hallucinated fields (filled in when they should be null): base 0.5B 67.1%, regex 2.5%, LoRA 1.9%, GPT-OSS-120B 1.0%. On synthetic posts the fine-tune wins on F1; the 120B model still guesses slightly less.
            </p>
          </ChartCard>
          <ChartCard title="Dataset, by construction" subtitle="Splits are disjoint by template family and company" source="data/processed/stats.json">
            <Table
              head={["Split", "Examples", "Distinct companies"]}
              rows={[
                ["train", "2,177", "260"],
                ["val", "352", "60"],
                ["test_synth", "471", "80"],
              ]}
            />
            <p className="mt-3 text-[12.5px] text-muted">3,000 generated · 0 failed the recoverability check · 0 near-duplicates removed · leakage check passed.</p>
          </ChartCard>
        </div>
      );
    case "rbi-rag":
      return (
        <div className="grid gap-6 [&>*]:min-w-0">
          <ChartCard
            title="Retrieval strategies vs BM25"
            subtitle="Chunk nDCG@10 on the test split (130 answerable questions); every strategy tuned on dev only"
            source="results/benchmark/strategies.csv"
            table={{ head: ["Strategy", "nDCG@10"], rows: rbiStrategies.map((d) => [d.label, d.value.toFixed(3)]) }}
          >
            <BarList data={rbiStrategies.map((d) => ({ label: d.label, value: d.value, baseline: !("served" in d) }))} format={(v) => v.toFixed(3)} max={0.8} />
            <p className="mt-4 text-[12.5px] text-muted">
              Paired randomisation tests with Holm correction: the original RRF hybrid + rerank is 0.172 below BM25 (p = 0.002), and no strategy beats BM25 significantly. The served profile ranks with BM25 and uses the cross-encoder only to decide whether to answer.
            </p>
          </ChartCard>
          <ChartCard
            title="The 36-configuration retrieval ablation"
            subtitle="Chunk-level nDCG@10 on the test split: 130 answerable questions from notifications never used for tuning"
            source="results/retrieval_ablation.csv"
            table={{
              head: ["Mode", "Chunker", "Size", "nDCG@10", "Doc Recall@5"],
              rows: rbiAblation.map((d) => [d.mode, d.chunker, d.size, d.ndcg10, d.docRecall5]),
            }}
          >
            <AblationGrid data={rbiAblation} />
            <p className="mt-4 text-[12.5px] text-muted">
              Plain BM25 on 512-token fixed chunks scored best (0.70). Dense retrieval alone was weakest everywhere, and adding the cross-encoder reranker did not beat BM25 on this corpus, whose questions reuse the exact regulatory wording.
            </p>
          </ChartCard>
          <ChartCard
            title="Answer quality"
            subtitle="Best retrieval configuration; answers judged by a local Qwen2.5-7B, with an NLI model as a second, stricter check"
            source="results/generation.md"
          >
            <Table
              head={["Generator · retrieval", "n", "Faithful (judge)", "Faithful (NLI)", "Relevance", "Refusal P / R"]}
              rows={rbiGeneration.map((g) => [g.label, String(g.n), g.faithJudge.toFixed(2), g.faithNli.toFixed(2), g.relevance.toFixed(2), `${g.refusalP.toFixed(2)} / ${g.refusalR.toFixed(2)}`])}
            />
            <p className="mt-3 text-[12.5px] text-muted">
              The NLI check is low mainly because the NLI model truncates passages at 512 tokens (86% are longer); checking each claim against passage windows gives 0.70–0.73. The test set is model-generated with 50 pairs AI-reviewed and none human-verified yet.
            </p>
          </ChartCard>
        </div>
      );
    case "abalone-regression":
      return (
        <ChartCard
          title="Cross-validated RMSLE by model"
          subtitle="Repeated K-fold 5×2, lower is better"
          source="README.md · web/data/results.json"
          table={{ head: ["Model", "CV RMSLE"], rows: abaloneCv.map((a) => [a.label, a.value]) }}
        >
          <BarList data={abaloneCv} format={(v) => v.toFixed(4)} />
        </ChartCard>
      );
    default:
      return null;
  }
}
