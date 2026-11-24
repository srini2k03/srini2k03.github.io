/**
 * Chart data, copied verbatim from committed result files.
 * credit-default-mlops/results/metrics.json, results/figures/shap_importance.csv, results/loadtest.md
 * olist-ecommerce-analytics/results/sql/04_delivery_delay_vs_review.csv, results/metrics/{stats,segments}.json
 * abalone-age-regression/README.md (CV table)
 * rbi-circulars-rag/results/{retrieval_ablation.csv,generation.md,benchmark/strategies.csv}, jobpost-extractor-qlora/results/results_table.md
 */

export const creditRules = [
  { id: "default", label: "0.5 default", threshold: 0.5, cost: 0.7523, recall: 0.3542, precision: 0.6724, approval: 0.8835, f1: 0.464 },
  { id: "maxf1", label: "Max-F1", threshold: 0.334, cost: 0.6292, recall: 0.5117, precision: 0.5593, approval: 0.7977, f1: 0.5344 },
  { id: "cost", label: "Cost-optimal", threshold: 0.16, cost: 0.5578, recall: 0.7769, precision: 0.3558, approval: 0.517, f1: 0.488 },
] as const;

export const creditModels = [
  { model: "Logistic regression", rocAuc: 0.7331, prAuc: 0.4739, brier: 0.1435, brierRaw: 0.1951, cost: 0.6198, recall: 0.7302 },
  { model: "Random forest", rocAuc: 0.7788, prAuc: 0.5551, brier: 0.1357, brierRaw: 0.177, cost: 0.5617, recall: 0.7875 },
  { model: "LightGBM (champion)", rocAuc: 0.7807, prAuc: 0.5594, brier: 0.1346, brierRaw: 0.1766, cost: 0.5578, recall: 0.7769 },
  { model: "XGBoost", rocAuc: 0.7797, prAuc: 0.5549, brier: 0.1357, brierRaw: 0.1824, cost: 0.5685, recall: 0.7076 },
  { model: "CatBoost (research only)", rocAuc: 0.7823, prAuc: 0.5631, brier: 0.1352, brierRaw: 0.1775, cost: 0.5593, recall: 0.7227 },
] as const;

export const creditShap = [
  { label: "max_delay", value: 0.4603 },
  { label: "PAY_0 (latest repayment status)", value: 0.2585 },
  { label: "LIMIT_BAL", value: 0.117 },
  { label: "n_delayed", value: 0.1078 },
  { label: "BILL_AMT1", value: 0.1071 },
  { label: "util_1", value: 0.0984 },
  { label: "util_mean", value: 0.0888 },
  { label: "PAY_AMT2", value: 0.0828 },
  { label: "PAY_AMT1", value: 0.0709 },
  { label: "PAY_AMT3", value: 0.0658 },
];

export const creditLoad = [
  { endpoint: "POST /predict", rps: 79.8, p50: 20, p95: 110, p99: 150 },
  { endpoint: "POST /explain", rps: 15.6, p50: 53, p95: 130, p99: 170 },
  { endpoint: "POST /predict_batch (20)", rps: 15.8, p50: 23, p95: 130, p99: 170 },
  { endpoint: "GET /health", rps: 7.8, p50: 8, p95: 70, p99: 130 },
];

export const olistDelay = [
  { label: "15+ days early", value: 4.323, share: 0.363, late: false },
  { label: "8–14 early", value: 4.311, share: 0.377, late: false },
  { label: "0–7 early", value: 4.189, share: 0.193, late: false },
  { label: "1–3 late", value: 3.291, share: 0.019, late: true },
  { label: "4–7 late", value: 2.106, share: 0.018, late: true },
  { label: "8–14 late", value: 1.672, share: 0.015, late: true },
  { label: "15+ late", value: 1.726, share: 0.014, late: true },
];

export const olistPeeking = [
  { looks: 1, fpr: 0.0465 },
  { looks: 2, fpr: 0.0755 },
  { looks: 5, fpr: 0.1365 },
  { looks: 10, fpr: 0.194 },
  { looks: 20, fpr: 0.231 },
  { looks: 40, fpr: 0.283 },
];

export const olistSegments = [
  { label: "At-risk big spenders", customers: 0.124, revenue: 0.386 },
  { label: "Recent mid-value", customers: 0.312, revenue: 0.314 },
  { label: "One-and-done", customers: 0.261, revenue: 0.155 },
  { label: "Recent low-value", customers: 0.272, revenue: 0.089 },
  { label: "Champions", customers: 0.03, revenue: 0.057 },
];

export const abaloneCv = [
  { label: "Blend", value: 0.1678 },
  { label: "Stacking", value: 0.1682 },
  { label: "Random Forest", value: 0.1693 },
  { label: "CatBoost", value: 0.1699 },
  { label: "XGBoost", value: 0.1701 },
  { label: "LightGBM", value: 0.1717 },
  { label: "Linear Regression", value: 0.1729 },
  { label: "Ridge", value: 0.1765 },
  { label: "Mean baseline", value: 0.2869, baseline: true },
];


/**
 * rbi-circulars-rag/results/retrieval_ablation.csv: test split, 130 answerable questions from
 * document-disjoint notifications. ndcg10 = chunk-level nDCG@10, docRecall5 = document Recall@5.
 */
export const rbiAblation = [
  { chunker: "fixed", size: 256, mode: "bm25", ndcg10: 0.654, docRecall5: 0.831 },
  { chunker: "fixed", size: 256, mode: "dense", ndcg10: 0.457, docRecall5: 0.769 },
  { chunker: "fixed", size: 256, mode: "hybrid", ndcg10: 0.579, docRecall5: 0.846 },
  { chunker: "fixed", size: 256, mode: "hybrid_rerank", ndcg10: 0.56, docRecall5: 0.8 },
  { chunker: "fixed", size: 512, mode: "bm25", ndcg10: 0.703, docRecall5: 0.846 },
  { chunker: "fixed", size: 512, mode: "dense", ndcg10: 0.487, docRecall5: 0.7 },
  { chunker: "fixed", size: 512, mode: "hybrid", ndcg10: 0.623, docRecall5: 0.823 },
  { chunker: "fixed", size: 512, mode: "hybrid_rerank", ndcg10: 0.584, docRecall5: 0.815 },
  { chunker: "fixed", size: 1024, mode: "bm25", ndcg10: 0.697, docRecall5: 0.846 },
  { chunker: "fixed", size: 1024, mode: "dense", ndcg10: 0.481, docRecall5: 0.738 },
  { chunker: "fixed", size: 1024, mode: "hybrid", ndcg10: 0.582, docRecall5: 0.8 },
  { chunker: "fixed", size: 1024, mode: "hybrid_rerank", ndcg10: 0.525, docRecall5: 0.738 },
  { chunker: "section", size: 256, mode: "bm25", ndcg10: 0.601, docRecall5: 0.831 },
  { chunker: "section", size: 256, mode: "dense", ndcg10: 0.567, docRecall5: 0.831 },
  { chunker: "section", size: 256, mode: "hybrid", ndcg10: 0.623, docRecall5: 0.831 },
  { chunker: "section", size: 256, mode: "hybrid_rerank", ndcg10: 0.576, docRecall5: 0.854 },
  { chunker: "section", size: 512, mode: "bm25", ndcg10: 0.641, docRecall5: 0.815 },
  { chunker: "section", size: 512, mode: "dense", ndcg10: 0.57, docRecall5: 0.831 },
  { chunker: "section", size: 512, mode: "hybrid", ndcg10: 0.632, docRecall5: 0.854 },
  { chunker: "section", size: 512, mode: "hybrid_rerank", ndcg10: 0.617, docRecall5: 0.862 },
  { chunker: "section", size: 1024, mode: "bm25", ndcg10: 0.654, docRecall5: 0.831 },
  { chunker: "section", size: 1024, mode: "dense", ndcg10: 0.539, docRecall5: 0.769 },
  { chunker: "section", size: 1024, mode: "hybrid", ndcg10: 0.612, docRecall5: 0.831 },
  { chunker: "section", size: 1024, mode: "hybrid_rerank", ndcg10: 0.625, docRecall5: 0.823 },
  { chunker: "semantic", size: 256, mode: "bm25", ndcg10: 0.648, docRecall5: 0.831 },
  { chunker: "semantic", size: 256, mode: "dense", ndcg10: 0.535, docRecall5: 0.785 },
  { chunker: "semantic", size: 256, mode: "hybrid", ndcg10: 0.637, docRecall5: 0.846 },
  { chunker: "semantic", size: 256, mode: "hybrid_rerank", ndcg10: 0.595, docRecall5: 0.823 },
  { chunker: "semantic", size: 512, mode: "bm25", ndcg10: 0.666, docRecall5: 0.815 },
  { chunker: "semantic", size: 512, mode: "dense", ndcg10: 0.535, docRecall5: 0.777 },
  { chunker: "semantic", size: 512, mode: "hybrid", ndcg10: 0.636, docRecall5: 0.862 },
  { chunker: "semantic", size: 512, mode: "hybrid_rerank", ndcg10: 0.611, docRecall5: 0.831 },
  { chunker: "semantic", size: 1024, mode: "bm25", ndcg10: 0.679, docRecall5: 0.869 },
  { chunker: "semantic", size: 1024, mode: "dense", ndcg10: 0.517, docRecall5: 0.769 },
  { chunker: "semantic", size: 1024, mode: "hybrid", ndcg10: 0.625, docRecall5: 0.854 },
  { chunker: "semantic", size: 1024, mode: "hybrid_rerank", ndcg10: 0.572, docRecall5: 0.777 },
] as const;

/** rbi-circulars-rag/results/generation.md: answers judged by a local Qwen2.5-7B; NLI = DeBERTa-v3 entailment. */
export const rbiGeneration = [
  { label: "Qwen2.5-3B (local), BM25", n: 155, faithJudge: 0.953, faithNli: 0.212, relevance: 0.941, refusalP: 0.913, refusalR: 0.84 },
  { label: "GPT-OSS-20B (Groq), BM25", n: 60, faithJudge: 0.986, faithNli: 0.131, relevance: 0.977, refusalP: 0.615, refusalR: 0.8 },
  { label: "Qwen2.5-3B (local), hybrid", n: 60, faithJudge: 0.891, faithNli: 0.289, relevance: 0.851, refusalP: 0.75, refusalR: 0.9 },
  { label: "Qwen2.5-3B (local), hybrid + rerank", n: 60, faithJudge: 0.918, faithNli: 0.29, relevance: 0.897, refusalP: 0.714, refusalR: 1.0 },
] as const;

/** jobpost-extractor-qlora/results/results_table.md: test_synth (471 posts; API and guided rows use a fixed 200-post subset). */
export const jobpostApproaches = [
  { label: "0.5B zero-shot", f1: 71.6, halluc: 67.1, n: 471, ours: false },
  { label: "0.5B 3-shot + grammar", f1: 80.1, halluc: 44.2, n: 200, ours: false },
  { label: "1.5B zero-shot", f1: 91.4, halluc: 35.3, n: 471, ours: false },
  { label: "Regex rules", f1: 93.1, halluc: 2.5, n: 471, ours: false },
  { label: "GPT-OSS-120B 3-shot", f1: 97.9, halluc: 1.0, n: 200, ours: false },
  { label: "LoRA 0.5B 4-bit", f1: 99.0, halluc: 2.0, n: 471, ours: true },
  { label: "LoRA 0.5B F16", f1: 99.3, halluc: 1.9, n: 471, ours: true },
] as const;

/** rbi-circulars-rag/results/benchmark/strategies.csv: chunk nDCG@10 on the test split (130 answerable questions); deployable strategies only (oracle filters excluded). */
export const rbiStrategies = [
  { label: "BM25 + parent context", value: 0.715 },
  { label: "Weighted hybrid (z-score, 0.7/0.3)", value: 0.704 },
  { label: "BM25 + RM3 expansion", value: 0.704 },
  { label: "BM25 (served)", value: 0.697, baseline: true },
  { label: "Weighted hybrid + rerank", value: 0.688 },
  { label: "BM25 + rerank", value: 0.663 },
  { label: "RRF hybrid (tuned)", value: 0.639 },
  { label: "RRF hybrid (original)", value: 0.582 },
  { label: "RRF hybrid + rerank (original)", value: 0.525 },
  { label: "Dense only", value: 0.481 },
];
