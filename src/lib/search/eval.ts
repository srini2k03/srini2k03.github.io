import { GATE, type Gate, type PortfolioRetriever } from "./engine";

/** expected: the source that should appear in the top-k, or null when the system should refuse. */
export interface LabelledQuery {
  q: string;
  expected: string | null;
}

/** Used only to choose GATE values. */
export const DEV_QUERIES: LabelledQuery[] = [
  { q: "which reranker model do you use", expected: "rbi-rag" },
  { q: "how do you stop the RAG from hallucinating", expected: "rbi-rag" },
  { q: "cost optimal threshold credit default", expected: "credit-default" },
  { q: "mlflow promotion gate", expected: "credit-default" },
  { q: "drift detection retraining", expected: "credit-default" },
  { q: "lora rank and alpha", expected: "jobpost-extractor" },
  { q: "minhash deduplication", expected: "jobpost-extractor" },
  { q: "late deliveries review score", expected: "olist-analytics" },
  { q: "free shipping ab test", expected: "olist-analytics" },
  { q: "grad-cam explanations", expected: "deepfake-detection" },
  { q: "audio spectrogram cnn", expected: "deepfake-detection" },
  { q: "where did you intern", expected: "experience" },
  { q: "what is your cgpa", expected: "education" },
  { q: "android offline sync", expected: "e-challan-android" },
  { q: "rmsle abalone", expected: "abalone-regression" },
  { q: "recipe for chocolate cake", expected: null },
  { q: "who won the football world cup", expected: null },
  { q: "weather in mumbai tomorrow", expected: null },
  { q: "favourite movie", expected: null },
  { q: "kubernetes helm operator", expected: null },
  { q: "zxqv plorb", expected: null },
  { q: "do you know kubernetes", expected: null },
  { q: "are you familiar with rust", expected: null },
  { q: "do you know mlflow", expected: "credit-default" },
];

/** Held out: reported in the UI, never used for tuning. */
export const TEST_QUERIES: LabelledQuery[] = [
  { q: "what embedding model and vector database", expected: "rbi-rag" },
  { q: "reciprocal rank fusion", expected: "rbi-rag" },
  { q: "does it refuse out of scope questions", expected: "rbi-rag" },
  { q: "lightgbm roc auc holdout", expected: "credit-default" },
  { q: "load test latency p95", expected: "credit-default" },
  { q: "shap explanations per prediction api", expected: "credit-default" },
  { q: "qwen fine tuning completion only loss", expected: "jobpost-extractor" },
  { q: "regex baseline f1", expected: "jobpost-extractor" },
  { q: "hinglish whatsapp job posts", expected: "jobpost-extractor" },
  { q: "duckdb postgres sql window functions", expected: "olist-analytics" },
  { q: "customer segmentation revenue share", expected: "olist-analytics" },
  { q: "peeking false positives", expected: "olist-analytics" },
  { q: "xception inceptionv3 ensemble", expected: "deepfake-detection" },
  { q: "attention pooling over video frames", expected: "deepfake-detection" },
  { q: "flask api llm prompt benchmarking internship", expected: "experience" },
  { q: "which college did you study at", expected: "education" },
  { q: "jetpack compose kotlin", expected: "e-challan-android" },
  { q: "xgboost in the browser parity", expected: "abalone-regression" },
  { q: "how to bake sourdough bread", expected: null },
  { q: "cricket scores today", expected: null },
  { q: "stock price prediction for tesla", expected: null },
  { q: "translate hello into french", expected: null },
  { q: "blockchain smart contracts solidity", expected: null },
  { q: "best hiking trails nearby", expected: null },
];

export interface EvalReport {
  n: number;
  answerable: number;
  recallAt3: number;
  mrr: number;
  refusalPrecision: number;
  refusalRecall: number;
  accuracy: number;
}

export function evaluate(retriever: PortfolioRetriever, queries: LabelledQuery[], k = 3, gate: Gate = GATE): EvalReport {
  let hits = 0;
  let rr = 0;
  let answerable = 0;
  let tp = 0; // correctly refused
  let fp = 0; // refused but should have answered
  let fn = 0; // answered but should have refused
  let correct = 0;

  for (const { q, expected } of queries) {
    const res = retriever.ask(q, 10, gate);
    if (expected === null) {
      if (!res.answered) {
        tp++;
        correct++;
      } else fn++;
      continue;
    }
    answerable++;
    if (!res.answered) {
      fp++;
      continue;
    }
    const sources = res.fused.map((r) => retriever.byId.get(r.id)?.source);
    const rank = sources.indexOf(expected) + 1;
    if (rank > 0 && rank <= k) {
      hits++;
      correct++;
    }
    if (rank > 0) rr += 1 / rank;
  }

  const refusals = queries.length - answerable;
  return {
    n: queries.length,
    answerable,
    recallAt3: answerable ? hits / answerable : 0,
    mrr: answerable ? rr / answerable : 0,
    refusalPrecision: tp + fp ? tp / (tp + fp) : 1,
    refusalRecall: refusals ? tp / (tp + fn) : 1,
    accuracy: correct / queries.length,
  };
}

/** Grid sweep over gate parameters, scored on the given split (use DEV_QUERIES only). */
export function sweepGate(retriever: PortfolioRetriever, queries: LabelledQuery[]) {
  const rows: Array<Gate & { accuracy: number }> = [];
  for (const minCoverage of [0.34, 0.5, 0.6, 0.67]) {
    for (const minSimilarity of [0.05, 0.08, 0.1, 0.12, 0.15, 0.18, 0.2, 0.25]) {
      rows.push({ minCoverage, minSimilarity, accuracy: evaluate(retriever, queries, 3, { minCoverage, minSimilarity }).accuracy });
    }
  }
  return rows;
}
