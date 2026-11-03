/**
 * Single source of truth for every project on the site.
 * Every number below is copied from a results file committed in the
 * project's own repository (paths noted in comments). Results that do not
 * exist yet are labelled as pending instead of being estimated.
 */

export type StatusTone = "live" | "pending" | "info";

export interface Status {
  label: string;
  tone: StatusTone;
}

export interface Metric {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  context?: string;
}

export interface Link {
  label: string;
  href: string;
  kind: "code" | "demo" | "api" | "site" | "apk";
  note?: string;
}

export interface Stage {
  name: string;
  detail: string;
}

export interface Project {
  slug: string;
  title: string;
  short: string;
  year: number;
  category: "GenAI · Retrieval" | "MLOps" | "LLM fine-tuning" | "Analytics · Statistics" | "Deep learning" | "Classical ML" | "Android" | "Backend";
  featured: boolean;
  tagline: string;
  status: Status[];
  /** Canonical skill names; these drive the skills evidence matrix. */
  skills: string[];
  links: Link[];
  problem: string;
  pipeline: Stage[];
  highlights: string[];
  metrics: Metric[];
  decisions: { title: string; body: string }[];
  engineering: { label: string; value: string }[];
  honesty?: string;
  next?: string[];
  inBrowser?: string;
  accent: "green" | "blue" | "amber" | "violet" | "rose";
}

export const projects: Project[] = [
  {
    slug: "rbi-rag",
    title: "RBI Regulations Q&A: Hybrid RAG with Citations",
    short: "RBI Hybrid RAG",
    year: 2026,
    category: "GenAI · Retrieval",
    featured: true,
    accent: "green",
    tagline:
      "Question answering over 2,000+ Reserve Bank of India notifications. Every answer cites its sources, and the system refuses when retrieval confidence is low.",
    status: [
      { label: "Retrieval live in browser", tone: "live" },
      { label: "Daily evaluation running", tone: "pending" },
    ],
    skills: ["Python", "RAG", "Hugging Face Transformers", "Qdrant", "BM25", "Cross-Encoder Reranking", "FastAPI", "Docker", "GitHub Actions (CI/CD)", "Pytest", "Streamlit", "Ollama"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/rbi-circulars-rag", kind: "code" },
      { label: "Live demo", href: "https://srini2k03.github.io/rbi-circulars-rag/", kind: "demo" },
    ],
    problem:
      "RBI publishes thousands of circulars that look almost identical. A compliance analyst needs the one rule that applies, with a citation to the exact notification. A plain LLM will invent a plausible-sounding rule. This system retrieves first, cites every claim, and declines to answer when the evidence is weak.",
    pipeline: [
      { name: "Crawl", detail: "Polite httpx crawler (≥1 s between requests, retries with backoff, SHA-256 manifest); corpus-v1 has 2,153 documents" },
      { name: "Parse & chunk", detail: "HTML/PDF parsing with selectolax and PyMuPDF; fixed, semantic or section-aware chunkers (default: section-aware, 512 tokens, 64 overlap)" },
      { name: "Sparse + dense", detail: "BM25 plus BAAI/bge-small-en-v1.5 (384-d) embeddings in Qdrant" },
      { name: "RRF fusion", detail: "Reciprocal Rank Fusion (k = 60) merges the two ranked lists without needing comparable scores" },
      { name: "Rerank", detail: "cross-encoder/ms-marco-MiniLM-L-6-v2 reranks 50 candidates down to 20, and the top 5 go to the LLM" },
      { name: "Confidence gate", detail: "Sigmoid of the top reranker logit is compared with τ, calibrated for refusal F0.5 on a document-level dev split" },
      { name: "Generate & cite", detail: "Numbered-source prompt; every [n] citation is validated against the retrieved set" },
      { name: "Serve", detail: "FastAPI with /query, SSE streaming and /metrics, a Streamlit UI, and Docker Compose with Qdrant" },
    ],
    highlights: [
      "Built a RAG system over 2,000+ RBI notifications: BM25 and dense retrieval (BGE embeddings in Qdrant) merged with Reciprocal Rank Fusion, then cross-encoder reranking, with numbered source citations in every answer.",
      "Added a calibrated confidence gate (threshold tuned for refusal F0.5 on a document-level split), so the system says “I don't know” instead of hallucinating on out-of-scope questions.",
      "Built an evaluation harness (Recall@k, MRR, nDCG, NLI faithfulness, citation accuracy, LLM-as-judge, bootstrap CIs) with a 36-configuration retrieval ablation (4 modes × 3 chunkers × 3 chunk sizes) scheduled daily in GitHub Actions.",
      "Shipped the same retrieval stack to the browser: BM25, BGE and the MiniLM reranker run client-side with transformers.js over an int8-quantised index.",
    ],
    metrics: [
      { value: 2000, suffix: "+", label: "RBI notifications indexed", context: "corpus-v1: 2,153 documents" },
      { value: 36, label: "Ablation configs", context: "4 retrieval modes × 3 chunkers × 3 sizes" },
      { value: 253, prefix: "~", label: "Automated tests", context: "31 test files, strict mypy" },
      { value: 4, label: "Retrieval stages", context: "BM25 → dense → RRF → rerank" },
    ],
    decisions: [
      { title: "RRF instead of score fusion", body: "BM25 scores and cosine similarities are on different scales. Rank fusion needs no normalisation, so it holds up when the corpus or the embedding model changes." },
      { title: "Document-level splits", body: "Dev and test questions come from disjoint documents (seeded SHA-256 split), so the refusal threshold is never tuned on the same circulars it is scored on." },
      { title: "Gold evidence as character spans", body: "The ground truth is stored as character offsets rather than chunk IDs, so the three chunkers can be compared fairly." },
      { title: "Two independent faithfulness checks", body: "An NLI model (DeBERTa-v3) checks faithfulness alongside the LLM judge, so the metric does not rest on a single LLM's opinion." },
      { title: "Honest test-set provenance", body: "Every Q/A pair is labelled as model-generated, AI-reviewed or human-verified, and runs below 90% completion are reported as incomplete." },
    ],
    engineering: [
      { label: "Tests", value: "~253 test functions in 31 files, plus Playwright browser tests and JS/Python parity checks" },
      { label: "CI", value: "ruff, strict mypy, pytest on Python 3.11/3.12, Docker Compose smoke test that curls /query, streaming and /metrics" },
      { label: "Scheduled jobs", value: "Daily Q/A generation and daily evaluation workflows (cron), resumable within free-tier quotas" },
      { label: "Packaging", value: "Non-root Dockerfiles for the API and UI; Compose stack with Qdrant and an optional Ollama profile" },
    ],
    honesty:
      "The evaluation harness and the 36-config ablation are implemented and scheduled daily, but no benchmark numbers have been committed yet. This page will show Recall@k and faithfulness only after the runs finish.",
    next: ["Publish the ablation results (hybrid + rerank vs BM25 alone)", "Grow the reviewed test set toward 220 answerable and 30 unanswerable questions"],
    inBrowser: "BM25, BGE embeddings and the cross-encoder reranker run client-side through transformers.js.",
  },
  {
    slug: "credit-default",
    title: "Credit Default Prediction: End-to-End MLOps",
    short: "Credit-risk MLOps",
    year: 2026,
    category: "MLOps",
    featured: true,
    accent: "blue",
    tagline:
      "A credit-risk model on 30,000 customers whose approve/decline cutoff minimises expected cost. It sits behind a promotion-gated MLflow registry, a load-tested FastAPI service and drift-triggered retraining.",
    status: [
      { label: "API live on Render", tone: "live" },
      { label: "Results committed", tone: "info" },
    ],
    skills: ["Python", "Scikit-Learn", "XGBoost", "LightGBM", "Optuna", "SHAP", "MLflow", "DVC", "Prefect", "Evidently", "Docker", "FastAPI", "GitHub Actions (CI/CD)", "Pytest", "pandas", "Linux"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/credit-default-mlops", kind: "code" },
      { label: "API docs", href: "https://credit-default-api-fkqg.onrender.com/docs", kind: "api", note: "Free tier: the first request takes 30–60 s to wake the service" },
      { label: "Project site", href: "https://srini2k03.github.io/credit-default-mlops/", kind: "site" },
    ],
    problem:
      "Approving a customer who later defaults costs a lender far more than turning away one who would have paid. A classifier that is tuned for accuracy at a 0.5 cutoff ignores that asymmetry. The real task is to pick the decision that minimises expected cost, keep the model calibrated, and stop a worse model from ever reaching production.",
    pipeline: [
      { name: "Ingest & version", detail: "UCI download pinned by SHA-256 and versioned with DVC" },
      { name: "Validate", detail: "Strict Pandera schema; any violation stops the pipeline" },
      { name: "Tune", detail: "Optuna TPE, 30 trials each for LogReg, XGBoost and LightGBM, maximising CV PR-AUC" },
      { name: "Calibrate", detail: "Isotonic regression on a separate calibration split (60/10/10/20 split)" },
      { name: "Decide", detail: "Cost curve over 199 thresholds with FN:FP = 5:1; the cutoff is chosen on validation" },
      { name: "Gate & register", detail: "MLflow registry with @staging / @production aliases; CI rejects regressions" },
      { name: "Serve & explain", detail: "FastAPI /predict, /predict_batch and /explain (per-prediction SHAP) in Docker on Render" },
      { name: "Monitor", detail: "Evidently drift report; drift share above 0.30 triggers the retraining workflow" },
    ],
    highlights: [
      "Trained, tuned (Optuna) and calibrated LogReg, XGBoost and LightGBM on 30,000 credit-card customers. The champion LightGBM scored ROC-AUC 0.778 and PR-AUC 0.536 on a 6,000-customer holdout.",
      "Replaced the default 0.5 cutoff with a cost-optimal threshold (5:1 miss-to-false-alarm cost). This cut expected cost per applicant by 26% and raised default recall from 35% to 77%.",
      "Shipped the full lifecycle: Pandera validation, DVC versioning, an MLflow registry with an automated promotion gate, SHAP explanations per prediction, Evidently drift detection that triggers retraining, and a Docker deploy to Render via GitHub Actions.",
    ],
    metrics: [
      { value: 0.778, decimals: 3, label: "ROC-AUC (holdout)", context: "n = 6,000 · PR-AUC 0.536" },
      { value: 26, prefix: "−", suffix: "%", label: "Expected cost / applicant", context: "0.759 → 0.563 vs the 0.5 cutoff" },
      { value: 77, suffix: "%", label: "Default recall", context: "up from 35% at the 0.5 cutoff" },
      { value: 170, suffix: " ms", label: "p95 latency under load", context: "Locust: 5,543 requests, 0 failures" },
    ],
    decisions: [
      { title: "Threshold chosen empirically, Bayes value as a check", body: "With calibrated scores the Bayes-optimal cutoff for 5:1 costs is 1/6 ≈ 0.167. The empirical optimum on validation was 0.13, and both are reported." },
      { title: "Calibrate on its own split", body: "Isotonic calibration is fitted on a held-out 10% split, so the base model stays untouched and its SHAP values remain exact." },
      { title: "SMOTE treated as an ablation, not a default", body: "SMOTE runs inside the CV folds. It did not beat class weights (LightGBM CV PR-AUC 0.5602 vs 0.5640), so class weights shipped." },
      { title: "The gate is tested", body: "A unit test trains a model on permuted labels and asserts that the promotion gate rejects it." },
      { title: "Graceful degradation", body: "If the registry is unreachable within 5 s, the API falls back to the bundled model instead of failing." },
    ],
    engineering: [
      { label: "Tests", value: "44 test functions on a synthetic fixture (no network), including a gate-rejection test" },
      { label: "CI", value: "ruff, pytest, synthetic end-to-end run (train → gate → drift → Prefect), Docker build, container smoke test, Locust, push to GHCR" },
      { label: "CD & monitoring", value: "Training workflow fails on gate reject; weekly drift check retrains if drift share > 0.30; weekly live-API smoke test" },
      { label: "Serving", value: "Non-root Docker image with HEALTHCHECK, Render autodeploy, predictions logged to SQLite" },
    ],
  },
  {
    slug: "jobpost-extractor",
    title: "Job-Post to JSON Extractor: LoRA Fine-Tuning",
    short: "LoRA JSON extractor",
    year: 2026,
    category: "LLM fine-tuning",
    featured: true,
    accent: "violet",
    tagline:
      "Turns messy Indian job posts (WhatsApp forwards, Hinglish, “12 LPA”) into one strict 11-field JSON object. Fields the post does not state come back null, not guessed.",
    status: [
      { label: "Baselines measured", tone: "info" },
      { label: "CPU LoRA training in progress", tone: "pending" },
    ],
    skills: ["Python", "Hugging Face Transformers", "TRL (LoRA fine-tuning)", "llama.cpp/GGUF Quantization", "Ollama", "FastAPI", "Docker", "GitHub Actions (CI/CD)", "Pytest", "NumPy"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/jobpost-extractor-qlora", kind: "code" },
      { label: "Project site", href: "https://srini2k03.github.io/jobpost-extractor-qlora/", kind: "site", note: "The in-browser model demo appears once training finishes" },
    ],
    problem:
      "Job posts in India arrive as WhatsApp forwards, Telegram blasts and Naukri copy-pastes, mixing Hindi and English, with salaries such as “8–12 LPA”. Downstream systems need strict JSON. A general LLM will happily invent a missing salary or location, so the goal is a small model that extracts what is there and returns null for what is not.",
    pipeline: [
      { name: "Synthesise", detail: "3,000 labelled posts from 18 role domains, 143 skills, 35 cities and 12 template families, plus noise operators" },
      { name: "Verify", detail: "A recoverability check ensures every gold value can be found in the text" },
      { name: "De-duplicate", detail: "MinHash LSH (128 permutations, Jaccard ≥ 0.8), implemented from scratch in NumPy" },
      { name: "Split", detail: "Template families and companies are disjoint across train 2,177 / val 352 / test 471" },
      { name: "Baselines", detail: "Regex, Qwen2.5 zero/3-shot with and without JSON grammar, GPT-OSS-120B with a JSON schema" },
      { name: "LoRA SFT", detail: "Qwen2.5-0.5B-Instruct, r = 16, α = 32 on all 7 projection modules, TRL completion-only loss, on CPU in chained GitHub Actions jobs" },
      { name: "Quantise", detail: "Merge, then convert to GGUF F16, Q8_0 and Q4_K_M with llama.cpp" },
      { name: "Serve", detail: "FastAPI with schema validation and retry; Q4_K_M runs in the browser via llama.cpp WASM with grammar-constrained decoding" },
    ],
    highlights: [
      "Set up LoRA fine-tuning of Qwen2.5-0.5B-Instruct (TRL SFT, completion-only loss) to convert noisy Indian job posts into schema-validated JSON across 11 fields, returning null instead of guessing missing values.",
      "Generated a 3,000-example synthetic dataset with MinHash de-duplication and template-disjoint splits to prevent leakage; scored with field-level exact match, micro/macro F1 and hallucination rate, with bootstrap CIs.",
      "Measured a regex baseline at 93.1 micro-F1 [92.5, 93.8] with a 2.5% hallucination rate, the bar the fine-tuned model has to clear.",
      "Built CPU-only training as chained, checkpointed GitHub Actions jobs, plus a GGUF quantisation and in-browser llama.cpp (WebAssembly) serving path.",
    ],
    metrics: [
      { value: 93.1, decimals: 1, label: "Regex baseline micro-F1", context: "95% CI [92.5, 93.8], n = 471 (synthetic test)" },
      { value: 3000, label: "Synthetic labelled posts", context: "0 duplicates, 0 failed validation" },
      { value: 11, label: "Schema fields", context: "null or [] when absent, never guessed" },
      { value: 117, prefix: "~", label: "Automated tests", context: "16 test files, including leakage tests" },
    ],
    decisions: [
      { title: "Labels known by construction", body: "Synthetic generation means every gold value is known exactly. A recoverability checker rejects any example whose answer is not literally present in the text." },
      { title: "Leakage-proof splits", body: "Template families and companies never cross splits. MinHash de-duplication keeps the test copy of any near-duplicate, so the test set never shrinks." },
      { title: "Hallucination as a first-class metric", body: "F1 alone rewards guessing. A separate hallucination rate counts fields that were filled in but should have been null." },
      { title: "Constrained decoding", body: "A JSON-schema grammar (llama.cpp) guarantees parseable output, so the evaluation measures extraction quality rather than JSON syntax errors." },
      { title: "A candid baseline", body: "The README warns that the regex baseline is flattered by the synthetic test set, because its patterns were written with every template in view." },
    ],
    engineering: [
      { label: "Tests", value: "~117 test functions in 16 files: leakage, completion gating, schema, serving" },
      { label: "CI", value: "ruff, mypy, pytest; regenerates the results table and fails if the committed copy is stale" },
      { label: "Training infra", value: "CPU fine-tune split into 5-hour chained jobs on a cron, checkpointing to a GitHub prerelease" },
      { label: "Serving", value: "Non-root Docker image (llama-cpp-python) with HEALTHCHECK and a regex fallback backend" },
    ],
    honesty:
      "Training is still running on CPU in GitHub Actions. No fine-tuned scores, quantised model or in-browser demo exist yet, and none are claimed here. The only committed final result is the regex baseline. A partial GPT-OSS-120B run (25 of 200) is left out of the results on purpose.",
    next: ["Release model-v1 and publish fine-tuned F1 and hallucination rate against the 93.1 baseline", "Evaluate on about 200 real job posts, not just the synthetic test split"],
  },
  {
    slug: "olist-analytics",
    title: "E-Commerce Analytics on 99K Orders (Olist)",
    short: "Olist analytics",
    year: 2026,
    category: "Analytics · Statistics",
    featured: true,
    accent: "amber",
    tagline:
      "Portable SQL, causal-minded statistics and an A/B test design on the real Olist marketplace data. It ends with a recommendation not to launch free shipping.",
    status: [
      { label: "Dashboard live (in-browser)", tone: "live" },
      { label: "Results committed", tone: "info" },
    ],
    skills: ["Python", "SQL", "DuckDB", "PostgreSQL", "Streamlit", "A/B Testing", "Statistical Inference", "pandas", "NumPy", "Scikit-Learn", "LightGBM", "SHAP", "GitHub Actions (CI/CD)", "Pytest"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/olist-ecommerce-analytics", kind: "code" },
      { label: "Dashboard", href: "https://srini2k03.github.io/olist-ecommerce-analytics/app/", kind: "demo", note: "Streamlit compiled to WebAssembly; the first load takes 10–30 s" },
    ],
    problem:
      "A marketplace with 99,441 orders wants to know what is hurting customer satisfaction, who its valuable customers are, and whether free shipping would pay for itself. Each question needs a defensible statistical answer and a business recommendation, not just a chart.",
    pipeline: [
      { name: "Fetch", detail: "Kaggle API with a pinned GitHub fallback; every file checked by SHA-256" },
      { name: "Warehouse", detail: "DuckDB locally, PostgreSQL 16 in CI, built from the same schema" },
      { name: "16 SQL queries", detail: "CTEs and window functions written to strict portability rules so one SQL text runs on both engines" },
      { name: "Statistics", detail: "Bootstrap CIs, Cliff's δ, ordinal regression (SciPy, statsmodels)" },
      { name: "Segment", detail: "K-Means on RFM features, cross-checked against an SQL NTILE RFM table" },
      { name: "Experiment", detail: "Simulated free-shipping A/B test: power analysis, SRM check, Bayesian posterior, peeking simulation" },
      { name: "Model", detail: "Repeat-purchase model with point-in-time features and SHAP reasons" },
      { name: "Dashboard", detail: "Streamlit compiled to WebAssembly (stlite/Pyodide), served from GitHub Pages with no backend" },
    ],
    highlights: [
      "Wrote 16 analytical SQL queries (CTEs, window functions) over 99,441 orders. CI cross-checks every result cell by cell on DuckDB and PostgreSQL 16.",
      "Showed that late deliveries drop the average review from 4.29 to 2.27 stars (bootstrap CI, Cliff's δ −0.64, ordinal regression), and found an RFM-based customer segment holding 12.4% of customers but 38.6% of revenue.",
      "Ran a simulated free-shipping A/B test (power analysis, SRM check, Bayesian posterior). The uplift was significant, but the subsidy cost R$9.60 per order for R$1.44 of extra revenue, so I recommended against launch.",
    ],
    metrics: [
      { value: 99441, label: "Orders analysed", context: "9 tables, Sep 2016 – Oct 2018" },
      { value: 2.27, decimals: 2, label: "Avg review when late", context: "vs 4.29 on time · δ = −0.64 (large)" },
      { value: 38.6, decimals: 1, suffix: "%", label: "Revenue from 12.4% of customers", context: "“At-risk big spenders” segment" },
      { value: 16, label: "SQL queries, 2 engines", context: "DuckDB and PostgreSQL 16, compared in CI" },
    ],
    decisions: [
      { title: "Significant is not the same as worth it", body: "The simulated test found a real uplift (p = 0.0062, P(B > A) = 0.997), but each order would cost R$9.60 in subsidy to earn R$1.44. The recommendation was not to launch." },
      { title: "One SQL, two engines", body: "Explicit portability rules (date casts instead of date_diff, no ILIKE, rounding in the runner) keep the queries engine-agnostic. CI fails if the snapshots drift from a fresh run." },
      { title: "Peeking quantified", body: "A simulation shows how checking results early inflates false positives: from 4.7% with one look to 28.3% with 40 looks. That is the argument for a fixed test horizon." },
      { title: "Honest about a weak model", body: "Only 3.0% of customers ever reorder. The repeat-purchase model reaches ROC-AUC of about 0.58 and is reported as “barely predictable” rather than oversold." },
    ],
    engineering: [
      { label: "Tests", value: "42 test functions (about 88 cases with parametrisation), including 7 point-in-time leakage tests and a Streamlit AppTest" },
      { label: "CI", value: "4 jobs: lint and test, SQL on DuckDB vs PostgreSQL 16, notebooks executed on real data, Playwright smoke test of the dashboard" },
      { label: "Reproducibility", value: "Data artefacts rebuilt by a workflow and committed; SHA-256 checks on every input" },
      { label: "Deployment", value: "Serverless dashboard: Streamlit in Pyodide, verified in headless Chromium before publishing" },
    ],
    inBrowser: "The Streamlit dashboard runs entirely client-side in Pyodide (Python compiled to WebAssembly).",
  },
  {
    slug: "deepfake-detection",
    title: "Multi-Modal Deepfake Detection",
    short: "Deepfake detection",
    year: 2025,
    category: "Deep learning",
    featured: true,
    accent: "rose",
    tagline:
      "Detects manipulated video, images and audio with a face-model ensemble, attention pooling over frames and an audio CNN, combined by late fusion, with Grad-CAM explanations.",
    status: [
      { label: "Pipeline & serving complete", tone: "info" },
      { label: "Benchmark training pending", tone: "pending" },
    ],
    skills: ["Python", "TensorFlow/Keras", "OpenCV", "NumPy", "Flask", "Docker", "GitHub Actions (CI/CD)", "Pytest"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/multimodal-deepfake-detection", kind: "code" },
      { label: "Demo", href: "https://srini2k03.github.io/multimodal-deepfake-detection/", kind: "demo", note: "Real face preprocessing in the browser; scores are labelled placeholders until weights are trained" },
    ],
    problem:
      "Manipulated media mixes visual and audio artefacts that a single-frame classifier misses. A usable detector has to combine evidence across frames and modalities, explain where it is looking, and be evaluated without identity leakage between train and test.",
    pipeline: [
      { name: "Sample & detect", detail: "OpenCV frame sampling (32 per video); Haar cascade or ResNet-10 SSD face detection" },
      { name: "Align & crop", detail: "Eye-based alignment, 299×299 face crops" },
      { name: "Face ensemble", detail: "Xception + InceptionV3 (ImageNet), two-stage transfer learning: head at lr 1e-3, then the top 35% of layers at 2e-5" },
      { name: "Temporal head", detail: "Additive attention pooling over per-frame features" },
      { name: "Audio branch", detail: "3-block CNN on log-mel spectrograms" },
      { name: "Late fusion", detail: "Visual 0.7 / audio 0.3" },
      { name: "Explain", detail: "Grad-CAM heatmaps on block14_sepconv2_act and mixed10" },
      { name: "Serve", detail: "Flask REST API with async jobs, a React dashboard, Docker (gunicorn + nginx)" },
    ],
    highlights: [
      "Built a video, image and audio deepfake detector: Xception and InceptionV3 face models (two-stage transfer learning) with attention pooling over frames, plus a log-mel spectrogram CNN for audio, combined by late fusion.",
      "Added Grad-CAM explanations, served through a Flask REST API (async jobs) and a React dashboard, containerised with Docker.",
      "Wrote dataset loaders for FaceForensics++ and Celeb-DF with identity-grouped train/test splits, and implemented AUC and EER evaluation in NumPy.",
    ],
    metrics: [
      { value: 3, label: "Modalities", context: "video, image, audio" },
      { value: 2, label: "CNN backbones ensembled", context: "Xception + InceptionV3" },
      { value: 61, label: "Automated tests", context: "CI runs with and without TensorFlow" },
      { value: 299, suffix: "px", label: "Aligned face crops", context: "eye-based alignment" },
    ],
    decisions: [
      { title: "Identity-grouped splits", body: "The same person never appears in both train and test, which is the most common source of inflated deepfake benchmarks." },
      { title: "Attention over frames", body: "Manipulation artefacts are intermittent. Learned attention weights let the model focus on the frames that show them instead of averaging them away." },
      { title: "No borrowed numbers", body: "The README cites published XceptionNet results for context but states plainly that this repository did not produce them." },
    ],
    engineering: [
      { label: "Tests", value: "61 test functions (about 808 lines); CI runs one job without TensorFlow and one with tensorflow-cpu" },
      { label: "CI", value: "ruff check and format, pytest with coverage, frontend production build" },
      { label: "Packaging", value: "Backend image (gunicorn, non-root, healthcheck) and frontend image (nginx) via docker-compose" },
      { label: "Demo", value: "Browser demo runs MediaPipe BlazeFace detection and alignment client-side" },
    ],
    honesty:
      "No trained weights or benchmark scores are committed yet: the results table in the repo reads TBD. The pipeline, serving and evaluation code are complete and tested; training on FaceForensics++ / Celeb-DF needs GPU time.",
    next: ["Train on FaceForensics++ and Celeb-DF and publish test AUC and EER"],
    inBrowser: "Face detection and alignment run client-side with MediaPipe.",
  },
  {
    slug: "abalone-regression",
    title: "Abalone Age Regression",
    short: "Abalone regression",
    year: 2024,
    category: "Classical ML",
    featured: false,
    accent: "green",
    tagline:
      "A reproducible scikit-learn pipeline comparing nine models. The tuned XGBoost model is exported to run in the browser, with a CI parity check against Python.",
    status: [{ label: "In-browser predictor live", tone: "live" }],
    skills: ["Python", "Scikit-Learn", "XGBoost", "LightGBM", "CatBoost", "Optuna", "SHAP", "FastAPI", "Docker", "GitHub Actions (CI/CD)", "Pytest", "pandas"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/abalone-age-regression", kind: "code" },
      { label: "Live predictor", href: "https://srini2k03.github.io/abalone-age-regression/", kind: "demo" },
    ],
    problem: "Predict an abalone's age (rings) from body measurements, and show which models actually beat a strong linear baseline.",
    pipeline: [
      { name: "Fetch & validate", detail: "UCI download with a pinned fingerprint and schema validation" },
      { name: "Features in-fold", detail: "Quantile clipping and morphometric features fitted inside each CV fold" },
      { name: "Compare", detail: "9 models with repeated K-fold (5×2), log1p target so training directly minimises RMSLE" },
      { name: "Ensemble", detail: "Stacking (positive linear meta-learner) and a blend" },
      { name: "Ship", detail: "Typer CLI, FastAPI and Docker; 300-tree XGBoost exported to JSON for the browser" },
    ],
    highlights: [
      "Best hold-out RMSLE of 0.1659 (blend ensemble), 41.6% below a mean-predictor baseline and about 3% better than plain linear regression in CV.",
      "The tuned XGBoost model runs in the browser. CI checks JS-vs-Python parity on 196 rows (tolerance 1e-4) before every deploy.",
    ],
    metrics: [
      { value: 0.1659, decimals: 4, label: "Hold-out RMSLE", context: "blend ensemble, 836 unseen rows" },
      { value: 41.6, decimals: 1, prefix: "−", suffix: "%", label: "vs mean baseline", context: "baseline RMSLE 0.2839" },
      { value: 56, label: "Tests", context: "Python 3.10–3.12 matrix" },
    ],
    decisions: [
      { title: "Report the gap to the strong baseline", body: "A gain of 41.6% over predicting the mean sounds large. The more honest comparison is with linear regression, where the gain is about 3%." },
    ],
    engineering: [
      { label: "CI", value: "ruff, pytest on 3 Python versions, CLI smoke run on real data, Docker build, JS/Python parity gate" },
    ],
    inBrowser: "300-tree XGBoost model evaluated client-side in plain JavaScript.",
  },
  {
    slug: "e-challan-android",
    title: "Traffic Violation & e-Challan Manager (Android)",
    short: "Android e-Challan",
    year: 2023,
    category: "Android",
    featured: false,
    accent: "blue",
    tagline:
      "An offline-first Android app for issuing traffic fines. Clean Architecture across three Gradle modules, with a Room source of truth synced to Firebase by WorkManager.",
    status: [{ label: "CI-built debug APK", tone: "info" }],
    skills: ["Kotlin", "GitHub Actions (CI/CD)"],
    links: [
      { label: "Code", href: "https://github.com/srini2k03/traffic-violation-fine-manager", kind: "code" },
      { label: "Site", href: "https://srini2k03.github.io/traffic-violation-fine-manager/", kind: "site" },
    ],
    problem: "Officers issue fines in places with patchy connectivity. The app must work offline, sync reliably later and apply repeat-offender rules consistently.",
    pipeline: [
      { name: ":domain", detail: "Pure Kotlin: fine calculator with repeat-offender tiers, validators, use cases" },
      { name: ":data", detail: "Room, a pending-operation queue, WorkManager sync with exponential backoff, Firebase Auth / Realtime Database / Storage" },
      { name: ":app", detail: "Jetpack Compose and Material 3, Hilt, MVVM with StateFlow" },
    ],
    highlights: [
      "Kotlin, Jetpack Compose, MVVM and Clean Architecture; Room offline-first storage with WorkManager sync to Firebase.",
      "Indian number-plate validation, GPS and photo evidence, PDF challans with QR codes, and an admin analytics console.",
      "107 unit tests (JUnit, MockK, Turbine); CI runs lint and tests and publishes a debug APK.",
    ],
    metrics: [
      { value: 107, label: "Unit tests", context: "JUnit 4, MockK, Turbine" },
      { value: 3, label: "Gradle modules", context: "domain / data / app" },
    ],
    decisions: [],
    engineering: [{ label: "CI", value: "assembleDebug, Android lint and unit tests; rolling debug APK release" }],
    honesty: "First built in September 2023 and later re-architected, as the README notes.",
  },
  {
    slug: "redis-chat",
    title: "Redis Chat Service",
    short: "Redis chat",
    year: 2025,
    category: "Backend",
    featured: false,
    accent: "amber",
    tagline: "A Spring Boot REST chat service. Rooms are Redis hashes, participants are sets, history is lists, with pub/sub for fan-out.",
    status: [],
    skills: ["Java", "Docker"],
    links: [{ label: "Code", href: "https://github.com/srini2k03/Simple-Chat-Application-Using-Redis", kind: "code" }],
    problem: "",
    pipeline: [],
    highlights: [],
    metrics: [],
    decisions: [],
    engineering: [],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** Aggregates computed from the data above, so headline numbers can never drift from the projects. */
export const proof = {
  endToEnd: featuredProjects.length,
  /** Approximate test-function counts per repo: RBI 253, credit 44, jobpost 117, olist 42, deepfake 61, abalone 56, android 107. */
  testsApprox: 253 + 44 + 117 + 42 + 61 + 56 + 107,
  inBrowserCount: projects.filter((p) => p.inBrowser).length,
  liveDemos: projects.filter((p) => p.status.some((s) => s.tone === "live")).length,
  /** Count of .github/workflows files across the seven project repos (5+5+8+3+2+2+2). */
  ciWorkflows: 27,
};
