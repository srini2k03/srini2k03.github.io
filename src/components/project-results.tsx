"use client";

import { abaloneCv, creditLoad, creditModels, creditShap, jobpostFields, olistDelay, olistPeeking, olistSegments } from "@/content/charts";
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
          <ChartCard title="Model comparison on the test holdout" subtitle="n = 6,000 · each model at its own cost-optimal threshold from validation" source="results/metrics.md">
            <Table
              head={["Model", "ROC-AUC", "PR-AUC", "Brier (raw → calibrated)", "Cost / applicant", "Recall"]}
              rows={creditModels.map((m) => [m.model, m.rocAuc.toFixed(4), m.prAuc.toFixed(4), `${m.brierRaw.toFixed(4)} → ${m.brier.toFixed(4)}`, m.cost.toFixed(4), pct(m.recall)])}
              highlight={1}
            />
            <p className="mt-3 text-[12.5px] text-muted">
              XGBoost has a slightly higher ROC-AUC, but LightGBM had the lowest cost on validation, and cost is the selection criterion.
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
            <ChartCard title="Load test" subtitle="Locust, 20 users, 60 s, API in Docker on a CI runner · 5,543 requests, 0 failures" source="results/loadtest.md">
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
            title="The bar to beat: regex baseline"
            subtitle="Field-level exact match on test_synth (n = 471); fields not shown score 100.0"
            source="results/metrics/regex_baseline__test_synth.json"
            table={{ head: ["Field", "Exact match"], rows: jobpostFields.map((f) => [f.label, f.value]) }}
          >
            <BarList data={jobpostFields} format={(v) => v.toFixed(1)} max={100} />
            <p className="mt-3 text-[12.5px] text-muted">
              Micro-F1 93.1 [92.5, 93.8], macro-F1 90.8, hallucination rate 2.5%. Company and role are where rules break down, which is where a fine-tuned model has to win.
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
        <ChartCard
          title="The 36-configuration retrieval ablation"
          subtitle="4 retrieval modes × 3 chunkers × 3 chunk sizes, each scored on Recall@k, MRR and nDCG with bootstrap CIs"
          source="eval/ablate.py · .github/workflows/evaluate.yml"
        >
          <AblationGrid />
          <p className="mt-4 text-[12.5px] text-muted">
            Dashed cells are scheduled runs. They fill in when the daily evaluation workflow commits results; no numbers are shown until then.
          </p>
        </ChartCard>
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
