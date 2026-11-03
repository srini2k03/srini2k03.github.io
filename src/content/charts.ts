/**
 * Chart data, copied verbatim from committed result files.
 * credit-default-mlops/results/metrics.md, results/figures/shap_importance.csv
 * olist-ecommerce-analytics/results/sql/04_delivery_delay_vs_review.csv, results/metrics/{stats,segments}.json
 * abalone-age-regression/README.md (CV table)
 */

export const creditRules = [
  { id: "default", label: "0.5 default", threshold: 0.5, cost: 0.7593, recall: 0.3466, precision: 0.6755, approval: 0.8865, f1: 0.4582 },
  { id: "maxf1", label: "Max-F1", threshold: 0.3868, cost: 0.6192, recall: 0.5237, precision: 0.556, approval: 0.7917, f1: 0.5394 },
  { id: "cost", label: "Cost-optimal", threshold: 0.13, cost: 0.5625, recall: 0.7664, precision: 0.3578, approval: 0.5263, f1: 0.4879 },
] as const;

export const creditModels = [
  { model: "Logistic regression", rocAuc: 0.7403, prAuc: 0.4782, brier: 0.1431, brierRaw: 0.1938, cost: 0.6012, recall: 0.7295 },
  { model: "LightGBM (champion)", rocAuc: 0.7781, prAuc: 0.5362, brier: 0.1353, brierRaw: 0.1763, cost: 0.5625, recall: 0.7664 },
  { model: "XGBoost", rocAuc: 0.7799, prAuc: 0.5351, brier: 0.1358, brierRaw: 0.1814, cost: 0.5682, recall: 0.7468 },
] as const;

export const creditShap = [
  { label: "PAY_0 (latest repayment status)", value: 0.3029 },
  { label: "max_delay", value: 0.2682 },
  { label: "n_delayed", value: 0.1517 },
  { label: "BILL_AMT1", value: 0.1057 },
  { label: "LIMIT_BAL", value: 0.1034 },
  { label: "util_mean", value: 0.089 },
  { label: "PAY_AMT2", value: 0.0758 },
  { label: "util_1", value: 0.0745 },
  { label: "PAY_AMT1", value: 0.0639 },
  { label: "pay_ratio_mean", value: 0.0563 },
];

export const creditLoad = [
  { endpoint: "POST /predict", rps: 63.6, p50: 88, p95: 170, p99: 190 },
  { endpoint: "POST /explain", rps: 12.3, p50: 70, p95: 130, p99: 160 },
  { endpoint: "POST /predict_batch (20)", rps: 11.9, p50: 100, p95: 180, p99: 190 },
  { endpoint: "GET /health", rps: 6.1, p50: 22, p95: 87, p99: 110 },
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

export const jobpostFields = [
  { label: "skills", value: 99.4 },
  { label: "seniority", value: 79.2 },
  { label: "role", value: 75.4 },
  { label: "company", value: 48.2 },
];
